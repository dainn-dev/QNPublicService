namespace DVC.Application.Features.Announcements;

public sealed record AnnouncementDto(
    Guid Id, string TitleVi, string TitleEn, string BodyVi, string BodyEn, string Tag, DateOnly Date);

public sealed record AdminAnnouncementDto(
    Guid Id, string TitleVi, string TitleEn, string BodyVi, string BodyEn, string Tag, DateOnly Date, bool IsActive);

public sealed record CreateAnnouncementDto(
    string TitleVi, string TitleEn, string BodyVi, string BodyEn, string Tag, DateOnly Date, bool IsActive);

public sealed record UpdateAnnouncementDto(
    string TitleVi, string TitleEn, string BodyVi, string BodyEn, string Tag, DateOnly Date, bool IsActive);
