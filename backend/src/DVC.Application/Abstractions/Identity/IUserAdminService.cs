using DVC.Application.Common;

namespace DVC.Application.Abstractions.Identity;

public sealed record AdminUserDto(
    Guid Id, string? Email, string? Username, string Status, bool IsLocked,
    DateTime? LastLoginAt, IReadOnlyList<string> Roles,
    string? FullName = null, string? Phone = null, string? Address = null);

/// <summary>
/// Admin-facing user/role operations. Wraps DainnUser's IUserManagementService/IRoleService
/// so controllers never touch DainnUser types.
/// </summary>
public interface IUserAdminService
{
    Task<PagedResult<AdminUserDto>> GetUsersAsync(int page, int pageSize, string? search, CancellationToken ct = default);
    Task<AdminUserDto> GetUserAsync(Guid userId, CancellationToken ct = default);
    Task AssignRoleAsync(Guid userId, string roleCode, CancellationToken ct = default);
    Task RemoveRoleAsync(Guid userId, string roleCode, CancellationToken ct = default);
    Task LockAsync(Guid userId, CancellationToken ct = default);
    Task UnlockAsync(Guid userId, CancellationToken ct = default);

    /// <summary>Ensures the canonical roles (citizen/officer/admin/super) exist.</summary>
    Task EnsureRolesAsync(IEnumerable<string> roleCodes, CancellationToken ct = default);
}
