using DVC.Application.Abstractions;
using DVC.Domain.Common;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Stats;

public sealed class StatsService
{
    private readonly IAppDbContext _db;

    public StatsService(IAppDbContext db) => _db = db;

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var totalServices = await _db.PublicServices.CountAsync(s => s.IsActive, ct);
        var totalServicePoints = await _db.ServicePoints.CountAsync(ct);
        var totalResolved = await _db.ServiceRequests.CountAsync(r => r.Status == ServiceRequestStatus.Completed, ct);

        // Satisfaction = mean of all 1–5 scores across both rating sources, as a percentage.
        var pointCount = await _db.ServicePointRatings.CountAsync(ct);
        var requestCount = await _db.ServiceRequestRatings.CountAsync(ct);
        var totalCount = pointCount + requestCount;

        double satisfactionRate = 0;
        if (totalCount > 0)
        {
            var pointSum = pointCount == 0 ? 0 : await _db.ServicePointRatings.SumAsync(r => r.Score, ct);
            var requestSum = requestCount == 0 ? 0 : await _db.ServiceRequestRatings.SumAsync(r => r.Score, ct);
            satisfactionRate = Math.Round((pointSum + requestSum) / (double)totalCount / 5d * 100d, 1);
        }

        return new DashboardStatsDto(totalServices, totalServicePoints, totalResolved, satisfactionRate);
    }
}
