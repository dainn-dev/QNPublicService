using DVC.Application.Abstractions;
using DVC.Application.Abstractions.Identity;
using DVC.Domain.Common;
using DVC.Domain.Identity;
using Microsoft.EntityFrameworkCore;

namespace DVC.Infrastructure.Persistence.Seed;

/// <summary>
/// Idempotently ensures a default admin account exists so the portal can be signed into out of the
/// box (dev/bootstrap convenience). Goes through the same identity/profile seams the API uses, so it
/// never references DainnUser types directly and never stores credentials in the app store.
/// </summary>
public static class AdminUserSeeder
{
    public static async Task SeedAsync(
        IAppDbContext db, IIdentityService identity, IUserAdminService userAdmin,
        string email, string username, string password, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return;

        // Idempotency: only register when no account with this email exists yet.
        var existing = await userAdmin.GetUsersAsync(1, 1, email, ct);
        var match = existing.Items
            .FirstOrDefault(u => string.Equals(u.Email, email, StringComparison.OrdinalIgnoreCase));

        Guid userId;
        bool hasAdminRole;
        if (match is null)
        {
            userId = await identity.RegisterAsync(email, username, password, ct);
            hasAdminRole = false;
        }
        else
        {
            userId = match.Id;
            hasAdminRole = match.Roles.Any(r => string.Equals(r, Roles.Admin, StringComparison.OrdinalIgnoreCase));
        }

        if (!hasAdminRole)
            await userAdmin.AssignRoleAsync(userId, Roles.Admin, ct);

        if (!await db.UserProfiles.AnyAsync(p => p.UserId == userId, ct))
        {
            db.UserProfiles.Add(new UserProfile
            {
                UserId = userId,
                FullName = "Quản trị viên"
            });
            await db.SaveChangesAsync(ct);
        }
    }
}
