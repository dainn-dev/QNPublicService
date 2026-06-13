using DVC.Application.Features.Stats;
using DVC.Domain.Catalog;
using DVC.Domain.Common;
using DVC.Domain.Feedback;
using DVC.Domain.Requests;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Stats;

public sealed class ManageStatsServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly ManageStatsService _service;

    private readonly PublicService _publicService;

    public ManageStatsServiceTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new ManageStatsService(_db);

        var category = new ServiceCategory { Code = "hotich", Name = "Hộ tịch" };
        _publicService = new PublicService { CategoryId = category.Id, Code = "svc01", Name = "Khai sinh" };
        _db.ServiceCategories.Add(category);
        _db.PublicServices.Add(_publicService);
        _db.SaveChanges();
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private ServiceRequest AddRequest(ServiceRequestStatus status, DateTime submittedAt,
        DateTime? dueAt = null, DateTime? completedAt = null)
    {
        var request = new ServiceRequest
        {
            Code = $"REQ-{Guid.NewGuid().ToString("N")[..8]}",
            PublicServiceId = _publicService.Id,
            CitizenId = Guid.NewGuid(),
            Status = status,
            SubmittedAt = submittedAt,
            DueAt = dueAt,
            CompletedAt = completedAt
        };
        _db.ServiceRequests.Add(request);
        return request;
    }

    private FeedbackReport AddFeedback(FeedbackCategory category, FeedbackStatus status, DateTime submittedAt,
        decimal? lat = null, decimal? lng = null)
    {
        var report = new FeedbackReport
        {
            Code = $"PA-{Guid.NewGuid().ToString("N")[..8]}",
            CategoryId = category.Id,
            CitizenId = Guid.NewGuid(),
            Title = "t", Description = "d",
            Status = status,
            SubmittedAt = submittedAt,
            Latitude = lat, Longitude = lng
        };
        _db.FeedbackReports.Add(report);
        return report;
    }

    [Fact]
    public async Task Overview_NoData_ReturnsZeros()
    {
        var stats = await _service.GetOverviewAsync();

        stats.TotalRequests.Should().Be(0);
        stats.OpenRequests.Should().Be(0);
        stats.ResolvedRequests.Should().Be(0);
        stats.OpenFeedback.Should().Be(0);
        stats.OnTimeRate.Should().Be(0);
    }

    [Fact]
    public async Task Overview_CountsOpenResolved_AndOnTimeRate()
    {
        var now = DateTime.UtcNow;
        AddRequest(ServiceRequestStatus.Processing, now);
        AddRequest(ServiceRequestStatus.WaitingSupplement, now);
        // Completed on time (before due date).
        AddRequest(ServiceRequestStatus.Completed, now.AddDays(-10), dueAt: now.AddDays(-1), completedAt: now.AddDays(-2));
        // Completed late.
        AddRequest(ServiceRequestStatus.Completed, now.AddDays(-10), dueAt: now.AddDays(-5), completedAt: now.AddDays(-2));
        // Cancelled — neither open nor resolved.
        AddRequest(ServiceRequestStatus.Cancelled, now);

        var category = new FeedbackCategory { Code = "c1", Name = "C1" };
        _db.FeedbackCategories.Add(category);
        AddFeedback(category, FeedbackStatus.Processing, now);
        AddFeedback(category, FeedbackStatus.Closed, now);
        await _db.SaveChangesAsync();

        var stats = await _service.GetOverviewAsync();

        stats.TotalRequests.Should().Be(5);
        stats.OpenRequests.Should().Be(2);
        stats.ResolvedRequests.Should().Be(2);
        stats.OpenFeedback.Should().Be(1);
        stats.OnTimeRate.Should().Be(50);
    }

    [Fact]
    public async Task Overview_MonthDeltas_SplitOnCalendarMonth()
    {
        var now = DateTime.UtcNow;
        var thisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        AddRequest(ServiceRequestStatus.Submitted, thisMonth.AddDays(1));
        AddRequest(ServiceRequestStatus.Submitted, thisMonth.AddDays(-1));  // last month
        AddRequest(ServiceRequestStatus.Submitted, thisMonth.AddMonths(-2)); // older — in neither bucket
        await _db.SaveChangesAsync();

        var stats = await _service.GetOverviewAsync();

        stats.RequestsThisMonth.Should().Be(1);
        stats.RequestsLastMonth.Should().Be(1);
    }

    [Fact]
    public async Task RequestsByMonth_ReturnsGaplessSeries_GroupedCorrectly()
    {
        var now = DateTime.UtcNow;
        var thisMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var lastMonth = thisMonth.AddMonths(-1);

        AddRequest(ServiceRequestStatus.Submitted, thisMonth.AddDays(2));
        AddRequest(ServiceRequestStatus.Submitted, thisMonth.AddDays(3));
        AddRequest(ServiceRequestStatus.Completed, lastMonth.AddDays(1), completedAt: thisMonth.AddDays(5));
        await _db.SaveChangesAsync();

        var series = await _service.GetRequestsByMonthAsync(months: 3);

        series.Should().HaveCount(3);
        series[^1].Month.Should().Be($"{thisMonth:yyyy-MM}");
        series[^1].Received.Should().Be(2);
        series[^1].Resolved.Should().Be(1);
        series[^2].Month.Should().Be($"{lastMonth:yyyy-MM}");
        series[^2].Received.Should().Be(1);
        series[^2].Resolved.Should().Be(0);
        series[0].Received.Should().Be(0); // empty months still appear
    }

    [Fact]
    public async Task FeedbackByCategory_CountsPerCategory()
    {
        var roads = new FeedbackCategory { Code = "giaothong", Name = "Giao thông" };
        var env = new FeedbackCategory { Code = "moitruong", Name = "Môi trường" };
        _db.FeedbackCategories.AddRange(roads, env);
        var now = DateTime.UtcNow;
        AddFeedback(roads, FeedbackStatus.Submitted, now);
        AddFeedback(roads, FeedbackStatus.Resolved, now);
        AddFeedback(env, FeedbackStatus.Submitted, now);
        await _db.SaveChangesAsync();

        var result = await _service.GetFeedbackByCategoryAsync();

        result.Should().HaveCount(2);
        result.Single(r => r.CategoryId == roads.Id).Count.Should().Be(2);
        result.Single(r => r.CategoryId == env.Id).CategoryName.Should().Be("Môi trường");
    }

    [Fact]
    public async Task FeedbackHeatmap_GroupsByCoordinates_AndSkipsMissingOnes()
    {
        var category = new FeedbackCategory { Code = "c1", Name = "C1" };
        _db.FeedbackCategories.Add(category);
        var now = DateTime.UtcNow;
        AddFeedback(category, FeedbackStatus.Submitted, now, 15.1201m, 108.7922m);
        AddFeedback(category, FeedbackStatus.Submitted, now, 15.1201m, 108.7922m);
        AddFeedback(category, FeedbackStatus.Submitted, now, 15.2000m, 108.8000m);
        AddFeedback(category, FeedbackStatus.Submitted, now); // no coordinates
        await _db.SaveChangesAsync();

        var points = await _service.GetFeedbackHeatmapAsync();

        points.Should().HaveCount(2);
        points.Single(p => p.Lat == 15.1201m && p.Lng == 108.7922m).Weight.Should().Be(2);
        points.Single(p => p.Lat == 15.2000m).Weight.Should().Be(1);
    }
}
