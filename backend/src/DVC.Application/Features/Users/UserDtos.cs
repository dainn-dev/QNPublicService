namespace DVC.Application.Features.Users;

/// <summary>Admin request to create a user account plus its profile and (optionally) a role.</summary>
public sealed record CreateUserDto(
    string Email, string Username, string Password,
    string? FullName, string? Phone, string? Address, string? Role);

/// <summary>Admin request to update an existing user's profile (never touches credentials).</summary>
public sealed record UpdateUserProfileDto(string? FullName, string? Phone, string? Address);
