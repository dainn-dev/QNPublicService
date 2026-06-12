using DVC.Application.Features.Engagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class RatingsController : ControllerBase
{
    private readonly RatingService _ratings;

    public RatingsController(RatingService ratings) => _ratings = ratings;

    [HttpGet("service-points/{id:guid}/ratings")]
    [AllowAnonymous]
    public async Task<IActionResult> GetServicePointRatings(Guid id, CancellationToken ct)
        => Ok(await _ratings.GetServicePointRatingsAsync(id, ct));

    [HttpPost("service-points/{id:guid}/ratings")]
    [Authorize]
    public async Task<IActionResult> RateServicePoint(Guid id, [FromBody] RateDto dto, CancellationToken ct)
        => Ok(await _ratings.RateServicePointAsync(id, dto, ct));

    [HttpPost("service-requests/{id:guid}/rating")]
    [Authorize]
    public async Task<IActionResult> RateRequest(Guid id, [FromBody] RateDto dto, CancellationToken ct)
        => Ok(await _ratings.RateRequestAsync(id, dto, ct));
}
