using DVC.Application.Abstractions;
using DVC.Application.Common;
using DVC.Domain.Common;
using DVC.Domain.Engagement;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Engagement;

public sealed record NotificationDto(Guid Id, NotificationType Type, string Title, string Message, bool IsRead, DateTime? ReadAt, string? RelatedEntityType, Guid? RelatedEntityId, DateTime CreatedAt);

public sealed class NotificationService
{
    private readonly IAppDbContext _db;

    public NotificationService(IAppDbContext db) => _db = db;

    /// <summary>Queues a notification (caller is responsible for SaveChanges, or pass save=true).</summary>
    public async Task NotifyAsync(Guid userId, NotificationType type, string title, string message,
        string? relatedEntityType = null, Guid? relatedEntityId = null, bool save = false, CancellationToken ct = default)
    {
        _db.Notifications.Add(new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            RelatedEntityType = relatedEntityType,
            RelatedEntityId = relatedEntityId
        });
        if (save)
            await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<NotificationDto>> ListAsync(Guid userId, bool unreadOnly, CancellationToken ct = default) =>
        await _db.Notifications
            .Where(n => n.UserId == userId && (!unreadOnly || !n.IsRead))
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto(n.Id, n.Type, n.Title, n.Message, n.IsRead, n.ReadAt, n.RelatedEntityType, n.RelatedEntityId, n.CreatedAt))
            .ToListAsync(ct);

    public async Task MarkReadAsync(Guid userId, Guid notificationId, CancellationToken ct = default)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, ct)
            ?? throw NotFoundException.For("Notification", notificationId);
        if (!n.IsRead)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task MarkAllReadAsync(Guid userId, CancellationToken ct = default)
    {
        var unread = await _db.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync(ct);
        var now = DateTime.UtcNow;
        foreach (var n in unread) { n.IsRead = true; n.ReadAt = now; }
        if (unread.Count > 0)
            await _db.SaveChangesAsync(ct);
    }
}
