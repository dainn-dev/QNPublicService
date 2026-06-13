using DVC.Application.Abstractions;
using DVC.Application.Common;
using DVC.Domain.Geo;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Geo;

public sealed class GeoService
{
    private readonly IAppDbContext _db;

    public GeoService(IAppDbContext db) => _db = db;

    public async Task<IReadOnlyList<ProvinceDto>> GetProvincesAsync(CancellationToken ct = default) =>
        await _db.Provinces
            .OrderBy(p => p.Name)
            .Select(p => new ProvinceDto(p.Code, p.Name, p.CodeName, p.DivisionType, p.PhoneCode))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<WardDto>> GetWardsAsync(int provinceCode, CancellationToken ct = default) =>
        await _db.Wards
            .Where(w => w.ProvinceCode == provinceCode)
            .OrderBy(w => w.Name)
            .Select(w => new WardDto(w.Code, w.Name, w.CodeName, w.DivisionType, w.ProvinceCode))
            .ToListAsync(ct);

    // ----- Province admin CRUD -----

    public async Task<ProvinceDto> CreateProvinceAsync(CreateProvinceDto dto, CancellationToken ct = default)
    {
        if (await _db.Provinces.AnyAsync(p => p.Code == dto.Code, ct))
            throw new ConflictException($"Province code '{dto.Code}' already exists.");

        var entity = new Province
        {
            Code = dto.Code,
            Name = dto.Name,
            CodeName = dto.CodeName,
            DivisionType = dto.DivisionType,
            PhoneCode = dto.PhoneCode
        };
        _db.Provinces.Add(entity);
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task<ProvinceDto> UpdateProvinceAsync(int code, UpdateProvinceDto dto, CancellationToken ct = default)
    {
        var entity = await _db.Provinces.FirstOrDefaultAsync(p => p.Code == code, ct)
            ?? throw NotFoundException.For("Province", code);
        entity.Name = dto.Name;
        entity.CodeName = dto.CodeName;
        entity.DivisionType = dto.DivisionType;
        entity.PhoneCode = dto.PhoneCode;
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task DeleteProvinceAsync(int code, CancellationToken ct = default)
    {
        var entity = await _db.Provinces.FirstOrDefaultAsync(p => p.Code == code, ct)
            ?? throw NotFoundException.For("Province", code);

        // Wards cascade on delete, but require the admin to clear them first so the destruction is explicit.
        if (await _db.Wards.AnyAsync(w => w.ProvinceCode == code, ct))
            throw new ConflictException("Cannot delete a province that still has wards. Delete its wards first.");
        // ServicePoint.ProvinceCode is a plain column, not a FK — guard it by hand.
        if (await _db.ServicePoints.AnyAsync(sp => sp.ProvinceCode == code, ct))
            throw new ConflictException("Cannot delete a province referenced by service points.");

        _db.Provinces.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ----- Ward admin CRUD -----

    public async Task<WardDto> CreateWardAsync(CreateWardDto dto, CancellationToken ct = default)
    {
        if (await _db.Wards.AnyAsync(w => w.Code == dto.Code, ct))
            throw new ConflictException($"Ward code '{dto.Code}' already exists.");
        if (!await _db.Provinces.AnyAsync(p => p.Code == dto.ProvinceCode, ct))
            throw NotFoundException.For("Province", dto.ProvinceCode);

        var entity = new Ward
        {
            Code = dto.Code,
            Name = dto.Name,
            CodeName = dto.CodeName,
            DivisionType = dto.DivisionType,
            ProvinceCode = dto.ProvinceCode
        };
        _db.Wards.Add(entity);
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task<WardDto> UpdateWardAsync(int code, UpdateWardDto dto, CancellationToken ct = default)
    {
        var entity = await _db.Wards.FirstOrDefaultAsync(w => w.Code == code, ct)
            ?? throw NotFoundException.For("Ward", code);
        if (dto.ProvinceCode != entity.ProvinceCode &&
            !await _db.Provinces.AnyAsync(p => p.Code == dto.ProvinceCode, ct))
            throw NotFoundException.For("Province", dto.ProvinceCode);

        entity.Name = dto.Name;
        entity.CodeName = dto.CodeName;
        entity.DivisionType = dto.DivisionType;
        entity.ProvinceCode = dto.ProvinceCode;
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task DeleteWardAsync(int code, CancellationToken ct = default)
    {
        var entity = await _db.Wards.FirstOrDefaultAsync(w => w.Code == code, ct)
            ?? throw NotFoundException.For("Ward", code);

        // ServicePoint.WardCode is a plain column, not a FK — guard it by hand.
        if (await _db.ServicePoints.AnyAsync(sp => sp.WardCode == code, ct))
            throw new ConflictException("Cannot delete a ward referenced by service points.");

        _db.Wards.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    private static ProvinceDto ToDto(Province p) => new(p.Code, p.Name, p.CodeName, p.DivisionType, p.PhoneCode);
    private static WardDto ToDto(Ward w) => new(w.Code, w.Name, w.CodeName, w.DivisionType, w.ProvinceCode);
}
