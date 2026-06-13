namespace DVC.Application.Features.Stats;

public sealed record DashboardStatsDto(
    int TotalServices, int TotalServicePoints, int TotalResolved, double SatisfactionRate);
