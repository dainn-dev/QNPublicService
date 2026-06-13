using DVC.Application.Common;
using DVC.Application.Features.Engagement;
using DVC.Application.Features.Requests;
using DVC.Domain.Catalog;
using DVC.Domain.Common;
using DVC.Domain.Requests;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Requests;

public sealed class ManageRequestListTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly RequestService _service;

    private readonly Guid _serviceA;
    private readonly Guid _serviceB;
    private readonly Guid _pointA = Guid.NewGuid();

    public ManageRequestListTests()
    {
        (_db, _connection) = SqliteDb.Create();
        var user = new FakeCurrentUser { UserId = Guid.NewGuid(), Roles = new[] { Roles.Officer } };
        _service = new RequestService(_db, user, new NotificationService(_db), new PersonNameResolver(_db));

        var category = new ServiceCategory { Code = "hotich", Name = "Hộ tịch" };
        var serviceA = new PublicService { CategoryId = category.Id, Code = "svcA", Name = "A" };
        var serviceB = new PublicService { CategoryId = category.Id, Code = "svcB", Name = "B" };
        _db.ServiceCategories.Add(category);
        _db.PublicServices.AddRange(serviceA, serviceB);
        _serviceA = serviceA.Id;
        _serviceB = serviceB.Id;

        var baseTime = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        for (var i = 0; i < 5; i++)
        {
            _db.ServiceRequests.Add(new ServiceRequest
            {
                Code = $"REQ-A{i}",
                PublicServiceId = _serviceA,
                ServicePointId = i < 2 ? _pointA : null,
                CitizenId = Guid.NewGuid(),
                Status = ServiceRequestStatus.Processing,
                SubmittedAt = baseTime.AddDays(i)
            });
        }
        _db.ServiceRequests.Add(new ServiceRequest
        {
            Code = "REQ-B0", PublicServiceId = _serviceB, CitizenId = Guid.NewGuid(),
            Status = ServiceRequestStatus.Submitted, SubmittedAt = baseTime.AddDays(10)
        });
        _db.SaveChanges();
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task FiltersByPublicService()
    {
        var result = await _service.ListForOfficerAsync(null, null, _serviceA, null);

        result.TotalCount.Should().Be(5);
        result.Items.Should().OnlyContain(r => r.PublicServiceId == _serviceA);
    }

    [Fact]
    public async Task FiltersByServicePoint()
    {
        var result = await _service.ListForOfficerAsync(null, null, null, _pointA);

        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task Paginates_NewestFirst_WithTotalCount()
    {
        var page1 = await _service.ListForOfficerAsync(null, null, null, null, page: 1, pageSize: 4);
        var page2 = await _service.ListForOfficerAsync(null, null, null, null, page: 2, pageSize: 4);

        page1.TotalCount.Should().Be(6);
        page1.TotalPages.Should().Be(2);
        page1.Items.Should().HaveCount(4);
        page2.Items.Should().HaveCount(2);
        page1.Items[0].Code.Should().Be("REQ-B0"); // newest submission first
        page1.Items.Select(r => r.Id).Should().NotIntersectWith(page2.Items.Select(r => r.Id));
    }

    [Fact]
    public async Task CombinesStatusFilter_WithPaging()
    {
        var result = await _service.ListForOfficerAsync(ServiceRequestStatus.Submitted, null, null, null, page: 1, pageSize: 10);

        result.TotalCount.Should().Be(1);
        result.Items.Should().ContainSingle(r => r.Code == "REQ-B0");
    }
}
