using DainnUser.Infrastructure.Data;
using DVC.Application.Abstractions.Identity;
using DVC.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace DVC.Infrastructure.Identity;

/// <summary>
/// User-store lookups over DainnUser that AppDbContext cannot answer. Reads go straight to the
/// DainnUser DbContext (stable entity shapes), mirroring <see cref="DainnUserUserAdminAdapter"/>.
/// </summary>
internal sealed class DainnUserUserDirectory : IUserDirectory
{
    private readonly DainnUserDbContext _db;

    public DainnUserUserDirectory(DainnUserDbContext db) => _db = db;

    public async Task<IReadOnlyList<Guid>> GetAllCitizenIdsAsync(CancellationToken ct = default) =>
        await _db.UserRoles.AsNoTracking()
            .Join(_db.Roles.Where(r => r.Name == Roles.Citizen),
                ur => ur.RoleId, r => r.Id, (ur, r) => ur.UserId)
            .Distinct()
            .ToListAsync(ct);
}
