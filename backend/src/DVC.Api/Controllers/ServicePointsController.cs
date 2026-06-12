using DVC.Application.Features.ServicePoints;
using DVC.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class ServicePointsController : ControllerBase
{
    private readonly ServicePointsService _points;

    public ServicePointsController(ServicePointsService points) => _points = points;

    // ----- Public reads -----
    [HttpGet("service-points")]
    [AllowAnonymous]
    public async Task<IActionResult> List(
        [FromQuery] ServicePointType? type, [FromQuery] int? wardCode, [FromQuery] int? provinceCode, CancellationToken ct)
        => Ok(await _points.ListAsync(type, wardCode, provinceCode, includeInactive: false, ct));

    [HttpGet("service-points/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => Ok(await _points.GetAsync(id, ct));

    // ----- Admin CRUD -----
    [HttpPost("admin/service-points")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> Create([FromBody] CreateServicePointDto dto, CancellationToken ct)
        => Ok(await _points.CreateAsync(dto, ct));

    [HttpPut("admin/service-points/{id:guid}")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateServicePointDto dto, CancellationToken ct)
        => Ok(await _points.UpdateAsync(id, dto, ct));

    [HttpDelete("admin/service-points/{id:guid}")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _points.DeleteAsync(id, ct);
        return NoContent();
    }

    [HttpPost("admin/service-points/{id:guid}/images")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> AddImage(Guid id, [FromBody] AddServicePointImageDto dto, CancellationToken ct)
        => Ok(await _points.AddImageAsync(id, dto, ct));
}
