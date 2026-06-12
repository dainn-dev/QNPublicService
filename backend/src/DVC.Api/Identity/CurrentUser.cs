using System.Security.Claims;
using DVC.Application.Abstractions.Identity;

namespace DVC.Api.Identity;

/// <summary>Resolves the authenticated caller from the JWT on the current HTTP request.</summary>
public sealed class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _accessor;

    public CurrentUser(IHttpContextAccessor accessor) => _accessor = accessor;

    private ClaimsPrincipal? Principal => _accessor.HttpContext?.User;

    public Guid? UserId
    {
        get
        {
            var sub = Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? Principal?.FindFirstValue("sub");
            return Guid.TryParse(sub, out var id) ? id : null;
        }
    }

    public string? Email => Principal?.FindFirstValue(ClaimTypes.Email) ?? Principal?.FindFirstValue("email");

    public IReadOnlyList<string> Roles =>
        Principal?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() ?? new List<string>();

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated ?? false;

    public bool IsInRole(string role) => Principal?.IsInRole(role) ?? false;

    public Guid RequireUserId() => UserId
        ?? throw new UnauthorizedAccessException("No authenticated user on the current request.");
}
