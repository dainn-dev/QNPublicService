using DVC.Application.Abstractions;
using DVC.Application.Abstractions.Identity;
using DVC.Application.Common;
using DVC.Domain.Identity;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Users;

/// <summary>
/// Admin-facing user management. Orchestrates account/role operations (DainnUser, via
/// <see cref="IIdentityService"/> / <see cref="IUserAdminService"/>) with the app-owned
/// <see cref="UserProfile"/> store so callers see one combined <see cref="AdminUserDto"/>.
/// </summary>
public sealed class ManageUsersService
{
    private readonly IAppDbContext _db;
    private readonly IUserAdminService _userAdmin;
    private readonly IIdentityService _identity;

    public ManageUsersService(IAppDbContext db, IUserAdminService userAdmin, IIdentityService identity)
    {
        _db = db;
        _userAdmin = userAdmin;
        _identity = identity;
    }

    public async Task<PagedResult<AdminUserDto>> ListAsync(int page, int pageSize, string? search, CancellationToken ct = default)
    {
        var users = await _userAdmin.GetUsersAsync(page, pageSize, search, ct);
        var profiles = await LoadProfilesAsync(users.Items.Select(u => u.Id), ct);
        var items = users.Items.Select(u => Enrich(u, profiles)).ToList();
        return new PagedResult<AdminUserDto>(items, users.Page, users.PageSize, users.TotalCount);
    }

    public async Task<AdminUserDto> GetAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userAdmin.GetUserAsync(userId, ct);
        var profile = await _db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, ct);
        return WithProfile(user, profile);
    }

    public async Task<AdminUserDto> CreateAsync(CreateUserDto dto, CancellationToken ct = default)
    {
        var userId = await _identity.RegisterAsync(dto.Email, dto.Username, dto.Password, ct);

        _db.UserProfiles.Add(new UserProfile
        {
            UserId = userId,
            FullName = dto.FullName,
            Phone = dto.Phone,
            Address = dto.Address
        });
        await _db.SaveChangesAsync(ct);

        if (!string.IsNullOrWhiteSpace(dto.Role))
            await _userAdmin.AssignRoleAsync(userId, dto.Role.Trim(), ct);

        return await GetAsync(userId, ct);
    }

    public async Task<AdminUserDto> UpdateProfileAsync(Guid userId, UpdateUserProfileDto dto, CancellationToken ct = default)
    {
        // Surface a 404 for an unknown account before creating an orphan profile row.
        var user = await _userAdmin.GetUserAsync(userId, ct);

        var profile = await _db.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (profile is null)
        {
            profile = new UserProfile { UserId = userId };
            _db.UserProfiles.Add(profile);
        }
        profile.FullName = dto.FullName;
        profile.Phone = dto.Phone;
        profile.Address = dto.Address;
        await _db.SaveChangesAsync(ct);

        return WithProfile(user, profile);
    }

    private async Task<Dictionary<Guid, UserProfile>> LoadProfilesAsync(IEnumerable<Guid> userIds, CancellationToken ct)
    {
        var ids = userIds.ToList();
        if (ids.Count == 0) return new Dictionary<Guid, UserProfile>();

        return await _db.UserProfiles.AsNoTracking()
            .Where(p => ids.Contains(p.UserId))
            .ToDictionaryAsync(p => p.UserId, ct);
    }

    private static AdminUserDto Enrich(AdminUserDto user, IReadOnlyDictionary<Guid, UserProfile> profiles) =>
        WithProfile(user, profiles.TryGetValue(user.Id, out var p) ? p : null);

    private static AdminUserDto WithProfile(AdminUserDto user, UserProfile? profile) =>
        user with { FullName = profile?.FullName, Phone = profile?.Phone, Address = profile?.Address };
}
