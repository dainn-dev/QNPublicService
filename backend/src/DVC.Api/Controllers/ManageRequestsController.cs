using DVC.Application.Features.Requests;
using DVC.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api/manage/service-requests")]
[Authorize(Roles = "officer,admin,super")]
public sealed class ManageRequestsController : ControllerBase
{
    private readonly RequestService _requests;

    public ManageRequestsController(RequestService requests) => _requests = requests;

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] ServiceRequestStatus? status, [FromQuery] Guid? assignedOfficerId, CancellationToken ct)
        => Ok(await _requests.ListForOfficerAsync(status, assignedOfficerId, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => Ok(await _requests.GetAsync(id, ct));

    [HttpPost("{id:guid}/assign")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignRequestDto dto, CancellationToken ct)
        => Ok(await _requests.AssignAsync(id, dto, ct));

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeRequestStatusDto dto, CancellationToken ct)
        => Ok(await _requests.ChangeStatusAsync(id, dto, ct));

    /// <summary>Shortcut to move a request to WAITING_SUPPLEMENT.</summary>
    [HttpPost("{id:guid}/request-supplement")]
    public async Task<IActionResult> RequestSupplement(Guid id, [FromBody] ChangeRequestStatusDto? dto, CancellationToken ct)
        => Ok(await _requests.ChangeStatusAsync(id, new ChangeRequestStatusDto(ServiceRequestStatus.WaitingSupplement, dto?.Note), ct));
}
