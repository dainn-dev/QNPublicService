using DVC.Application.Abstractions;
using DVC.Application.Abstractions.Identity;
using DVC.Application.Common;
using DVC.Application.Features.Engagement;
using DVC.Domain.Common;
using DVC.Domain.Requests;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Requests;

public sealed class RequestService
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUser _user;
    private readonly NotificationService _notifications;
    private readonly PersonNameResolver _names;

    public RequestService(IAppDbContext db, ICurrentUser user, NotificationService notifications, PersonNameResolver names)
    {
        _db = db;
        _user = user;
        _notifications = notifications;
        _names = names;
    }

    // ----- Citizen -----
    public async Task<ServiceRequestDto> SubmitAsync(SubmitRequestDto dto, CancellationToken ct = default)
    {
        var citizenId = _user.RequireUserId();
        var service = await _db.PublicServices.FirstOrDefaultAsync(s => s.Id == dto.PublicServiceId, ct)
            ?? throw NotFoundException.For("Public service", dto.PublicServiceId);
        if (dto.ServicePointId is { } sp && !await _db.ServicePoints.AnyAsync(p => p.Id == sp, ct))
            throw NotFoundException.For("Service point", sp);

        var now = DateTime.UtcNow;
        var request = new ServiceRequest
        {
            Code = $"QNG-{now:yyyy}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
            PublicServiceId = dto.PublicServiceId,
            CitizenId = citizenId,
            ServicePointId = dto.ServicePointId,
            Note = dto.Note,
            Status = ServiceRequestStatus.Submitted,
            SubmittedAt = now,
            // SLA: due ProcessingTimeDays working days after submission; no deadline when unset.
            DueAt = service.ProcessingTimeDays is { } days ? Sla.AddWorkingDays(now, days) : null
        };
        request.StatusHistory.Add(new ServiceRequestStatusHistory
        {
            ToStatus = ServiceRequestStatus.Submitted,
            ChangedById = citizenId,
            ChangedAt = now,
            Note = "Đã nộp hồ sơ"
        });
        _db.ServiceRequests.Add(request);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(request.Id, includeInternal: false, ct);
    }

    public async Task<IReadOnlyList<ServiceRequestDto>> GetMineAsync(CancellationToken ct = default)
    {
        var citizenId = _user.RequireUserId();
        var rows = await LoadDetailQuery().Where(r => r.CitizenId == citizenId)
            .OrderByDescending(r => r.SubmittedAt).ToListAsync(ct);
        var names = await ResolveNamesAsync(rows, ct);
        return rows.Select(r => ToDto(r, includeInternal: false, names)).ToList();
    }

    public async Task<ServiceRequestDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var request = await LoadDetailQuery().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Service request", id);

        var isOfficer = _user.IsInRole(Roles.Officer) || _user.IsInRole(Roles.Admin) || _user.IsInRole(Roles.Super);
        if (!isOfficer && request.CitizenId != _user.UserId)
            throw new ForbiddenException("You can only access your own request.");

        var names = await ResolveNamesAsync(new[] { request }, ct);
        return ToDto(request, includeInternal: isOfficer, names);
    }

    public async Task<RequestDocumentDto> AddDocumentAsync(Guid id, AddRequestDocumentDto dto, CancellationToken ct = default)
    {
        var request = await _db.ServiceRequests.FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Service request", id);
        EnsureOwnerOrOfficer(request.CitizenId);

        var doc = new ServiceRequestDocument
        {
            ServiceRequestId = id, Url = dto.Url, DocumentType = dto.DocumentType,
            FileName = dto.FileName, IsSupplement = dto.IsSupplement
        };
        _db.ServiceRequestDocuments.Add(doc);

        // Supplying supplements while waiting moves the request back into processing.
        if (dto.IsSupplement && request.Status == ServiceRequestStatus.WaitingSupplement)
        {
            TransitionTo(request, ServiceRequestStatus.Processing, "Công dân đã bổ sung hồ sơ");
            if (request.AssignedOfficerId is { } officer)
                await _notifications.NotifyAsync(officer, NotificationType.Request, "Hồ sơ được bổ sung",
                    $"Hồ sơ {request.Code} đã được bổ sung.", nameof(ServiceRequest), request.Id, ct: ct);
        }

        await _db.SaveChangesAsync(ct);
        return new RequestDocumentDto(doc.Id, doc.Url, doc.DocumentType, doc.FileName, doc.IsSupplement);
    }

    public async Task<ServiceRequestDto> CancelAsync(Guid id, CancellationToken ct = default)
    {
        var request = await LoadDetailQuery().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Service request", id);
        if (request.CitizenId != _user.RequireUserId())
            throw new ForbiddenException("You can only cancel your own request.");

        TransitionTo(request, ServiceRequestStatus.Cancelled, "Công dân hủy hồ sơ");
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, includeInternal: false, ct);
    }

    public async Task<RequestCommentDto> AddCommentAsync(Guid id, AddRequestCommentDto dto, CancellationToken ct = default)
    {
        var request = await _db.ServiceRequests.FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Service request", id);
        var authorId = _user.RequireUserId();
        var isOfficer = _user.IsInRole(Roles.Officer) || _user.IsInRole(Roles.Admin) || _user.IsInRole(Roles.Super);
        if (!isOfficer && request.CitizenId != authorId)
            throw new ForbiddenException("You can only comment on your own request.");
        // Citizens cannot post internal notes.
        var isInternal = dto.IsInternal && isOfficer;

        var comment = new ServiceRequestComment { ServiceRequestId = id, AuthorId = authorId, Content = dto.Content, IsInternal = isInternal };
        _db.ServiceRequestComments.Add(comment);

        // Notify the other party of a visible comment.
        if (!isInternal)
        {
            var target = isOfficer ? request.CitizenId : request.AssignedOfficerId;
            if (target is { } t && t != authorId)
                await _notifications.NotifyAsync(t, NotificationType.Request, "Hồ sơ có phản hồi mới",
                    $"Hồ sơ {request.Code} có bình luận mới.", nameof(ServiceRequest), request.Id, ct: ct);
        }

        await _db.SaveChangesAsync(ct);
        var names = await _names.LoadAsync(new[] { comment.AuthorId }, ct);
        return new RequestCommentDto(comment.Id, comment.AuthorId, names.Name(comment.AuthorId), comment.Content, comment.IsInternal, comment.CreatedAt);
    }

    // ----- Officer -----
    public async Task<PagedResult<ServiceRequestDto>> ListForOfficerAsync(
        ServiceRequestStatus? status, Guid? assignedOfficerId, Guid? publicServiceId, Guid? servicePointId,
        int page = 1, int pageSize = 20, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = LoadDetailQuery()
            .Where(r => (status == null || r.Status == status)
                && (assignedOfficerId == null || r.AssignedOfficerId == assignedOfficerId)
                && (publicServiceId == null || r.PublicServiceId == publicServiceId)
                && (servicePointId == null || r.ServicePointId == servicePointId));

        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(r => r.SubmittedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
        var names = await ResolveNamesAsync(rows, ct);
        return new PagedResult<ServiceRequestDto>(rows.Select(r => ToDto(r, includeInternal: true, names)).ToList(), page, pageSize, total);
    }

    public async Task<ServiceRequestDto> AssignAsync(Guid id, AssignRequestDto dto, CancellationToken ct = default)
    {
        var request = await LoadDetailQuery().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Service request", id);
        request.AssignedOfficerId = dto.OfficerId;
        if (request.Status == ServiceRequestStatus.Submitted)
            TransitionTo(request, ServiceRequestStatus.Received, "Tiếp nhận và phân công");

        await _notifications.NotifyAsync(dto.OfficerId, NotificationType.Request, "Hồ sơ được phân công",
            $"Bạn được phân công xử lý hồ sơ {request.Code}.", nameof(ServiceRequest), request.Id, ct: ct);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, includeInternal: true, ct);
    }

    public async Task<ServiceRequestDto> ChangeStatusAsync(Guid id, ChangeRequestStatusDto dto, CancellationToken ct = default)
    {
        var request = await LoadDetailQuery().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Service request", id);
        TransitionTo(request, dto.Status, dto.Note);

        await _notifications.NotifyAsync(request.CitizenId, NotificationType.Request, "Cập nhật hồ sơ",
            $"Hồ sơ {request.Code} chuyển sang trạng thái {dto.Status}.", nameof(ServiceRequest), request.Id, ct: ct);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, includeInternal: true, ct);
    }

    private void TransitionTo(ServiceRequest request, ServiceRequestStatus to, string? note)
    {
        RequestWorkflow.EnsureCanTransition(request.Status, to);
        var now = DateTime.UtcNow;
        var from = request.Status;
        request.Status = to;
        if (to == ServiceRequestStatus.Completed) request.CompletedAt = now;

        _db.ServiceRequestStatusHistory.Add(new ServiceRequestStatusHistory
        {
            ServiceRequestId = request.Id,
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
            throw new ForbiddenException("You can only access your own request.");
    }

    private IQueryable<ServiceRequest> LoadDetailQuery() => _db.ServiceRequests
        .Include(r => r.Documents)
        .Include(r => r.Comments)
        .Include(r => r.StatusHistory);

    private async Task<ServiceRequestDto> GetByIdAsync(Guid id, bool includeInternal, CancellationToken ct)
    {
        var request = await LoadDetailQuery().FirstAsync(r => r.Id == id, ct);
        var names = await ResolveNamesAsync(new[] { request }, ct);
        return ToDto(request, includeInternal, names);
    }

    // Citizen + every comment author + every status-change author across the given requests.
    private Task<PersonNames> ResolveNamesAsync(IEnumerable<ServiceRequest> requests, CancellationToken ct) =>
        _names.LoadAsync(requests.SelectMany(CollectUserIds), ct);

    private static IEnumerable<Guid> CollectUserIds(ServiceRequest r)
    {
        yield return r.CitizenId;
        foreach (var c in r.Comments) yield return c.AuthorId;
        foreach (var h in r.StatusHistory)
            if (h.ChangedById is { } id) yield return id;
    }

    private static ServiceRequestDto ToDto(ServiceRequest r, bool includeInternal, PersonNames names) => new(
        r.Id, r.Code, r.PublicServiceId, r.CitizenId, names.Name(r.CitizenId), names.Phone(r.CitizenId), r.ServicePointId, r.AssignedOfficerId,
        r.Status, r.Note, r.SubmittedAt, r.DueAt, r.CompletedAt,
        r.Documents.OrderBy(d => d.CreatedAt).Select(d => new RequestDocumentDto(d.Id, d.Url, d.DocumentType, d.FileName, d.IsSupplement)).ToList(),
        r.Comments.Where(c => includeInternal || !c.IsInternal)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new RequestCommentDto(c.Id, c.AuthorId, names.Name(c.AuthorId), c.Content, c.IsInternal, c.CreatedAt)).ToList(),
        r.StatusHistory.OrderBy(h => h.ChangedAt).Select(h => new RequestHistoryDto(h.FromStatus, h.ToStatus, h.ChangedById, names.Name(h.ChangedById), h.Note, h.ChangedAt)).ToList());
}
