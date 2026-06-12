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

    public RequestService(IAppDbContext db, ICurrentUser user, NotificationService notifications)
    {
        _db = db;
        _user = user;
        _notifications = notifications;
    }

    // ----- Citizen -----
    public async Task<ServiceRequestDto> SubmitAsync(SubmitRequestDto dto, CancellationToken ct = default)
    {
        var citizenId = _user.RequireUserId();
        if (!await _db.PublicServices.AnyAsync(s => s.Id == dto.PublicServiceId, ct))
            throw NotFoundException.For("Public service", dto.PublicServiceId);
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
            SubmittedAt = now
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
        return await GetByIdAsync(request.Id, ct);
    }

    public async Task<IReadOnlyList<ServiceRequestDto>> GetMineAsync(CancellationToken ct = default)
    {
        var citizenId = _user.RequireUserId();
        var rows = await LoadDetailQuery().Where(r => r.CitizenId == citizenId)
            .OrderByDescending(r => r.SubmittedAt).ToListAsync(ct);
        return rows.Select(ToDto).ToList();
    }

    public async Task<ServiceRequestDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var request = await LoadDetailQuery().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Service request", id);
        EnsureOwnerOrOfficer(request.CitizenId);
        return ToDto(request);
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
        return await GetByIdAsync(id, ct);
    }

    // ----- Officer -----
    public async Task<IReadOnlyList<ServiceRequestDto>> ListForOfficerAsync(
        ServiceRequestStatus? status, Guid? assignedOfficerId, CancellationToken ct = default)
    {
        var rows = await LoadDetailQuery()
            .Where(r => (status == null || r.Status == status)
                && (assignedOfficerId == null || r.AssignedOfficerId == assignedOfficerId))
            .OrderByDescending(r => r.SubmittedAt)
            .ToListAsync(ct);
        return rows.Select(ToDto).ToList();
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
        return await GetByIdAsync(id, ct);
    }

    public async Task<ServiceRequestDto> ChangeStatusAsync(Guid id, ChangeRequestStatusDto dto, CancellationToken ct = default)
    {
        var request = await LoadDetailQuery().FirstOrDefaultAsync(r => r.Id == id, ct)
            ?? throw NotFoundException.For("Service request", id);
        TransitionTo(request, dto.Status, dto.Note);

        await _notifications.NotifyAsync(request.CitizenId, NotificationType.Request, "Cập nhật hồ sơ",
            $"Hồ sơ {request.Code} chuyển sang trạng thái {dto.Status}.", nameof(ServiceRequest), request.Id, ct: ct);
        await _db.SaveChangesAsync(ct);
        return await GetByIdAsync(id, ct);
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
        .Include(r => r.StatusHistory);

    private async Task<ServiceRequestDto> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var request = await LoadDetailQuery().FirstAsync(r => r.Id == id, ct);
        return ToDto(request);
    }

    private static ServiceRequestDto ToDto(ServiceRequest r) => new(
        r.Id, r.Code, r.PublicServiceId, r.CitizenId, r.ServicePointId, r.AssignedOfficerId,
        r.Status, r.Note, r.SubmittedAt, r.DueAt, r.CompletedAt,
        r.Documents.OrderBy(d => d.CreatedAt).Select(d => new RequestDocumentDto(d.Id, d.Url, d.DocumentType, d.FileName, d.IsSupplement)).ToList(),
        r.StatusHistory.OrderBy(h => h.ChangedAt).Select(h => new RequestHistoryDto(h.FromStatus, h.ToStatus, h.ChangedById, h.Note, h.ChangedAt)).ToList());
}
