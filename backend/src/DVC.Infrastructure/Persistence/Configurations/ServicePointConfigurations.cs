using DVC.Domain.ServicePoints;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DVC.Infrastructure.Persistence.Configurations;

public sealed class ServicePointConfiguration : IEntityTypeConfiguration<ServicePoint>
{
    public void Configure(EntityTypeBuilder<ServicePoint> b)
    {
        b.ToTable("service_points");
        b.HasKey(x => x.Id);
        b.Property(x => x.Code).HasMaxLength(50).IsRequired();
        b.HasIndex(x => x.Code).IsUnique();
        b.Property(x => x.Name).HasMaxLength(255).IsRequired();
        b.Property(x => x.NameEn).HasMaxLength(255);
        b.Property(x => x.Type).HasConversion<string>().HasMaxLength(50);
        b.Property(x => x.Address).IsRequired();
        b.Property(x => x.Latitude).HasColumnType("numeric(10,7)");
        b.Property(x => x.Longitude).HasColumnType("numeric(10,7)");
        b.Property(x => x.Phone).HasMaxLength(30);
        b.Property(x => x.Email).HasMaxLength(255);
        b.Property(x => x.Website).HasMaxLength(255);
        b.HasIndex(x => new { x.ProvinceCode, x.WardCode });
        b.HasIndex(x => new { x.Latitude, x.Longitude });
    }
}

public sealed class ServicePointServiceConfiguration : IEntityTypeConfiguration<ServicePointService>
{
    public void Configure(EntityTypeBuilder<ServicePointService> b)
    {
        b.ToTable("service_point_services");
        b.HasKey(x => new { x.ServicePointId, x.PublicServiceId });
        b.HasOne(x => x.ServicePoint).WithMany(x => x.Services).HasForeignKey(x => x.ServicePointId).OnDelete(DeleteBehavior.Cascade);
        b.HasOne(x => x.PublicService).WithMany().HasForeignKey(x => x.PublicServiceId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ServicePointImageConfiguration : IEntityTypeConfiguration<ServicePointImage>
{
    public void Configure(EntityTypeBuilder<ServicePointImage> b)
    {
        b.ToTable("service_point_images");
        b.HasKey(x => x.Id);
        b.Property(x => x.Url).IsRequired();
        b.HasOne(x => x.ServicePoint).WithMany(x => x.Images).HasForeignKey(x => x.ServicePointId).OnDelete(DeleteBehavior.Cascade);
    }
}
