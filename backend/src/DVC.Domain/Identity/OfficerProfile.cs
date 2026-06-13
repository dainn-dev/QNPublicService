using DVC.Domain.Common;

namespace DVC.Domain.Identity;

/// <summary>
/// Extra profile data for a user who is an officer. References the DainnUser user id (Users.Id)
/// as a plain Guid — there is no EF navigation across the identity/app context boundary.
/// </summary>
public class OfficerProfile : BaseEntity, IAuditableEntity
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Department { get; set; }
    public string? Position { get; set; }
    public Guid? ServicePointId { get; set; }
    public string? PhoneNumber { get; set; }

    /// <summary>Wards this officer is responsible for, as a comma-separated list of ward codes/names.</summary>
    public string? Area { get; set; }

    public bool IsActive { get; set; } = true;
}
