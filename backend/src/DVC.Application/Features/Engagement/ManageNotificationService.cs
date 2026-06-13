using DVC.Application.Abstractions;
using DVC.Application.Abstractions.Identity;
using DVC.Application.Common;
using DVC.Domain.Common;
using DVC.Domain.Engagement;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Engagement;

/// <summary>
/// Admin-facing notification operations: send push/broadcast/emergency campaigns and read history.
/// Sits alongside <see cref="NotificationService"/> (end-user reads) the same way ManageStatsService
/// sits alongside StatsService. Audience resolution stays in AppDbContext where possible (officers,
/// ward) and falls back to <see cref="IUserDirectory"/> for the full citizen list.
/// </summary>
public sealed class ManageNotificationService
{
    private readonly IAppDbContext _db;
    private readonly IUserDirectory _directory;

    public ManageNotificationService(IAppDbContext db, IUserDirectory directory)
    {
        _db = db;
        _directory = directory;
    }

    public async Task<NotificationCampaignDto> PushAsync(Guid senderId, PushNotificationRequest request, CancellationToken ct = default)
    {
        var userIds = (request.UserIds ?? Array.Empty<Guid>()).Where(id => id != Guid.Empty).Distinct().ToList();
        if (userIds.Count == 0)
            throw new ConflictException("At least one recipient is required.");
        RequireTitle(request.Title);

        foreach (var userId in userIds)
            AddNotification(userId, request.Type, request.Title, request.Message);

        return await SaveCampaignAsync(senderId, NotificationCampaignType.Push, audience: null,
            wardCode: null, department: null, request.Title, request.Message, userIds.Count, ct);
    }

    public async Task<NotificationCampaignDto> BroadcastAsync(Guid senderId, BroadcastNotificationRequest request, CancellationToken ct = default)
    {
        RequireTitle(request.Title);

        var recipients = await ResolveAudienceAsync(request.Audience, request.WardCode, request.Department, ct);
        // Officer broadcasts are operational; citizen broadcasts surface as announcements.
        var type = request.Audience == NotificationAudience.Officers ? NotificationType.System : NotificationType.Announcement;
        foreach (var userId in recipients)
            AddNotification(userId, type, request.Title, request.Message);

        return await SaveCampaignAsync(senderId, NotificationCampaignType.Broadcast, request.Audience,
            request.WardCode, request.Department, request.Title, request.Message, recipients.Count, ct);
    }

    public async Task<NotificationCampaignDto> EmergencyAsync(Guid senderId, EmergencyNotificationRequest request, CancellationToken ct = default)
    {
        RequireTitle(request.Title);

        var recipients = await _directory.GetAllCitizenIdsAsync(ct);
        foreach (var userId in recipients)
            AddNotification(userId, NotificationType.Emergency, request.Title, request.Message);

        return await SaveCampaignAsync(senderId, NotificationCampaignType.Emergency, NotificationAudience.All,
            wardCode: null, department: null, request.Title, request.Message, recipients.Count, ct);
    }

    /// <summary>Resolves the distinct recipient user ids for a broadcast audience.</summary>
    public async Task<IReadOnlyList<Guid>> ResolveAudienceAsync(
        NotificationAudience audience, int? wardCode, string? department, CancellationToken ct = default)
    {
        switch (audience)
        {
            case NotificationAudience.Officers:
                var officers = _db.OfficerProfiles.Where(o => o.IsActive);
                if (!string.IsNullOrWhiteSpace(department))
                    officers = officers.Where(o => o.Department == department);
                return await officers.Select(o => o.UserId).Distinct().ToListAsync(ct);

            case NotificationAudience.Ward:
                if (wardCode is null)
                    throw new ConflictException("wardCode is required for a ward broadcast.");
                // Citizens known to be in the ward through their feedback reports.
                return await _db.FeedbackReports
                    .Where(f => f.WardCode == wardCode)
                    .Select(f => f.CitizenId)
                    .Distinct()
                    .ToListAsync(ct);

            case NotificationAudience.All:
            default:
                return await _directory.GetAllCitizenIdsAsync(ct);
        }
    }

    public async Task<PagedResult<NotificationCampaignDto>> GetHistoryAsync(int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _db.NotificationCampaigns.OrderByDescending(c => c.SentAt).ThenByDescending(c => c.CreatedAt);
        var total = await query.CountAsync(ct);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<NotificationCampaignDto>(items.Select(ToDto).ToList(), page, pageSize, total);
    }

    private void AddNotification(Guid userId, NotificationType type, string title, string message) =>
        _db.Notifications.Add(new Notification { UserId = userId, Type = type, Title = title, Message = message });

    private async Task<NotificationCampaignDto> SaveCampaignAsync(
        Guid senderId, NotificationCampaignType type, NotificationAudience? audience, int? wardCode,
        string? department, string title, string message, int recipientCount, CancellationToken ct)
    {
        var campaign = new NotificationCampaign
        {
            Type = type,
            Audience = audience,
            WardCode = wardCode,
            Department = department,
            Title = title,
            Message = message,
            RecipientCount = recipientCount,
            SentByUserId = senderId,
            SentAt = DateTime.UtcNow
        };
        _db.NotificationCampaigns.Add(campaign);
        await _db.SaveChangesAsync(ct);
        return ToDto(campaign);
    }

    private static void RequireTitle(string? title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ConflictException("Title is required.");
    }

    private static NotificationCampaignDto ToDto(NotificationCampaign c) => new(
        c.Id, c.Type, AudienceLabel(c), c.WardCode, c.Department,
        c.Title, c.Message, c.RecipientCount, c.SentByUserId, c.SentAt);

    private static string AudienceLabel(NotificationCampaign c) => c.Audience switch
    {
        NotificationAudience.All => "all",
        NotificationAudience.Ward => "ward",
        NotificationAudience.Officers => "officers",
        _ => "specific"
    };
}
