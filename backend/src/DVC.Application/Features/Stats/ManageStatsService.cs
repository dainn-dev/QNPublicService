using DVC.Application.Abstractions;
using DVC.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Stats;

/// <summary>Internal (officer-facing) dashboard statistics — distinct from the public StatsService.</summary>
public sealed class ManageStatsService
{
    private static readonly ServiceRequestStatus[] OpenRequestStatuses =
    {
        ServiceRequestStatus.Submitted, ServiceRequestStatus.Received,
        ServiceRequestStatus.Processing, ServiceRequestStatus.WaitingSupplement
    };

    private static readonly FeedbackStatus[] OpenFeedbackStatuses =
    {
        FeedbackStatus.Submitted, FeedbackStatus.Received,
        FeedbackStatus.Assigned, FeedbackStatus.Processing
    };

    private readonly IAppDbContext _db;

    public ManageStatsService(IAppDbContext db) => _db = db;

    public async Task<ManageOverviewStatsDto> GetOverviewAsync(CancellationToken ct = default)
    {
        var totalRequests = await _db.ServiceRequests.CountAsync(ct);
        var openRequests = await _db.ServiceRequests.CountAsync(r => OpenRequestStatuses.Contains(r.Status), ct);
        var resolvedRequests = await _db.ServiceRequests.CountAsync(r => r.Status == ServiceRequestStatus.Completed, ct);
        var openFeedback = await _db.FeedbackReports.CountAsync(r => OpenFeedbackStatuses.Contains(r.Status), ct);

        // SLA: of all completed requests, the share finished on or before the due date.
        // Requests without a due date count as on time.
        double onTimeRate = 0;
        if (resolvedRequests > 0)
        {
            var onTime = await _db.ServiceRequests.CountAsync(r => r.Status == ServiceRequestStatus.Completed
                && (r.DueAt == null || (r.CompletedAt != null && r.CompletedAt <= r.DueAt)), ct);
            onTimeRate = Math.Round(onTime / (double)resolvedRequests * 100d, 1);
        }

        var now = DateTime.UtcNow;
        var thisMonthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastMonthStart = thisMonthStart.AddMonths(-1);

        var requestsThisMonth = await _db.ServiceRequests.CountAsync(r => r.SubmittedAt >= thisMonthStart, ct);
        var requestsLastMonth = await _db.ServiceRequests.CountAsync(r => r.SubmittedAt >= lastMonthStart && r.SubmittedAt < thisMonthStart, ct);
        var feedbackThisMonth = await _db.FeedbackReports.CountAsync(r => r.SubmittedAt >= thisMonthStart, ct);
        var feedbackLastMonth = await _db.FeedbackReports.CountAsync(r => r.SubmittedAt >= lastMonthStart && r.SubmittedAt < thisMonthStart, ct);

        return new ManageOverviewStatsDto(
            totalRequests, openRequests, resolvedRequests, openFeedback, onTimeRate,
            requestsThisMonth, requestsLastMonth, feedbackThisMonth, feedbackLastMonth);
    }

    public async Task<IReadOnlyList<RequestsByMonthDto>> GetRequestsByMonthAsync(int months = 6, CancellationToken ct = default)
    {
        months = Math.Clamp(months, 1, 12);
        var now = DateTime.UtcNow;
        var from = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-(months - 1));

        var received = await _db.ServiceRequests
            .Where(r => r.SubmittedAt >= from)
            .GroupBy(r => new { r.SubmittedAt.Year, r.SubmittedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync(ct);

        var resolved = await _db.ServiceRequests
            .Where(r => r.CompletedAt != null && r.CompletedAt >= from)
            .GroupBy(r => new { r.CompletedAt!.Value.Year, r.CompletedAt!.Value.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync(ct);

        // Emit every month in the window, oldest first, so charts get a gapless series.
        return Enumerable.Range(0, months)
            .Select(i => from.AddMonths(i))
            .Select(m => new RequestsByMonthDto(
                $"{m:yyyy-MM}",
                received.FirstOrDefault(x => x.Year == m.Year && x.Month == m.Month)?.Count ?? 0,
                resolved.FirstOrDefault(x => x.Year == m.Year && x.Month == m.Month)?.Count ?? 0))
            .ToList();
    }

    public async Task<IReadOnlyList<FeedbackByCategoryDto>> GetFeedbackByCategoryAsync(CancellationToken ct = default) =>
        await _db.FeedbackReports
            .GroupBy(r => new { r.CategoryId, r.Category!.Name })
            .Select(g => new FeedbackByCategoryDto(g.Key.CategoryId, g.Key.Name, g.Count()))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<FeedbackHeatmapPointDto>> GetFeedbackHeatmapAsync(CancellationToken ct = default)
    {
        var points = await _db.FeedbackReports
            .Where(r => r.Latitude != null && r.Longitude != null)
            .GroupBy(r => new { r.Latitude, r.Longitude })
            .Select(g => new { g.Key.Latitude, g.Key.Longitude, Count = g.Count() })
            .ToListAsync(ct);
        return points.Select(p => new FeedbackHeatmapPointDto(p.Latitude!.Value, p.Longitude!.Value, p.Count)).ToList();
    }
}
