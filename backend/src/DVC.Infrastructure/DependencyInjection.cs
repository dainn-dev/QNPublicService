using DainnUser.Infrastructure;
using DainnUser.Infrastructure.Data;
using DVC.Application.Abstractions;
using DVC.Application.Abstractions.Identity;
using DVC.Infrastructure.Identity;
using DVC.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DVC.Infrastructure;

public static class DependencyInjection
{
    /// <summary>
    /// Registers infrastructure services: the DainnUser user/auth module, our domain DbContext, and adapters.
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // DainnUser owns the users/roles/user_roles tables, JWT issuance, sessions, etc.
        // Config lives under the "DainnUser:" section (Database:Provider=PostgreSQL, Jwt:Secret, ...).
        // Some flags don't bind reliably from config, so set the ones we depend on explicitly here.
        services.AddDainnUser(configuration, options =>
        {
            options.RequireEmailVerification = configuration.GetValue("DainnUser:RequireEmailVerification", false);
            options.EnablePhoneVerification = configuration.GetValue("DainnUser:EnablePhoneVerification", false);
            options.EnableTwoFactor = configuration.GetValue("DainnUser:EnableTwoFactor", false);
            options.EnableRateLimiting = configuration.GetValue("DainnUser:EnableRateLimiting", false);
        });

        // Single seam over DainnUser — everything else depends only on these interfaces.
        services.AddScoped<IIdentityService, DainnUserAuthAdapter>();
        services.AddScoped<IUserAdminService, DainnUserUserAdminAdapter>();
        services.AddScoped<IUserDirectory, DainnUserUserDirectory>();

        // Our domain store: snake_case tables, isolated from DainnUser's PascalCase tables.
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' is not configured.");

        services.AddScoped<Persistence.Interceptors.AuditSaveChangesInterceptor>();
        services.AddDbContext<AppDbContext>((sp, options) => options
            .UseNpgsql(connectionString)
            .UseSnakeCaseNamingConvention()
            .AddInterceptors(sp.GetRequiredService<Persistence.Interceptors.AuditSaveChangesInterceptor>()));

        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());

        // Geo seeder with a typed HttpClient pointed at the Vietnam provinces open API.
        var geoBaseUrl = configuration["Geo:ApiBaseUrl"] ?? "https://provinces.open-api.vn/api/v2/";
        services.AddHttpClient<IGeoSeeder, Geo.ProvinceApiSeeder>(client =>
        {
            client.BaseAddress = new Uri(geoBaseUrl);
            client.Timeout = TimeSpan.FromSeconds(60);
        });

        return services;
    }

    /// <summary>
    /// Registers the JWT bearer authentication scheme provided by DainnUser.
    /// </summary>
    public static IServiceCollection AddInfrastructureAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDainnUserAuthentication(configuration);
        return services;
    }

    /// <summary>
    /// Creates/updates both schemas at startup. DainnUser's identity tables are built from its model
    /// (its shipped InitialCreate migration has a Guid→string seed bug under Npgsql), and our
    /// AppDbContext is migrated normally.
    /// </summary>
    public static async Task MigrateDatabaseAsync(this IServiceProvider services, CancellationToken ct = default)
    {
        await using var scope = services.CreateAsyncScope();

        var identity = scope.ServiceProvider.GetRequiredService<DainnUserDbContext>();
        await identity.Database.EnsureCreatedAsync(ct);

        var app = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await app.Database.MigrateAsync(ct);

        // Ensure the canonical roles exist in the DainnUser store.
        var userAdmin = scope.ServiceProvider.GetRequiredService<IUserAdminService>();
        await userAdmin.EnsureRolesAsync(DVC.Domain.Common.Roles.All, ct);

        // Seed reference data (feedback categories, …).
        await Persistence.Seed.ReferenceDataSeeder.SeedAsync(app, ct);

        // Seed a default admin so the portal can be signed into out of the box.
        var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var identityService = scope.ServiceProvider.GetRequiredService<IIdentityService>();
        await Persistence.Seed.AdminUserSeeder.SeedAsync(
            app, identityService, userAdmin,
            config["Seed:Admin:Email"] ?? "admin@dvc.local",
            config["Seed:Admin:Username"] ?? "admin",
            config["Seed:Admin:Password"] ?? "Admin@123456",
            ct);
    }

    /// <summary>Seeds provinces/wards from the public API only when the table is empty (dev convenience).</summary>
    public static async Task SeedGeoIfEmptyAsync(this IServiceProvider services, CancellationToken ct = default)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (await db.Provinces.AnyAsync(ct))
            return;

        var seeder = scope.ServiceProvider.GetRequiredService<IGeoSeeder>();
        await seeder.SeedAsync(ct);
    }
}
