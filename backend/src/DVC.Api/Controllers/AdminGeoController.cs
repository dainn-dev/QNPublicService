using DVC.Application.Features.Geo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

/// <summary>
/// Admin management of Vietnam's 2-tier administrative units (Province → Ward) after the 2025 reform.
/// Read endpoints for citizens live on <see cref="GeoController"/>; everything here is admin/super only.
/// </summary>
[ApiController]
[Route("api/admin/geo")]
[Authorize(Roles = "admin,super")]
public sealed class AdminGeoController : ControllerBase
{
    private readonly GeoService _geo;

    public AdminGeoController(GeoService geo) => _geo = geo;

    // ----- Provinces -----

    [HttpGet("provinces")]
    public async Task<IActionResult> ListProvinces(CancellationToken ct)
        => Ok(await _geo.GetProvincesAsync(ct));

    [HttpPost("provinces")]
    public async Task<IActionResult> CreateProvince([FromBody] CreateProvinceDto dto, CancellationToken ct)
    {
        var created = await _geo.CreateProvinceAsync(dto, ct);
        return CreatedAtAction(nameof(ListProvinces), new { }, created);
    }

    [HttpPut("provinces/{code:int}")]
    public async Task<IActionResult> UpdateProvince(int code, [FromBody] UpdateProvinceDto dto, CancellationToken ct)
        => Ok(await _geo.UpdateProvinceAsync(code, dto, ct));

    [HttpDelete("provinces/{code:int}")]
    public async Task<IActionResult> DeleteProvince(int code, CancellationToken ct)
    {
        await _geo.DeleteProvinceAsync(code, ct);
        return NoContent();
    }

    // ----- Wards -----

    [HttpGet("provinces/{code:int}/wards")]
    public async Task<IActionResult> ListWards(int code, CancellationToken ct)
        => Ok(await _geo.GetWardsAsync(code, ct));

    [HttpPost("wards")]
    public async Task<IActionResult> CreateWard([FromBody] CreateWardDto dto, CancellationToken ct)
    {
        var created = await _geo.CreateWardAsync(dto, ct);
        return CreatedAtAction(nameof(ListWards), new { code = created.ProvinceCode }, created);
    }

    [HttpPut("wards/{code:int}")]
    public async Task<IActionResult> UpdateWard(int code, [FromBody] UpdateWardDto dto, CancellationToken ct)
        => Ok(await _geo.UpdateWardAsync(code, dto, ct));

    [HttpDelete("wards/{code:int}")]
    public async Task<IActionResult> DeleteWard(int code, CancellationToken ct)
    {
        await _geo.DeleteWardAsync(code, ct);
        return NoContent();
    }
}
