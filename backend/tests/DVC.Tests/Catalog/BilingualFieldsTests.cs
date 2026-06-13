using DVC.Application.Features.Catalog;
using DVC.Application.Features.ServicePoints;
using DVC.Domain.Common;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Catalog;

/// <summary>Verifies the English name/description fields round-trip through the catalog and service-point services.</summary>
public sealed class BilingualFieldsTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly CatalogService _catalog;
    private readonly ServicePointsService _points;

    public BilingualFieldsTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _catalog = new CatalogService(_db);
        _points = new ServicePointsService(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task CreateCategory_PersistsAndReturnsEnglishFields()
    {
        var created = await _catalog.CreateCategoryAsync(
            new CreateServiceCategoryDto("hotich", "Hộ tịch", "Civil registration", "Mô tả", "Description", null, 1));

        created.NameEn.Should().Be("Civil registration");
        created.DescriptionEn.Should().Be("Description");

        var fetched = (await _catalog.GetCategoriesAsync(includeInactive: true)).Single();
        fetched.NameEn.Should().Be("Civil registration");
        fetched.DescriptionEn.Should().Be("Description");
    }

    [Fact]
    public async Task CreateAndUpdateService_MapsEnglishFields()
    {
        var category = await _catalog.CreateCategoryAsync(
            new CreateServiceCategoryDto("hotich", "Hộ tịch", "Civil registration", null, null, null, 1));

        var created = await _catalog.CreateServiceAsync(new CreatePublicServiceDto(
            category.Id, "svc01", "Đăng ký khai sinh", "Birth registration", "Mô tả VI", "Birth registration desc",
            null, 1, 0m, ServiceLevel.Level4));

        created.NameEn.Should().Be("Birth registration");
        created.DescriptionEn.Should().Be("Birth registration desc");

        var updated = await _catalog.UpdateServiceAsync(created.Id, new UpdatePublicServiceDto(
            category.Id, "Đăng ký khai sinh", "Birth registration (updated)", "Mô tả VI", "Updated desc",
            null, 2, 0m, ServiceLevel.Level4, true));

        updated.NameEn.Should().Be("Birth registration (updated)");
        updated.DescriptionEn.Should().Be("Updated desc");
    }

    [Fact]
    public async Task CreateServicePoint_PersistsAndReturnsEnglishName()
    {
        var created = await _points.CreateAsync(new CreateServicePointDto(
            "sp01", "Bộ phận Một cửa", "One-Stop Desk", ServicePointType.AdminCenter, "142 Lê Trung Đình",
            null, null, null, null, null, null, null, null, null));

        created.NameEn.Should().Be("One-Stop Desk");

        var fetched = await _points.GetAsync(created.Id);
        fetched.NameEn.Should().Be("One-Stop Desk");
    }
}
