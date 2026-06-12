using DainnUser.Core.Interfaces.Services;
using DainnUser.Infrastructure.Data;
using DVC.Application.Abstractions.Identity;
using DVC.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace DVC.Infrastructure.Identity;

/// <summary>
/// Admin user/role operations over DainnUser. Reads go straight to the DainnUser DbContext (stable
/// entity shapes); role/lock mutations go through DainnUser's services so their invariants run.
/// </summary>
internal sealed class DainnUserUserAdminAdapter : IUserAdminService
{
    private readonly DainnUserDbContext _db;
    private readonly IRoleService _roles;
    private readonly IUserManagementService _users;

    public DainnUserUserAdminAdapter(DainnUserDbContext db, IRoleService roles, IUserManagementService users)
    {
        _db = db;
        _roles = roles;
        _users = users;
    }

    public async Task<PagedResult<AdminUserDto>> GetUsersAsync(int page, int pageSize, string? search, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u =>
                (u.Email != null && u.Email.ToLower().Contains(term)) ||
                (u.Username != null && u.Username.ToLower().Contains(term)));
        }

        var total = await query.CountAsync(ct);
        var users = await query
            .OrderBy(u => u.Email)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = new List<AdminUserDto>(users.Count);
        foreach (var u in users)
            items.Add(await ToDtoAsync(u.Id, ct));

        return new PagedResult<AdminUserDto>(items, page, pageSize, total);
    }

    public async Task<AdminUserDto> GetUserAsync(Guid userId, CancellationToken ct = default)
    {
        if (!await _db.Users.AnyAsync(u => u.Id == userId, ct))
            throw NotFoundUser(userId);
        return await ToDtoAsync(userId, ct);
    }

    public async Task AssignRoleAsync(Guid userId, string roleCode, CancellationToken ct = default)
        => await _roles.AssignRoleToUserAsync(userId, await ResolveRoleIdAsync(roleCode, ct), ct);

    public async Task RemoveRoleAsync(Guid userId, string roleCode, CancellationToken ct = default)
        => await _roles.RemoveRoleFromUserAsync(userId, await ResolveRoleIdAsync(roleCode, ct), ct);

    public Task LockAsync(Guid userId, CancellationToken ct = default) => _users.LockUserAsync(userId, ct);

    public Task UnlockAsync(Guid userId, CancellationToken ct = default) => _users.UnlockUserAsync(userId, ct);

    public async Task EnsureRolesAsync(IEnumerable<string> roleCodes, CancellationToken ct = default)
    {
        var existing = await _db.Roles.Select(r => r.Name).ToListAsync(ct);
        var present = new HashSet<string>(existing, StringComparer.OrdinalIgnoreCase);
        foreach (var code in roleCodes)
        {
            if (!present.Contains(code))
                await _roles.CreateRoleAsync(code, $"{code} role", Array.Empty<string>(), ct);
        }
    }

    private async Task<Guid> ResolveRoleIdAsync(string roleCode, CancellationToken ct)
    {
        var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == roleCode, ct)
            ?? throw new Application.Common.NotFoundException($"Role '{roleCode}' does not exist.");
        return role.Id;
    }

    private async Task<AdminUserDto> ToDtoAsync(Guid userId, CancellationToken ct)
    {
        var u = await _db.Users.AsNoTracking().FirstAsync(x => x.Id == userId, ct);
        var roleNames = await _db.UserRoles.AsNoTracking()
            .Where(ur => ur.UserId == userId)
            .Join(_db.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
            .ToListAsync(ct);

        var isLocked = u.LockoutEnd.HasValue && u.LockoutEnd.Value > DateTime.UtcNow;
        return new AdminUserDto(u.Id, u.Email, u.Username, u.Status.ToString(), isLocked, u.LastLoginAt, roleNames);
    }

    private static Application.Common.NotFoundException NotFoundUser(Guid id)
        => new($"User '{id}' was not found.");
}
