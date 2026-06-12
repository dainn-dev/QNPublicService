namespace DVC.Application.Features.Officers;

public sealed record OfficerProfileDto(
    Guid Id, Guid UserId, string FullName, string? Department, string? Position,
    Guid? ServicePointId, string? PhoneNumber, bool IsActive);

public sealed record CreateOfficerProfileDto(
    Guid UserId, string FullName, string? Department, string? Position, Guid? ServicePointId, string? PhoneNumber);

public sealed record UpdateOfficerProfileDto(
    string FullName, string? Department, string? Position, Guid? ServicePointId, string? PhoneNumber, bool IsActive);
