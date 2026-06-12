using DVC.Domain.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DVC.Infrastructure.Persistence.Configurations;

public sealed class OfficerProfileConfiguration : IEntityTypeConfiguration<OfficerProfile>
{
    public void Configure(EntityTypeBuilder<OfficerProfile> b)
    {
        b.ToTable("officer_profiles");
        b.HasKey(x => x.Id);
        b.Property(x => x.FullName).HasMaxLength(255).IsRequired();
        b.Property(x => x.Department).HasMaxLength(255);
        b.Property(x => x.Position).HasMaxLength(255);
        b.Property(x => x.PhoneNumber).HasMaxLength(30);
        b.HasIndex(x => x.UserId).IsUnique();
        b.HasIndex(x => x.ServicePointId);
    }
}
