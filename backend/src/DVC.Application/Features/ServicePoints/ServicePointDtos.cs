using DVC.Domain.Common;

namespace DVC.Application.Features.ServicePoints;

public sealed record ServicePointImageDto(Guid Id, string Url, string? Caption, int DisplayOrder);

public sealed record ServicePointDto(
    Guid Id, string Code, string Name, string? NameEn, ServicePointType Type, string Address,
    int? ProvinceCode, int? WardCode, decimal? Latitude, decimal? Longitude,
    string? Phone, string? Email, string? Website, string? WorkingHours, bool IsActive,
    IReadOnlyList<Guid> ServiceIds, IReadOnlyList<ServicePointImageDto> Images);

public sealed record CreateServicePointDto(
    string Code, string Name, string? NameEn, ServicePointType Type, string Address,
    int? ProvinceCode, int? WardCode, decimal? Latitude, decimal? Longitude,
    string? Phone, string? Email, string? Website, string? WorkingHours,
    IReadOnlyList<Guid>? ServiceIds);

public sealed record UpdateServicePointDto(
    string Name, string? NameEn, ServicePointType Type, string Address,
    int? ProvinceCode, int? WardCode, decimal? Latitude, decimal? Longitude,
    string? Phone, string? Email, string? Website, string? WorkingHours, bool IsActive,
    IReadOnlyList<Guid>? ServiceIds);

public sealed record AddServicePointImageDto(string Url, string? Caption, int DisplayOrder);
