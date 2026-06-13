using DVC.Application.Features.Stats;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class StatsController : ControllerBase
{
    private readonly StatsService _stats;

    public StatsController(StatsService stats) => _stats = stats;

    [HttpGet("stats")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDashboardStats(CancellationToken ct)
        => Ok(await _stats.GetDashboardStatsAsync(ct));
}
