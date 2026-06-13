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

public sealed class FeedbackCategoryAdminTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly FeedbackService _service;

    public FeedbackCategoryAdminTests()
    {
        (_db, _connection) = SqliteDb.Create();
        var user = new FakeCurrentUser { UserId = Guid.NewGuid(), Roles = new[] { Roles.Admin } };
        _service = new FeedbackService(_db, user, new NotificationService(_db), new PersonNameResolver(_db));
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task GetCategoriesAsync_IncludeInactive_ReturnsHidden()
    {
        _db.FeedbackCategories.AddRange(
            new FeedbackCategory { Code = "road", Name = "Giao thông", IsActive = true },
            new FeedbackCategory { Code = "env", Name = "Môi trường", IsActive = false });
        await _db.SaveChangesAsync();

        var active = await _service.GetCategoriesAsync(includeInactive: false);
        var all = await _service.GetCategoriesAsync(includeInactive: true);

        active.Should().ContainSingle(c => c.Code == "road");
        all.Should().HaveCount(2);
        all.Should().Contain(c => !c.IsActive);
    }

    [Fact]
    public async Task CreateCategoryAsync_PersistsCategory()
    {
        var created = await _service.CreateCategoryAsync(new CreateFeedbackCategoryDto("road", "Giao thông"));

        created.Id.Should().NotBeEmpty();
        created.IsActive.Should().BeTrue();
        var stored = await _db.FeedbackCategories.FindAsync(created.Id);
        stored.Should().NotBeNull();
        stored!.Code.Should().Be("road");
        stored.Name.Should().Be("Giao thông");
    }

    [Fact]
    public async Task CreateCategoryAsync_DuplicateCode_ThrowsConflict()
    {
        await _service.CreateCategoryAsync(new CreateFeedbackCategoryDto("road", "Giao thông"));

        var act = () => _service.CreateCategoryAsync(new CreateFeedbackCategoryDto("road", "Khác"));

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task UpdateCategoryAsync_ChangesNameAndActive()
    {
        var created = await _service.CreateCategoryAsync(new CreateFeedbackCategoryDto("road", "Giao thông"));

        var updated = await _service.UpdateCategoryAsync(created.Id, new UpdateFeedbackCategoryDto("Hạ tầng", false));

        updated.Name.Should().Be("Hạ tầng");
        updated.IsActive.Should().BeFalse();
        updated.Code.Should().Be("road"); // code is immutable
    }

    [Fact]
    public async Task UpdateCategoryAsync_Missing_ThrowsNotFound()
    {
        var act = () => _service.UpdateCategoryAsync(Guid.NewGuid(), new UpdateFeedbackCategoryDto("x", true));

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteCategoryAsync_RemovesCategory()
    {
        var created = await _service.CreateCategoryAsync(new CreateFeedbackCategoryDto("road", "Giao thông"));

        await _service.DeleteCategoryAsync(created.Id);

        (await _db.FeedbackCategories.FindAsync(created.Id)).Should().BeNull();
    }

    [Fact]
    public async Task DeleteCategoryAsync_Missing_ThrowsNotFound()
    {
        var act = () => _service.DeleteCategoryAsync(Guid.NewGuid());

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteCategoryAsync_WithReports_ThrowsConflict()
    {
        var created = await _service.CreateCategoryAsync(new CreateFeedbackCategoryDto("road", "Giao thông"));
        _db.FeedbackReports.Add(new FeedbackReport
        {
            Code = "PA-1", CategoryId = created.Id, CitizenId = Guid.NewGuid(),
            Title = "Ổ gà", Description = "...", SubmittedAt = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc)
        });
        await _db.SaveChangesAsync();

        var act = () => _service.DeleteCategoryAsync(created.Id);

        await act.Should().ThrowAsync<ConflictException>();
    }
}
