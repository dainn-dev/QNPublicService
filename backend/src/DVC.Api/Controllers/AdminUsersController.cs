using DVC.Application.Abstractions.Identity;
using DVC.Application.Features.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DVC.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "admin,super")]
public sealed class AdminUsersController : ControllerBase
{
    private readonly IUserAdminService _users;
    private readonly ManageUsersService _manage;

    public AdminUsersController(IUserAdminService users, ManageUsersService manage)
    {
        _users = users;
        _manage = manage;
    }

    public sealed record RoleChangeDto(string Role);

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, CancellationToken ct = default)
        => Ok(await _manage.ListAsync(page, pageSize, search, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
        => Ok(await _manage.GetAsync(id, ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto, CancellationToken ct)
    {
        var user = await _manage.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
    }

    [HttpPut("{id:guid}/profile")]
    public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateUserProfileDto dto, CancellationToken ct)
        => Ok(await _manage.UpdateProfileAsync(id, dto, ct));

    [HttpPost("{id:guid}/roles")]
    public async Task<IActionResult> AssignRole(Guid id, [FromBody] RoleChangeDto dto, CancellationToken ct)
    {
        await _users.AssignRoleAsync(id, dto.Role, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}/roles/{role}")]
    public async Task<IActionResult> RemoveRole(Guid id, string role, CancellationToken ct)
    {
        await _users.RemoveRoleAsync(id, role, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/lock")]
    public async Task<IActionResult> Lock(Guid id, CancellationToken ct)
    {
        await _users.LockAsync(id, ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/unlock")]
    public async Task<IActionResult> Unlock(Guid id, CancellationToken ct)
    {
        await _users.UnlockAsync(id, ct);
        return NoContent();
    }
}
