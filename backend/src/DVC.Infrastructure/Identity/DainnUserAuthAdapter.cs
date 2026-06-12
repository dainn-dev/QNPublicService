using DainnUser.Core.Interfaces.Services;
using DVC.Application.Abstractions.Identity;

namespace DVC.Infrastructure.Identity;

/// <summary>
/// The ONLY file that references the DainnUser packages. Implements <see cref="IIdentityService"/>
/// by delegating to DainnUser's <see cref="IAuthenticationService"/>. To drop DainnUser, replace
/// this single class with a BCrypt + JWT implementation behind the same interface.
/// </summary>
internal sealed class DainnUserAuthAdapter : IIdentityService
{
    private readonly IAuthenticationService _auth;

    public DainnUserAuthAdapter(IAuthenticationService auth) => _auth = auth;

    public Task<Guid> RegisterAsync(string email, string username, string password, CancellationToken ct = default)
        => _auth.RegisterAsync(email, username, password, ct);

    public async Task<AuthResult> LoginAsync(string email, string password, string? ipAddress, string? userAgent, CancellationToken ct = default)
    {
        // 5th arg is an optional 2FA/recaptcha code (undocumented in the package XML); null = not provided.
        var r = await _auth.LoginAsync(email, password, ipAddress ?? string.Empty, userAgent ?? string.Empty, null, ct);
        return Map(r);
    }

    public async Task<AuthResult> RefreshTokenAsync(string refreshToken, string? ipAddress, string? userAgent, CancellationToken ct = default)
    {
        var r = await _auth.RefreshTokenAsync(refreshToken, ipAddress ?? string.Empty, userAgent ?? string.Empty, ct);
        return Map(r);
    }

    public Task LogoutAsync(Guid userId, CancellationToken ct = default)
        => _auth.LogoutAsync(userId, ct);

    private static AuthResult Map(DainnUser.Core.Models.Authentication.LoginResult r) => new(
        AccessToken: r.AccessToken,
        RefreshToken: r.RefreshToken,
        AccessTokenExpiresAt: r.AccessTokenExpiresAt,
        RefreshTokenExpiresAt: r.RefreshTokenExpiresAt,
        UserId: r.User?.Id,
        RequiresTwoFactor: r.RequiresTwoFactor);
}
