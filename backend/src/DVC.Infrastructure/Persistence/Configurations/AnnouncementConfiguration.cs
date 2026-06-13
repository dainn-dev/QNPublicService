using DVC.Domain.Announcements;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DVC.Infrastructure.Persistence.Configurations;

public sealed class AnnouncementConfiguration : IEntityTypeConfiguration<Announcement>
{
    public void Configure(EntityTypeBuilder<Announcement> b)
    {
        b.ToTable("announcements");
        b.HasKey(x => x.Id);
        b.Property(x => x.TitleVi).HasMaxLength(500).IsRequired();
        b.Property(x => x.TitleEn).HasMaxLength(500).IsRequired();
        b.Property(x => x.BodyVi).IsRequired();
        b.Property(x => x.BodyEn).IsRequired();
        b.Property(x => x.Tag).HasMaxLength(30).IsRequired();
        b.HasIndex(x => new { x.IsActive, x.Date });
        b.HasIndex(x => x.Tag);
    }
}
