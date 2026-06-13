using DVC.Domain.Catalog;
using DVC.Domain.Requests;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DVC.Infrastructure.Persistence.Configurations;

public sealed class ServiceRequestConfiguration : IEntityTypeConfiguration<ServiceRequest>
{
    public void Configure(EntityTypeBuilder<ServiceRequest> b)
    {
        b.ToTable("service_requests");
        b.HasKey(x => x.Id);
        b.Property(x => x.Code).HasMaxLength(50).IsRequired();
        b.HasIndex(x => x.Code).IsUnique();
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(30);

        b.HasOne<PublicService>().WithMany().HasForeignKey(x => x.PublicServiceId).OnDelete(DeleteBehavior.Restrict);
        b.HasMany(x => x.Documents).WithOne(x => x.ServiceRequest!).HasForeignKey(x => x.ServiceRequestId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.Comments).WithOne(x => x.ServiceRequest!).HasForeignKey(x => x.ServiceRequestId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.StatusHistory).WithOne(x => x.ServiceRequest!).HasForeignKey(x => x.ServiceRequestId).OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => x.CitizenId);
        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.AssignedOfficerId);
    }
}

public sealed class ServiceRequestDocumentConfiguration : IEntityTypeConfiguration<ServiceRequestDocument>
{
    public void Configure(EntityTypeBuilder<ServiceRequestDocument> b)
    {
        b.ToTable("service_request_documents");
        b.HasKey(x => x.Id);
        b.Property(x => x.Url).IsRequired();
        b.Property(x => x.DocumentType).HasMaxLength(100);
    }
}

public sealed class ServiceRequestCommentConfiguration : IEntityTypeConfiguration<ServiceRequestComment>
{
    public void Configure(EntityTypeBuilder<ServiceRequestComment> b)
    {
        b.ToTable("service_request_comments");
        b.HasKey(x => x.Id);
        b.Property(x => x.Content).IsRequired();
        b.HasIndex(x => x.ServiceRequestId);
    }
}

public sealed class ServiceRequestStatusHistoryConfiguration : IEntityTypeConfiguration<ServiceRequestStatusHistory>
{
    public void Configure(EntityTypeBuilder<ServiceRequestStatusHistory> b)
    {
        b.ToTable("service_request_status_history");
        b.HasKey(x => x.Id);
        b.Property(x => x.FromStatus).HasConversion<string>().HasMaxLength(30);
        b.Property(x => x.ToStatus).HasConversion<string>().HasMaxLength(30);
        b.HasIndex(x => x.ServiceRequestId);
    }
}
