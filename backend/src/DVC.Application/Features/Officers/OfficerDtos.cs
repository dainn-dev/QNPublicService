namespace DVC.Application.Features.Officers;

public sealed record OfficerProfileDto(
    Guid Id, Guid UserId, string FullName, string? Department, string? Position,
    Guid? ServicePointId, string? PhoneNumber, bool IsActive, string? Area,
    // Computed: number of open (non-terminal) service requests currently assigned to this officer.
    int Workload);

/// <summary>Slim projection for the officer-portal assignment dropdown — no contact details.</summary>
public sealed record OfficerSummaryDto(
    Guid Id, Guid UserId, string FullName, string? Department, string? Position);

public sealed record CreateOfficerProfileDto(
    Guid UserId, string FullName, string? Department, string? Position, Guid? ServicePointId, string? PhoneNumber, string? Area);

public sealed record UpdateOfficerProfileDto(
    string FullName, string? Department, string? Position, Guid? ServicePointId, string? PhoneNumber, bool IsActive, string? Area);
