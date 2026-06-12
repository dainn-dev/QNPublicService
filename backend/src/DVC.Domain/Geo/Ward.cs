namespace DVC.Domain.Geo;

/// <summary>
/// Ward / commune (bottom tier). Keyed by government numeric <see cref="Code"/>; belongs to a <see cref="Province"/>.
/// </summary>
public class Ward
{
    public int Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? CodeName { get; set; }
    public string? DivisionType { get; set; }

    public int ProvinceCode { get; set; }
    public Province? Province { get; set; }
}
