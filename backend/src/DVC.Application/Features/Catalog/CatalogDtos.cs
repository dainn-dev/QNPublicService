using DVC.Domain.Common;

namespace DVC.Application.Features.Catalog;

public sealed record ServiceCategoryDto(Guid Id, string Code, string Name, string? NameEn, string? Description, string? DescriptionEn, Guid? ParentId, int DisplayOrder, bool IsActive);
public sealed record CreateServiceCategoryDto(string Code, string Name, string? NameEn, string? Description, string? DescriptionEn, Guid? ParentId, int DisplayOrder);
public sealed record UpdateServiceCategoryDto(string Name, string? NameEn, string? Description, string? DescriptionEn, Guid? ParentId, int DisplayOrder, bool IsActive);

public sealed record PublicServiceDto(
    Guid Id, Guid CategoryId, string Code, string Name, string? NameEn, string? Description, string? DescriptionEn,
    string? RequiredDocuments, int? ProcessingTimeDays, decimal Fee, ServiceLevel ServiceLevel, bool IsActive, bool IsFeatured);

public sealed record CreatePublicServiceDto(
    Guid CategoryId, string Code, string Name, string? NameEn, string? Description, string? DescriptionEn,
    string? RequiredDocuments, int? ProcessingTimeDays, decimal Fee, ServiceLevel ServiceLevel);

public sealed record UpdatePublicServiceDto(
    Guid CategoryId, string Name, string? NameEn, string? Description, string? DescriptionEn,
    string? RequiredDocuments, int? ProcessingTimeDays, decimal Fee, ServiceLevel ServiceLevel, bool IsActive);
