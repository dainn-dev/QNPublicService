using DVC.Domain.Announcements;
using DVC.Domain.Catalog;
using DVC.Domain.Common;
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
        await SeedFeedbackCategoriesAsync(db, ct);
        await SeedAnnouncementsAsync(db, ct);
        await SeedCatalogAsync(db, ct);
    }

    private static async Task SeedFeedbackCategoriesAsync(AppDbContext db, CancellationToken ct)
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

    private static async Task SeedAnnouncementsAsync(AppDbContext db, CancellationToken ct)
    {
        if (await db.Announcements.AnyAsync(ct)) return;

        db.Announcements.AddRange(
            new Announcement
            {
                Tag = "thongbao",
                Date = new DateOnly(2026, 6, 9),
                TitleVi = "Từ 15/6: tiếp nhận hồ sơ cấp đổi CCCD cả sáng thứ Bảy tại Công an TP. Quảng Ngãi",
                TitleEn = "From Jun 15: ID card renewals accepted Saturday mornings at City Police",
                BodyVi = "Nhằm giảm tải cho người dân trong giờ hành chính, từ ngày 15/6/2026, Công an TP. Quảng Ngãi tổ chức tiếp nhận hồ sơ cấp đổi, cấp lại thẻ Căn cước công dân vào sáng thứ Bảy hàng tuần (07:30 – 11:30) tại trụ sở 142 Lê Trung Đình.\n\nNgười dân nên đặt lịch trước qua Cổng Dịch vụ công để được phục vụ nhanh nhất. Khi đi mang theo CCCD cũ (nếu có) và mã đặt lịch.",
                BodyEn = "To reduce weekday congestion, from June 15, 2026 the City Police will accept ID card renewal and replacement applications on Saturday mornings (07:30 – 11:30) at 142 Le Trung Dinh.\n\nCitizens should book an appointment via the Service Portal in advance and bring their old ID card (if any) plus the booking code."
            },
            new Announcement
            {
                Tag = "huongdan",
                Date = new DateOnly(2026, 6, 6),
                TitleVi = "Hướng dẫn nộp hồ sơ khai sinh liên thông 3 trong 1 (khai sinh – thường trú – BHYT)",
                TitleEn = "Guide: 3-in-1 combined birth registration (birth – residence – insurance)",
                BodyVi = "Thủ tục liên thông 3 trong 1 cho phép cha mẹ thực hiện đồng thời: đăng ký khai sinh, đăng ký thường trú và cấp thẻ BHYT cho trẻ dưới 6 tuổi chỉ với một lần nộp hồ sơ trực tuyến.\n\nHồ sơ gồm: tờ khai điện tử (kê khai trực tiếp trên Cổng), giấy chứng sinh, CCCD của cha/mẹ. Kết quả trả trong 3 ngày làm việc qua bưu điện hoặc nhận trực tiếp tại Bộ phận Một cửa.",
                BodyEn = "The 3-in-1 combined procedure lets parents simultaneously register a birth, register permanent residence, and obtain a health insurance card for children under 6 — with a single online application.\n\nRequired: the online declaration form, the birth certificate from the medical facility, and parents’ ID cards. Results are returned within 3 working days by post or at the One-Stop Desk."
            },
            new Announcement
            {
                Tag = "thongbao",
                Date = new DateOnly(2026, 6, 1),
                TitleVi = "Trung tâm Phục vụ hành chính công tỉnh chuyển về trụ sở mới 54 Hùng Vương từ 01/7/2026",
                TitleEn = "Provincial Administration Center moving to 54 Hung Vuong from Jul 1, 2026",
                BodyVi = "Từ ngày 01/7/2026, Trung tâm Phục vụ hành chính công tỉnh Quảng Ngãi chuyển toàn bộ hoạt động tiếp nhận và trả kết quả về trụ sở mới tại 54 Hùng Vương, P. Cẩm Thành.\n\nTrong tuần đầu chuyển đổi (01/7 – 05/7), Trung tâm bố trí bàn hướng dẫn tại cả trụ sở cũ và mới. Các lịch hẹn đã đặt trước vẫn được giữ nguyên giá trị.",
                BodyEn = "From July 1, 2026, the Provincial Public Administration Center will move all intake and result-return operations to its new office at 54 Hung Vuong, Cam Thanh Ward.\n\nDuring the first transition week (Jul 1–5), help desks will operate at both the old and new locations. Existing appointments remain valid."
            },
            new Announcement
            {
                Tag = "khancap",
                Date = new DateOnly(2026, 5, 26),
                TitleVi = "Cảnh báo: xuất hiện tin nhắn giả mạo Cổng DVC yêu cầu cung cấp OTP — tuyệt đối không cung cấp",
                TitleEn = "Warning: fake portal SMS requesting OTP codes — never share your OTP",
                BodyVi = "Hiện có đối tượng giả mạo tin nhắn thương hiệu “Cổng DVC” yêu cầu người dân cung cấp mã OTP để “xác minh hồ sơ”. Đây là hành vi lừa đảo chiếm đoạt tài khoản.\n\nCổng Dịch vụ công KHÔNG BAO GIỜ yêu cầu cung cấp OTP qua tin nhắn hoặc điện thoại. Nếu nhận được yêu cầu tương tự, vui lòng báo ngay tổng đài 1900 1096 hoặc gửi phản ánh trên Cổng.",
                BodyEn = "Scammers are sending SMS impersonating the Service Portal, asking citizens for OTP codes to “verify applications”. This is account-theft fraud.\n\nThe Service Portal NEVER asks for OTP codes via SMS or phone. If you receive such a request, report it immediately via hotline 1900 1096 or the portal’s feedback feature."
            });

        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedCatalogAsync(AppDbContext db, CancellationToken ct)
    {
        if (await db.PublicServices.AnyAsync(ct)) return;

        var hotich = await EnsureCategoryAsync(db, "hotich", "Hộ tịch", "Civil registration", 1, ct);
        var datdai = await EnsureCategoryAsync(db, "datdai", "Đất đai – Xây dựng", "Land & Construction", 3, ct);
        var kinhdoanh = await EnsureCategoryAsync(db, "kinhdoanh", "Đăng ký kinh doanh", "Business registration", 4, ct);

        db.PublicServices.AddRange(
            new PublicService
            {
                CategoryId = hotich.Id,
                Code = "svc01",
                Name = "Đăng ký khai sinh",
                NameEn = "Birth registration",
                Description = "Đăng ký khai sinh cho trẻ em trong vòng 60 ngày kể từ ngày sinh. Có thể thực hiện liên thông cùng đăng ký thường trú và cấp thẻ BHYT.",
                DescriptionEn = "Register a birth within 60 days. Can be combined with residence registration and health insurance card issuance.",
                RequiredDocuments = "Tờ khai đăng ký khai sinh (theo mẫu)\nGiấy chứng sinh do cơ sở y tế cấp\nCCCD của cha/mẹ\nGiấy chứng nhận kết hôn (nếu có)",
                ProcessingTimeDays = 1,
                Fee = 0,
                ServiceLevel = ServiceLevel.Level4,
                IsFeatured = true
            },
            new PublicService
            {
                CategoryId = hotich.Id,
                Code = "svc03",
                Name = "Đăng ký kết hôn",
                NameEn = "Marriage registration",
                Description = "Đăng ký kết hôn cho công dân Việt Nam cư trú trong nước. Hai bên nam nữ cùng có mặt khi nhận Giấy chứng nhận kết hôn.",
                DescriptionEn = "Marriage registration for Vietnamese citizens residing in the country. Both parties must be present to receive the certificate.",
                RequiredDocuments = "Tờ khai đăng ký kết hôn\nCCCD của hai bên\nGiấy xác nhận tình trạng hôn nhân",
                ProcessingTimeDays = 3,
                Fee = 0,
                ServiceLevel = ServiceLevel.Level4,
                IsFeatured = true
            },
            new PublicService
            {
                CategoryId = datdai.Id,
                Code = "svc06",
                Name = "Cấp giấy phép xây dựng nhà ở riêng lẻ",
                NameEn = "Private housing construction permit",
                Description = "Cấp giấy phép xây dựng mới nhà ở riêng lẻ tại đô thị trên địa bàn thành phố.",
                DescriptionEn = "New construction permit for private housing in urban areas of the city.",
                RequiredDocuments = "Đơn đề nghị cấp giấy phép xây dựng\nGiấy tờ chứng minh quyền sử dụng đất\nBản vẽ thiết kế xây dựng (2 bộ)",
                ProcessingTimeDays = 15,
                Fee = 75000,
                ServiceLevel = ServiceLevel.Level3,
                IsFeatured = true
            },
            new PublicService
            {
                CategoryId = kinhdoanh.Id,
                Code = "svc07",
                Name = "Đăng ký hộ kinh doanh",
                NameEn = "Household business registration",
                Description = "Đăng ký thành lập hộ kinh doanh cá thể; nhận kết quả trong 3 ngày làm việc.",
                DescriptionEn = "Register a household business; results within 3 working days.",
                RequiredDocuments = "Giấy đề nghị đăng ký hộ kinh doanh\nCCCD của chủ hộ kinh doanh\nBiên bản họp thành viên hộ gia đình (nếu có)",
                ProcessingTimeDays = 3,
                Fee = 100000,
                ServiceLevel = ServiceLevel.Level4,
                IsFeatured = true
            });

        await db.SaveChangesAsync(ct);
    }

    private static async Task<ServiceCategory> EnsureCategoryAsync(
        AppDbContext db, string code, string name, string nameEn, int displayOrder, CancellationToken ct)
    {
        var existing = await db.ServiceCategories.FirstOrDefaultAsync(c => c.Code == code, ct);
        if (existing is not null) return existing;

        var category = new ServiceCategory { Code = code, Name = name, NameEn = nameEn, DisplayOrder = displayOrder };
        db.ServiceCategories.Add(category);
        return category;
    }
}
