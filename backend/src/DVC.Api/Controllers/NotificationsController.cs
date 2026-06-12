using DVC.Application.Abstractions.Identity;
using DVC.Application.Features.Engagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public sealed class NotificationsController : ControllerBase
{
    private readonly NotificationService _notifications;
    private readonly ICurrentUser _user;

    public NotificationsController(NotificationService notifications, ICurrentUser user)
    {
        _notifications = notifications;
        _user = user;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] bool unreadOnly = false, CancellationToken ct = default)
        => Ok(await _notifications.ListAsync(_user.RequireUserId(), unreadOnly, ct));

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        await _notifications.MarkReadAsync(_user.RequireUserId(), id, ct);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        await _notifications.MarkAllReadAsync(_user.RequireUserId(), ct);
        return NoContent();
    }
}
