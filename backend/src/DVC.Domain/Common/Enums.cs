namespace DVC.Domain.Common;

public enum ServiceLevel
{
    Level1,
    Level2,
    Level3,
    Level4
}

public enum ServicePointType
{
    Ubnd,
    Police,
    Hospital,
    School,
    AdminCenter
}

public enum FeedbackStatus
{
    Submitted,
    Received,
    Assigned,
    Processing,
    Resolved,
    Rejected,
    Closed
}

public enum FeedbackPriority
{
    Low,
    Normal,
    High,
    Urgent
}

public enum ServiceRequestStatus
{
    Submitted,
    Received,
    Processing,
    WaitingSupplement,
    Completed,
    Rejected,
    Cancelled
}

public enum NotificationType
{
    Request,
    Feedback,
    Announcement,
    System,
    Emergency
}

/// <summary>How an admin notification campaign was sent.</summary>
public enum NotificationCampaignType
{
    Push,       // pushed to an explicit list of users
    Broadcast,  // sent to a resolved audience (all / ward / officers)
    Emergency   // urgent broadcast to all citizens
}

/// <summary>Target group for a broadcast campaign.</summary>
public enum NotificationAudience
{
    All,        // all citizens
    Ward,       // citizens of a specific ward
    Officers    // officers, optionally of a department
}
