using DVC.Application.Abstractions;
using DVC.Domain.Audit;
using DVC.Domain.Catalog;
using DVC.Domain.Common;
using DVC.Domain.Engagement;
using DVC.Domain.Feedback;
using DVC.Domain.Geo;
using DVC.Domain.Identity;
using DVC.Domain.Requests;
using DVC.Domain.ServicePoints;
using Microsoft.EntityFrameworkCore;

namespace DVC.Infrastructure.Persistence;

/// <summary>
/// The application's domain DbContext (everything except the DainnUser-owned identity tables).
/// Uses snake_case naming; tables therefore never collide with DainnUser's PascalCase tables in the same DB.
/// </summary>
public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Province> Provinces => Set<Province>();
    public DbSet<Ward> Wards => Set<Ward>();
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<PublicService> PublicServices => Set<PublicService>();
    public DbSet<ServicePoint> ServicePoints => Set<ServicePoint>();
    public DbSet<ServicePointService> ServicePointServices => Set<ServicePointService>();
    public DbSet<ServicePointImage> ServicePointImages => Set<ServicePointImage>();
    public DbSet<OfficerProfile> OfficerProfiles => Set<OfficerProfile>();
    public DbSet<FeedbackCategory> FeedbackCategories => Set<FeedbackCategory>();
    public DbSet<FeedbackReport> FeedbackReports => Set<FeedbackReport>();
    public DbSet<FeedbackAttachment> FeedbackAttachments => Set<FeedbackAttachment>();
    public DbSet<FeedbackComment> FeedbackComments => Set<FeedbackComment>();
    public DbSet<FeedbackStatusHistory> FeedbackStatusHistory => Set<FeedbackStatusHistory>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<ServiceRequestDocument> ServiceRequestDocuments => Set<ServiceRequestDocument>();
    public DbSet<ServiceRequestStatusHistory> ServiceRequestStatusHistory => Set<ServiceRequestStatusHistory>();
    public DbSet<ServicePointRating> ServicePointRatings => Set<ServicePointRating>();
    public DbSet<ServiceRequestRating> ServiceRequestRatings => Set<ServiceRequestRating>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyTimestamps()
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.UpdatedAt = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }
    }
}
