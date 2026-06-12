using DVC.Domain.Common;

namespace DVC.Domain.ServicePoints;

/// <summary>A physical office where services are delivered (one-stop centre, UBND, police, …) shown on the map.</summary>
public class ServicePoint : BaseEntity, IAuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ServicePointType Type { get; set; }
    public string Address { get; set; } = string.Empty;

    public int? ProvinceCode { get; set; }
    public int? WardCode { get; set; }

    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
    public string? WorkingHours { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<ServicePointService> Services { get; set; } = new List<ServicePointService>();
    public ICollection<ServicePointImage> Images { get; set; } = new List<ServicePointImage>();
}

/// <summary>Join: which services a point provides.</summary>
public class ServicePointService
{
    public Guid ServicePointId { get; set; }
    public Guid PublicServiceId { get; set; }

    public ServicePoint? ServicePoint { get; set; }
    public Catalog.PublicService? PublicService { get; set; }
}

public class ServicePointImage : BaseEntity
{
    public Guid ServicePointId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public int DisplayOrder { get; set; }

    public ServicePoint? ServicePoint { get; set; }
}
