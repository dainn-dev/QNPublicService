namespace DVC.Domain.Audit;

/// <summary>An immutable record of a create/update/delete on an audited entity.</summary>
public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? ActorUserId { get; set; }
    public string Action { get; set; } = string.Empty;       // Created / Updated / Deleted
    public string EntityType { get; set; } = string.Empty;
    public Guid? EntityId { get; set; }
    public string? OldValue { get; set; }                    // jsonb
    public string? NewValue { get; set; }                    // jsonb
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime CreatedAt { get; set; }
}
