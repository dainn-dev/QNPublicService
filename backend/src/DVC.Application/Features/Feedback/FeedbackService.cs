using DVC.Application.Abstractions;
using DVC.Application.Abstractions.Identity;
using DVC.Application.Common;
using DVC.Application.Features.Engagement;
using DVC.Domain.Common;
using DVC.Domain.Feedback;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Feedback;

public sealed class FeedbackService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUser _user;
    private readonly NotificationService _notifications;
    private readonly PersonNameResolver _names;

    public FeedbackService(IAppDbContext db, ICurrentUser user, NotificationService notifications, PersonNameResolver names)
    {
        _db = db;
        _user = user;
        _notifications = notifications;
        _names = names;
    }

    public async Task<IReadOnlyList<FeedbackCategoryDto>> GetCategoriesAsync(bool includeInactive = false, CancellationToken ct = default) =>
        await _db.FeedbackCategories.Where(c => includeInactive || c.IsActive).OrderBy(c => c.Name)
            .Select(c => new FeedbackCategoryDto(c.Id, c.Code, c.Name, c.IsActive)).ToListAsync(ct);

    // ----- Admin category CRUD -----
    public async Task<FeedbackCategoryDto> CreateCategoryAsync(CreateFeedbackCategoryDto dto, CancellationToken ct = default)
    {
        if (await _db.FeedbackCategories.AnyAsync(c => c.Code == dto.Code, ct))
            throw new ConflictException($"Feedback category code '{dto.Code}' already exists.");

        var entity = new FeedbackCategory { Code = dto.Code, Name = dto.Name };
        _db.FeedbackCategories.Add(entity);
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task<FeedbackCategoryDto> UpdateCategoryAsync(Guid id, UpdateFeedbackCategoryDto dto, CancellationToken ct = default)
    {
        var entity = await _db.FeedbackCategories.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw NotFoundException.For("Feedback category", id);
        entity.Name = dto.Name;
        entity.IsActive = dto.IsActive;
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task DeleteCategoryAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.FeedbackCategories.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw NotFoundException.For("Feedback category", id);
        if (await _db.FeedbackReports.AnyAsync(r => r.CategoryId == id, ct))
            throw new ConflictException("Cannot delete a category that still has feedback reports.");
        _db.FeedbackCategories.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    private static FeedbackCategoryDto ToDto(FeedbackCategory c) =>
        new(c.Id, c.Code, c.Name, c.IsActive);

    // ----- Citizen -----
    public async Task<FeedbackReportDto> SubmitAsync(SubmitFeedbackDto dto, CancellationToken ct = default)
    {
        var citizenId = _user.RequireUserId();
        if (!await _db.FeedbackCategories.AnyAsync(c => c.Id == dto.CategoryId, ct))
            throw NotFoundException.For("Feedback category", dto.CategoryId);

        var now = DateTime.UtcNow;
        var priority = dto.Priority ?? FeedbackPriority.Normal;
        var report = new FeedbackReport
        {
            Code = $"PA-{now:yyyy}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
            CategoryId = dto.CategoryId,
            CitizenId = citizenId,
            Title = dto.Title,
            Description = dto.Description,
            Address = dto.Address,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            ProvinceCode = dto.ProvinceCode,
            WardCode = dto.WardCode,
            Status = FeedbackStatus.Submitted,
            Priority = priority,
            SubmittedAt = now,
            // SLA: due a priority-driven number of calendar days after submission.
            DueAt = Sla.FeedbackDueAt(now, priority)
        };
        report.StatusHistory.Add(new FeedbackStatusHistory
        {
            ToStatus = FeedbackStatus.Submitted,
            ChangedById = citizenId,
            ChangedAt = now,
            Note = "Đã gửi phản ánh"
        });
        _db.FeedbackReports.Add(report);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(report.Id, includeInternal: false, ct);
    }

    public async Task<IReadOnlyList<FeedbackReportDto>> GetMineAsync(CancellationToken ct = default)
    {
        var citizenId = _user.RequireUserId();
        var rows = await LoadDetailQuery().Where(r => r.CitizenId == citizenId)
            .OrderByDescending(r => r.SubmittedAt).ToListAsync(ct);
        var names = await ResolveNamesAsync(rows, ct);
        return rows.Select(r => ToDto(r, includeInternal: false, names)).ToList();
    }

    public async Task<FeedbackReportDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var report = await LoadDetailQuery().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Feedback report", id);

        var isOfficer = _user.IsInRole(Roles.Officer) || _user.IsInRole(Roles.Admin) || _user.IsInRole(Roles.Super);
        if (!isOfficer && report.CitizenId != _user.UserId)
            throw new ForbiddenException("You can only view your own feedback.");

        var names = await ResolveNamesAsync(new[] { report }, ct);
        return ToDto(report, includeInternal: isOfficer, names);
    }

    public async Task<FeedbackAttachmentDto> AddAttachmentAsync(Guid id, AddFeedbackAttachmentDto dto, CancellationToken ct = default)
    {
        var report = await _db.FeedbackReports.FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Feedback report", id);
        EnsureOwnerOrOfficer(report.CitizenId);

        var att = new FeedbackAttachment { FeedbackReportId = id, Url = dto.Url, FileName = dto.FileName, ContentType = dto.ContentType };
        _db.FeedbackAttachments.Add(att);
        await _db.SaveChangesAsync(ct);
        return new FeedbackAttachmentDto(att.Id, att.Url, att.FileName, att.ContentType);
    }

    public async Task<FeedbackCommentDto> AddCommentAsync(Guid id, AddFeedbackCommentDto dto, CancellationToken ct = default)
    {
        var report = await _db.FeedbackReports.FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Feedback report", id);
        var authorId = _user.RequireUserId();
        var isOfficer = _user.IsInRole(Roles.Officer) || _user.IsInRole(Roles.Admin) || _user.IsInRole(Roles.Super);
        if (!isOfficer && report.CitizenId != authorId)
            throw new ForbiddenException("You can only comment on your own feedback.");
        // Citizens cannot post internal notes.
        var isInternal = dto.IsInternal && isOfficer;

        var comment = new FeedbackComment { FeedbackReportId = id, AuthorId = authorId, Content = dto.Content, IsInternal = isInternal };
        _db.FeedbackComments.Add(comment);

        // Notify the other party of a visible comment.
        if (!isInternal)
        {
            var target = isOfficer ? report.CitizenId : report.AssignedOfficerId;
            if (target is { } t && t != authorId)
                await _notifications.NotifyAsync(t, NotificationType.Feedback, "Phản ánh có phản hồi mới",
                    $"Phản ánh {report.Code} có bình luận mới.", nameof(FeedbackReport), report.Id, ct: ct);
        }

        await _db.SaveChangesAsync(ct);
        var names = await _names.LoadAsync(new[] { comment.AuthorId }, ct);
        return new FeedbackCommentDto(comment.Id, comment.AuthorId, names.Name(comment.AuthorId), comment.Content, comment.IsInternal, comment.CreatedAt);
    }

    // ----- Officer -----
    public async Task<PagedResult<FeedbackReportDto>> ListForOfficerAsync(
        FeedbackStatus? status, Guid? assignedOfficerId, FeedbackPriority? priority,
        Guid? categoryId, int? wardCode, int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = LoadDetailQuery()
            .Where(r => (status == null || r.Status == status)
                && (assignedOfficerId == null || r.AssignedOfficerId == assignedOfficerId)
                && (priority == null || r.Priority == priority)
                && (categoryId == null || r.CategoryId == categoryId)
                && (wardCode == null || r.WardCode == wardCode));

        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(r => r.SubmittedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        var names = await ResolveNamesAsync(rows, ct);
        return new PagedResult<FeedbackReportDto>(rows.Select(r => ToDto(r, includeInternal: true, names)).ToList(), page, pageSize, total);
    }

    public async Task<FeedbackReportDto> AssignAsync(Guid id, AssignFeedbackDto dto, CancellationToken ct = default)
    {
        var report = await LoadDetailQuery().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Feedback report", id);

        report.AssignedOfficerId = dto.OfficerId;
        if (report.Status is FeedbackStatus.Submitted or FeedbackStatus.Received)
            TransitionTo(report, FeedbackStatus.Assigned, "Đã phân công xử lý");

        await _notifications.NotifyAsync(dto.OfficerId, NotificationType.Feedback, "Phản ánh được phân công",
            $"Bạn được phân công xử lý phản ánh {report.Code}.", nameof(FeedbackReport), report.Id, ct: ct);

        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(report.Id, includeInternal: true, ct);
    }

    public async Task<FeedbackReportDto> ChangeStatusAsync(Guid id, ChangeFeedbackStatusDto dto, CancellationToken ct = default)
    {
        var report = await LoadDetailQuery().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Feedback report", id);

        TransitionTo(report, dto.Status, dto.Note);

        await _notifications.NotifyAsync(report.CitizenId, NotificationType.Feedback, "Cập nhật phản ánh",
            $"Phản ánh {report.Code} chuyển sang trạng thái {dto.Status}.", nameof(FeedbackReport), report.Id, ct: ct);

        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(report.Id, includeInternal: true, ct);
    }

    private void TransitionTo(FeedbackReport report, FeedbackStatus to, string? note)
    {
        FeedbackWorkflow.EnsureCanTransition(report.Status, to);
        var now = DateTime.UtcNow;
        var from = report.Status;
        report.Status = to;
        if (to == FeedbackStatus.Resolved) report.ResolvedAt = now;
        if (to == FeedbackStatus.Closed) report.ClosedAt = now;

        // Add via the DbSet (not the tracked collection): the client-generated Guid key would
        // otherwise make EF treat this new row as an existing/Modified entity.
        _db.FeedbackStatusHistory.Add(new FeedbackStatusHistory
        {
            FeedbackReportId = report.Id,
            FromStatus = from,
            ToStatus = to,
            ChangedById = _user.UserId,
            Note = note,
            ChangedAt = now
        });
    }

    private void EnsureOwnerOrOfficer(Guid citizenId)
    {
        var isOfficer = _user.IsInRole(Roles.Officer) || _user.IsInRole(Roles.Admin) || _user.IsInRole(Roles.Super);
        if (!isOfficer && citizenId != _user.UserId)
            throw new ForbiddenException("You can only modify your own feedback.");
    }

    private IQueryable<FeedbackReport> LoadDetailQuery() => _db.FeedbackReports
        .Include(r => r.Attachments)
        .Include(r => r.Comments)
        .Include(r => r.StatusHistory);

    private async Task<FeedbackReportDto> GetByIdAsync(Guid id, bool includeInternal, CancellationToken ct)
    {
        var report = await LoadDetailQuery().FirstAsync(r => r.Id == id, ct);
        var names = await ResolveNamesAsync(new[] { report }, ct);
        return ToDto(report, includeInternal, names);
    }

    // Citizen + every comment author + every status-change author across the given reports.
    private Task<PersonNames> ResolveNamesAsync(IEnumerable<FeedbackReport> reports, CancellationToken ct) =>
        _names.LoadAsync(reports.SelectMany(CollectUserIds), ct);

    private static IEnumerable<Guid> CollectUserIds(FeedbackReport r)
    {
        yield return r.CitizenId;
        foreach (var c in r.Comments) yield return c.AuthorId;
        foreach (var h in r.StatusHistory)
            if (h.ChangedById is { } id) yield return id;
    }

    private static FeedbackReportDto ToDto(FeedbackReport r, bool includeInternal, PersonNames names) => new(
        r.Id, r.Code, r.CategoryId, r.CitizenId, names.Name(r.CitizenId), names.Phone(r.CitizenId), r.Title, r.Description,
        r.Address, r.Latitude, r.Longitude, r.ProvinceCode, r.WardCode,
        r.Status, r.Priority, r.AssignedOfficerId,
        r.SubmittedAt, r.DueAt, r.ResolvedAt, r.ClosedAt,
        r.Attachments.Select(a => new FeedbackAttachmentDto(a.Id, a.Url, a.FileName, a.ContentType)).ToList(),
        r.Comments.Where(c => includeInternal || !c.IsInternal)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new FeedbackCommentDto(c.Id, c.AuthorId, names.Name(c.AuthorId), c.Content, c.IsInternal, c.CreatedAt)).ToList(),
        r.StatusHistory.OrderBy(h => h.ChangedAt)
            .Select(h => new FeedbackHistoryDto(h.FromStatus, h.ToStatus, h.ChangedById, names.Name(h.ChangedById), h.Note, h.ChangedAt)).ToList());
}
