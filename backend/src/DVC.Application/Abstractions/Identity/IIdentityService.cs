namespace DVC.Application.Abstractions.Identity;

/// <summary>
/// Tokens + identity returned by an authentication operation.
/// </summary>
public sealed record AuthResult(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiresAt,
    DateTime RefreshTokenExpiresAt,
    Guid? UserId,
    bool RequiresTwoFactor);

/// <summary>
/// Single seam over the user/auth provider (DainnUser). Nothing outside
/// <c>DVC.Infrastructure.Identity</c> references the DainnUser packages — swapping the
/// adapter for an in-house BCrypt+JWT implementation only touches the adapter.
/// </summary>
public interface IIdentityService
{
    Task<Guid> RegisterAsync(string email, string username, string password, CancellationToken ct = default);

    Task<AuthResult> LoginAsync(string email, string password, string? ipAddress, string? userAgent, CancellationToken ct = default);

    Task<AuthResult> RefreshTokenAsync(string refreshToken, string? ipAddress, string? userAgent, CancellationToken ct = default);

    Task LogoutAsync(Guid userId, CancellationToken ct = default);
}
