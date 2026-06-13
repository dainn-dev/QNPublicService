using System.Text;
using DVC.Application.Features.Audit;
using DVC.Domain.Audit;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Audit;

public sealed class AuditServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly AuditService _service;

    public AuditServiceTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new AuditService(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private AuditLog Add(string action, string entityType, DateTime createdAt,
        Guid? actorUserId = null, Guid? entityId = null, string? ip = null,
        string? oldValue = null, string? newValue = null)
    {
        var log = new AuditLog
        {
            ActorUserId = actorUserId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            IpAddress = ip,
            OldValue = oldValue,
            NewValue = newValue,
            CreatedAt = createdAt
        };
        _db.AuditLogs.Add(log);
        return log;
    }

    [Fact]
    public async Task Filter_ByAction()
    {
        var now = DateTime.UtcNow;
        Add("Created", "PublicService", now);
        Add("Updated", "PublicService", now);
        Add("Deleted", "PublicService", now);
        await _db.SaveChangesAsync();

        var result = await _service.GetAsync(new AuditLogQuery(Action: "Updated"));

        result.TotalCount.Should().Be(1);
        result.Items.Should().ContainSingle().Which.Action.Should().Be("Updated");
    }

    [Fact]
    public async Task Filter_ByDateRange_InclusiveEndOfDay()
    {
        Add("Created", "A", new DateTime(2026, 6, 10, 12, 0, 0, DateTimeKind.Utc));
        Add("Created", "B", new DateTime(2026, 6, 12, 23, 59, 0, DateTimeKind.Utc)); // last moment of 'to' day
        Add("Created", "C", new DateTime(2026, 6, 14, 0, 0, 0, DateTimeKind.Utc));
        await _db.SaveChangesAsync();

        var result = await _service.GetAsync(new AuditLogQuery(
            From: new DateOnly(2026, 6, 11), To: new DateOnly(2026, 6, 12)));

        result.Items.Should().ContainSingle().Which.EntityType.Should().Be("B");
    }

    [Fact]
    public async Task Search_MatchesEntityActionAndIp_CaseInsensitive()
    {
        var now = DateTime.UtcNow;
        Add("Created", "Announcement", now, ip: "10.0.0.1");
        Add("Updated", "Feedback", now, ip: "192.168.1.5");
        await _db.SaveChangesAsync();

        (await _service.GetAsync(new AuditLogQuery(Search: "announce"))).TotalCount.Should().Be(1);
        (await _service.GetAsync(new AuditLogQuery(Search: "UPDATED"))).TotalCount.Should().Be(1);
        (await _service.GetAsync(new AuditLogQuery(Search: "192.168"))).TotalCount.Should().Be(1);
        (await _service.GetAsync(new AuditLogQuery(Search: "nomatch"))).TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task Search_ByGuid_MatchesActorOrEntityId()
    {
        var actor = Guid.NewGuid();
        var entity = Guid.NewGuid();
        var now = DateTime.UtcNow;
        Add("Created", "A", now, actorUserId: actor);
        Add("Created", "B", now, entityId: entity);
        Add("Created", "C", now);
        await _db.SaveChangesAsync();

        (await _service.GetAsync(new AuditLogQuery(Search: actor.ToString()))).TotalCount.Should().Be(1);
        (await _service.GetAsync(new AuditLogQuery(Search: entity.ToString()))).TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task Filter_ByEntityTypeAndActor_StillWork()
    {
        var actor = Guid.NewGuid();
        var now = DateTime.UtcNow;
        Add("Created", "PublicService", now, actorUserId: actor);
        Add("Created", "Feedback", now, actorUserId: actor);
        Add("Created", "PublicService", now);
        await _db.SaveChangesAsync();

        (await _service.GetAsync(new AuditLogQuery(EntityType: "PublicService"))).TotalCount.Should().Be(2);
        (await _service.GetAsync(new AuditLogQuery(ActorUserId: actor))).TotalCount.Should().Be(2);
        (await _service.GetAsync(new AuditLogQuery(EntityType: "PublicService", ActorUserId: actor))).TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task Pagination_PreservedWithFilters()
    {
        var baseTime = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        for (var i = 0; i < 5; i++)
            Add("Created", "PublicService", baseTime.AddMinutes(i));
        Add("Created", "Other", baseTime); // excluded by filter
        await _db.SaveChangesAsync();

        var page1 = await _service.GetAsync(new AuditLogQuery(Page: 1, PageSize: 2, EntityType: "PublicService"));

        page1.TotalCount.Should().Be(5);
        page1.Items.Should().HaveCount(2);
        page1.TotalPages.Should().Be(3);
        // Newest first.
        page1.Items[0].CreatedAt.Should().BeAfter(page1.Items[1].CreatedAt);
    }

    [Fact]
    public async Task ExportCsv_HasBomHeaderRowsAndRespectsFilter()
    {
        var now = new DateTime(2026, 6, 12, 8, 0, 0, DateTimeKind.Utc);
        Add("Updated", "PublicService", now, ip: "10.0.0.1", oldValue: "{\"name\":\"a, b\"}", newValue: "{\"name\":\"c\"}");
        Add("Created", "Feedback", now);
        await _db.SaveChangesAsync();

        var bytes = await _service.ExportCsvAsync(new AuditLogQuery(EntityType: "PublicService"));
        var text = Encoding.UTF8.GetString(bytes);

        text[0].Should().Be('\uFEFF'); // UTF-8 BOM
        var lines = text.TrimEnd('\n').Split('\n');
        lines[0].TrimStart('\uFEFF').Should().Be("Time,User,Action,EntityType,EntityId,OldValue,NewValue,IpAddress");
        lines.Should().HaveCount(2); // header + one filtered row
        lines[1].Should().Contain("Updated").And.Contain("10.0.0.1");
        // Comma inside a value stays quoted, not split into columns.
        lines[1].Should().Contain("\"{\"\"name\"\":\"\"a, b\"\"}\"");
    }
}
