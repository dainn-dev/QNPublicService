using DVC.Application.Features.Stats;
using DVC.Domain.Catalog;
using DVC.Domain.Common;
using DVC.Domain.Engagement;
using DVC.Domain.Requests;
using DVC.Domain.ServicePoints;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Stats;

public sealed class StatsServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly StatsService _service;

    public StatsServiceTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new StatsService(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task GetDashboardStats_NoData_ReturnsZeros()
    {
        var stats = await _service.GetDashboardStatsAsync();

        stats.TotalServices.Should().Be(0);
        stats.TotalServicePoints.Should().Be(0);
        stats.TotalResolved.Should().Be(0);
        stats.SatisfactionRate.Should().Be(0);
    }

    [Fact]
    public async Task GetDashboardStats_CombinesBothRatingSources_AndRounds()
    {
        _db.ServicePointRatings.AddRange(
            new ServicePointRating { ServicePointId = Guid.NewGuid(), UserId = Guid.NewGuid(), Score = 4 },
            new ServicePointRating { ServicePointId = Guid.NewGuid(), UserId = Guid.NewGuid(), Score = 4 });
        _db.ServiceRequestRatings.Add(
            new ServiceRequestRating { ServiceRequestId = Guid.NewGuid(), UserId = Guid.NewGuid(), Score = 5 });
        await _db.SaveChangesAsync();

        var stats = await _service.GetDashboardStatsAsync();

        // (4 + 4 + 5) / 3 / 5 * 100 = 86.666… → 86.7
        stats.SatisfactionRate.Should().Be(86.7);
    }

    [Fact]
    public async Task GetDashboardStats_CountsOnlyActiveServices_AndCompletedRequests()
    {
        var category = new ServiceCategory { Code = "hotich", Name = "Hộ tịch" };
        var active1 = new PublicService { CategoryId = category.Id, Code = "svc01", Name = "A" };
        var active2 = new PublicService { CategoryId = category.Id, Code = "svc02", Name = "B" };
        var inactive = new PublicService { CategoryId = category.Id, Code = "svc03", Name = "C", IsActive = false };
        _db.ServiceCategories.Add(category);
        _db.PublicServices.AddRange(active1, active2, inactive);

        _db.ServiceRequests.AddRange(
            new ServiceRequest { Code = "REQ-1", PublicServiceId = active1.Id, CitizenId = Guid.NewGuid(), Status = ServiceRequestStatus.Completed },
            new ServiceRequest { Code = "REQ-2", PublicServiceId = active1.Id, CitizenId = Guid.NewGuid(), Status = ServiceRequestStatus.Processing },
            new ServiceRequest { Code = "REQ-3", PublicServiceId = active2.Id, CitizenId = Guid.NewGuid(), Status = ServiceRequestStatus.Rejected });

        _db.ServicePoints.AddRange(
            new ServicePoint { Code = "sp01", Name = "Point 1", Address = "Addr 1" },
            new ServicePoint { Code = "sp02", Name = "Point 2", Address = "Addr 2" });
        await _db.SaveChangesAsync();

        var stats = await _service.GetDashboardStatsAsync();

        stats.TotalServices.Should().Be(2);
        stats.TotalServicePoints.Should().Be(2);
        stats.TotalResolved.Should().Be(1);
    }
}
