namespace DVC.Domain.Common;

/// <summary>Canonical role codes. Mirrored as roles in the DainnUser store.</summary>
public static class Roles
{
    public const string Citizen = "citizen";
    public const string Officer = "officer";
    public const string Admin = "admin";
    public const string Super = "super";

    public static readonly IReadOnlyList<string> All = new[] { Citizen, Officer, Admin, Super };
}
