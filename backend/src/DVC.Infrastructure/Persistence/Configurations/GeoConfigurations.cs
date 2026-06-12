using DVC.Domain.Geo;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DVC.Infrastructure.Persistence.Configurations;

public sealed class ProvinceConfiguration : IEntityTypeConfiguration<Province>
{
    public void Configure(EntityTypeBuilder<Province> b)
    {
        b.ToTable("provinces");
        b.HasKey(p => p.Code);
        b.Property(p => p.Code).ValueGeneratedNever();
        b.Property(p => p.Name).HasMaxLength(255).IsRequired();
        b.Property(p => p.CodeName).HasMaxLength(255);
        b.Property(p => p.DivisionType).HasMaxLength(100);
        b.Property(p => p.PhoneCode).HasMaxLength(10);

        b.HasMany(p => p.Wards)
            .WithOne(w => w.Province!)
            .HasForeignKey(w => w.ProvinceCode)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class WardConfiguration : IEntityTypeConfiguration<Ward>
{
    public void Configure(EntityTypeBuilder<Ward> b)
    {
        b.ToTable("wards");
        b.HasKey(w => w.Code);
        b.Property(w => w.Code).ValueGeneratedNever();
        b.Property(w => w.Name).HasMaxLength(255).IsRequired();
        b.Property(w => w.CodeName).HasMaxLength(255);
        b.Property(w => w.DivisionType).HasMaxLength(100);
        b.HasIndex(w => w.ProvinceCode);
    }
}
