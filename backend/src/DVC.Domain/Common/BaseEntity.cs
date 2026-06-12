namespace DVC.Domain.Common;

/// <summary>Base for all entities with a surrogate Guid key and audit timestamps.</summary>
public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>Marker: changes to entities implementing this are captured by the audit interceptor.</summary>
public interface IAuditableEntity
{
}
