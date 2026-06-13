using DVC.Application.Features.Announcements;
using DVC.Application.Features.Catalog;
using DVC.Application.Features.Engagement;
using DVC.Application.Features.Feedback;
using DVC.Application.Features.Geo;
using DVC.Application.Features.Officers;
using DVC.Application.Features.Requests;
using DVC.Application.Features.ServicePoints;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace DVC.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<Common.PersonNameResolver>();
        services.AddScoped<GeoService>();
        services.AddScoped<CatalogService>();
        services.AddScoped<ServicePointsService>();
        services.AddScoped<OfficerService>();
        services.AddScoped<Features.Users.ManageUsersService>();
        services.AddScoped<NotificationService>();
        services.AddScoped<ManageNotificationService>();
        services.AddScoped<RatingService>();
        services.AddScoped<FeedbackService>();
        services.AddScoped<RequestService>();
        services.AddScoped<Features.Audit.AuditService>();
        services.AddScoped<AnnouncementService>();
        services.AddScoped<Features.Stats.StatsService>();
        services.AddScoped<Features.Stats.ManageStatsService>();

        return services;
    }
}
