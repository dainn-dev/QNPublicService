using DVC.Application.Common;
using DVC.Application.Features.Engagement;
using DVC.Application.Features.Requests;
using DVC.Domain.Catalog;
using DVC.Domain.Common;
using DVC.Domain.Identity;
using DVC.Domain.Requests;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Requests;

public sealed class RequestCommentTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly FakeCurrentUser _user = new();
    private readonly RequestService _service;

    private readonly Guid _citizenId = Guid.NewGuid();
    private readonly Guid _officerId = Guid.NewGuid();
    private readonly ServiceRequest _request;

    public RequestCommentTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new RequestService(_db, _user, new NotificationService(_db), new PersonNameResolver(_db));

        var category = new ServiceCategory { Code = "hotich", Name = "Hộ tịch" };
        var publicService = new PublicService { CategoryId = category.Id, Code = "svc01", Name = "Khai sinh" };
        _db.ServiceCategories.Add(category);
        _db.PublicServices.Add(publicService);

        _request = new ServiceRequest
        {
            Code = "REQ-1", PublicServiceId = publicService.Id, CitizenId = _citizenId,
            AssignedOfficerId = _officerId, Status = ServiceRequestStatus.Processing,
            SubmittedAt = DateTime.UtcNow
        };
        _db.ServiceRequests.Add(_request);
        _db.SaveChanges();
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private void ActAsOfficer() { _user.UserId = _officerId; _user.Roles = new[] { Roles.Officer }; }
    private void ActAsCitizen() { _user.UserId = _citizenId; _user.Roles = Array.Empty<string>(); }

    [Fact]
    public async Task OfficerInternalComment_IsHiddenFromCitizen_AndVisibleToOfficer()
    {
        ActAsOfficer();
        await _service.AddCommentAsync(_request.Id, new AddRequestCommentDto("ghi chú nội bộ", IsInternal: true));
        await _service.AddCommentAsync(_request.Id, new AddRequestCommentDto("trả lời công dân", IsInternal: false));

        var officerView = await _service.GetAsync(_request.Id);
        officerView.Comments.Should().HaveCount(2);

        ActAsCitizen();
        var citizenView = await _service.GetAsync(_request.Id);
        citizenView.Comments.Should().ContainSingle(c => c.Content == "trả lời công dân");
    }

    [Fact]
    public async Task CitizenComment_CannotBeInternal()
    {
        ActAsCitizen();
        var comment = await _service.AddCommentAsync(_request.Id, new AddRequestCommentDto("hỏi tiến độ", IsInternal: true));

        comment.IsInternal.Should().BeFalse();
    }

    [Fact]
    public async Task VisibleOfficerComment_NotifiesCitizen_ButInternalDoesNot()
    {
        ActAsOfficer();
        await _service.AddCommentAsync(_request.Id, new AddRequestCommentDto("nội bộ", IsInternal: true));
        _db.Notifications.Count(n => n.UserId == _citizenId).Should().Be(0);

        await _service.AddCommentAsync(_request.Id, new AddRequestCommentDto("công khai", IsInternal: false));
        _db.Notifications.Count(n => n.UserId == _citizenId).Should().Be(1);
    }

    [Fact]
    public async Task Dto_CarriesCitizenAndAuthorNames_WithFallbackForMissingProfiles()
    {
        _db.UserProfiles.Add(new UserProfile { UserId = _citizenId, FullName = "Nguyễn Văn Công Dân", Phone = "0905000111" });
        _db.OfficerProfiles.Add(new OfficerProfile { UserId = _officerId, FullName = "Cán bộ Lê" });
        _db.SaveChanges();

        ActAsCitizen();
        await _service.AddCommentAsync(_request.Id, new AddRequestCommentDto("hỏi tiến độ", IsInternal: false));
        ActAsOfficer();
        var officerComment = await _service.AddCommentAsync(_request.Id, new AddRequestCommentDto("đang xử lý", IsInternal: false));

        officerComment.AuthorName.Should().Be("Cán bộ Lê");

        var view = await _service.GetAsync(_request.Id);
        view.CitizenName.Should().Be("Nguyễn Văn Công Dân");
        view.CitizenPhone.Should().Be("0905000111");
        view.Comments.Single(c => c.Content == "hỏi tiến độ").AuthorName.Should().Be("Nguyễn Văn Công Dân");
        view.Comments.Single(c => c.Content == "đang xử lý").AuthorName.Should().Be("Cán bộ Lê");
    }

    [Fact]
    public async Task Dto_UsesUnknownFallback_WhenCitizenHasNoProfile()
    {
        ActAsOfficer();
        var view = await _service.GetAsync(_request.Id);

        view.CitizenName.Should().Be("(Không rõ)");
        view.CitizenPhone.Should().BeNull();
    }

    [Fact]
    public async Task OfficerCanAttachDocument_ToAnotherCitizensRequest()
    {
        ActAsOfficer();
        var doc = await _service.AddDocumentAsync(_request.Id,
            new AddRequestDocumentDto("https://files/result.pdf", "result", "result.pdf", IsSupplement: false));

        doc.Url.Should().Be("https://files/result.pdf");
        _db.ServiceRequestDocuments.Count(d => d.ServiceRequestId == _request.Id).Should().Be(1);
    }
}
