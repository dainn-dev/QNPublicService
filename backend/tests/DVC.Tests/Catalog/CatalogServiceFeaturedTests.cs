using DVC.Application.Features.Catalog;
using DVC.Domain.Catalog;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Catalog;

public sealed class CatalogServiceFeaturedTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly CatalogService _service;

    public CatalogServiceFeaturedTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _service = new CatalogService(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task GetServicesAsync_FeaturedTrue_ReturnsOnlyFeaturedActive()
    {
        var category = new ServiceCategory { Code = "hotich", Name = "Hộ tịch" };
        _db.ServiceCategories.Add(category);
        _db.PublicServices.AddRange(
            new PublicService { CategoryId = category.Id, Code = "svc01", Name = "Featured active", IsFeatured = true },
            new PublicService { CategoryId = category.Id, Code = "svc02", Name = "Plain active" },
            new PublicService { CategoryId = category.Id, Code = "svc03", Name = "Featured inactive", IsFeatured = true, IsActive = false });
        await _db.SaveChangesAsync();

        var featured = await _service.GetServicesAsync(categoryId: null, includeInactive: false, featured: true);
        var all = await _service.GetServicesAsync(categoryId: null, includeInactive: false);

        featured.Should().ContainSingle().Which.Code.Should().Be("svc01");
        featured.Single().IsFeatured.Should().BeTrue();
        all.Should().HaveCount(2);
    }
}
