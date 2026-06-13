using DVC.Application.Common;
using DVC.Domain.Identity;
using DVC.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Xunit;

namespace DVC.Tests.Common;

public sealed class PersonNameResolverTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly SqliteConnection _connection;
    private readonly PersonNameResolver _resolver;

    public PersonNameResolverTests()
    {
        (_db, _connection) = SqliteDb.Create();
        _resolver = new PersonNameResolver(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task ResolvesCitizenProfile_NameAndPhone()
    {
        var citizenId = Guid.NewGuid();
        _db.UserProfiles.Add(new UserProfile { UserId = citizenId, FullName = "Trần Thị B", Phone = "0905123456" });
        _db.SaveChanges();

        var names = await _resolver.LoadAsync(new[] { citizenId });

        names.Name(citizenId).Should().Be("Trần Thị B");
        names.Phone(citizenId).Should().Be("0905123456");
    }

    [Fact]
    public async Task ResolvesOfficerProfile_NameAndPhone()
    {
        var officerId = Guid.NewGuid();
        _db.OfficerProfiles.Add(new OfficerProfile { UserId = officerId, FullName = "Cán bộ A", PhoneNumber = "0911" });
        _db.SaveChanges();

        var names = await _resolver.LoadAsync(new[] { officerId });

        names.Name(officerId).Should().Be("Cán bộ A");
        names.Phone(officerId).Should().Be("0911");
    }

    [Fact]
    public async Task MissingProfile_FallsBackToUnknownName_AndNullPhone()
    {
        var unknown = Guid.NewGuid();

        var names = await _resolver.LoadAsync(new[] { unknown });

        names.Name(unknown).Should().Be(PersonNameResolver.UnknownName);
        names.Phone(unknown).Should().BeNull();
    }

    [Fact]
    public async Task BlankProfileName_FallsBackToUnknownName()
    {
        var citizenId = Guid.NewGuid();
        _db.UserProfiles.Add(new UserProfile { UserId = citizenId, FullName = "  ", Phone = null });
        _db.SaveChanges();

        var names = await _resolver.LoadAsync(new[] { citizenId });

        names.Name(citizenId).Should().Be(PersonNameResolver.UnknownName);
    }

    [Fact]
    public async Task OfficerProfile_WinsOver_CitizenProfile_ForSameUser()
    {
        // A staff member may carry both an officer and a (legacy) citizen profile.
        var userId = Guid.NewGuid();
        _db.UserProfiles.Add(new UserProfile { UserId = userId, FullName = "Tên công dân", Phone = "0900" });
        _db.OfficerProfiles.Add(new OfficerProfile { UserId = userId, FullName = "Tên cán bộ", PhoneNumber = "0999" });
        _db.SaveChanges();

        var names = await _resolver.LoadAsync(new[] { userId });

        names.Name(userId).Should().Be("Tên cán bộ");
        names.Phone(userId).Should().Be("0999");
    }

    [Fact]
    public async Task BatchLookup_ResolvesMixOfOfficersCitizensAndUnknowns()
    {
        var officerId = Guid.NewGuid();
        var citizenId = Guid.NewGuid();
        var unknownId = Guid.NewGuid();
        _db.OfficerProfiles.Add(new OfficerProfile { UserId = officerId, FullName = "O" });
        _db.UserProfiles.Add(new UserProfile { UserId = citizenId, FullName = "C" });
        _db.SaveChanges();

        // Duplicates and Guid.Empty are tolerated.
        var names = await _resolver.LoadAsync(new[] { officerId, citizenId, unknownId, citizenId, Guid.Empty });

        names.Name(officerId).Should().Be("O");
        names.Name(citizenId).Should().Be("C");
        names.Name(unknownId).Should().Be(PersonNameResolver.UnknownName);
    }

    [Fact]
    public async Task NullUserId_ReturnsUnknownName_AndNullPhone()
    {
        var names = await _resolver.LoadAsync(Array.Empty<Guid>());

        names.Name(null).Should().Be(PersonNameResolver.UnknownName);
        names.Phone(null).Should().BeNull();
    }
}
