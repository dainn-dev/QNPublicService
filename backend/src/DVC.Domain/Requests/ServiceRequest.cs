using DVC.Domain.Common;

namespace DVC.Domain.Requests;

/// <summary>A citizen's application for a public service, tracked through a status workflow.</summary>
public class ServiceRequest : BaseEntity, IAuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public Guid PublicServiceId { get; set; }
    public Guid CitizenId { get; set; }              // DainnUser Users.Id
    public Guid? ServicePointId { get; set; }
    public Guid? AssignedOfficerId { get; set; }     // DainnUser Users.Id

    public ServiceRequestStatus Status { get; set; } = ServiceRequestStatus.Submitted;
    public string? Note { get; set; }

    public DateTime SubmittedAt { get; set; }
    public DateTime? DueAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public ICollection<ServiceRequestDocument> Documents { get; set; } = new List<ServiceRequestDocument>();
    public ICollection<ServiceRequestComment> Comments { get; set; } = new List<ServiceRequestComment>();
    public ICollection<ServiceRequestStatusHistory> StatusHistory { get; set; } = new List<ServiceRequestStatusHistory>();
}

public class ServiceRequestComment : BaseEntity
{
    public Guid ServiceRequestId { get; set; }
    public Guid AuthorId { get; set; }               // DainnUser Users.Id
    public string Content { get; set; } = string.Empty;
    public bool IsInternal { get; set; }             // officer-only note vs citizen-visible response
    public ServiceRequest? ServiceRequest { get; set; }
}

public class ServiceRequestDocument : BaseEntity
{
    public Guid ServiceRequestId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? DocumentType { get; set; }
    public string? FileName { get; set; }
    public bool IsSupplement { get; set; }
    public ServiceRequest? ServiceRequest { get; set; }
}

public class ServiceRequestStatusHistory : BaseEntity
{
    public Guid ServiceRequestId { get; set; }
    public ServiceRequestStatus? FromStatus { get; set; }
    public ServiceRequestStatus ToStatus { get; set; }
    public Guid? ChangedById { get; set; }
    public string? Note { get; set; }
    public DateTime ChangedAt { get; set; }
    public ServiceRequest? ServiceRequest { get; set; }
}
