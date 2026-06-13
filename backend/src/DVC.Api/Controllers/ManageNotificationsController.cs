using DVC.Application.Abstractions.Identity;
using DVC.Application.Features.Engagement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

/// <summary>
/// Admin notification console: send push/broadcast/emergency campaigns and read send history.
/// Backs the admin "Thông báo đẩy" screen (notify-audit.jsx).
/// </summary>
[ApiController]
[Route("api/manage/notifications")]
[Authorize(Roles = "admin,super")]
public sealed class ManageNotificationsController : ControllerBase
{
    private readonly ManageNotificationService _notifications;
    private readonly ICurrentUser _user;

    public ManageNotificationsController(ManageNotificationService notifications, ICurrentUser user)
    {
        _notifications = notifications;
        _user = user;
    }

    [HttpPost("push")]
    public async Task<IActionResult> Push([FromBody] PushNotificationRequest request, CancellationToken ct)
        => Ok(await _notifications.PushAsync(_user.RequireUserId(), request, ct));

    [HttpPost("broadcast")]
    public async Task<IActionResult> Broadcast([FromBody] BroadcastNotificationRequest request, CancellationToken ct)
        => Ok(await _notifications.BroadcastAsync(_user.RequireUserId(), request, ct));

    [HttpPost("emergency")]
    public async Task<IActionResult> Emergency([FromBody] EmergencyNotificationRequest request, CancellationToken ct)
        => Ok(await _notifications.EmergencyAsync(_user.RequireUserId(), request, ct));

    [HttpGet("history")]
    public async Task<IActionResult> History([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _notifications.GetHistoryAsync(page, pageSize, ct));
}
