using DVC.Application.Features.Feedback;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api/feedback")]
[Authorize]
public sealed class FeedbackController : ControllerBase
{
    private readonly FeedbackService _feedback;

    public FeedbackController(FeedbackService feedback) => _feedback = feedback;

    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<IActionResult> Categories(CancellationToken ct)
        => Ok(await _feedback.GetCategoriesAsync(includeInactive: false, ct));

    [HttpPost]
    public async Task<IActionResult> Submit([FromBody] SubmitFeedbackDto dto, CancellationToken ct)
        => Ok(await _feedback.SubmitAsync(dto, ct));

    [HttpGet("mine")]
    public async Task<IActionResult> Mine(CancellationToken ct)
        => Ok(await _feedback.GetMineAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => Ok(await _feedback.GetAsync(id, ct));

    [HttpPost("{id:guid}/attachments")]
    public async Task<IActionResult> AddAttachment(Guid id, [FromBody] AddFeedbackAttachmentDto dto, CancellationToken ct)
        => Ok(await _feedback.AddAttachmentAsync(id, dto, ct));

    [HttpPost("{id:guid}/comments")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] AddFeedbackCommentDto dto, CancellationToken ct)
        => Ok(await _feedback.AddCommentAsync(id, dto, ct));
}
