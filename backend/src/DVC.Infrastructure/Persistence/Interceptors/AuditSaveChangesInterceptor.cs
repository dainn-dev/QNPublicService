using System.Text.Json;
using DVC.Application.Abstractions.Identity;
using DVC.Domain.Audit;
using DVC.Domain.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace DVC.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Writes an <see cref="AuditLog"/> row for every insert/update/delete of an <see cref="IAuditableEntity"/>.
/// AuditLog itself is not auditable, so there is no recursion.
/// </summary>
public sealed class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUser _currentUser;
    private readonly IHttpContextAccessor _http;

    public AuditSaveChangesInterceptor(ICurrentUser currentUser, IHttpContextAccessor http)
    {
        _currentUser = currentUser;
        _http = http;
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;
        if (context is not null)
            AddAuditEntries(context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void AddAuditEntries(DbContext context)
    {
        var now = DateTime.UtcNow;
        var actor = _currentUser.UserId;
        var ip = _http.HttpContext?.Connection.RemoteIpAddress?.ToString();
        var ua = _http.HttpContext?.Request.Headers.UserAgent.ToString();

        var auditable = context.ChangeTracker.Entries<IAuditableEntity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList();

        var logs = new List<AuditLog>(auditable.Count);
        foreach (var entry in auditable)
        {
            var (action, oldVal, newVal) = entry.State switch
            {
                EntityState.Added => ("Created", (string?)null, Serialize(entry.CurrentValues)),
                EntityState.Deleted => ("Deleted", Serialize(entry.OriginalValues), (string?)null),
                _ => ("Updated", Serialize(entry.OriginalValues), Serialize(entry.CurrentValues))
            };

            logs.Add(new AuditLog
            {
                ActorUserId = actor,
                Action = action,
                EntityType = entry.Entity.GetType().Name,
                EntityId = TryGetId(entry),
                OldValue = oldVal,
                NewValue = newVal,
                IpAddress = ip,
                UserAgent = ua,
                CreatedAt = now
            });
        }

        if (logs.Count > 0)
            context.Set<AuditLog>().AddRange(logs);
    }

    private static Guid? TryGetId(EntityEntry entry)
        => entry.Entity is BaseEntity be ? be.Id : null;

    private static string Serialize(PropertyValues values)
    {
        var dict = new Dictionary<string, object?>();
        foreach (var p in values.Properties)
            dict[p.Name] = values[p.Name];
        return JsonSerializer.Serialize(dict);
    }
}
