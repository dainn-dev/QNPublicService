using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DVC.Infrastructure.Persistence;

/// <summary>
/// Design-time factory for `dotnet ef migrations` so the tooling doesn't boot the whole API
/// (which needs DainnUser config + a live DB). The connection string here is only used to build
/// the model/migration, never to connect.
/// </summary>
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("DVC_DESIGN_CONNECTION")
            ?? "Host=localhost;Port=5432;Database=dvc;Username=dvc;Password=dvc_dev_pw";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention()
            .Options;

        return new AppDbContext(options);
    }
}
