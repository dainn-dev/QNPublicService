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

public sealed class RequestDueAtTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly FakeCurrentUser _user = new();
    private readonly RequestService _service;
    private readonly ServiceCategory _category;

    public RequestDueAtTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new RequestService(_db, _user, new NotificationService(_db), new PersonNameResolver(_db));
        _user.UserId = Guid.NewGuid();

        _category = new ServiceCategory { Code = "hotich", Name = "Hộ tịch" };
        _db.ServiceCategories.Add(_category);
        _db.SaveChanges();
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private Guid AddService(int? processingTimeDays)
    {
        var svc = new PublicService
        {
            CategoryId = _category.Id,
            Code = $"svc-{Guid.NewGuid().ToString("N")[..6]}",
            Name = "Khai sinh",
            ProcessingTimeDays = processingTimeDays
        };
        _db.PublicServices.Add(svc);
        _db.SaveChanges();
        return svc.Id;
    }

    [Fact]
    public async Task Submit_SetsDueAt_WorkingDaysAfterSubmission()
    {
        var serviceId = AddService(processingTimeDays: 3);

        var result = await _service.SubmitAsync(new SubmitRequestDto(serviceId, null, "note"));

        result.DueAt.Should().NotBeNull();
        result.SubmittedAt.Should().NotBe(default);
        // 3 working days, weekends excluded — so always at least 3 calendar days out.
        var businessDays = CountBusinessDays(result.SubmittedAt, result.DueAt!.Value);
        businessDays.Should().Be(3);
    }

    [Fact]
    public async Task Submit_NoProcessingTime_LeavesDueAtNull()
    {
        var serviceId = AddService(processingTimeDays: null);

        var result = await _service.SubmitAsync(new SubmitRequestDto(serviceId, null, null));

        result.DueAt.Should().BeNull();
    }

    private static int CountBusinessDays(DateTime from, DateTime to)
    {
        var count = 0;
        for (var d = from.AddDays(1); d <= to; d = d.AddDays(1))
            if (d.DayOfWeek is not (DayOfWeek.Saturday or DayOfWeek.Sunday))
                count++;
        return count;
    }
}
