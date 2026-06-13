namespace DVC.Application.Features.Stats;

/// <summary>Officer dashboard KPIs. *ThisMonth/*LastMonth pairs let the frontend render a delta.</summary>
public sealed record ManageOverviewStatsDto(
    int TotalRequests, int OpenRequests, int ResolvedRequests, int OpenFeedback,
    double OnTimeRate,
    int RequestsThisMonth, int RequestsLastMonth,
    int FeedbackThisMonth, int FeedbackLastMonth);

public sealed record RequestsByMonthDto(string Month, int Received, int Resolved);

public sealed record FeedbackByCategoryDto(Guid CategoryId, string CategoryName, int Count);

public sealed record FeedbackHeatmapPointDto(decimal Lat, decimal Lng, int Weight);
