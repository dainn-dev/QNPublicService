using DVC.Application.Abstractions;
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
}
