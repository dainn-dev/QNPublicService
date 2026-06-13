using DVC.Application.Abstractions.Identity;
using DVC.Application.Common;

namespace DVC.Tests.Common;

/// <summary>No-op IUserAdminService stub — records role grants so officer-create tests stay self-contained.</summary>
public sealed class FakeUserAdminService : IUserAdminService
{
    public List<(Guid UserId, string Role)> AssignedRoles { get; } = new();

    public Task AssignRoleAsync(Guid userId, string roleCode, CancellationToken ct = default)
    {
        AssignedRoles.Add((userId, roleCode));
        return Task.CompletedTask;
    }

    public Task<PagedResult<AdminUserDto>> GetUsersAsync(int page, int pageSize, string? search, CancellationToken ct = default) =>
        throw new NotImplementedException();
    public Task<AdminUserDto> GetUserAsync(Guid userId, CancellationToken ct = default) =>
        throw new NotImplementedException();
    public Task RemoveRoleAsync(Guid userId, string roleCode, CancellationToken ct = default) =>
        throw new NotImplementedException();
    public Task LockAsync(Guid userId, CancellationToken ct = default) => throw new NotImplementedException();
    public Task UnlockAsync(Guid userId, CancellationToken ct = default) => throw new NotImplementedException();
    public Task EnsureRolesAsync(IEnumerable<string> roleCodes, CancellationToken ct = default) =>
        throw new NotImplementedException();
}
