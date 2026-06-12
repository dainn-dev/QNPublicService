using DVC.Application.Abstractions;
using DVC.Application.Features.Geo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class GeoController : ControllerBase
{
    private readonly GeoService _geo;

    public GeoController(GeoService geo) => _geo = geo;

    [HttpGet("provinces")]
    [AllowAnonymous]
    public async Task<IActionResult> GetProvinces(CancellationToken ct)
        => Ok(await _geo.GetProvincesAsync(ct));

    [HttpGet("provinces/{code:int}/wards")]
    [AllowAnonymous]
    public async Task<IActionResult> GetWards(int code, CancellationToken ct)
        => Ok(await _geo.GetWardsAsync(code, ct));

    /// <summary>One-shot seed of provinces + wards from the public API. Restricted to admins.</summary>
    [HttpPost("admin/geo/seed")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> Seed([FromServices] IGeoSeeder seeder, CancellationToken ct)
        => Ok(await seeder.SeedAsync(ct));
}
