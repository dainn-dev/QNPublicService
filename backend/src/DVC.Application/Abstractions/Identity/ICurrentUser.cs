namespace DVC.Application.Abstractions.Identity;

/// <summary>Ambient accessor for the authenticated caller, resolved from the JWT.</summary>
public interface ICurrentUser
{
    Guid? UserId { get; }
    string? Email { get; }
    IReadOnlyList<string> Roles { get; }
    bool IsAuthenticated { get; }

    bool IsInRole(string role);

    /// <summary>The caller's id or throws if anonymous — for endpoints that require authentication.</summary>
    Guid RequireUserId();
}
