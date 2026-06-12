using DVC.Domain.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DVC.Infrastructure.Persistence.Configurations;

public sealed class ServiceCategoryConfiguration : IEntityTypeConfiguration<ServiceCategory>
{
    public void Configure(EntityTypeBuilder<ServiceCategory> b)
    {
        b.ToTable("service_categories");
        b.HasKey(x => x.Id);
        b.Property(x => x.Code).HasMaxLength(50).IsRequired();
        b.HasIndex(x => x.Code).IsUnique();
        b.Property(x => x.Name).HasMaxLength(255).IsRequired();
        b.HasOne(x => x.Parent).WithMany().HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.Restrict);
        b.HasMany(x => x.Services).WithOne(x => x.Category!).HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class PublicServiceConfiguration : IEntityTypeConfiguration<PublicService>
{
    public void Configure(EntityTypeBuilder<PublicService> b)
    {
        b.ToTable("public_services");
        b.HasKey(x => x.Id);
        b.Property(x => x.Code).HasMaxLength(50).IsRequired();
        b.HasIndex(x => x.Code).IsUnique();
        b.Property(x => x.Name).HasMaxLength(255).IsRequired();
        b.Property(x => x.Fee).HasColumnType("numeric(18,2)");
        b.Property(x => x.ServiceLevel).HasConversion<string>().HasMaxLength(30);
        b.HasIndex(x => x.CategoryId);
    }
}
