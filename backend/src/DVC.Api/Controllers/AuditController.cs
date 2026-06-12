using DVC.Application.Features.Audit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api/admin/audit-logs")]
[Authorize(Roles = "super")]
public sealed class AuditController : ControllerBase
{
    private readonly AuditService _audit;

    public AuditController(AuditService audit) => _audit = audit;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 50,
        [FromQuery] string? entityType = null, [FromQuery] Guid? actorUserId = null, CancellationToken ct = default)
        => Ok(await _audit.GetAsync(page, pageSize, entityType, actorUserId, ct));
}
