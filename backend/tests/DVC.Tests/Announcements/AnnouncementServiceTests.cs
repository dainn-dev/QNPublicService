using DVC.Application.Common;
using DVC.Application.Features.Announcements;
using DVC.Domain.Announcements;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Announcements;

public sealed class AnnouncementServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly AnnouncementService _service;

    public AnnouncementServiceTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new AnnouncementService(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private static Announcement Make(string tag, DateOnly date, bool isActive = true, string titleVi = "Tiêu đề") =>
        new()
        {
            TitleVi = titleVi,
            TitleEn = "Title",
            BodyVi = "Nội dung",
            BodyEn = "Body",
            Tag = tag,
            Date = date,
            IsActive = isActive
        };

    [Fact]
    public async Task GetListAsync_ReturnsOnlyActive_OrderedByDateDescending()
    {
        _db.Announcements.AddRange(
            Make("thongbao", new DateOnly(2026, 6, 1)),
            Make("thongbao", new DateOnly(2026, 6, 9)),
            Make("huongdan", new DateOnly(2026, 6, 6)),
            Make("khancap", new DateOnly(2026, 6, 12), isActive: false));
        await _db.SaveChangesAsync();

        var result = await _service.GetListAsync(tag: null);

        result.Should().HaveCount(3);
        result.Select(a => a.Date).Should().BeInDescendingOrder();
    }

    [Fact]
    public async Task GetListAsync_WithTag_FiltersByTag()
    {
        _db.Announcements.AddRange(
            Make("thongbao", new DateOnly(2026, 6, 1)),
            Make("khancap", new DateOnly(2026, 5, 26)));
        await _db.SaveChangesAsync();

        var khancap = await _service.GetListAsync("khancap");
        var unknown = await _service.GetListAsync("nonexistent");

        khancap.Should().ContainSingle().Which.Tag.Should().Be("khancap");
        unknown.Should().BeEmpty();
    }

    [Fact]
    public async Task GetByIdAsync_ActiveAnnouncement_ReturnsDto()
    {
        var entity = Make("huongdan", new DateOnly(2026, 6, 6), titleVi: "Hướng dẫn nộp hồ sơ");
        _db.Announcements.Add(entity);
        await _db.SaveChangesAsync();

        var dto = await _service.GetByIdAsync(entity.Id);

        dto.Id.Should().Be(entity.Id);
        dto.TitleVi.Should().Be("Hướng dẫn nộp hồ sơ");
        dto.TitleEn.Should().Be("Title");
        dto.BodyVi.Should().Be("Nội dung");
        dto.BodyEn.Should().Be("Body");
        dto.Tag.Should().Be("huongdan");
        dto.Date.Should().Be(new DateOnly(2026, 6, 6));
    }

    [Fact]
    public async Task GetByIdAsync_MissingOrInactive_ThrowsNotFound()
    {
        var inactive = Make("thongbao", new DateOnly(2026, 6, 1), isActive: false);
        _db.Announcements.Add(inactive);
        await _db.SaveChangesAsync();

        var missing = () => _service.GetByIdAsync(Guid.NewGuid());
        var hidden = () => _service.GetByIdAsync(inactive.Id);

        await missing.Should().ThrowAsync<NotFoundException>();
        await hidden.Should().ThrowAsync<NotFoundException>();
    }
}
