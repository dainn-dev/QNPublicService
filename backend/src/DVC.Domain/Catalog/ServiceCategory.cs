using DVC.Domain.Common;

namespace DVC.Domain.Catalog;

/// <summary>A grouping of public services (e.g. Hộ tịch, Cư trú, Đất đai).</summary>
public class ServiceCategory : BaseEntity, IAuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid? ParentId { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;

    public ServiceCategory? Parent { get; set; }
    public ICollection<PublicService> Services { get; set; } = new List<PublicService>();
}
