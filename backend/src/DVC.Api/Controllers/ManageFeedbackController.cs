using DVC.Application.Features.Feedback;
using DVC.Domain.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api/manage/feedback")]
[Authorize(Roles = "officer,admin,super")]
public sealed class ManageFeedbackController : ControllerBase
{
    private readonly FeedbackService _feedback;

    public ManageFeedbackController(FeedbackService feedback) => _feedback = feedback;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] FeedbackStatus? status, [FromQuery] Guid? assignedOfficerId, [FromQuery] FeedbackPriority? priority, CancellationToken ct)
        => Ok(await _feedback.ListForOfficerAsync(status, assignedOfficerId, priority, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => Ok(await _feedback.GetAsync(id, ct));

    [HttpPost("{id:guid}/assign")]
    public async Task<IActionResult> Assign(Guid id, [FromBody] AssignFeedbackDto dto, CancellationToken ct)
        => Ok(await _feedback.AssignAsync(id, dto, ct));

    [HttpPost("{id:guid}/status")]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeFeedbackStatusDto dto, CancellationToken ct)
        => Ok(await _feedback.ChangeStatusAsync(id, dto, ct));

    [HttpPost("{id:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddFeedbackCommentDto dto, CancellationToken ct)
        => Ok(await _feedback.AddCommentAsync(id, dto, ct));
}
