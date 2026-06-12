using DVC.Domain.Common;

namespace DVC.Domain.Feedback;

public class FeedbackCategory : BaseEntity, IAuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

/// <summary>A citizen report/complaint (phản ánh, kiến nghị) with a moderated status workflow.</summary>
public class FeedbackReport : BaseEntity, IAuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public Guid CitizenId { get; set; }              // DainnUser Users.Id

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    public string? Address { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public int? ProvinceCode { get; set; }
    public int? WardCode { get; set; }

    public FeedbackStatus Status { get; set; } = FeedbackStatus.Submitted;
    public FeedbackPriority Priority { get; set; } = FeedbackPriority.Normal;
    public Guid? AssignedOfficerId { get; set; }     // DainnUser Users.Id

    public DateTime SubmittedAt { get; set; }
    public DateTime? DueAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public DateTime? ClosedAt { get; set; }

    public FeedbackCategory? Category { get; set; }
    public ICollection<FeedbackAttachment> Attachments { get; set; } = new List<FeedbackAttachment>();
    public ICollection<FeedbackComment> Comments { get; set; } = new List<FeedbackComment>();
    public ICollection<FeedbackStatusHistory> StatusHistory { get; set; } = new List<FeedbackStatusHistory>();
}

public class FeedbackAttachment : BaseEntity
{
    public Guid FeedbackReportId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? FileName { get; set; }
    public string? ContentType { get; set; }
    public FeedbackReport? FeedbackReport { get; set; }
}

public class FeedbackComment : BaseEntity
{
    public Guid FeedbackReportId { get; set; }
    public Guid AuthorId { get; set; }               // DainnUser Users.Id
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; }             // officer-only note vs citizen-visible response
    public FeedbackReport? FeedbackReport { get; set; }
}

public class FeedbackStatusHistory : BaseEntity
{
    public Guid FeedbackReportId { get; set; }
    public FeedbackStatus? FromStatus { get; set; }
    public FeedbackStatus ToStatus { get; set; }
    public Guid? ChangedById { get; set; }
    public string? Note { get; set; }
    public DateTime ChangedAt { get; set; }
    public FeedbackReport? FeedbackReport { get; set; }
}
