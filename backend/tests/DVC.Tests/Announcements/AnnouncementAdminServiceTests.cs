using DVC.Application.Common;
using DVC.Application.Features.Announcements;
using DVC.Domain.Announcements;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Announcements;

public sealed class AnnouncementAdminServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly AnnouncementService _service;

    public AnnouncementAdminServiceTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new AnnouncementService(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private static CreateAnnouncementDto NewDto(string tag = "thongbao", bool isActive = true) =>
        new("Tiêu đề", "Title", "Nội dung", "Body", tag, new DateOnly(2026, 6, 13), isActive);

    [Fact]
    public async Task GetAdminListAsync_IncludesInactive()
    {
        _db.Announcements.AddRange(
            new Announcement { TitleVi = "Active", Tag = "thongbao", Date = new DateOnly(2026, 6, 1), IsActive = true },
            new Announcement { TitleVi = "Hidden", Tag = "thongbao", Date = new DateOnly(2026, 6, 2), IsActive = false });
        await _db.SaveChangesAsync();

        var result = await _service.GetAdminListAsync(tag: null);

        result.Should().HaveCount(2);
        result.Should().Contain(a => !a.IsActive);
    }

    [Fact]
    public async Task CreateAsync_PersistsAnnouncement()
    {
        var created = await _service.CreateAsync(NewDto(isActive: false));

        created.Id.Should().NotBeEmpty();
        created.IsActive.Should().BeFalse();
        var stored = await _db.Announcements.FindAsync(created.Id);
        stored.Should().NotBeNull();
        stored!.TitleVi.Should().Be("Tiêu đề");
        stored.Tag.Should().Be("thongbao");
    }

    [Fact]
    public async Task CreateAsync_InvalidTag_ThrowsConflict()
    {
        var act = () => _service.CreateAsync(NewDto(tag: "invalid"));

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task UpdateAsync_ChangesFields()
    {
        var created = await _service.CreateAsync(NewDto());

        var updated = await _service.UpdateAsync(created.Id,
            new UpdateAnnouncementDto("Mới", "New", "Nội dung mới", "New body", "khancap", new DateOnly(2026, 7, 1), false));

        updated.TitleVi.Should().Be("Mới");
        updated.Tag.Should().Be("khancap");
        updated.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task UpdateAsync_Missing_ThrowsNotFound()
    {
        var act = () => _service.UpdateAsync(Guid.NewGuid(),
            new UpdateAnnouncementDto("x", "x", "x", "x", "thongbao", new DateOnly(2026, 7, 1), true));

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateAsync_InvalidTag_ThrowsConflict()
    {
        var created = await _service.CreateAsync(NewDto());

        var act = () => _service.UpdateAsync(created.Id,
            new UpdateAnnouncementDto("x", "x", "x", "x", "invalid", new DateOnly(2026, 7, 1), true));

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task DeleteAsync_RemovesAnnouncement()
    {
        var created = await _service.CreateAsync(NewDto());

        await _service.DeleteAsync(created.Id);

        (await _db.Announcements.FindAsync(created.Id)).Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_Missing_ThrowsNotFound()
    {
        var act = () => _service.DeleteAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
