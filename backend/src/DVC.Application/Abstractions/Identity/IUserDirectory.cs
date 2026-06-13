namespace DVC.Application.Abstractions.Identity;

/// <summary>
/// Read-only lookups over the DainnUser user store that the app store (AppDbContext) cannot answer
/// on its own — e.g. enumerating every citizen for a broadcast. Implemented in Infrastructure over
/// DainnUser so the Application layer never references the DainnUser packages.
/// </summary>
public interface IUserDirectory
{
    /// <summary>Ids of every user holding the citizen role — recipients for an all-citizens broadcast.</summary>
    Task<IReadOnlyList<Guid>> GetAllCitizenIdsAsync(CancellationToken ct = default);
}
