using DVC.Application.Features.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api/service-requests")]
[Authorize]
public sealed class RequestsController : ControllerBase
{
    private readonly RequestService _requests;

    public RequestsController(RequestService requests) => _requests = requests;

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitRequestDto dto, CancellationToken ct)
        => Ok(await _requests.SubmitAsync(dto, ct));

    [HttpGet("mine")]
    public async Task<IActionResult> Mine(CancellationToken ct)
        => Ok(await _requests.GetMineAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => Ok(await _requests.GetAsync(id, ct));

    [HttpPost("{id:guid}/documents")]
    public async Task<IActionResult> AddDocument(Guid id, [FromBody] AddRequestDocumentDto dto, CancellationToken ct)
        => Ok(await _requests.AddDocumentAsync(id, dto, ct));

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
        => Ok(await _requests.CancelAsync(id, ct));
}
