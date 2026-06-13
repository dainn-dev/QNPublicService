using DVC.Application.Features.Officers;
using DVC.Domain.Catalog;
using DVC.Domain.Common;
using DVC.Domain.Identity;
using DVC.Domain.Requests;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Officers;

public sealed class ManageOfficersTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly OfficerService _service;
    private readonly Guid _publicServiceId;

    public ManageOfficersTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new OfficerService(_db, userAdmin: null!); // ListActiveSummariesAsync never touches IUserAdminService

        var category = new ServiceCategory { Code = "hotich", Name = "Hộ tịch" };
        var service = new PublicService { CategoryId = category.Id, Code = "svc", Name = "Dịch vụ" };
        _db.ServiceCategories.Add(category);
        _db.PublicServices.Add(service);
        _db.SaveChanges();
        _publicServiceId = service.Id;
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task ListActiveSummaries_ReturnsOnlyActive_SortedByName_WithoutContactDetails()
    {
        _db.OfficerProfiles.AddRange(
            new OfficerProfile { UserId = Guid.NewGuid(), FullName = "Trần B", Department = "Hộ tịch", Position = "Chuyên viên", PhoneNumber = "0901" },
            new OfficerProfile { UserId = Guid.NewGuid(), FullName = "Lê A", Department = "Đất đai" },
            new OfficerProfile { UserId = Guid.NewGuid(), FullName = "Ngô C", IsActive = false });
        await _db.SaveChangesAsync();

        var result = await _service.ListActiveSummariesAsync();

        result.Should().HaveCount(2);
        result.Select(o => o.FullName).Should().ContainInOrder("Lê A", "Trần B");
        result.Should().AllSatisfy(o => o.GetType().GetProperty("PhoneNumber").Should().BeNull());
    }

    [Fact]
    public async Task List_ComputesWorkload_FromOpenRequestsOnly_AndReturnsArea()
    {
        var officerUserId = Guid.NewGuid();
        var otherOfficerUserId = Guid.NewGuid();
        _db.OfficerProfiles.Add(new OfficerProfile
        {
            UserId = officerUserId, FullName = "Lê A", Area = "P. Nguyễn Trãi, P. Trần Hưng Đạo"
        });
        _db.OfficerProfiles.Add(new OfficerProfile { UserId = otherOfficerUserId, FullName = "Trần B" });

        // 3 open + 2 terminal assigned to officer A; 1 open assigned to officer B; 1 unassigned.
        _db.ServiceRequests.AddRange(
            Request(officerUserId, ServiceRequestStatus.Submitted),
            Request(officerUserId, ServiceRequestStatus.Processing),
            Request(officerUserId, ServiceRequestStatus.WaitingSupplement),
            Request(officerUserId, ServiceRequestStatus.Completed),
            Request(officerUserId, ServiceRequestStatus.Cancelled),
            Request(otherOfficerUserId, ServiceRequestStatus.Received),
            Request(null, ServiceRequestStatus.Submitted));
        await _db.SaveChangesAsync();

        var result = await _service.ListAsync(includeInactive: true);

        var a = result.Single(o => o.FullName == "Lê A");
        a.Workload.Should().Be(3);
        a.Area.Should().Be("P. Nguyễn Trãi, P. Trần Hưng Đạo");
        result.Single(o => o.FullName == "Trần B").Workload.Should().Be(1);
    }

    [Fact]
    public async Task Create_PersistsArea_AndReturnsZeroWorkload()
    {
        var service = new OfficerService(_db, new FakeUserAdminService());
        var dto = new CreateOfficerProfileDto(
            UserId: Guid.NewGuid(), FullName: "Lê A", Department: "Đất đai", Position: "Chuyên viên",
            ServicePointId: null, PhoneNumber: "0901", Area: "P. Nghĩa Lộ");

        var created = await service.CreateAsync(dto);

        created.Area.Should().Be("P. Nghĩa Lộ");
        created.Workload.Should().Be(0);
        (await _db.OfficerProfiles.FindAsync(created.Id))!.Area.Should().Be("P. Nghĩa Lộ");
    }

    [Fact]
    public async Task Update_ChangesArea()
    {
        var service = new OfficerService(_db, new FakeUserAdminService());
        var entity = new OfficerProfile { UserId = Guid.NewGuid(), FullName = "Lê A", Area = "P. Cũ" };
        _db.OfficerProfiles.Add(entity);
        await _db.SaveChangesAsync();

        var updated = await service.UpdateAsync(entity.Id, new UpdateOfficerProfileDto(
            FullName: "Lê A", Department: null, Position: null, ServicePointId: null,
            PhoneNumber: null, IsActive: true, Area: "P. Mới"));

        updated.Area.Should().Be("P. Mới");
    }

    private ServiceRequest Request(Guid? assignedOfficerId, ServiceRequestStatus status) => new()
    {
        Code = Guid.NewGuid().ToString("N"),
        PublicServiceId = _publicServiceId,
        CitizenId = Guid.NewGuid(),
        AssignedOfficerId = assignedOfficerId,
        Status = status,
        SubmittedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
    };
}
