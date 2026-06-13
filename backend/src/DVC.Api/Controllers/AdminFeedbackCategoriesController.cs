using DVC.Application.Features.Feedback;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

/// <summary>
/// Admin CRUD for feedback categories. Citizens read the active list via /api/feedback/categories;
/// this surface manages the full catalogue (including inactive) and is restricted to admin/super.
/// </summary>
[ApiController]
[Route("api/admin/feedback-categories")]
[Authorize(Roles = "admin,super")]
public sealed class AdminFeedbackCategoriesController : ControllerBase
{
    private readonly FeedbackService _feedback;

    public AdminFeedbackCategoriesController(FeedbackService feedback) => _feedback = feedback;

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
        => Ok(await _feedback.GetCategoriesAsync(includeInactive: true, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFeedbackCategoryDto dto, CancellationToken ct)
        => Ok(await _feedback.CreateCategoryAsync(dto, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFeedbackCategoryDto dto, CancellationToken ct)
        => Ok(await _feedback.UpdateCategoryAsync(id, dto, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _feedback.DeleteCategoryAsync(id, ct);
        return NoContent();
    }
}
