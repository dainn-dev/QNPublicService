using DVC.Application.Abstractions;
using DVC.Application.Common;
using DVC.Domain.Common;
using DVC.Domain.ServicePoints;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.ServicePoints;

public sealed class ServicePointsService
{
    private readonly IAppDbContext _db;

    public ServicePointsService(IAppDbContext db) => _db = db;

    public async Task<IReadOnlyList<ServicePointDto>> ListAsync(
        ServicePointType? type, int? wardCode, int? provinceCode, bool includeInactive, CancellationToken ct = default)
    {
        var rows = await _db.ServicePoints
            .Include(p => p.Services)
            .Include(p => p.Images)
            .Where(p => (includeInactive || p.IsActive)
                && (type == null || p.Type == type)
                && (wardCode == null || p.WardCode == wardCode)
                && (provinceCode == null || p.ProvinceCode == provinceCode))
            .OrderBy(p => p.Name)
            .ToListAsync(ct);
        return rows.Select(ToDto).ToList();
    }

    public async Task<ServicePointDto> GetAsync(Guid id, CancellationToken ct = default)
    {
        var p = await _db.ServicePoints
            .Include(p => p.Services)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw NotFoundException.For("Service point", id);
        return ToDto(p);
    }

    public async Task<ServicePointDto> CreateAsync(CreateServicePointDto dto, CancellationToken ct = default)
    {
        if (await _db.ServicePoints.AnyAsync(p => p.Code == dto.Code, ct))
            throw new ConflictException($"Service point code '{dto.Code}' already exists.");

        var entity = new ServicePoint
        {
            Code = dto.Code,
            Name = dto.Name,
            NameEn = dto.NameEn,
            Type = dto.Type,
            Address = dto.Address,
            ProvinceCode = dto.ProvinceCode,
            WardCode = dto.WardCode,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Phone = dto.Phone,
            Email = dto.Email,
            Website = dto.Website,
            WorkingHours = dto.WorkingHours
        };
        _db.ServicePoints.Add(entity);
        await SyncServicesAsync(entity, dto.ServiceIds, ct);
        await _db.SaveChangesAsync(ct);
        return await GetAsync(entity.Id, ct);
    }

    public async Task<ServicePointDto> UpdateAsync(Guid id, UpdateServicePointDto dto, CancellationToken ct = default)
    {
        var entity = await _db.ServicePoints.Include(p => p.Services).FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw NotFoundException.For("Service point", id);

        entity.Name = dto.Name;
        entity.NameEn = dto.NameEn;
        entity.Type = dto.Type;
        entity.Address = dto.Address;
        entity.ProvinceCode = dto.ProvinceCode;
        entity.WardCode = dto.WardCode;
        entity.Latitude = dto.Latitude;
        entity.Longitude = dto.Longitude;
        entity.Phone = dto.Phone;
        entity.Email = dto.Email;
        entity.Website = dto.Website;
        entity.WorkingHours = dto.WorkingHours;
        entity.IsActive = dto.IsActive;

        if (dto.ServiceIds is not null)
            await SyncServicesAsync(entity, dto.ServiceIds, ct);

        await _db.SaveChangesAsync(ct);
        return await GetAsync(id, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.ServicePoints.FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw NotFoundException.For("Service point", id);
        _db.ServicePoints.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<ServicePointImageDto> AddImageAsync(Guid id, AddServicePointImageDto dto, CancellationToken ct = default)
    {
        if (!await _db.ServicePoints.AnyAsync(p => p.Id == id, ct))
            throw NotFoundException.For("Service point", id);
        var img = new ServicePointImage { ServicePointId = id, Url = dto.Url, Caption = dto.Caption, DisplayOrder = dto.DisplayOrder };
        _db.ServicePointImages.Add(img);
        await _db.SaveChangesAsync(ct);
        return new ServicePointImageDto(img.Id, img.Url, img.Caption, img.DisplayOrder);
    }

    private async Task SyncServicesAsync(ServicePoint point, IReadOnlyList<Guid>? serviceIds, CancellationToken ct)
    {
        serviceIds ??= Array.Empty<Guid>();
        var distinct = serviceIds.Distinct().ToList();
        if (distinct.Count > 0)
        {
            var validCount = await _db.PublicServices.CountAsync(s => distinct.Contains(s.Id), ct);
            if (validCount != distinct.Count)
                throw new ConflictException("One or more service ids do not exist.");
        }

        point.Services.Clear();
        foreach (var sid in distinct)
            point.Services.Add(new ServicePointService { ServicePointId = point.Id, PublicServiceId = sid });
    }

    private static ServicePointDto ToDto(ServicePoint p) => new(
        p.Id, p.Code, p.Name, p.NameEn, p.Type, p.Address, p.ProvinceCode, p.WardCode, p.Latitude, p.Longitude,
        p.Phone, p.Email, p.Website, p.WorkingHours, p.IsActive,
        p.Services.Select(s => s.PublicServiceId).ToList(),
        p.Images.OrderBy(i => i.DisplayOrder).Select(i => new ServicePointImageDto(i.Id, i.Url, i.Caption, i.DisplayOrder)).ToList());
}
