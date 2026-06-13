using DVC.Application.Common;
using DVC.Application.Features.Geo;
using DVC.Domain.Common;
using DVC.Domain.Geo;
using DVC.Domain.ServicePoints;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Geo;

public sealed class GeoAdminServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly GeoService _service;

    public GeoAdminServiceTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new GeoService(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private async Task<Province> SeedProvinceAsync(int code = 51, string name = "Quảng Ngãi")
    {
        var p = new Province { Code = code, Name = name };
        _db.Provinces.Add(p);
        await _db.SaveChangesAsync();
        return p;
    }

    // ----- Province -----

    [Fact]
    public async Task CreateProvinceAsync_PersistsProvince()
    {
        var created = await _service.CreateProvinceAsync(
            new CreateProvinceDto(51, "Quảng Ngãi", "quang_ngai", "tỉnh", "255"));

        created.Code.Should().Be(51);
        var stored = await _db.Provinces.FindAsync(51);
        stored.Should().NotBeNull();
        stored!.Name.Should().Be("Quảng Ngãi");
        stored.PhoneCode.Should().Be("255");
    }

    [Fact]
    public async Task CreateProvinceAsync_DuplicateCode_ThrowsConflict()
    {
        await SeedProvinceAsync();

        var act = () => _service.CreateProvinceAsync(new CreateProvinceDto(51, "Khác", null, null, null));

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task UpdateProvinceAsync_ChangesFields_KeepsCode()
    {
        await SeedProvinceAsync();

        var updated = await _service.UpdateProvinceAsync(51, new UpdateProvinceDto("Đà Nẵng", "da_nang", "thành phố", "236"));

        updated.Code.Should().Be(51);
        updated.Name.Should().Be("Đà Nẵng");
        updated.DivisionType.Should().Be("thành phố");
    }

    [Fact]
    public async Task UpdateProvinceAsync_Missing_ThrowsNotFound()
    {
        var act = () => _service.UpdateProvinceAsync(999, new UpdateProvinceDto("x", null, null, null));

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteProvinceAsync_RemovesProvince()
    {
        await SeedProvinceAsync();

        await _service.DeleteProvinceAsync(51);

        (await _db.Provinces.FindAsync(51)).Should().BeNull();
    }

    [Fact]
    public async Task DeleteProvinceAsync_Missing_ThrowsNotFound()
    {
        var act = () => _service.DeleteProvinceAsync(999);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteProvinceAsync_WithWards_ThrowsConflict()
    {
        await SeedProvinceAsync();
        _db.Wards.Add(new Ward { Code = 5101, Name = "Phường 1", ProvinceCode = 51 });
        await _db.SaveChangesAsync();

        var act = () => _service.DeleteProvinceAsync(51);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task DeleteProvinceAsync_ReferencedByServicePoint_ThrowsConflict()
    {
        await SeedProvinceAsync();
        _db.ServicePoints.Add(new ServicePoint
        {
            Code = "SP1", Name = "Trung tâm HCC", Type = ServicePointType.AdminCenter,
            Address = "123 Hùng Vương", ProvinceCode = 51
        });
        await _db.SaveChangesAsync();

        var act = () => _service.DeleteProvinceAsync(51);

        await act.Should().ThrowAsync<ConflictException>();
    }

    // ----- Ward -----

    [Fact]
    public async Task CreateWardAsync_PersistsWard()
    {
        await SeedProvinceAsync();

        var created = await _service.CreateWardAsync(new CreateWardDto(5101, "Phường Trần Phú", "tran_phu", "phường", 51));

        created.Code.Should().Be(5101);
        created.ProvinceCode.Should().Be(51);
        (await _db.Wards.FindAsync(5101)).Should().NotBeNull();
    }

    [Fact]
    public async Task CreateWardAsync_UnknownProvince_ThrowsNotFound()
    {
        var act = () => _service.CreateWardAsync(new CreateWardDto(5101, "Phường 1", null, null, 999));

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task CreateWardAsync_DuplicateCode_ThrowsConflict()
    {
        await SeedProvinceAsync();
        await _service.CreateWardAsync(new CreateWardDto(5101, "Phường 1", null, null, 51));

        var act = () => _service.CreateWardAsync(new CreateWardDto(5101, "Phường 2", null, null, 51));

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task UpdateWardAsync_MovesToAnotherProvince()
    {
        await SeedProvinceAsync();
        await SeedProvinceAsync(48, "Đà Nẵng");
        await _service.CreateWardAsync(new CreateWardDto(5101, "Phường 1", null, null, 51));

        var updated = await _service.UpdateWardAsync(5101, new UpdateWardDto("Phường Hải Châu", "hai_chau", "phường", 48));

        updated.ProvinceCode.Should().Be(48);
        updated.Name.Should().Be("Phường Hải Châu");
    }

    [Fact]
    public async Task UpdateWardAsync_UnknownTargetProvince_ThrowsNotFound()
    {
        await SeedProvinceAsync();
        await _service.CreateWardAsync(new CreateWardDto(5101, "Phường 1", null, null, 51));

        var act = () => _service.UpdateWardAsync(5101, new UpdateWardDto("Phường 1", null, null, 999));

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteWardAsync_RemovesWard()
    {
        await SeedProvinceAsync();
        await _service.CreateWardAsync(new CreateWardDto(5101, "Phường 1", null, null, 51));

        await _service.DeleteWardAsync(5101);

        (await _db.Wards.FindAsync(5101)).Should().BeNull();
    }

    [Fact]
    public async Task DeleteWardAsync_ReferencedByServicePoint_ThrowsConflict()
    {
        await SeedProvinceAsync();
        await _service.CreateWardAsync(new CreateWardDto(5101, "Phường 1", null, null, 51));
        _db.ServicePoints.Add(new ServicePoint
        {
            Code = "SP1", Name = "Trung tâm HCC", Type = ServicePointType.AdminCenter,
            Address = "123 Hùng Vương", ProvinceCode = 51, WardCode = 5101
        });
        await _db.SaveChangesAsync();

        var act = () => _service.DeleteWardAsync(5101);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task GetWardsAsync_ReturnsOnlyWardsOfProvince_SortedByName()
    {
        await SeedProvinceAsync();
        await SeedProvinceAsync(48, "Đà Nẵng");
        await _service.CreateWardAsync(new CreateWardDto(5102, "Phường B", null, null, 51));
        await _service.CreateWardAsync(new CreateWardDto(5101, "Phường A", null, null, 51));
        await _service.CreateWardAsync(new CreateWardDto(4801, "Phường C", null, null, 48));

        var wards = await _service.GetWardsAsync(51);

        wards.Should().HaveCount(2);
        wards.Select(w => w.Name).Should().ContainInOrder("Phường A", "Phường B");
    }
}
