using DVC.Domain.Common;

namespace DVC.Domain.Engagement;

/// <summary>A citizen's 1–5 star rating of a service point.</summary>
public class ServicePointRating : BaseEntity
{
    public Guid ServicePointId { get; set; }
    public Guid UserId { get; set; }
    public int Score { get; set; }
    public string? Comment { get; set; }
}

/// <summary>A citizen's 1–5 star rating of a completed service request.</summary>
public class ServiceRequestRating : BaseEntity
{
    public Guid ServiceRequestId { get; set; }
    public Guid UserId { get; set; }
    public int Score { get; set; }
    public string? Comment { get; set; }
}
