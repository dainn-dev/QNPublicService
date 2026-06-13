using DVC.Domain.Common;

namespace DVC.Domain.Announcements;

/// <summary>A public announcement shown on the portal home page (thông báo / hướng dẫn / khẩn cấp).</summary>
public class Announcement : BaseEntity, IAuditableEntity
{
    public string TitleVi { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;
    public string BodyVi { get; set; } = string.Empty;
    public string BodyEn { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty; // thongbao | huongdan | khancap
    public DateOnly Date { get; set; }
    public bool IsActive { get; set; } = true;
}
