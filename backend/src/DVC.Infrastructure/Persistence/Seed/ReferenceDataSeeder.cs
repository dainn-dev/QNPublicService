using DVC.Domain.Feedback;
using Microsoft.EntityFrameworkCore;

namespace DVC.Infrastructure.Persistence.Seed;

/// <summary>Idempotently seeds reference data that the portal needs out of the box.</summary>
public static class ReferenceDataSeeder
{
    private static readonly (string Code, string Name)[] FeedbackCategories =
    {
        ("road", "Hạ tầng giao thông"),
        ("env", "Môi trường"),
        ("flood", "Ngập lụt"),
        ("security", "An ninh trật tự"),
        ("construct", "Xây dựng"),
        ("service", "Thái độ phục vụ"),
        ("fire", "Phòng cháy chữa cháy"),
        ("abuse", "Lạm quyền"),
        ("fraud", "Gian lận")
    };

    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        var existing = await db.FeedbackCategories.Select(c => c.Code).ToListAsync(ct);
        var present = new HashSet<string>(existing, StringComparer.OrdinalIgnoreCase);

        var added = false;
        foreach (var (code, name) in FeedbackCategories)
        {
            if (present.Contains(code)) continue;
            db.FeedbackCategories.Add(new FeedbackCategory { Code = code, Name = name });
            added = true;
        }

        if (added)
            await db.SaveChangesAsync(ct);
    }
}
