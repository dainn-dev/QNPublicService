using System.Linq.Expressions;
using System.Text;
using DVC.Application.Abstractions;
using DVC.Application.Common;
using DVC.Domain.Audit;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Audit;

public sealed record AuditLogDto(
    Guid Id, Guid? ActorUserId, string Action, string EntityType, Guid? EntityId,
    string? OldValue, string? NewValue, string? IpAddress, DateTime CreatedAt);

/// <summary>Filter + paging inputs for the admin audit-log screen. Page/PageSize are ignored by export.</summary>
public sealed record AuditLogQuery(
    int Page = 1,
    int PageSize = 50,
    string? EntityType = null,
    Guid? ActorUserId = null,
    string? Action = null,
    DateOnly? From = null,
    DateOnly? To = null,
    string? Search = null);

public sealed class AuditService
{
    /// <summary>Hard cap on export rows so a wide date range can't stream an unbounded file.</summary>
    private const int MaxExportRows = 50_000;

    private static readonly Expression<Func<AuditLog, AuditLogDto>> ToDto =
        a => new AuditLogDto(a.Id, a.ActorUserId, a.Action, a.EntityType, a.EntityId, a.OldValue, a.NewValue, a.IpAddress, a.CreatedAt);

    private readonly IAppDbContext _db;

    public AuditService(IAppDbContext db) => _db = db;

    public async Task<PagedResult<AuditLogDto>> GetAsync(AuditLogQuery query, CancellationToken ct = default)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 200);

        var filtered = ApplyFilters(_db.AuditLogs.AsQueryable(), query);

        var total = await filtered.CountAsync(ct);
        var items = await filtered
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ToDto)
            .ToListAsync(ct);

        return new PagedResult<AuditLogDto>(items, page, pageSize, total);
    }

    /// <summary>Renders the filtered logs (newest first, capped) as a UTF-8 CSV with a BOM for Excel.</summary>
    public async Task<byte[]> ExportCsvAsync(AuditLogQuery query, CancellationToken ct = default)
    {
        var rows = await ApplyFilters(_db.AuditLogs.AsQueryable(), query)
            .OrderByDescending(a => a.CreatedAt)
            .Take(MaxExportRows)
            .Select(ToDto)
            .ToListAsync(ct);

        var sb = new StringBuilder();
        sb.Append('\uFEFF'); // BOM so Excel reads the UTF-8 Vietnamese text correctly.
        sb.Append("Time,User,Action,EntityType,EntityId,OldValue,NewValue,IpAddress\n");
        foreach (var r in rows)
        {
            sb.Append(Csv(r.CreatedAt.ToString("o"))).Append(',')
              .Append(Csv(r.ActorUserId?.ToString())).Append(',')
              .Append(Csv(r.Action)).Append(',')
              .Append(Csv(r.EntityType)).Append(',')
              .Append(Csv(r.EntityId?.ToString())).Append(',')
              .Append(Csv(r.OldValue)).Append(',')
              .Append(Csv(r.NewValue)).Append(',')
              .Append(Csv(r.IpAddress)).Append('\n');
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private static IQueryable<AuditLog> ApplyFilters(IQueryable<AuditLog> query, AuditLogQuery f)
    {
        if (!string.IsNullOrWhiteSpace(f.EntityType))
            query = query.Where(a => a.EntityType == f.EntityType);

        if (f.ActorUserId is { } actor)
            query = query.Where(a => a.ActorUserId == actor);

        if (!string.IsNullOrWhiteSpace(f.Action))
            query = query.Where(a => a.Action == f.Action);

        if (f.From is { } from)
        {
            var fromUtc = DateTime.SpecifyKind(from.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            query = query.Where(a => a.CreatedAt >= fromUtc);
        }

        if (f.To is { } to)
        {
            // Inclusive end-of-day: everything strictly before the start of the next day.
            var toExclusive = DateTime.SpecifyKind(to.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc).AddDays(1);
            query = query.Where(a => a.CreatedAt < toExclusive);
        }

        if (!string.IsNullOrWhiteSpace(f.Search))
        {
            var raw = f.Search.Trim();
            var term = raw.ToLower();
            // Free-text over the text columns (entity/action/ip). When the term is a GUID it also
            // matches the actor or entity id. OldValue/NewValue are jsonb and are intentionally left
            // out: a LIKE over jsonb is not translatable on PostgreSQL.
            if (Guid.TryParse(raw, out var termId))
            {
                query = query.Where(a =>
                    a.ActorUserId == termId ||
                    a.EntityId == termId ||
                    a.EntityType.ToLower().Contains(term) ||
                    a.Action.ToLower().Contains(term) ||
                    (a.IpAddress != null && a.IpAddress.ToLower().Contains(term)));
            }
            else
            {
                query = query.Where(a =>
                    a.EntityType.ToLower().Contains(term) ||
                    a.Action.ToLower().Contains(term) ||
                    (a.IpAddress != null && a.IpAddress.ToLower().Contains(term)));
            }
        }

        return query;
    }

    private static string Csv(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return string.Empty;
        return $"\"{value.Replace("\"", "\"\"")}\"";
    }
}
