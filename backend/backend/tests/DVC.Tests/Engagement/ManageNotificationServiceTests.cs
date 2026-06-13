using DVC.Application.Abstractions.Identity;
using DVC.Application.Features.Engagement;
using DVC.Domain.Common;
using DVC.Domain.Engagement;
using DVC.Domain.Feedback;
using DVC.Domain.Identity;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace DVC.Tests.Engagement;

public sealed class ManageNotificationServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly Guid _admin = Guid.NewGuid();

    public ManageNotificationServiceTests()
    {
        (_db, _connection) = SqliteDb.Create();
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private ManageNotificationService Service(params Guid[] citizens) =>
        new(_db, new FakeUserDirectory(citizens));

    private sealed class FakeUserDirectory : IUserDirectory
    {
        private readonly IReadOnlyList<Guid> _citizens;
        public FakeUserDirectory(IReadOnlyList<Guid> citizens) => _citizens = citizens;
        public Task<IReadOnlyList<Guid>> GetAllCitizenIdsAsync(CancellationToken ct = default) =>
            Task.FromResult(_citizens);
    }

    private static OfficerProfile Officer(string name, string? dept, bool active = true) =>
        new() { UserId = Guid.NewGuid(), FullName = name, Department = dept, IsActive = active };

    private static FeedbackReport Report(Guid citizenId, int wardCode) =>
        new() { Code = "FB-" + Guid.NewGuid().ToString("N")[..6], CategoryId = Guid.NewGuid(),
            CitizenId = citizenId, Title = "t", Description = "d", WardCode = wardCode };

    [Fact]
    public async Task PushAsync_CreatesOneNotificationPerUser_AndDedupes()
    {
        var u1 = Guid.NewGuid();
        var u2 = Guid.NewGuid();

        var campaign = await Service().PushAsync(_admin,
            new PushNotificationRequest(new[] { u1, u2, u1 }, "Hi", "Body", NotificationType.System));

        campaign.Type.Should().Be(NotificationCampaignType.Push);
        campaign.RecipientCount.Should().Be(2);
        campaign.SentByUserId.Should().Be(_admin);

        var notifs = await _db.Notifications.ToListAsync();
        notifs.Should().HaveCount(2);
        notifs.Select(n => n.UserId).Should().BeEquivalentTo(new[] { u1, u2 });
        notifs.Should().OnlyContain(n => n.Title == "Hi" && n.Type == NotificationType.System);
    }

    [Fact]
    public async Task PushAsync_NoRecipients_Throws()
    {
        var act = () => Service().PushAsync(_admin,
            new PushNotificationRequest(Array.Empty<Guid>(), "Hi", "Body"));

        await act.Should().ThrowAsync<DVC.Application.Common.ConflictException>();
    }

    [Fact]
    public async Task Broadcast_Officers_ResolvesActiveOfficers_FilteredByDepartment()
    {
        var tuPhap = Officer("A", "Tư pháp");
        var tuPhap2 = Officer("B", "Tư pháp");
        var diaChinh = Officer("C", "Địa chính");
        var inactive = Officer("D", "Tư pháp", active: false);
        _db.OfficerProfiles.AddRange(tuPhap, tuPhap2, diaChinh, inactive);
        await _db.SaveChangesAsync();

        var campaign = await Service().BroadcastAsync(_admin,
            new BroadcastNotificationRequest(NotificationAudience.Officers, null, "Tư pháp", "Họp", "10h"));

        campaign.RecipientCount.Should().Be(2);
        var recipients = await _db.Notifications.Select(n => n.UserId).ToListAsync();
        recipients.Should().BeEquivalentTo(new[] { tuPhap.UserId, tuPhap2.UserId });
    }

    [Fact]
    public async Task Broadcast_Officers_NoDepartment_ResolvesAllActive()
    {
        _db.OfficerProfiles.AddRange(
            Officer("A", "Tư pháp"), Officer("B", "Địa chính"), Officer("C", null, active: false));
        await _db.SaveChangesAsync();

        var campaign = await Service().BroadcastAsync(_admin,
            new BroadcastNotificationRequest(NotificationAudience.Officers, null, null, "TB", "..."));

        campaign.RecipientCount.Should().Be(2);
    }

    [Fact]
    public async Task Broadcast_Ward_ResolvesDistinctCitizensFromFeedback()
    {
        var c1 = Guid.NewGuid();
        var c2 = Guid.NewGuid();
        _db.FeedbackReports.AddRange(
            Report(c1, wardCode: 100),
            Report(c1, wardCode: 100),   // same citizen, two reports → counted once
            Report(c2, wardCode: 100),
            Report(Guid.NewGuid(), wardCode: 200)); // other ward → excluded
        await _db.SaveChangesAsync();

        var campaign = await Service().BroadcastAsync(_admin,
            new BroadcastNotificationRequest(NotificationAudience.Ward, 100, null, "TB phường", "..."));

        campaign.RecipientCount.Should().Be(2);
        campaign.WardCode.Should().Be(100);
        var recipients = await _db.Notifications.Select(n => n.UserId).ToListAsync();
        recipients.Should().BeEquivalentTo(new[] { c1, c2 });
    }

    [Fact]
    public async Task Broadcast_Ward_MissingWardCode_Throws()
    {
        var act = () => Service().BroadcastAsync(_admin,
            new BroadcastNotificationRequest(NotificationAudience.Ward, null, null, "TB", "..."));

        await act.Should().ThrowAsync<DVC.Application.Common.ConflictException>();
    }

    [Fact]
    public async Task Broadcast_All_UsesUserDirectory()
    {
        var c1 = Guid.NewGuid();
        var c2 = Guid.NewGuid();

        var campaign = await Service(c1, c2).BroadcastAsync(_admin,
            new BroadcastNotificationRequest(NotificationAudience.All, null, null, "Toàn dân", "..."));

        campaign.RecipientCount.Should().Be(2);
        campaign.Audience.Should().Be("all");
        var notifs = await _db.Notifications.ToListAsync();
        notifs.Select(n => n.UserId).Should().BeEquivalentTo(new[] { c1, c2 });
        notifs.Should().OnlyContain(n => n.Type == NotificationType.Announcement);
    }

    [Fact]
    public async Task Emergency_BroadcastsToAllCitizens_WithEmergencyType()
    {
        var c1 = Guid.NewGuid();
        var c2 = Guid.NewGuid();

        var campaign = await Service(c1, c2).EmergencyAsync(_admin,
            new EmergencyNotificationRequest("Bão số 5", "Sơ tán ngay"));

        campaign.Type.Should().Be(NotificationCampaignType.Emergency);
        campaign.RecipientCount.Should().Be(2);
        var notifs = await _db.Notifications.ToListAsync();
        notifs.Should().HaveCount(2);
        notifs.Should().OnlyContain(n => n.Type == NotificationType.Emergency);
    }

    [Fact]
    public async Task GetHistory_ReturnsMostRecentFirst_WithRecipientCount()
    {
        _db.NotificationCampaigns.AddRange(
            new NotificationCampaign { Type = NotificationCampaignType.Broadcast, Audience = NotificationAudience.All,
                Title = "Cũ", Message = "m", RecipientCount = 10, SentByUserId = _admin, SentAt = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc) },
            new NotificationCampaign { Type = NotificationCampaignType.Emergency, Audience = NotificationAudience.All,
                Title = "Mới", Message = "m", RecipientCount = 99, SentByUserId = _admin, SentAt = new DateTime(2026, 6, 12, 0, 0, 0, DateTimeKind.Utc) });
        await _db.SaveChangesAsync();

        var page = await Service().GetHistoryAsync(1, 20);

        page.TotalCount.Should().Be(2);
        page.Items[0].Title.Should().Be("Mới");
        page.Items[0].RecipientCount.Should().Be(99);
        page.Items[1].Title.Should().Be("Cũ");
    }
}
