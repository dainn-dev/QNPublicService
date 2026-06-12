using DVC.Domain.Common;

namespace DVC.Domain.Catalog;

/// <summary>An administrative procedure a citizen can request (thủ tục hành chính).</summary>
public class PublicService : BaseEntity, IAuditableEntity
{
    public Guid CategoryId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? RequiredDocuments { get; set; }
    public int? ProcessingTimeDays { get; set; }
    public decimal Fee { get; set; }
    public ServiceLevel ServiceLevel { get; set; } = ServiceLevel.Level2;
    public bool IsActive { get; set; } = true;

    public ServiceCategory? Category { get; set; }
}
