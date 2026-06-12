using DVC.Domain.Audit;
using DVC.Domain.Engagement;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DVC.Infrastructure.Persistence.Configurations;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> b)
    {
        b.ToTable("notifications");
        b.HasKey(x => x.Id);
        b.Property(x => x.Type).HasConversion<string>().HasMaxLength(50);
        b.Property(x => x.Title).HasMaxLength(255).IsRequired();
        b.Property(x => x.Message).IsRequired();
        b.Property(x => x.RelatedEntityType).HasMaxLength(100);
        b.HasIndex(x => new { x.UserId, x.IsRead });
    }
}

public sealed class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> b)
    {
        b.ToTable("audit_logs");
        b.HasKey(x => x.Id);
        b.Property(x => x.Action).HasMaxLength(100).IsRequired();
        b.Property(x => x.EntityType).HasMaxLength(100).IsRequired();
        b.Property(x => x.OldValue).HasColumnType("jsonb");
        b.Property(x => x.NewValue).HasColumnType("jsonb");
        b.Property(x => x.IpAddress).HasMaxLength(100);
        b.HasIndex(x => new { x.EntityType, x.EntityId });
        b.HasIndex(x => x.ActorUserId);
        b.HasIndex(x => x.CreatedAt);
    }
}
