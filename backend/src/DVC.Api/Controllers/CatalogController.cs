using DVC.Application.Features.Catalog;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class CatalogController : ControllerBase
{
    private readonly CatalogService _catalog;

    public CatalogController(CatalogService catalog) => _catalog = catalog;

    // ----- Public reads -----
    [HttpGet("service-categories")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
        => Ok(await _catalog.GetCategoriesAsync(includeInactive: false, ct));

    [HttpGet("public-services")]
    [AllowAnonymous]
    public async Task<IActionResult> GetServices([FromQuery] Guid? categoryId, [FromQuery] bool? featured, CancellationToken ct)
        => Ok(await _catalog.GetServicesAsync(categoryId, includeInactive: false, featured, ct));

    [HttpGet("public-services/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetService(Guid id, CancellationToken ct)
        => Ok(await _catalog.GetServiceAsync(id, ct));

    // ----- Admin CRUD -----
    [HttpGet("admin/service-categories")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> AdminGetCategories(CancellationToken ct)
        => Ok(await _catalog.GetCategoriesAsync(includeInactive: true, ct));

    [HttpPost("admin/service-categories")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateServiceCategoryDto dto, CancellationToken ct)
        => Ok(await _catalog.CreateCategoryAsync(dto, ct));

    [HttpPut("admin/service-categories/{id:guid}")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateServiceCategoryDto dto, CancellationToken ct)
        => Ok(await _catalog.UpdateCategoryAsync(id, dto, ct));

    [HttpDelete("admin/service-categories/{id:guid}")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> DeleteCategory(Guid id, CancellationToken ct)
    {
        await _catalog.DeleteCategoryAsync(id, ct);
        return NoContent();
    }

    [HttpPost("admin/public-services")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> CreateService([FromBody] CreatePublicServiceDto dto, CancellationToken ct)
        => Ok(await _catalog.CreateServiceAsync(dto, ct));

    [HttpPut("admin/public-services/{id:guid}")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> UpdateService(Guid id, [FromBody] UpdatePublicServiceDto dto, CancellationToken ct)
        => Ok(await _catalog.UpdateServiceAsync(id, dto, ct));

    [HttpDelete("admin/public-services/{id:guid}")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> DeleteService(Guid id, CancellationToken ct)
    {
        await _catalog.DeleteServiceAsync(id, ct);
        return NoContent();
    }
}
