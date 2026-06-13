// ============================================================
// Dữ liệu mẫu — TP. Quảng Ngãi (mô phỏng, phục vụ thiết kế)
// window.DATA
// ============================================================
window.DATA = {

  user: {
    id: 'u01',
    fullName: 'Nguyễn Thị Minh Hà',
    phone: '0905 234 671',
    email: 'minhha.nguyen@gmail.com',
    citizenId: '051198004523',
    ward: 'Phường Cẩm Thành',
    verified: true,
  },

  categories: [
    { id: 'hotich',    icon: 'family',   vi: 'Hộ tịch',                 en: 'Civil registration',    count: 14 },
    { id: 'cutru',     icon: 'idcard',   vi: 'Căn cước & Cư trú',       en: 'ID & Residence',        count: 11 },
    { id: 'datdai',    icon: 'land',     vi: 'Đất đai – Xây dựng',      en: 'Land & Construction',   count: 23 },
    { id: 'kinhdoanh', icon: 'store',    vi: 'Đăng ký kinh doanh',      en: 'Business registration', count: 9 },
    { id: 'giaoduc',   icon: 'school',   vi: 'Giáo dục',                en: 'Education',             count: 7 },
    { id: 'yte',       icon: 'health',   vi: 'Y tế – Bảo hiểm xã hội',  en: 'Health & Insurance',    count: 12 },
    { id: 'giaothong', icon: 'car',      vi: 'Giao thông vận tải',      en: 'Transportation',        count: 8 },
    { id: 'tuphap',    icon: 'scale',    vi: 'Tư pháp – Công chứng',    en: 'Justice & Notary',      count: 10 },
  ],

  services: [
    {
      id: 'svc01', categoryId: 'hotich', featured: true, level: 'full',
      vi: 'Đăng ký khai sinh', en: 'Birth registration',
      descVi: 'Đăng ký khai sinh cho trẻ em trong vòng 60 ngày kể từ ngày sinh. Có thể thực hiện liên thông cùng đăng ký thường trú và cấp thẻ BHYT.',
      descEn: 'Register a birth within 60 days. Can be combined with residence registration and health insurance card issuance.',
      documents: [
        ['Tờ khai đăng ký khai sinh (theo mẫu)', 'Birth registration form'],
        ['Giấy chứng sinh do cơ sở y tế cấp', 'Birth certificate from medical facility'],
        ['CCCD của cha/mẹ', "Parents' citizen ID"],
        ['Giấy chứng nhận kết hôn (nếu có)', 'Marriage certificate (if any)'],
      ],
      processingDays: 1, fee: 0,
    },
    {
      id: 'svc02', categoryId: 'cutru', featured: true, level: 'partial',
      vi: 'Cấp thẻ Căn cước công dân', en: 'Citizen ID card issuance',
      descVi: 'Cấp mới, cấp đổi, cấp lại thẻ Căn cước công dân gắn chip cho công dân từ đủ 14 tuổi.',
      descEn: 'New issuance, renewal, or replacement of chip-based citizen ID cards for citizens aged 14+.',
      documents: [
        ['Phiếu thu nhận thông tin CCCD', 'ID information form'],
        ['Sổ hộ khẩu hoặc giấy tờ chứng minh cư trú', 'Proof of residence'],
        ['CMND/CCCD cũ (nếu cấp đổi)', 'Old ID card (if renewing)'],
      ],
      processingDays: 7, fee: 30000,
    },
    {
      id: 'svc03', categoryId: 'hotich', featured: true, level: 'full',
      vi: 'Đăng ký kết hôn', en: 'Marriage registration',
      descVi: 'Đăng ký kết hôn cho công dân Việt Nam cư trú trong nước. Hai bên nam nữ cùng có mặt khi nhận Giấy chứng nhận kết hôn.',
      descEn: 'Marriage registration for Vietnamese citizens residing in the country. Both parties must be present to receive the certificate.',
      documents: [
        ['Tờ khai đăng ký kết hôn', 'Marriage registration form'],
        ['CCCD của hai bên', "Both parties' citizen ID"],
        ['Giấy xác nhận tình trạng hôn nhân', 'Certificate of marital status'],
      ],
      processingDays: 3, fee: 0,
    },
    {
      id: 'svc04', categoryId: 'cutru', featured: true, level: 'full',
      vi: 'Đăng ký thường trú', en: 'Permanent residence registration',
      descVi: 'Đăng ký thường trú tại chỗ ở hợp pháp trên địa bàn TP. Quảng Ngãi qua Cổng dịch vụ công.',
      descEn: 'Register permanent residence at a legal residence in Quang Ngai City via the service portal.',
      documents: [
        ['Tờ khai thay đổi thông tin cư trú', 'Residence change form'],
        ['Giấy tờ chứng minh chỗ ở hợp pháp', 'Proof of legal residence'],
      ],
      processingDays: 5, fee: 0,
    },
    {
      id: 'svc05', categoryId: 'hotich', featured: false, level: 'full',
      vi: 'Cấp giấy xác nhận tình trạng hôn nhân', en: 'Certificate of marital status',
      descVi: 'Cấp giấy xác nhận tình trạng hôn nhân cho công dân để sử dụng trong nước hoặc nước ngoài.',
      descEn: 'Issuance of marital status certificate for domestic or international use.',
      documents: [
        ['Tờ khai cấp giấy xác nhận tình trạng hôn nhân', 'Application form'],
        ['CCCD', 'Citizen ID'],
      ],
      processingDays: 3, fee: 0,
    },
    {
      id: 'svc06', categoryId: 'datdai', featured: true, level: 'partial',
      vi: 'Cấp giấy phép xây dựng nhà ở riêng lẻ', en: 'Private housing construction permit',
      descVi: 'Cấp giấy phép xây dựng mới nhà ở riêng lẻ tại đô thị trên địa bàn thành phố.',
      descEn: 'New construction permit for private housing in urban areas of the city.',
      documents: [
        ['Đơn đề nghị cấp giấy phép xây dựng', 'Permit application form'],
        ['Giấy tờ chứng minh quyền sử dụng đất', 'Land use right documents'],
        ['Bản vẽ thiết kế xây dựng (2 bộ)', 'Construction design drawings (2 sets)'],
      ],
      processingDays: 15, fee: 75000,
    },
    {
      id: 'svc07', categoryId: 'kinhdoanh', featured: true, level: 'full',
      vi: 'Đăng ký hộ kinh doanh', en: 'Household business registration',
      descVi: 'Đăng ký thành lập hộ kinh doanh cá thể; nhận kết quả trong 3 ngày làm việc.',
      descEn: 'Register a household business; results within 3 working days.',
      documents: [
        ['Giấy đề nghị đăng ký hộ kinh doanh', 'Registration request form'],
        ['CCCD của chủ hộ kinh doanh', "Owner's citizen ID"],
        ['Biên bản họp thành viên hộ gia đình (nếu có)', 'Family member meeting minutes (if any)'],
      ],
      processingDays: 3, fee: 100000,
    },
    {
      id: 'svc08', categoryId: 'yte', featured: false, level: 'full',
      vi: 'Cấp lại thẻ BHYT do mất, hỏng', en: 'Health insurance card reissuance',
      descVi: 'Cấp lại thẻ bảo hiểm y tế do bị mất, rách, hỏng; không thay đổi thông tin.',
      descEn: 'Reissue lost or damaged health insurance cards; no information changes.',
      documents: [['Tờ khai tham gia, điều chỉnh thông tin BHYT', 'Insurance information form']],
      processingDays: 3, fee: 0,
    },
    {
      id: 'svc09', categoryId: 'giaothong', featured: false, level: 'partial',
      vi: 'Đổi giấy phép lái xe', en: 'Driving license renewal',
      descVi: 'Đổi giấy phép lái xe do ngành giao thông vận tải cấp (sắp hết hạn hoặc hư hỏng).',
      descEn: 'Renew driving licenses issued by the transport authority (expiring or damaged).',
      documents: [
        ['Đơn đề nghị đổi giấy phép lái xe', 'Renewal application form'],
        ['Giấy khám sức khỏe của người lái xe', 'Health certificate'],
        ['Bản sao GPLX, CCCD', 'Copy of license & citizen ID'],
      ],
      processingDays: 5, fee: 135000,
    },
    {
      id: 'svc10', categoryId: 'tuphap', featured: false, level: 'full',
      vi: 'Cấp phiếu lý lịch tư pháp', en: 'Criminal record certificate',
      descVi: 'Cấp phiếu lý lịch tư pháp số 1, số 2 cho công dân Việt Nam cư trú tại tỉnh.',
      descEn: 'Issuance of criminal record certificates No. 1 and No. 2 for residents.',
      documents: [
        ['Tờ khai yêu cầu cấp phiếu lý lịch tư pháp', 'Application form'],
        ['CCCD', 'Citizen ID'],
      ],
      processingDays: 10, fee: 200000,
    },
    {
      id: 'svc11', categoryId: 'giaoduc', featured: false, level: 'full',
      vi: 'Xác nhận tốt nghiệp tạm thời', en: 'Temporary graduation certificate',
      descVi: 'Cấp giấy xác nhận tốt nghiệp tạm thời cho học sinh THPT trong thời gian chờ bằng chính thức.',
      descEn: 'Temporary graduation confirmation for high school students awaiting official diplomas.',
      documents: [['Đơn đề nghị xác nhận', 'Request form'], ['CCCD', 'Citizen ID']],
      processingDays: 2, fee: 0,
    },
    {
      id: 'svc12', categoryId: 'datdai', featured: false, level: 'partial',
      vi: 'Đăng ký biến động đất đai', en: 'Land change registration',
      descVi: 'Đăng ký biến động quyền sử dụng đất khi chuyển nhượng, tặng cho, thừa kế.',
      descEn: 'Register land use right changes for transfers, gifts, or inheritance.',
      documents: [
        ['Đơn đăng ký biến động', 'Change registration form'],
        ['Giấy chứng nhận quyền sử dụng đất', 'Land use right certificate'],
        ['Hợp đồng chuyển nhượng có công chứng', 'Notarized transfer contract'],
      ],
      processingDays: 10, fee: 50000,
    },
  ],

  // Tọa độ thực khu vực trung tâm TP. Quảng Ngãi (~15.12, 108.79)
  servicePoints: [
    {
      id: 'sp01', categoryId: 'all', lat: 15.1205, lng: 108.7965,
      vi: 'Trung tâm Phục vụ hành chính công tỉnh Quảng Ngãi',
      en: 'Quang Ngai Provincial Public Administration Center',
      address: '54 Hùng Vương, P. Cẩm Thành', ward: 'Cẩm Thành',
      phone: '0255 3712 345', email: 'hcc@quangngai.gov.vn', website: 'dichvucong.quangngai.gov.vn',
      hours: { weekday: '07:00 – 11:30, 13:30 – 17:00', saturday: '07:30 – 11:30' },
      rating: 4.6, ratingCount: 312, open: true,
      serviceIds: ['svc01','svc03','svc04','svc05','svc06','svc07','svc10','svc12'],
      distance: 0.8,
    },
    {
      id: 'sp02', categoryId: 'cutru', lat: 15.1248, lng: 108.7891,
      vi: 'Công an TP. Quảng Ngãi — Bộ phận cấp CCCD',
      en: 'Quang Ngai City Police — ID Card Division',
      address: '142 Lê Trung Đình, P. Trần Hưng Đạo', ward: 'Trần Hưng Đạo',
      phone: '0255 3822 218', email: 'congan.tpqn@quangngai.gov.vn', website: '',
      hours: { weekday: '07:30 – 11:30, 13:30 – 17:00', saturday: '07:30 – 11:30' },
      rating: 4.2, ratingCount: 188, open: true,
      serviceIds: ['svc02','svc04'],
      distance: 1.4,
    },
    {
      id: 'sp03', categoryId: 'hotich', lat: 15.1172, lng: 108.8014,
      vi: 'Bộ phận Một cửa UBND phường Cẩm Thành',
      en: 'Cam Thanh Ward One-Stop Service Desk',
      address: '15 Phan Đình Phùng, P. Cẩm Thành', ward: 'Cẩm Thành',
      phone: '0255 3826 471', email: 'camthanh@quangngai.gov.vn', website: '',
      hours: { weekday: '07:00 – 11:30, 13:30 – 17:00', saturday: 'Nghỉ' },
      rating: 4.8, ratingCount: 96, open: true,
      serviceIds: ['svc01','svc03','svc05','svc11'],
      distance: 0.5,
    },
    {
      id: 'sp04', categoryId: 'hotich', lat: 15.1312, lng: 108.7842,
      vi: 'Bộ phận Một cửa UBND phường Trương Quang Trọng',
      en: 'Truong Quang Trong Ward One-Stop Service Desk',
      address: '88 Quang Trung, P. Trương Quang Trọng', ward: 'Trương Quang Trọng',
      phone: '0255 3842 190', email: 'tqtrong@quangngai.gov.vn', website: '',
      hours: { weekday: '07:00 – 11:30, 13:30 – 17:00', saturday: 'Nghỉ' },
      rating: 4.4, ratingCount: 71, open: false,
      serviceIds: ['svc01','svc03','svc04','svc05'],
      distance: 2.6,
    },
    {
      id: 'sp05', categoryId: 'yte', lat: 15.1146, lng: 108.7918,
      vi: 'Bảo hiểm xã hội TP. Quảng Ngãi',
      en: 'Quang Ngai City Social Insurance Office',
      address: '208 Nguyễn Nghiêm, P. Nghĩa Lộ', ward: 'Nghĩa Lộ',
      phone: '0255 3818 802', email: 'bhxh.tpqn@vss.gov.vn', website: 'baohiemxahoi.gov.vn',
      hours: { weekday: '07:30 – 11:30, 13:30 – 17:00', saturday: 'Nghỉ' },
      rating: 4.1, ratingCount: 134, open: true,
      serviceIds: ['svc08'],
      distance: 1.1,
    },
    {
      id: 'sp06', categoryId: 'giaothong', lat: 15.1086, lng: 108.8052,
      vi: 'Bưu điện TP. Quảng Ngãi — Điểm tiếp nhận hồ sơ',
      en: 'Quang Ngai City Post Office — Application Intake',
      address: '02 Phan Bội Châu, P. Chánh Lộ', ward: 'Chánh Lộ',
      phone: '0255 3823 444', email: 'qnipost@vnpost.vn', website: 'vnpost.vn',
      hours: { weekday: '07:00 – 18:00', saturday: '07:00 – 12:00' },
      rating: 4.5, ratingCount: 203, open: true,
      serviceIds: ['svc09','svc10','svc02'],
      distance: 1.9,
    },
  ],

  reviews: {
    sp01: [
      { name: 'Trần Văn Khoa', rating: 5, date: '02/06/2026', vi: 'Cán bộ hướng dẫn tận tình, lấy số thứ tự nhanh, chờ khoảng 15 phút là tới lượt.', en: 'Helpful staff, quick queue — waited about 15 minutes.' },
      { name: 'Lê Thị Bích', rating: 4, date: '28/05/2026', vi: 'Thủ tục nhanh gọn. Chỗ gửi xe hơi chật vào giờ cao điểm.', en: 'Quick procedures. Parking gets crowded at peak hours.' },
      { name: 'Phạm Minh Tuấn', rating: 5, date: '19/05/2026', vi: 'Nộp hồ sơ khai sinh liên thông, 1 ngày có kết quả. Rất hài lòng!', en: 'Submitted combined birth registration, results in 1 day. Very satisfied!' },
    ],
    sp03: [
      { name: 'Võ Thị Hạnh', rating: 5, date: '05/06/2026', vi: 'Phường làm việc nhanh, cô cán bộ một cửa rất dễ thương.', en: 'Fast service, very friendly staff at the one-stop desk.' },
    ],
  },

  announcements: [
    {
      id: 'an01', date: '09/06/2026', tag: 'thongbao',
      vi: 'Từ 15/6: tiếp nhận hồ sơ cấp đổi CCCD cả sáng thứ Bảy tại Công an TP. Quảng Ngãi',
      en: 'From Jun 15: ID card renewals accepted Saturday mornings at City Police',
      bodyVi: 'Nhằm giảm tải cho người dân trong giờ hành chính, từ ngày 15/6/2026, Công an TP. Quảng Ngãi tổ chức tiếp nhận hồ sơ cấp đổi, cấp lại thẻ Căn cước công dân vào sáng thứ Bảy hàng tuần (07:30 – 11:30) tại trụ sở 142 Lê Trung Đình.\n\nNgười dân nên đặt lịch trước qua Cổng Dịch vụ công để được phục vụ nhanh nhất. Khi đi mang theo CCCD cũ (nếu có) và mã đặt lịch.',
      bodyEn: 'To reduce weekday congestion, from June 15, 2026 the City Police will accept ID card renewal and replacement applications on Saturday mornings (07:30 – 11:30) at 142 Le Trung Dinh.\n\nCitizens should book an appointment via the Service Portal in advance and bring their old ID card (if any) plus the booking code.',
    },
    {
      id: 'an02', date: '06/06/2026', tag: 'huongdan',
      vi: 'Hướng dẫn nộp hồ sơ khai sinh liên thông 3 trong 1 (khai sinh – thường trú – BHYT)',
      en: 'Guide: 3-in-1 combined birth registration (birth – residence – insurance)',
      bodyVi: 'Thủ tục liên thông 3 trong 1 cho phép cha mẹ thực hiện đồng thời: đăng ký khai sinh, đăng ký thường trú và cấp thẻ BHYT cho trẻ dưới 6 tuổi chỉ với một lần nộp hồ sơ trực tuyến.\n\nHồ sơ gồm: tờ khai điện tử (kê khai trực tiếp trên Cổng), giấy chứng sinh, CCCD của cha/mẹ. Kết quả trả trong 3 ngày làm việc qua bưu điện hoặc nhận trực tiếp tại Bộ phận Một cửa.',
      bodyEn: 'The 3-in-1 combined procedure lets parents simultaneously register a birth, register permanent residence, and obtain a health insurance card for children under 6 — with a single online application.\n\nRequired: the online declaration form, the birth certificate from the medical facility, and parents’ ID cards. Results are returned within 3 working days by post or at the One-Stop Desk.',
    },
    {
      id: 'an03', date: '01/06/2026', tag: 'thongbao',
      vi: 'Trung tâm Phục vụ hành chính công tỉnh chuyển về trụ sở mới 54 Hùng Vương từ 01/7/2026',
      en: 'Provincial Administration Center moving to 54 Hung Vuong from Jul 1, 2026',
      bodyVi: 'Từ ngày 01/7/2026, Trung tâm Phục vụ hành chính công tỉnh Quảng Ngãi chuyển toàn bộ hoạt động tiếp nhận và trả kết quả về trụ sở mới tại 54 Hùng Vương, P. Cẩm Thành.\n\nTrong tuần đầu chuyển đổi (01/7 – 05/7), Trung tâm bố trí bàn hướng dẫn tại cả trụ sở cũ và mới. Các lịch hẹn đã đặt trước vẫn được giữ nguyên giá trị.',
      bodyEn: 'From July 1, 2026, the Provincial Public Administration Center will move all intake and result-return operations to its new office at 54 Hung Vuong, Cam Thanh Ward.\n\nDuring the first transition week (Jul 1–5), help desks will operate at both the old and new locations. Existing appointments remain valid.',
    },
    {
      id: 'an04', date: '26/05/2026', tag: 'khancap',
      vi: 'Cảnh báo: xuất hiện tin nhắn giả mạo Cổng DVC yêu cầu cung cấp OTP — tuyệt đối không cung cấp',
      en: 'Warning: fake portal SMS requesting OTP codes — never share your OTP',
      bodyVi: 'Hiện có đối tượng giả mạo tin nhắn thương hiệu “Cổng DVC” yêu cầu người dân cung cấp mã OTP để “xác minh hồ sơ”. Đây là hành vi lừa đảo chiếm đoạt tài khoản.\n\nCổng Dịch vụ công KHÔNG BAO GIỜ yêu cầu cung cấp OTP qua tin nhắn hoặc điện thoại. Nếu nhận được yêu cầu tương tự, vui lòng báo ngay tổng đài 1900 1096 hoặc gửi phản ánh trên Cổng.',
      bodyEn: 'Scammers are sending SMS impersonating the Service Portal, asking citizens for OTP codes to “verify applications”. This is account-theft fraud.\n\nThe Service Portal NEVER asks for OTP codes via SMS or phone. If you receive such a request, report it immediately via hotline 1900 1096 or the portal’s feedback feature.',
    },
  ],

  requests: [
    {
      id: 'QNG-2026-04812', serviceId: 'svc01', pointId: 'sp03',
      submitted: '04/06/2026 09:12', status: 'processing',
      description: 'Đăng ký khai sinh cho con trai Nguyễn Hoàng Phúc, sinh ngày 28/5/2026 tại BVĐK tỉnh Quảng Ngãi.',
      documents: [
        { name: 'To-khai-dang-ky-khai-sinh.pdf', size: '1.2 MB' },
        { name: 'Giay-chung-sinh-BVDK.jpg', size: '3.4 MB' },
        { name: 'CCCD-hai-vo-chong.pdf', size: '2.1 MB' },
      ],
      timeline: [
        { status: 'submitted', at: '04/06/2026 09:12', noteVi: 'Hồ sơ được nộp trực tuyến', noteEn: 'Application submitted online' },
        { status: 'received', at: '04/06/2026 10:45', noteVi: 'Bộ phận Một cửa P. Cẩm Thành tiếp nhận, mã số tiếp nhận 2026/KS-0341', noteEn: 'Received by Cam Thanh ward desk, intake no. 2026/KS-0341' },
        { status: 'processing', at: '05/06/2026 08:20', noteVi: 'Chuyển cán bộ Tư pháp – Hộ tịch thẩm định', noteEn: 'Forwarded to civil registration officer for review' },
      ],
      officerNote: { vi: 'Hồ sơ hợp lệ. Dự kiến trả kết quả ngày 06/06/2026 tại Bộ phận Một cửa hoặc qua bưu điện theo đăng ký.', en: 'Application valid. Expected result on 06/06/2026 at the service desk or via post as registered.' },
    },
    {
      id: 'QNG-2026-04391', serviceId: 'svc02', pointId: 'sp02',
      submitted: '21/05/2026 14:30', status: 'completed',
      description: 'Cấp đổi CCCD gắn chip do thay đổi nơi thường trú.',
      documents: [{ name: 'Phieu-thu-nhan-thong-tin.pdf', size: '0.8 MB' }],
      timeline: [
        { status: 'submitted', at: '21/05/2026 14:30', noteVi: 'Hồ sơ được nộp trực tuyến', noteEn: 'Application submitted online' },
        { status: 'received', at: '21/05/2026 15:10', noteVi: 'Đã đặt lịch thu nhận sinh trắc học 23/05/2026', noteEn: 'Biometric appointment booked for 23/05/2026' },
        { status: 'processing', at: '23/05/2026 09:00', noteVi: 'Đã thu nhận vân tay, ảnh chân dung', noteEn: 'Fingerprints and portrait collected' },
        { status: 'completed', at: '30/05/2026 16:00', noteVi: 'Thẻ CCCD đã được trả qua bưu điện', noteEn: 'ID card delivered via post' },
      ],
      officerNote: null,
    },
    {
      id: 'QNG-2026-03977', serviceId: 'svc07', pointId: 'sp01',
      submitted: '12/05/2026 10:05', status: 'waiting',
      description: 'Đăng ký hộ kinh doanh quán cà phê "Hà An Coffee" tại 27 Trần Hưng Đạo.',
      documents: [
        { name: 'Giay-de-nghi-dang-ky-HKD.pdf', size: '1.0 MB' },
        { name: 'CCCD-chu-ho.jpg', size: '2.8 MB' },
      ],
      timeline: [
        { status: 'submitted', at: '12/05/2026 10:05', noteVi: 'Hồ sơ được nộp trực tuyến', noteEn: 'Application submitted online' },
        { status: 'received', at: '12/05/2026 11:00', noteVi: 'Trung tâm PVHCC tỉnh tiếp nhận', noteEn: 'Received by Provincial Administration Center' },
        { status: 'waiting', at: '14/05/2026 09:30', noteVi: 'Yêu cầu bổ sung: bản sao hợp đồng thuê mặt bằng kinh doanh', noteEn: 'Supplement requested: copy of premises lease contract' },
      ],
      officerNote: { vi: 'Vui lòng bổ sung bản sao hợp đồng thuê mặt bằng trong vòng 15 ngày để tiếp tục xử lý hồ sơ.', en: 'Please supplement a copy of the lease contract within 15 days to continue processing.' },
    },
  ],

  feedbackCategories: [
    { id: 'road',      icon: 'road',     vi: 'Hạ tầng giao thông', en: 'Road issues' },
    { id: 'env',       icon: 'leaf',     vi: 'Môi trường',          en: 'Environment' },
    { id: 'flood',     icon: 'water',    vi: 'Ngập úng',            en: 'Flooding' },
    { id: 'security',  icon: 'shield',   vi: 'An ninh trật tự',     en: 'Security' },
    { id: 'construct', icon: 'building', vi: 'Vi phạm xây dựng',    en: 'Construction violation' },
    { id: 'service',   icon: 'service',  vi: 'Dịch vụ công',        en: 'Public service' },
    { id: 'fire',      icon: 'fire',     vi: 'Hoả hoạn',            en: 'Fire' },
    { id: 'abuse',     icon: 'abuse',    vi: 'Bạo hành',            en: 'Abuse' },
    { id: 'fraud',     icon: 'fraud',    vi: 'Lừa đảo',             en: 'Fraud / scam' },
  ],

  feedbacks: [
    {
      id: 'PA-2026-0153', categoryId: 'road', status: 'processing', priority: 'high',
      submitted: '06/06/2026 18:42',
      title: 'Đèn tín hiệu giao thông hỏng tại ngã tư Quang Trung – Hùng Vương',
      desc: 'Đèn tín hiệu hướng Quang Trung bị tắt từ chiều 06/6, giờ cao điểm giao thông lộn xộn, tiềm ẩn nguy cơ tai nạn.',
      address: 'Ngã tư Quang Trung – Hùng Vương, P. Cẩm Thành',
      lat: 15.1218, lng: 108.7942,
      attachments: [{ type: 'image', name: 'den-tin-hieu-1.jpg' }, { type: 'image', name: 'den-tin-hieu-2.jpg' }],
      timeline: [
        { status: 'submitted', at: '06/06/2026 18:42', noteVi: 'Phản ánh được gửi qua Cổng DVC', noteEn: 'Report submitted via portal' },
        { status: 'received', at: '06/06/2026 19:30', noteVi: 'Trung tâm điều hành đô thị tiếp nhận', noteEn: 'Received by Urban Operations Center' },
        { status: 'assigned', at: '07/06/2026 07:45', noteVi: 'Phân công Đội quản lý hạ tầng giao thông xử lý', noteEn: 'Assigned to Traffic Infrastructure Team' },
        { status: 'processing', at: '07/06/2026 09:15', noteVi: 'Đơn vị thi công đang khắc phục, dự kiến hoàn thành trong ngày', noteEn: 'Repair crew on site, expected completion today' },
      ],
      response: { vi: 'Đội QLHT giao thông đã kiểm tra, xác định hỏng bộ điều khiển. Đã thay thế thiết bị, đèn hoạt động bình thường từ 15h00 ngày 07/6.', en: 'Inspection found a faulty controller. Equipment replaced; signal operating normally since 15:00 on Jun 7.' },
    },
    {
      id: 'PA-2026-0148', categoryId: 'env', status: 'resolved', priority: 'medium',
      submitted: '02/06/2026 07:15',
      title: 'Rác thải tồn đọng tại bờ kè sông Trà Khúc',
      desc: 'Khu vực bờ kè đoạn gần cầu Trà Khúc 1 có nhiều rác thải sinh hoạt tồn đọng 3–4 ngày chưa được thu gom, bốc mùi.',
      address: 'Bờ kè sông Trà Khúc, P. Trương Quang Trọng',
      lat: 15.1339, lng: 108.7901,
      attachments: [{ type: 'image', name: 'rac-bo-ke.jpg' }, { type: 'video', name: 'hien-truong.mp4' }],
      timeline: [
        { status: 'submitted', at: '02/06/2026 07:15', noteVi: 'Phản ánh được gửi qua Cổng DVC', noteEn: 'Report submitted via portal' },
        { status: 'received', at: '02/06/2026 08:00', noteVi: 'Tiếp nhận và chuyển Công ty CP Môi trường đô thị', noteEn: 'Received and forwarded to Urban Environment JSC' },
        { status: 'assigned', at: '02/06/2026 09:30', noteVi: 'Phân công tổ thu gom khu vực 3', noteEn: 'Assigned to collection team, zone 3' },
        { status: 'processing', at: '03/06/2026 06:00', noteVi: 'Tổ thu gom triển khai dọn vệ sinh', noteEn: 'Cleanup in progress' },
        { status: 'resolved', at: '03/06/2026 10:30', noteVi: 'Đã thu gom toàn bộ, bố trí thêm 2 thùng rác công cộng', noteEn: 'Fully cleaned; 2 additional public bins installed' },
      ],
      response: { vi: 'Đã xử lý xong và bổ sung 2 thùng rác công cộng tại khu vực. Cảm ơn phản ánh của bà con.', en: 'Resolved; 2 public bins added in the area. Thank you for your report.' },
    },
    {
      id: 'PA-2026-0132', categoryId: 'flood', status: 'received', priority: 'medium',
      submitted: '28/05/2026 16:20',
      title: 'Ngập cục bộ đường Nguyễn Công Phương sau mưa lớn',
      desc: 'Đoạn đường trước trường THCS Nguyễn Nghiêm ngập 30–40cm mỗi khi mưa to, học sinh đi lại khó khăn.',
      address: 'Đường Nguyễn Công Phương, P. Nghĩa Lộ',
      lat: 15.1101, lng: 108.7873,
      attachments: [{ type: 'image', name: 'ngap-duong.jpg' }],
      timeline: [
        { status: 'submitted', at: '28/05/2026 16:20', noteVi: 'Phản ánh được gửi qua Cổng DVC', noteEn: 'Report submitted via portal' },
        { status: 'received', at: '29/05/2026 08:10', noteVi: 'Chuyển Phòng Quản lý đô thị khảo sát hệ thống thoát nước', noteEn: 'Forwarded to Urban Management Division for drainage survey' },
      ],
      response: null,
    },
  ],

  notifications: [
    { id: 'n01', read: false, at: '07/06/2026 09:20', type: 'request',
      vi: 'Hồ sơ QNG-2026-04812 đã chuyển sang trạng thái Đang xử lý', en: 'Application QNG-2026-04812 is now Processing' },
    { id: 'n02', read: false, at: '07/06/2026 15:05', type: 'feedback',
      vi: 'Phản ánh PA-2026-0153 đã có phản hồi từ Đội QLHT giao thông', en: 'Report PA-2026-0153 received a response from the Traffic Infrastructure Team' },
    { id: 'n03', read: false, at: '05/06/2026 10:00', type: 'announcement',
      vi: 'Từ 15/6: tiếp nhận cấp đổi CCCD sáng thứ Bảy tại Công an TP', en: 'From Jun 15: Saturday-morning ID renewals at City Police' },
    { id: 'n04', read: true, at: '30/05/2026 16:02', type: 'request',
      vi: 'Hồ sơ QNG-2026-04391 đã Hoàn thành — thẻ CCCD trả qua bưu điện', en: 'Application QNG-2026-04391 Completed — ID card delivered via post' },
    { id: 'n05', read: true, at: '14/05/2026 09:35', type: 'request',
      vi: 'Hồ sơ QNG-2026-03977 cần bổ sung giấy tờ — xem chi tiết', en: 'Application QNG-2026-03977 requires supplementary documents' },
  ],

  wards: ['Cẩm Thành', 'Trần Hưng Đạo', 'Nghĩa Lộ', 'Chánh Lộ', 'Trương Quang Trọng', 'Quảng Phú', 'Nghĩa Chánh'],

  stats: { services: 94, points: 23, resolved: '12.480', satisfaction: '96,2%' },
};

// ---- Trạng thái: ánh xạ màu + nhãn i18n ----
window.STATUS_META = {
  // hồ sơ
  submitted:  { labelKey: 'st_submitted',  tone: 'neutral' },
  received:   { labelKey: 'st_received',   tone: 'info' },
  processing: { labelKey: 'st_processing', tone: 'warning' },
  waiting:    { labelKey: 'st_waiting',    tone: 'danger' },
  completed:  { labelKey: 'st_completed',  tone: 'success' },
  rejected:   { labelKey: 'st_rejected',   tone: 'danger' },
  cancelled:  { labelKey: 'st_cancelled',  tone: 'neutral' },
};
window.FB_STATUS_META = {
  submitted:  { labelKey: 'fst_submitted',  tone: 'neutral' },
  received:   { labelKey: 'fst_received',   tone: 'info' },
  assigned:   { labelKey: 'fst_assigned',   tone: 'info' },
  processing: { labelKey: 'fst_processing', tone: 'warning' },
  resolved:   { labelKey: 'fst_resolved',   tone: 'success' },
  rejected:   { labelKey: 'fst_rejected',   tone: 'danger' },
  closed:     { labelKey: 'fst_closed',     tone: 'neutral' },
};
