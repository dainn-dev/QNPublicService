using DVC.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Common;

/// <summary>
/// Resolves display names (and citizen phone) for a batch of DainnUser ids in one round trip,
/// without leaking identity types: it reads only the app-owned <c>OfficerProfile</c> /
/// <c>UserProfile</c> stores. An id is matched against the officer directory first (staff acting
/// on a case), then the citizen directory. Missing profiles fall back to a safe placeholder.
/// </summary>
public sealed class PersonNameResolver
{
    /// <summary>Shown when an id has no profile (deleted account, seed data, etc.).</summary>
    public const string UnknownName = "(Không rõ)";

    private readonly IAppDbContext _db;

    public PersonNameResolver(IAppDbContext db) => _db = db;

    /// <summary>
    /// Batch-loads names for the given user ids into an in-memory snapshot. Empty/duplicate ids are
    /// ignored, so callers can pass the raw union of citizen/author/changed-by ids from many rows.
    /// </summary>
    public async Task<PersonNames> LoadAsync(IEnumerable<Guid> userIds, CancellationToken ct = default)
    {
        var ids = userIds.Where(id => id != Guid.Empty).Distinct().ToList();
        if (ids.Count == 0) return PersonNames.Empty;

        var officers = await _db.OfficerProfiles.AsNoTracking()
            .Where(o => ids.Contains(o.UserId))
            .Select(o => new { o.UserId, o.FullName, o.PhoneNumber })
            .ToListAsync(ct);

        var citizens = await _db.UserProfiles.AsNoTracking()
            .Where(p => ids.Contains(p.UserId))
            .Select(p => new { p.UserId, p.FullName, p.Phone })
            .ToListAsync(ct);

        var names = new Dictionary<Guid, (string? Name, string? Phone)>(ids.Count);
        // Citizens first, then officers so an officer profile wins when a user has both.
        foreach (var c in citizens) names[c.UserId] = (c.FullName, c.Phone);
        foreach (var o in officers) names[o.UserId] = (o.FullName, o.PhoneNumber);

        return new PersonNames(names);
    }
}

/// <summary>Immutable snapshot of resolved names, keyed by user id. Safe for synchronous DTO projection.</summary>
public sealed class PersonNames
{
    public static readonly PersonNames Empty = new(new Dictionary<Guid, (string?, string?)>());

    private readonly IReadOnlyDictionary<Guid, (string? Name, string? Phone)> _names;

    public PersonNames(IReadOnlyDictionary<Guid, (string? Name, string? Phone)> names) => _names = names;

    /// <summary>Display name for <paramref name="userId"/>, or the "(Không rõ)" fallback when missing.</summary>
    public string Name(Guid? userId) =>
        userId is { } id && _names.TryGetValue(id, out var n) && !string.IsNullOrWhiteSpace(n.Name)
            ? n.Name!
            : PersonNameResolver.UnknownName;

    /// <summary>Phone for <paramref name="userId"/>, or null when no profile / no phone is on file.</summary>
    public string? Phone(Guid? userId) =>
        userId is { } id && _names.TryGetValue(id, out var n) ? n.Phone : null;
}
