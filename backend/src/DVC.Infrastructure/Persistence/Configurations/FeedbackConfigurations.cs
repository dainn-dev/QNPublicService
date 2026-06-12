using DVC.Domain.Feedback;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DVC.Infrastructure.Persistence.Configurations;

public sealed class FeedbackCategoryConfiguration : IEntityTypeConfiguration<FeedbackCategory>
{
    public void Configure(EntityTypeBuilder<FeedbackCategory> b)
    {
        b.ToTable("feedback_categories");
        b.HasKey(x => x.Id);
        b.Property(x => x.Code).HasMaxLength(50).IsRequired();
        b.HasIndex(x => x.Code).IsUnique();
        b.Property(x => x.Name).HasMaxLength(255).IsRequired();
    }
}

public sealed class FeedbackReportConfiguration : IEntityTypeConfiguration<FeedbackReport>
{
    public void Configure(EntityTypeBuilder<FeedbackReport> b)
    {
        b.ToTable("feedback_reports");
        b.HasKey(x => x.Id);
        b.Property(x => x.Code).HasMaxLength(50).IsRequired();
        b.HasIndex(x => x.Code).IsUnique();
        b.Property(x => x.Title).HasMaxLength(255).IsRequired();
        b.Property(x => x.Status).HasConversion<string>().HasMaxLength(30);
        b.Property(x => x.Priority).HasConversion<string>().HasMaxLength(30);
        b.Property(x => x.Latitude).HasColumnType("numeric(10,7)");
        b.Property(x => x.Longitude).HasColumnType("numeric(10,7)");

        b.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        b.HasMany(x => x.Attachments).WithOne(x => x.FeedbackReport!).HasForeignKey(x => x.FeedbackReportId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.Comments).WithOne(x => x.FeedbackReport!).HasForeignKey(x => x.FeedbackReportId).OnDelete(DeleteBehavior.Cascade);
        b.HasMany(x => x.StatusHistory).WithOne(x => x.FeedbackReport!).HasForeignKey(x => x.FeedbackReportId).OnDelete(DeleteBehavior.Cascade);

        b.HasIndex(x => x.Status);
        b.HasIndex(x => x.CitizenId);
        b.HasIndex(x => x.AssignedOfficerId);
        b.HasIndex(x => new { x.ProvinceCode, x.WardCode });
    }
}

public sealed class FeedbackAttachmentConfiguration : IEntityTypeConfiguration<FeedbackAttachment>
{
    public void Configure(EntityTypeBuilder<FeedbackAttachment> b)
    {
        b.ToTable("feedback_attachments");
        b.HasKey(x => x.Id);
        b.Property(x => x.Url).IsRequired();
        b.Property(x => x.ContentType).HasMaxLength(100);
    }
}

public sealed class FeedbackCommentConfiguration : IEntityTypeConfiguration<FeedbackComment>
{
    public void Configure(EntityTypeBuilder<FeedbackComment> b)
    {
        b.ToTable("feedback_comments");
        b.HasKey(x => x.Id);
        b.Property(x => x.Content).IsRequired();
        b.HasIndex(x => x.FeedbackReportId);
    }
}

public sealed class FeedbackStatusHistoryConfiguration : IEntityTypeConfiguration<FeedbackStatusHistory>
{
    public void Configure(EntityTypeBuilder<FeedbackStatusHistory> b)
    {
        b.ToTable("feedback_status_history");
        b.HasKey(x => x.Id);
        b.Property(x => x.FromStatus).HasConversion<string>().HasMaxLength(30);
        b.Property(x => x.ToStatus).HasConversion<string>().HasMaxLength(30);
        b.HasIndex(x => x.FeedbackReportId);
    }
}
