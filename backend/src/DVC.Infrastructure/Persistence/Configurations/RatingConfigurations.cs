using DVC.Domain.Engagement;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DVC.Infrastructure.Persistence.Configurations;

public sealed class ServicePointRatingConfiguration : IEntityTypeConfiguration<ServicePointRating>
{
    public void Configure(EntityTypeBuilder<ServicePointRating> b)
    {
        b.ToTable("service_point_ratings", t => t.HasCheckConstraint("ck_service_point_ratings_score", "score BETWEEN 1 AND 5"));
        b.HasKey(x => x.Id);
        b.HasIndex(x => new { x.ServicePointId, x.UserId }).IsUnique();
    }
}

public sealed class ServiceRequestRatingConfiguration : IEntityTypeConfiguration<ServiceRequestRating>
{
    public void Configure(EntityTypeBuilder<ServiceRequestRating> b)
    {
        b.ToTable("service_request_ratings", t => t.HasCheckConstraint("ck_service_request_ratings_score", "score BETWEEN 1 AND 5"));
        b.HasKey(x => x.Id);
        b.HasIndex(x => x.ServiceRequestId).IsUnique();
    }
}
