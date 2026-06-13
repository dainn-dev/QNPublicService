using DVC.Application.Abstractions.Identity;

namespace DVC.Tests.Common;

/// <summary>Mutable ICurrentUser stub — swap UserId/Roles mid-test to act as different callers.</summary>
public sealed class FakeCurrentUser : ICurrentUser
{
    public Guid? UserId { get; set; }
    public string? Email { get; set; }
    public IReadOnlyList<string> Roles { get; set; } = Array.Empty<string>();
    public bool IsAuthenticated => UserId is not null;

    public bool IsInRole(string role) => Roles.Contains(role);

    public Guid RequireUserId() => UserId ?? throw new InvalidOperationException("No authenticated user in test.");
}
