using DVC.Application.Abstractions;
using DVC.Application.Common;
using DVC.Domain.Announcements;
using Microsoft.EntityFrameworkCore;

namespace DVC.Application.Features.Announcements;

public sealed class AnnouncementService
{
    private static readonly HashSet<string> AllowedTags = new() { "thongbao", "huongdan", "khancap" };

    private readonly IAppDbContext _db;

    public AnnouncementService(IAppDbContext db) => _db = db;

    public async Task<IReadOnlyList<AnnouncementDto>> GetListAsync(string? tag, CancellationToken ct = default) =>
        await _db.Announcements
            .Where(a => a.IsActive && (tag == null || a.Tag == tag))
            .OrderByDescending(a => a.Date).ThenByDescending(a => a.CreatedAt)
            .Select(a => new AnnouncementDto(a.Id, a.TitleVi, a.TitleEn, a.BodyVi, a.BodyEn, a.Tag, a.Date))
            .ToListAsync(ct);

    public async Task<AnnouncementDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var a = await _db.Announcements.FirstOrDefaultAsync(a => a.Id == id && a.IsActive, ct)
            ?? throw NotFoundException.For("Announcement", id);
        return ToDto(a);
    }

    // ----- Admin -----
    public async Task<IReadOnlyList<AdminAnnouncementDto>> GetAdminListAsync(string? tag, CancellationToken ct = default) =>
        await _db.Announcements
            .Where(a => tag == null || a.Tag == tag)
            .OrderByDescending(a => a.Date).ThenByDescending(a => a.CreatedAt)
            .Select(a => new AdminAnnouncementDto(a.Id, a.TitleVi, a.TitleEn, a.BodyVi, a.BodyEn, a.Tag, a.Date, a.IsActive))
            .ToListAsync(ct);

    public async Task<AdminAnnouncementDto> CreateAsync(CreateAnnouncementDto dto, CancellationToken ct = default)
    {
        ValidateTag(dto.Tag);

        var entity = new Announcement
        {
            TitleVi = dto.TitleVi,
            TitleEn = dto.TitleEn,
            BodyVi = dto.BodyVi,
            BodyEn = dto.BodyEn,
            Tag = dto.Tag,
            Date = dto.Date,
            IsActive = dto.IsActive
        };
        _db.Announcements.Add(entity);
        await _db.SaveChangesAsync(ct);
        return ToAdminDto(entity);
    }

    public async Task<AdminAnnouncementDto> UpdateAsync(Guid id, UpdateAnnouncementDto dto, CancellationToken ct = default)
    {
        ValidateTag(dto.Tag);

        var entity = await _db.Announcements.FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw NotFoundException.For("Announcement", id);

        entity.TitleVi = dto.TitleVi;
        entity.TitleEn = dto.TitleEn;
        entity.BodyVi = dto.BodyVi;
        entity.BodyEn = dto.BodyEn;
        entity.Tag = dto.Tag;
        entity.Date = dto.Date;
        entity.IsActive = dto.IsActive;
        await _db.SaveChangesAsync(ct);
        return ToAdminDto(entity);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.Announcements.FirstOrDefaultAsync(a => a.Id == id, ct)
            ?? throw NotFoundException.For("Announcement", id);
        _db.Announcements.Remove(entity);
        await _db.SaveChangesAsync(ct);
    }

    private static void ValidateTag(string tag)
    {
        if (!AllowedTags.Contains(tag))
            throw new ConflictException($"Tag '{tag}' is invalid. Allowed values: thongbao, huongdan, khancap.");
    }

    private static AnnouncementDto ToDto(Announcement a) =>
        new(a.Id, a.TitleVi, a.TitleEn, a.BodyVi, a.BodyEn, a.Tag, a.Date);

    private static AdminAnnouncementDto ToAdminDto(Announcement a) =>
        new(a.Id, a.TitleVi, a.TitleEn, a.BodyVi, a.BodyEn, a.Tag, a.Date, a.IsActive);
}
