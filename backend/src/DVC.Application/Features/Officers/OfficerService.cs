using DVC.Application.Abstractions;
using DVC.Application.Abstractions.Identity;
using DVC.Application.Common;
using DVC.Domain.Common;
using DVC.Domain.Identity;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Officers;

public sealed class OfficerService
{
    private readonly IAppDbContext _db;
    private readonly IUserAdminService _userAdmin;

    public OfficerService(IAppDbContext db, IUserAdminService userAdmin)
    {
        _db = db;
        _userAdmin = userAdmin;
    }

    public async Task<IReadOnlyList<OfficerProfileDto>> ListAsync(bool includeInactive, CancellationToken ct = default) =>
        await _db.OfficerProfiles
            .Where(o => includeInactive || o.IsActive)
            .OrderBy(o => o.FullName)
            .Select(o => new OfficerProfileDto(o.Id, o.UserId, o.FullName, o.Department, o.Position, o.ServicePointId, o.PhoneNumber, o.IsActive))
            .ToListAsync(ct);

    public async Task<OfficerProfileDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var o = await _db.OfficerProfiles.FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw NotFoundException.For("Officer profile", id);
        return ToDto(o);
    }

    public async Task<OfficerProfileDto> CreateAsync(CreateOfficerProfileDto dto, CancellationToken ct = default)
    {
        if (await _db.OfficerProfiles.AnyAsync(o => o.UserId == dto.UserId, ct))
            throw new ConflictException("This user already has an officer profile.");

        var entity = new OfficerProfile
        {
            UserId = dto.UserId,
            FullName = dto.FullName,
            Department = dto.Department,
            Position = dto.Position,
            ServicePointId = dto.ServicePointId,
            PhoneNumber = dto.PhoneNumber
        };
        _db.OfficerProfiles.Add(entity);
        await _db.SaveChangesAsync(ct);

        // Grant the officer role so the user can access the officer portal.
        await _userAdmin.AssignRoleAsync(dto.UserId, Roles.Officer, ct);
        return ToDto(entity);
    }

    public async Task<OfficerProfileDto> UpdateAsync(Guid id, UpdateOfficerProfileDto dto, CancellationToken ct = default)
    {
        var entity = await _db.OfficerProfiles.FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw NotFoundException.For("Officer profile", id);
        entity.FullName = dto.FullName;
        entity.Department = dto.Department;
        entity.Position = dto.Position;
        entity.ServicePointId = dto.ServicePointId;
        entity.PhoneNumber = dto.PhoneNumber;
        entity.IsActive = dto.IsActive;
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.OfficerProfiles.FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw NotFoundException.For("Officer profile", id);
        _db.OfficerProfiles.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    private static OfficerProfileDto ToDto(OfficerProfile o) =>
        new(o.Id, o.UserId, o.FullName, o.Department, o.Position, o.ServicePointId, o.PhoneNumber, o.IsActive);
}
