using DVC.Application.Abstractions.Identity;
using DVC.Application.Common;
using DVC.Application.Features.Users;
using DVC.Domain.Common;
using DVC.Domain.Identity;
using DVC.Infrastructure.Persistence;
using DVC.Tests.Common;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Users;

public sealed class ManageUsersServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly FakeUserAdmin _userAdmin = new();
    private readonly FakeIdentity _identity;
    private readonly ManageUsersService _service;

    public ManageUsersServiceTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _identity = new FakeIdentity(_userAdmin);
        _service = new ManageUsersService(_db, _userAdmin, _identity);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task Create_RegistersUser_PersistsProfile_AssignsRole()
    {
        var dto = new CreateUserDto("an@dvc.local", "an", "Pw@123456", "Nguyễn An", "0905", "Quảng Ngãi", Roles.Officer);

        var result = await _service.CreateAsync(dto);

        result.Email.Should().Be("an@dvc.local");
        result.FullName.Should().Be("Nguyễn An");
        result.Phone.Should().Be("0905");
        result.Address.Should().Be("Quảng Ngãi");
        result.Roles.Should().Contain(Roles.Officer);

        var profile = _db.UserProfiles.Single(p => p.UserId == result.Id);
        profile.FullName.Should().Be("Nguyễn An");
        _identity.Registered.Should().ContainSingle();
    }

    [Fact]
    public async Task Create_WithoutRole_DoesNotAssignAnyRole()
    {
        var dto = new CreateUserDto("b@dvc.local", "b", "Pw@123456", "B", null, null, null);

        var result = await _service.CreateAsync(dto);

        result.Roles.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateProfile_CreatesProfileWhenMissing_ThenUpdates()
    {
        var userId = await _identity.RegisterAsync("c@dvc.local", "c", "Pw@123456");
        _userAdmin.Seed(userId, "c@dvc.local", "c");

        var first = await _service.UpdateProfileAsync(userId, new UpdateUserProfileDto("Tên 1", "0901", "Đ/c 1"));
        first.FullName.Should().Be("Tên 1");
        _db.UserProfiles.Count(p => p.UserId == userId).Should().Be(1);

        var second = await _service.UpdateProfileAsync(userId, new UpdateUserProfileDto("Tên 2", null, null));
        second.FullName.Should().Be("Tên 2");
        second.Phone.Should().BeNull();
        _db.UserProfiles.Count(p => p.UserId == userId).Should().Be(1);
    }

    [Fact]
    public async Task UpdateProfile_UnknownUser_Throws()
    {
        var act = () => _service.UpdateProfileAsync(Guid.NewGuid(), new UpdateUserProfileDto("X", null, null));
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task List_EnrichesUsersWithProfiles_AndLeavesProfilelessUsersNull()
    {
        var withProfile = await _service.CreateAsync(
            new CreateUserDto("d@dvc.local", "d", "Pw@123456", "Có hồ sơ", "0911", "Addr", null));
        var bare = await _identity.RegisterAsync("e@dvc.local", "e", "Pw@123456");
        _userAdmin.Seed(bare, "e@dvc.local", "e");

        var page = await _service.ListAsync(1, 20, null);

        page.Items.Single(u => u.Id == withProfile.Id).FullName.Should().Be("Có hồ sơ");
        page.Items.Single(u => u.Id == bare).FullName.Should().BeNull();
    }

    private sealed class FakeIdentity : IIdentityService
    {
        private readonly FakeUserAdmin _store;
        public List<Guid> Registered { get; } = new();

        public FakeIdentity(FakeUserAdmin store) => _store = store;

        public Task<Guid> RegisterAsync(string email, string username, string password, CancellationToken ct = default)
        {
            var id = Guid.NewGuid();
            // Mirror production: the account lands in the same store GetUserAsync reads from.
            _store.Seed(id, email, username);
            Registered.Add(id);
            return Task.FromResult(id);
        }

        public Task<AuthResult> LoginAsync(string email, string password, string? ip, string? ua, CancellationToken ct = default)
            => throw new NotImplementedException();
        public Task<AuthResult> RefreshTokenAsync(string token, string? ip, string? ua, CancellationToken ct = default)
            => throw new NotImplementedException();
        public Task LogoutAsync(Guid userId, CancellationToken ct = default) => Task.CompletedTask;
    }

    private sealed class FakeUserAdmin : IUserAdminService
    {
        private readonly Dictionary<Guid, (string Email, string Username, List<string> Roles)> _users = new();

        public void Seed(Guid id, string email, string username) =>
            _users[id] = (email, username, new List<string>());

        public Task<PagedResult<AdminUserDto>> GetUsersAsync(int page, int pageSize, string? search, CancellationToken ct = default)
        {
            var items = _users.Select(kv => ToDto(kv.Key)).ToList();
            return Task.FromResult(new PagedResult<AdminUserDto>(items, page, pageSize, items.Count));
        }

        public Task<AdminUserDto> GetUserAsync(Guid userId, CancellationToken ct = default)
        {
            if (!_users.ContainsKey(userId)) throw NotFoundException.For("User", userId);
            return Task.FromResult(ToDto(userId));
        }

        public Task AssignRoleAsync(Guid userId, string roleCode, CancellationToken ct = default)
        {
            var roles = _users[userId].Roles;
            if (!roles.Contains(roleCode)) roles.Add(roleCode);
            return Task.CompletedTask;
        }

        public Task RemoveRoleAsync(Guid userId, string roleCode, CancellationToken ct = default)
        {
            _users[userId].Roles.Remove(roleCode);
            return Task.CompletedTask;
        }

        public Task LockAsync(Guid userId, CancellationToken ct = default) => Task.CompletedTask;
        public Task UnlockAsync(Guid userId, CancellationToken ct = default) => Task.CompletedTask;
        public Task EnsureRolesAsync(IEnumerable<string> roleCodes, CancellationToken ct = default) => Task.CompletedTask;

        private AdminUserDto ToDto(Guid id)
        {
            var u = _users[id];
            return new AdminUserDto(id, u.Email, u.Username, "Active", false, null, u.Roles.ToList());
        }
    }
}
