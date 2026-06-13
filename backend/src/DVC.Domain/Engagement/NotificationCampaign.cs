using DVC.Domain.Common;

namespace DVC.Domain.Engagement;

/// <summary>
/// A record of an admin-sent notification campaign (push / broadcast / emergency). One row is
/// written per send; the individual recipients each get their own <see cref="Notification"/>.
/// </summary>
public class NotificationCampaign : BaseEntity
{
    public NotificationCampaignType Type { get; set; }
    public NotificationAudience? Audience { get; set; }   // null for a push to explicit users
    public int? WardCode { get; set; }                    // set when Audience == Ward
    public string? Department { get; set; }               // set when Audience == Officers and narrowed
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int RecipientCount { get; set; }
    public Guid SentByUserId { get; set; }                // DainnUser Users.Id of the admin
    public DateTime SentAt { get; set; }
}
