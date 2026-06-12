using DVC.Application.Abstractions;
using DVC.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Audit;

public sealed record AuditLogDto(
    Guid Id, Guid? ActorUserId, string Action, string EntityType, Guid? EntityId,
    string? OldValue, string? NewValue, string? IpAddress, DateTime CreatedAt);

public sealed class AuditService
{
    private readonly IAppDbContext _db;

    public AuditService(IAppDbContext db) => _db = db;

    public async Task<PagedResult<AuditLogDto>> GetAsync(
        int page, int pageSize, string? entityType, Guid? actorUserId, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var query = _db.AuditLogs.AsQueryable();
        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(a => a.EntityType == entityType);
        if (actorUserId is { } actor)
            query = query.Where(a => a.ActorUserId == actor);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto(a.Id, a.ActorUserId, a.Action, a.EntityType, a.EntityId, a.OldValue, a.NewValue, a.IpAddress, a.CreatedAt))
            .ToListAsync(ct);

        return new PagedResult<AuditLogDto>(items, page, pageSize, total);
    }
}
