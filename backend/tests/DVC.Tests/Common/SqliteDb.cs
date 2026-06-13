using DVC.Infrastructure.Persistence;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace DVC.Tests.Common;

/// <summary>
/// Creates a real AppDbContext over an in-memory SQLite database. The context is constructed
/// directly (no DI) so the audit interceptor is not attached and no ICurrentUser fake is needed.
/// </summary>
public static class SqliteDb
{
    public static (AppDbContext Db, SqliteConnection Connection) Create()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connection)
            .UseSnakeCaseNamingConvention()
            .Options;

        var db = new AppDbContext(options);
        db.Database.EnsureCreated();
        return (db, connection);
    }
}
