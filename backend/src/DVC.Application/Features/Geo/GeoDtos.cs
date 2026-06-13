namespace DVC.Application.Features.Geo;

public sealed record ProvinceDto(int Code, string Name, string? CodeName, string? DivisionType, string? PhoneCode);

public sealed record WardDto(int Code, string Name, string? CodeName, string? DivisionType, int ProvinceCode);

// Admin CRUD. Code is the government numeric key — supplied on create, immutable thereafter.
public sealed record CreateProvinceDto(int Code, string Name, string? CodeName, string? DivisionType, string? PhoneCode);
public sealed record UpdateProvinceDto(string Name, string? CodeName, string? DivisionType, string? PhoneCode);

public sealed record CreateWardDto(int Code, string Name, string? CodeName, string? DivisionType, int ProvinceCode);
public sealed record UpdateWardDto(string Name, string? CodeName, string? DivisionType, int ProvinceCode);
