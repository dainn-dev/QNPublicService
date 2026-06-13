using DVC.Application.Features.Announcements;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class AnnouncementsController : ControllerBase
{
    private readonly AnnouncementService _announcements;

    public AnnouncementsController(AnnouncementService announcements) => _announcements = announcements;

    [HttpGet("announcements")]
    [AllowAnonymous]
    public async Task<IActionResult> GetList([FromQuery] string? tag, CancellationToken ct)
        => Ok(await _announcements.GetListAsync(tag, ct));

    [HttpGet("announcements/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        => Ok(await _announcements.GetByIdAsync(id, ct));

    // ----- Admin CRUD -----
    [HttpGet("admin/announcements")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> AdminGetList([FromQuery] string? tag, CancellationToken ct)
        => Ok(await _announcements.GetAdminListAsync(tag, ct));

    [HttpPost("admin/announcements")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> Create([FromBody] CreateAnnouncementDto dto, CancellationToken ct)
        => Ok(await _announcements.CreateAsync(dto, ct));

    [HttpPut("admin/announcements/{id:guid}")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAnnouncementDto dto, CancellationToken ct)
        => Ok(await _announcements.UpdateAsync(id, dto, ct));

    [HttpDelete("admin/announcements/{id:guid}")]
    [Authorize(Roles = "admin,super")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _announcements.DeleteAsync(id, ct);
        return NoContent();
    }
}
