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

public sealed class FeedbackDueAtTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly FakeCurrentUser _user = new();
    private readonly FeedbackService _service;
    private readonly FeedbackCategory _category;

    public FeedbackDueAtTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new FeedbackService(_db, _user, new NotificationService(_db), new PersonNameResolver(_db));
        _user.UserId = Guid.NewGuid();

        _category = new FeedbackCategory { Code = "giaothong", Name = "Giao thông" };
        _db.FeedbackCategories.Add(_category);
        _db.SaveChanges();
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Theory]
    [InlineData(FeedbackPriority.Urgent, 1)]
    [InlineData(FeedbackPriority.High, 3)]
    [InlineData(FeedbackPriority.Normal, 5)]
    [InlineData(FeedbackPriority.Low, 7)]
    public async Task Submit_SetsDueAt_ByPriority(FeedbackPriority priority, int expectedDays)
    {
        var result = await _service.SubmitAsync(new SubmitFeedbackDto(
            _category.Id, "Tiêu đề", "Mô tả", null, null, null, null, null, priority));

        result.DueAt.Should().NotBeNull();
        (result.DueAt!.Value - result.SubmittedAt).TotalDays.Should().BeApproximately(expectedDays, 0.001);
    }

    [Fact]
    public async Task Submit_DefaultPriority_UsesNormalSla()
    {
        var result = await _service.SubmitAsync(new SubmitFeedbackDto(
            _category.Id, "Tiêu đề", "Mô tả", null, null, null, null, null, Priority: null));

        result.Priority.Should().Be(FeedbackPriority.Normal);
        (result.DueAt!.Value - result.SubmittedAt).TotalDays.Should().BeApproximately(5, 0.001);
    }
}
