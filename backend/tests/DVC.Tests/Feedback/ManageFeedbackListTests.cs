using DVC.Application.Common;
using DVC.Application.Features.Engagement;
using DVC.Application.Features.Feedback;
using DVC.Domain.Common;
using DVC.Domain.Feedback;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Feedback;

public sealed class ManageFeedbackListTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly FeedbackService _service;

    private readonly FeedbackCategory _roads = new() { Code = "giaothong", Name = "Giao thông" };
    private readonly FeedbackCategory _environment = new() { Code = "moitruong", Name = "Môi trường" };

    public ManageFeedbackListTests()
    {
        (_db, _connection) = SqliteDb.Create();
        var user = new FakeCurrentUser { UserId = Guid.NewGuid(), Roles = new[] { Roles.Officer } };
        _service = new FeedbackService(_db, user, new NotificationService(_db), new PersonNameResolver(_db));

        _db.FeedbackCategories.AddRange(_roads, _environment);
        var baseTime = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        for (var i = 0; i < 3; i++)
        {
            _db.FeedbackReports.Add(new FeedbackReport
            {
                Code = $"PA-R{i}", CategoryId = _roads.Id, CitizenId = Guid.NewGuid(),
                Title = $"Ổ gà {i}", Description = "...", WardCode = 100,
                SubmittedAt = baseTime.AddDays(i)
            });
        }
        _db.FeedbackReports.Add(new FeedbackReport
        {
            Code = "PA-E0", CategoryId = _environment.Id, CitizenId = Guid.NewGuid(),
            Title = "Rác thải", Description = "...", WardCode = 200,
            SubmittedAt = baseTime.AddDays(5)
        });
        _db.SaveChanges();
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task FiltersByCategory()
    {
        var result = await _service.ListForOfficerAsync(null, null, null, _roads.Id, null);

        result.TotalCount.Should().Be(3);
        result.Items.Should().OnlyContain(r => r.CategoryId == _roads.Id);
    }

    [Fact]
    public async Task FiltersByWardCode()
    {
        var result = await _service.ListForOfficerAsync(null, null, null, null, wardCode: 200);

        result.TotalCount.Should().Be(1);
        result.Items.Should().ContainSingle(r => r.Code == "PA-E0");
    }

    [Fact]
    public async Task ResolvesCitizenName_WithUnknownFallback()
    {
        var citizenId = Guid.NewGuid();
        _db.UserProfiles.Add(new DVC.Domain.Identity.UserProfile { UserId = citizenId, FullName = "Phạm Thị C", Phone = "0988" });
        _db.FeedbackReports.Add(new FeedbackReport
        {
            Code = "PA-NAMED", CategoryId = _environment.Id, CitizenId = citizenId,
            Title = "Có hồ sơ", Description = "...", WardCode = 300,
            SubmittedAt = new DateTime(2026, 6, 10, 0, 0, 0, DateTimeKind.Utc)
        });
        _db.SaveChanges();

        var result = await _service.ListForOfficerAsync(null, null, null, null, wardCode: 300);
        var named = result.Items.Single(r => r.Code == "PA-NAMED");
        named.CitizenName.Should().Be("Phạm Thị C");
        named.CitizenPhone.Should().Be("0988");

        // Reports seeded without a profile fall back safely.
        var anon = await _service.ListForOfficerAsync(null, null, null, null, wardCode: 200);
        anon.Items.Single().CitizenName.Should().Be("(Không rõ)");
    }

    [Fact]
    public async Task Paginates_WithTotalCount()
    {
        var page1 = await _service.ListForOfficerAsync(null, null, null, null, null, page: 1, pageSize: 3);
        var page2 = await _service.ListForOfficerAsync(null, null, null, null, null, page: 2, pageSize: 3);

        page1.TotalCount.Should().Be(4);
        page1.Items.Should().HaveCount(3);
        page2.Items.Should().HaveCount(1);
        page1.Items[0].Code.Should().Be("PA-E0"); // newest first
    }
}
