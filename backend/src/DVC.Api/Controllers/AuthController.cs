using System.Security.Claims;
using DVC.Application.Abstractions.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IIdentityService _identity;

    public AuthController(IIdentityService identity) => _identity = identity;

    public sealed record RegisterRequest(string Email, string Username, string Password);
    public sealed record LoginRequest(string Email, string Password);
    public sealed record RefreshRequest(string RefreshToken);

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req, CancellationToken ct)
    {
        var userId = await _identity.RegisterAsync(req.Email, req.Username, req.Password, ct);
        return Ok(new { userId });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest req, CancellationToken ct)
    {
        var result = await _identity.LoginAsync(req.Email, req.Password, ClientIp, UserAgent, ct);
        return Ok(result);
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshRequest req, CancellationToken ct)
    {
        var result = await _identity.RefreshTokenAsync(req.RefreshToken, ClientIp, UserAgent, ct);
        return Ok(result);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (Guid.TryParse(sub, out var userId))
            await _identity.LogoutAsync(userId, ct);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value });
        return Ok(new
        {
            id = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"),
            name = User.Identity?.Name,
            roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value),
            claims
        });
    }

    private string? ClientIp => HttpContext.Connection.RemoteIpAddress?.ToString();
    private string? UserAgent => Request.Headers.UserAgent.ToString();
}
