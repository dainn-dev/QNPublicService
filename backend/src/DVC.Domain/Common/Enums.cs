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
    System
}
