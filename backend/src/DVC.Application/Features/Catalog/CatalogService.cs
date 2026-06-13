using DVC.Application.Abstractions;
using DVC.Application.Common;
using DVC.Domain.Catalog;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Catalog;

public sealed class CatalogService
{
    private readonly IAppDbContext _db;

    public CatalogService(IAppDbContext db) => _db = db;

    // ----- Categories -----
    public async Task<IReadOnlyList<ServiceCategoryDto>> GetCategoriesAsync(bool includeInactive, CancellationToken ct = default) =>
        await _db.ServiceCategories
            .Where(c => includeInactive || c.IsActive)
            .OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name)
            .Select(c => new ServiceCategoryDto(c.Id, c.Code, c.Name, c.NameEn, c.Description, c.DescriptionEn, c.ParentId, c.DisplayOrder, c.IsActive))
            .ToListAsync(ct);

    public async Task<ServiceCategoryDto> CreateCategoryAsync(CreateServiceCategoryDto dto, CancellationToken ct = default)
    {
        if (await _db.ServiceCategories.AnyAsync(c => c.Code == dto.Code, ct))
            throw new ConflictException($"Service category code '{dto.Code}' already exists.");

        var entity = new ServiceCategory
        {
            Code = dto.Code,
            Name = dto.Name,
            NameEn = dto.NameEn,
            Description = dto.Description,
            DescriptionEn = dto.DescriptionEn,
            ParentId = dto.ParentId,
            DisplayOrder = dto.DisplayOrder
        };
        _db.ServiceCategories.Add(entity);
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task<ServiceCategoryDto> UpdateCategoryAsync(Guid id, UpdateServiceCategoryDto dto, CancellationToken ct = default)
    {
        var entity = await _db.ServiceCategories.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw NotFoundException.For("Service category", id);
        entity.Name = dto.Name;
        entity.NameEn = dto.NameEn;
        entity.Description = dto.Description;
        entity.DescriptionEn = dto.DescriptionEn;
        entity.ParentId = dto.ParentId;
        entity.DisplayOrder = dto.DisplayOrder;
        entity.IsActive = dto.IsActive;
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task DeleteCategoryAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.ServiceCategories.FirstOrDefaultAsync(c => c.Id == id, ct)
            ?? throw NotFoundException.For("Service category", id);
        if (await _db.PublicServices.AnyAsync(s => s.CategoryId == id, ct))
            throw new ConflictException("Cannot delete a category that still has services.");
        _db.ServiceCategories.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    // ----- Public services -----
    public async Task<IReadOnlyList<PublicServiceDto>> GetServicesAsync(Guid? categoryId, bool includeInactive, bool? featured = null, CancellationToken ct = default)
    {
        var rows = await _db.PublicServices
            .Where(s => (includeInactive || s.IsActive)
                        && (categoryId == null || s.CategoryId == categoryId)
                        && (featured == null || s.IsFeatured == featured))
            .OrderBy(s => s.Name)
            .ToListAsync(ct);
        return rows.Select(ToDto).ToList();
    }

    public async Task<PublicServiceDto> GetServiceAsync(Guid id, CancellationToken ct = default)
    {
        var s = await _db.PublicServices.FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw NotFoundException.For("Public service", id);
        return ToDto(s);
    }

    public async Task<PublicServiceDto> CreateServiceAsync(CreatePublicServiceDto dto, CancellationToken ct = default)
    {
        if (!await _db.ServiceCategories.AnyAsync(c => c.Id == dto.CategoryId, ct))
            throw NotFoundException.For("Service category", dto.CategoryId);
        if (await _db.PublicServices.AnyAsync(s => s.Code == dto.Code, ct))
            throw new ConflictException($"Public service code '{dto.Code}' already exists.");

        var entity = new PublicService
        {
            CategoryId = dto.CategoryId,
            Code = dto.Code,
            Name = dto.Name,
            NameEn = dto.NameEn,
            Description = dto.Description,
            DescriptionEn = dto.DescriptionEn,
            RequiredDocuments = dto.RequiredDocuments,
            ProcessingTimeDays = dto.ProcessingTimeDays,
            Fee = dto.Fee,
            ServiceLevel = dto.ServiceLevel
        };
        _db.PublicServices.Add(entity);
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task<PublicServiceDto> UpdateServiceAsync(Guid id, UpdatePublicServiceDto dto, CancellationToken ct = default)
    {
        var entity = await _db.PublicServices.FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw NotFoundException.For("Public service", id);
        if (!await _db.ServiceCategories.AnyAsync(c => c.Id == dto.CategoryId, ct))
            throw NotFoundException.For("Service category", dto.CategoryId);

        entity.CategoryId = dto.CategoryId;
        entity.Name = dto.Name;
        entity.NameEn = dto.NameEn;
        entity.Description = dto.Description;
        entity.DescriptionEn = dto.DescriptionEn;
        entity.RequiredDocuments = dto.RequiredDocuments;
        entity.ProcessingTimeDays = dto.ProcessingTimeDays;
        entity.Fee = dto.Fee;
        entity.ServiceLevel = dto.ServiceLevel;
        entity.IsActive = dto.IsActive;
        await _db.SaveChangesAsync(ct);
        return ToDto(entity);
    }

    public async Task DeleteServiceAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.PublicServices.FirstOrDefaultAsync(s => s.Id == id, ct)
            ?? throw NotFoundException.For("Public service", id);
        _db.PublicServices.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    private static ServiceCategoryDto ToDto(ServiceCategory c) =>
        new(c.Id, c.Code, c.Name, c.NameEn, c.Description, c.DescriptionEn, c.ParentId, c.DisplayOrder, c.IsActive);

    private static PublicServiceDto ToDto(PublicService s) =>
        new(s.Id, s.CategoryId, s.Code, s.Name, s.NameEn, s.Description, s.DescriptionEn, s.RequiredDocuments, s.ProcessingTimeDays, s.Fee, s.ServiceLevel, s.IsActive, s.IsFeatured);
}
