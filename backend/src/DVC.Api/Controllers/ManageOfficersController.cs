using DVC.Application.Features.Officers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

/// <summary>
/// Officer directory for the officer portal's assign dropdown. Unlike /api/admin/officers,
/// this is readable by the officer role and only exposes non-sensitive fields.
/// </summary>
[ApiController]
[Route("api/manage/officers")]
[Authorize(Roles = "officer,admin,super")]
public sealed class ManageOfficersController : ControllerBase
{
    private readonly OfficerService _officers;

    public ManageOfficersController(OfficerService officers) => _officers = officers;

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _officers.ListActiveSummariesAsync(ct));
}
