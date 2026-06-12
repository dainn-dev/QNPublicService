namespace DVC.Application.Abstractions;

public sealed record GeoSeedResult(int Provinces, int Wards);

/// <summary>Fetches Vietnam administrative units from the public API and upserts them locally.</summary>
public interface IGeoSeeder
{
    Task<GeoSeedResult> SeedAsync(CancellationToken ct = default);
}
