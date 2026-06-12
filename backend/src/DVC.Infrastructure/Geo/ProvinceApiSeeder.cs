using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using DVC.Application.Abstractions;
using DVC.Domain.Geo;
using DVC.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace DVC.Infrastructure.Geo;

/// <summary>
/// Seeds provinces + wards (2-tier) from https://provinces.open-api.vn/api/v2/?depth=2.
/// Upserts by the government numeric <c>code</c>, so it is idempotent and safe to re-run.
/// </summary>
internal sealed class ProvinceApiSeeder : IGeoSeeder
{
    private readonly HttpClient _http;
    private readonly AppDbContext _db;
    private readonly ILogger<ProvinceApiSeeder> _logger;

    public ProvinceApiSeeder(HttpClient http, AppDbContext db, ILogger<ProvinceApiSeeder> logger)
    {
        _http = http;
        _db = db;
        _logger = logger;
    }

    public async Task<GeoSeedResult> SeedAsync(CancellationToken ct = default)
    {
        var provinces = await _http.GetFromJsonAsync<List<ApiProvince>>("?depth=2", ct)
            ?? throw new InvalidOperationException("Provinces API returned no data.");

        var existingProvinces = await _db.Provinces.ToDictionaryAsync(p => p.Code, ct);
        var existingWards = await _db.Wards.ToDictionaryAsync(w => w.Code, ct);

        var pCount = 0;
        var wCount = 0;

        foreach (var ap in provinces)
        {
            if (!existingProvinces.TryGetValue(ap.Code, out var province))
            {
                province = new Province { Code = ap.Code };
                _db.Provinces.Add(province);
                existingProvinces[ap.Code] = province;
            }
            province.Name = ap.Name;
            province.CodeName = ap.CodeName;
            province.DivisionType = ap.DivisionType;
            province.PhoneCode = ToStringValue(ap.PhoneCode);
            pCount++;

            foreach (var aw in ap.Wards)
            {
                if (!existingWards.TryGetValue(aw.Code, out var ward))
                {
                    ward = new Ward { Code = aw.Code };
                    _db.Wards.Add(ward);
                    existingWards[aw.Code] = ward;
                }
                ward.Name = aw.Name;
                ward.CodeName = aw.CodeName;
                ward.DivisionType = aw.DivisionType;
                ward.ProvinceCode = ap.Code;
                wCount++;
            }
        }

        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Geo seed complete: {Provinces} provinces, {Wards} wards.", pCount, wCount);
        return new GeoSeedResult(pCount, wCount);
    }

    /// <summary>phone_code arrives as a JSON number in v2 (the docs show a string), so accept either.</summary>
    private static string? ToStringValue(JsonElement e) => e.ValueKind switch
    {
        JsonValueKind.String => e.GetString(),
        JsonValueKind.Number => e.GetRawText(),
        _ => null
    };

    private sealed record ApiProvince(
        [property: JsonPropertyName("code")] int Code,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("codename")] string? CodeName,
        [property: JsonPropertyName("division_type")] string? DivisionType,
        [property: JsonPropertyName("phone_code")] JsonElement PhoneCode,
        [property: JsonPropertyName("wards")] List<ApiWard> Wards);

    private sealed record ApiWard(
        [property: JsonPropertyName("code")] int Code,
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("codename")] string? CodeName,
        [property: JsonPropertyName("division_type")] string? DivisionType);
}
