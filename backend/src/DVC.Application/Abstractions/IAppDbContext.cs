using DVC.Domain.Announcements;
using DVC.Domain.Audit;
using DVC.Domain.Catalog;
using DVC.Domain.Engagement;
using DVC.Domain.Feedback;
using DVC.Domain.Geo;
using DVC.Domain.Identity;
using DVC.Domain.Requests;
using DVC.Domain.ServicePoints;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Abstractions;

/// <summary>
/// Abstraction over the application's EF context so Application services stay free of
/// an Infrastructure reference. Grows one DbSet group per module.
/// </summary>
public interface IAppDbContext
{
    DbSet<Province> Provinces { get; }
    DbSet<Ward> Wards { get; }
    DbSet<ServiceCategory> ServiceCategories { get; }
    DbSet<PublicService> PublicServices { get; }
    DbSet<ServicePoint> ServicePoints { get; }
    DbSet<ServicePointService> ServicePointServices { get; }
    DbSet<ServicePointImage> ServicePointImages { get; }
    DbSet<OfficerProfile> OfficerProfiles { get; }
    DbSet<UserProfile> UserProfiles { get; }
    DbSet<FeedbackCategory> FeedbackCategories { get; }
    DbSet<FeedbackReport> FeedbackReports { get; }
    DbSet<FeedbackAttachment> FeedbackAttachments { get; }
    DbSet<FeedbackComment> FeedbackComments { get; }
    DbSet<FeedbackStatusHistory> FeedbackStatusHistory { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<NotificationCampaign> NotificationCampaigns { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<ServiceRequest> ServiceRequests { get; }
    DbSet<ServiceRequestDocument> ServiceRequestDocuments { get; }
    DbSet<ServiceRequestComment> ServiceRequestComments { get; }
    DbSet<ServiceRequestStatusHistory> ServiceRequestStatusHistory { get; }
    DbSet<ServicePointRating> ServicePointRatings { get; }
    DbSet<ServiceRequestRating> ServiceRequestRatings { get; }
    DbSet<Announcement> Announcements { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
