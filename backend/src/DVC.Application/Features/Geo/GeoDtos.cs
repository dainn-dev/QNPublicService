namespace DVC.Application.Features.Geo;

public sealed record ProvinceDto(int Code, string Name, string? CodeName, string? DivisionType, string? PhoneCode);

public sealed record WardDto(int Code, string Name, string? CodeName, string? DivisionType, int ProvinceCode);
