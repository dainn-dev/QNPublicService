using DVC.Application.Features.Officers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api/admin/officers")]
[Authorize(Roles = "admin,super")]
public sealed class OfficersController : ControllerBase
{
    private readonly OfficerService _officers;

    public OfficersController(OfficerService officers) => _officers = officers;

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _officers.ListAsync(includeInactive: true, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => Ok(await _officers.GetAsync(id, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOfficerProfileDto dto, CancellationToken ct)
        => Ok(await _officers.CreateAsync(dto, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOfficerProfileDto dto, CancellationToken ct)
        => Ok(await _officers.UpdateAsync(id, dto, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _officers.DeleteAsync(id, ct);
        return NoContent();
    }
}
