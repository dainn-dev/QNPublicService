using DVC.Application.Features.Stats;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

/// <summary>Internal dashboard statistics for the officer portal (Manage.html).</summary>
[ApiController]
[Route("api/manage/stats")]
[Authorize(Roles = "officer,admin,super")]
public sealed class ManageStatsController : ControllerBase
{
    private readonly ManageStatsService _stats;

    public ManageStatsController(ManageStatsService stats) => _stats = stats;

    [HttpGet("overview")]
    public async Task<IActionResult> Overview(CancellationToken ct)
        => Ok(await _stats.GetOverviewAsync(ct));

    [HttpGet("requests-by-month")]
    public async Task<IActionResult> RequestsByMonth([FromQuery] int months = 6, CancellationToken ct = default)
        => Ok(await _stats.GetRequestsByMonthAsync(months, ct));

    [HttpGet("feedback-by-category")]
    public async Task<IActionResult> FeedbackByCategory(CancellationToken ct)
        => Ok(await _stats.GetFeedbackByCategoryAsync(ct));

    [HttpGet("feedback-heatmap")]
    public async Task<IActionResult> FeedbackHeatmap(CancellationToken ct)
        => Ok(await _stats.GetFeedbackHeatmapAsync(ct));
}
