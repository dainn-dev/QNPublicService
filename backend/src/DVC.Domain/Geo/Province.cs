namespace DVC.Domain.Geo;

/// <summary>
/// Province / centrally-governed city (top tier of Vietnam's 2-tier admin units after the 2025 reform).
/// Keyed by the government numeric <see cref="Code"/> from provinces.open-api.vn so seeding is idempotent.
/// </summary>
public class Province
{
    public int Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? CodeName { get; set; }
    public string? DivisionType { get; set; }
    public string? PhoneCode { get; set; }

    public ICollection<Ward> Wards { get; set; } = new List<Ward>();
}
