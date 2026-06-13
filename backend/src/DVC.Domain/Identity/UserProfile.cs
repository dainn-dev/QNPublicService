using DVC.Domain.Common;

namespace DVC.Domain.Identity;

/// <summary>
/// Extra profile data for an end user (full name, phone, address). References the DainnUser user id
/// (Users.Id) as a plain Guid — there is no EF navigation across the identity/app context boundary,
/// mirroring <see cref="OfficerProfile"/>. Never stores credentials.
/// </summary>
public class UserProfile : BaseEntity, IAuditableEntity
{
    public Guid UserId { get; set; }
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
}
