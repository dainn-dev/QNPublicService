using DainnUser.Infrastructure;
using DVC.Api.Middleware;
using DVC.Application;
using DVC.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// --- Services ---
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddInfrastructureAuthentication(builder.Configuration);
builder.Services.AddAuthorization();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<DVC.Application.Abstractions.Identity.ICurrentUser, DVC.Api.Identity.CurrentUser>();

builder.Services
    .AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(
        new System.Text.Json.Serialization.JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

const string FrontendCors = "frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCors, policy => policy
        .WithOrigins("http://localhost:8765", "http://127.0.0.1:8765")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();

// --- Create/migrate both schemas on startup ---
await app.Services.MigrateDatabaseAsync();
if (app.Configuration.GetValue("Geo:AutoSeed", false))
    await app.Services.SeedGeoIfEmptyAsync();

// --- Pipeline ---
app.UseExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(FrontendCors);
app.UseDainnUser();          // DainnUser middleware (rate limiting, etc.)
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program; // exposed for WebApplicationFactory in tests
