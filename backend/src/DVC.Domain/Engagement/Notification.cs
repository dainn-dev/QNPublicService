using DVC.Domain.Common;

namespace DVC.Domain.Engagement;

/// <summary>An in-app notification for a user (citizen or officer).</summary>
public class Notification : BaseEntity
{
    public Guid UserId { get; set; }                 // DainnUser Users.Id
    public NotificationType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? RelatedEntityType { get; set; }
    public Guid? RelatedEntityId { get; set; }
}
