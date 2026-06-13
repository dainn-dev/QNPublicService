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

    /// <summary>Service-request statuses that count toward an officer's live workload (i.e. not yet terminal).</summary>
    private static readonly ServiceRequestStatus[] OpenStatuses =
    {
        ServiceRequestStatus.Submitted, ServiceRequestStatus.Received,
        ServiceRequestStatus.Processing, ServiceRequestStatus.WaitingSupplement
    };

    public async Task<IReadOnlyList<OfficerProfileDto>> ListAsync(bool includeInactive, CancellationToken ct = default) =>
        await _db.OfficerProfiles
            .Where(o => includeInactive || o.IsActive)
            .OrderBy(o => o.FullName)
            .Select(o => new OfficerProfileDto(
                o.Id, o.UserId, o.FullName, o.Department, o.Position, o.ServicePointId, o.PhoneNumber, o.IsActive, o.Area,
                _db.ServiceRequests.Count(r => r.AssignedOfficerId == o.UserId && OpenStatuses.Contains(r.Status))))
            .ToListAsync(ct);

    /// <summary>Active officers only, with no contact details — safe for the officer role.</summary>
    public async Task<IReadOnlyList<OfficerSummaryDto>> ListActiveSummariesAsync(CancellationToken ct = default) =>
        await _db.OfficerProfiles
            .Where(o => o.IsActive)
            .OrderBy(o => o.FullName)
            .Select(o => new OfficerSummaryDto(o.Id, o.UserId, o.FullName, o.Department, o.Position))
            .ToListAsync(ct);

    public async Task<OfficerProfileDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var o = await _db.OfficerProfiles.FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw NotFoundException.For("Officer profile", id);
        return await ToDtoAsync(o, ct);
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
            PhoneNumber = dto.PhoneNumber,
            Area = dto.Area
        };
        _db.OfficerProfiles.Add(entity);
        await _db.SaveChangesAsync(ct);

        // Grant the officer role so the user can access the officer portal.
        await _userAdmin.AssignRoleAsync(dto.UserId, Roles.Officer, ct);
        return await ToDtoAsync(entity, ct);
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
        entity.Area = dto.Area;
        await _db.SaveChangesAsync(ct);
        return await ToDtoAsync(entity, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.OfficerProfiles.FirstOrDefaultAsync(o => o.Id == id, ct)
            ?? throw NotFoundException.For("Officer profile", id);
        _db.OfficerProfiles.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    private async Task<OfficerProfileDto> ToDtoAsync(OfficerProfile o, CancellationToken ct)
    {
        var workload = await _db.ServiceRequests
            .CountAsync(r => r.AssignedOfficerId == o.UserId && OpenStatuses.Contains(r.Status), ct);
        return new(o.Id, o.UserId, o.FullName, o.Department, o.Position, o.ServicePointId, o.PhoneNumber, o.IsActive, o.Area, workload);
    }
}
