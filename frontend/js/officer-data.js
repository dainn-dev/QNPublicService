// ============================================================
// Dữ liệu & i18n Cổng cán bộ — TP. Quảng Ngãi (mô phỏng)
// Yêu cầu nạp sau js/i18n.js và js/data.js
// ============================================================

// ---- i18n bổ sung ----
Object.assign(window.I18N.vi, {
  op_portal: 'Cổng cán bộ',
  op_dashboard: 'Tổng quan',
  op_requests: 'Quản lý hồ sơ',
  op_feedback: 'Quản lý phản ánh',
  op_citizen_portal: 'Cổng công dân',
  op_search_ph: 'Tìm mã hồ sơ, tên công dân…',

  // KPI
  kpi_total_requests: 'Tổng hồ sơ',
  kpi_open_requests: 'Hồ sơ đang mở',
  kpi_resolved_requests: 'Hồ sơ đã giải quyết',
  kpi_open_feedback: 'Phản ánh đang mở',
  kpi_sla: 'Tỷ lệ đúng hạn (SLA)',
  kpi_vs_last_month: 'so với tháng trước',

  // Charts
  ch_requests_by_month: 'Hồ sơ theo tháng',
  ch_feedback_by_category: 'Phản ánh theo loại',
  ch_feedback_heatmap: 'Bản đồ nhiệt phản ánh',
  ch_received: 'Tiếp nhận',
  ch_resolved: 'Giải quyết',
  month_short: 'T',

  // Bảng hồ sơ
  tbl_code: 'Mã hồ sơ',
  tbl_citizen: 'Công dân',
  tbl_service: 'Dịch vụ',
  tbl_point: 'Điểm tiếp nhận',
  tbl_ward: 'Phường/Xã',
  tbl_officer: 'Cán bộ xử lý',
  tbl_submitted: 'Ngày nộp',
  tbl_due: 'Hạn xử lý',
  tbl_status: 'Trạng thái',
  tbl_actions: 'Thao tác',
  tbl_priority: 'Ưu tiên',
  tbl_category: 'Loại',
  tbl_title: 'Tiêu đề',
  unassigned: 'Chưa phân công',
  pg_showing: 'Hiển thị',
  pg_prev: 'Trang trước',
  pg_next: 'Trang sau',
  pg_page: 'Trang',
  overdue: 'Quá hạn',
  due_soon: 'Sắp đến hạn',

  // Thao tác
  act_assign: 'Phân công',
  act_approve: 'Duyệt',
  act_reject: 'Từ chối',
  act_complete: 'Hoàn thành',
  act_update_status: 'Cập nhật trạng thái',
  act_add_note: 'Thêm ghi chú',
  act_upload_response: 'Tải lên văn bản phản hồi',
  act_request_supplement: 'Yêu cầu bổ sung',
  act_send: 'Gửi',
  act_save: 'Lưu thay đổi',
  act_respond_citizen: 'Phản hồi người dân',

  // Ưu tiên
  pr_high: 'Cao',
  pr_medium: 'Trung bình',
  pr_low: 'Thấp',

  // Chi tiết
  dt_internal_comments: 'Trao đổi nội bộ',
  dt_citizen_comm: 'Liên hệ với người dân',
  dt_evidence: 'Bằng chứng hiện trường',
  dt_note_ph: 'Nhập ghi chú nội bộ…',
  dt_response_ph: 'Nhập nội dung phản hồi gửi người dân…',
  dt_assign_to: 'Phân công cho',
  dt_history: 'Lịch sử xử lý',
  dt_citizen_info: 'Thông tin công dân',
  dt_new_status: 'Trạng thái mới',
  dt_note_internal: 'Ghi chú (nội bộ)',
  dt_saved: 'Đã lưu thay đổi',
  dt_sent: 'Đã gửi phản hồi',
  dt_documents: 'Giấy tờ đính kèm',
  op_internal_hint: 'Chỉ cán bộ nhìn thấy — người dân không xem được nội dung này',
  op_notif_title: 'Thông báo',
  op_notif_assigned_req: 'Hồ sơ được phân công',
  op_notif_assigned_fb: 'Phản ánh được phân công',
  op_notif_due: 'Sắp đến hạn',
  results: 'kết quả',
  all: 'Tất cả',
  logout: 'Đăng xuất',
});

Object.assign(window.I18N.en, {
  op_portal: 'Officer Portal',
  op_dashboard: 'Dashboard',
  op_requests: 'Request Management',
  op_feedback: 'Feedback Management',
  op_citizen_portal: 'Citizen Portal',
  op_search_ph: 'Search code, citizen name…',

  kpi_total_requests: 'Total requests',
  kpi_open_requests: 'Open requests',
  kpi_resolved_requests: 'Resolved requests',
  kpi_open_feedback: 'Open feedback',
  kpi_sla: 'SLA compliance',
  kpi_vs_last_month: 'vs last month',

  ch_requests_by_month: 'Requests by month',
  ch_feedback_by_category: 'Feedback by category',
  ch_feedback_heatmap: 'Feedback heatmap',
  ch_received: 'Received',
  ch_resolved: 'Resolved',
  month_short: 'M',

  tbl_code: 'Code',
  tbl_citizen: 'Citizen',
  tbl_service: 'Service',
  tbl_point: 'Service point',
  tbl_ward: 'Ward',
  tbl_officer: 'Officer',
  tbl_submitted: 'Submitted',
  tbl_due: 'Due',
  tbl_status: 'Status',
  tbl_actions: 'Actions',
  tbl_priority: 'Priority',
  tbl_category: 'Category',
  tbl_title: 'Title',
  unassigned: 'Unassigned',
  pg_showing: 'Showing',
  pg_prev: 'Previous page',
  pg_next: 'Next page',
  pg_page: 'Page',
  overdue: 'Overdue',
  due_soon: 'Due soon',

  act_assign: 'Assign',
  act_approve: 'Approve',
  act_reject: 'Reject',
  act_complete: 'Complete',
  act_update_status: 'Update status',
  act_add_note: 'Add note',
  act_upload_response: 'Upload response document',
  act_request_supplement: 'Request supplement',
  act_send: 'Send',
  act_save: 'Save changes',
  act_respond_citizen: 'Respond to citizen',

  pr_high: 'High',
  pr_medium: 'Medium',
  pr_low: 'Low',

  dt_internal_comments: 'Internal discussion',
  dt_citizen_comm: 'Citizen communication',
  dt_evidence: 'Field evidence',
  dt_note_ph: 'Write an internal note…',
  dt_response_ph: 'Write a response to the citizen…',
  dt_assign_to: 'Assign to',
  dt_history: 'Processing history',
  dt_citizen_info: 'Citizen information',
  dt_new_status: 'New status',
  dt_note_internal: 'Note (internal)',
  dt_saved: 'Changes saved',
  dt_sent: 'Response sent',
  dt_documents: 'Attached documents',
  op_internal_hint: 'Visible to officers only — citizens cannot see this',
  op_notif_title: 'Notifications',
  op_notif_assigned_req: 'Request assigned',
  op_notif_assigned_fb: 'Feedback assigned',
  op_notif_due: 'Due soon',
  results: 'results',
  all: 'All',
  logout: 'Sign out',
});

// ---- Cán bộ ----
window.ODATA = {
  me: { id: 'of2', name: 'Lê Thị Thu Trang', role: { vi: 'Chuyên viên Bộ phận Một cửa', en: 'One-Stop Desk Specialist' }, initials: 'TT' },

  officers: [
    { id: 'of1', name: 'Trần Quốc Bảo',    dept: { vi: 'Tư pháp – Hộ tịch', en: 'Civil Registration' },  initials: 'QB' },
    { id: 'of2', name: 'Lê Thị Thu Trang', dept: { vi: 'Bộ phận Một cửa',   en: 'One-Stop Desk' },        initials: 'TT' },
    { id: 'of3', name: 'Phạm Văn Hùng',    dept: { vi: 'Quản lý đô thị',    en: 'Urban Management' },     initials: 'VH' },
    { id: 'of4', name: 'Võ Minh Châu',     dept: { vi: 'Tài nguyên – Môi trường', en: 'Environment' },    initials: 'MC' },
    { id: 'of5', name: 'Đặng Hữu Phước',   dept: { vi: 'Công an TP',        en: 'City Police' },          initials: 'HP' },
  ],

  kpi: {
    total: 1284, open: 86, resolved: 1158, openFeedback: 23, sla: '94,6%',
    deltas: { total: '+8,2%', open: '−12 hồ sơ', resolved: '+9,1%', openFeedback: '+4', sla: '+1,3 đ%' },
  },

  requestsByMonth: [
    { m: 1, received: 168, resolved: 154 },
    { m: 2, received: 142, resolved: 138 },
    { m: 3, received: 196, resolved: 181 },
    { m: 4, received: 230, resolved: 212 },
    { m: 5, received: 251, resolved: 240 },
    { m: 6, received: 297, resolved: 233 },
  ],

  feedbackByCategory: [
    { id: 'road', count: 34 },
    { id: 'env', count: 27 },
    { id: 'flood', count: 19 },
    { id: 'construct', count: 12 },
    { id: 'security', count: 9 },
    { id: 'service', count: 7 },
  ],

  // Điểm nhiệt phản ánh (lat, lng, cường độ 1-10)
  heat: [
    [15.1218, 108.7942, 9], [15.1205, 108.7965, 6], [15.1339, 108.7901, 7],
    [15.1101, 108.7873, 8], [15.1146, 108.7918, 4], [15.1086, 108.8052, 5],
    [15.1248, 108.7891, 3], [15.1172, 108.8014, 4], [15.1289, 108.8003, 6],
    [15.1052, 108.7921, 7], [15.1187, 108.7820, 3], [15.1310, 108.7967, 2],
  ],

  // Hồ sơ (mở rộng) — serviceId/pointId tham chiếu window.DATA
  requests: [
    { id: 'QNG-2026-04913', citizen: 'Nguyễn Thị Minh Hà', phone: '0905 234 671', serviceId: 'svc01', pointId: 'sp03', ward: 'Cẩm Thành', officerId: null,  submitted: '08/06/2026', due: '10/06/2026', status: 'submitted', dueState: 'soon' },
    { id: 'QNG-2026-04907', citizen: 'Trần Văn Khoa',      phone: '0913 882 045', serviceId: 'svc07', pointId: 'sp01', ward: 'Trần Hưng Đạo', officerId: 'of2', submitted: '08/06/2026', due: '11/06/2026', status: 'received', dueState: 'ok' },
    { id: 'QNG-2026-04898', citizen: 'Lê Thị Bích',        phone: '0935 117 209', serviceId: 'svc02', pointId: 'sp02', ward: 'Nghĩa Lộ', officerId: 'of5', submitted: '07/06/2026', due: '14/06/2026', status: 'processing', dueState: 'ok' },
    { id: 'QNG-2026-04881', citizen: 'Phạm Minh Tuấn',     phone: '0905 661 384', serviceId: 'svc04', pointId: 'sp01', ward: 'Chánh Lộ', officerId: 'of2', submitted: '06/06/2026', due: '11/06/2026', status: 'processing', dueState: 'soon' },
    { id: 'QNG-2026-04866', citizen: 'Võ Thị Hạnh',        phone: '0987 220 953', serviceId: 'svc03', pointId: 'sp03', ward: 'Cẩm Thành', officerId: 'of1', submitted: '05/06/2026', due: '09/06/2026', status: 'waiting', dueState: 'overdue' },
    { id: 'QNG-2026-04852', citizen: 'Đỗ Quang Vinh',      phone: '0918 530 776', serviceId: 'svc06', pointId: 'sp01', ward: 'Quảng Phú', officerId: 'of3', submitted: '04/06/2026', due: '25/06/2026', status: 'processing', dueState: 'ok' },
    { id: 'QNG-2026-04812', citizen: 'Nguyễn Thị Minh Hà', phone: '0905 234 671', serviceId: 'svc01', pointId: 'sp03', ward: 'Cẩm Thành', officerId: 'of1', submitted: '04/06/2026', due: '06/06/2026', status: 'processing', dueState: 'overdue' },
    { id: 'QNG-2026-04790', citizen: 'Bùi Đức Long',       phone: '0909 415 268', serviceId: 'svc10', pointId: 'sp06', ward: 'Chánh Lộ', officerId: 'of1', submitted: '03/06/2026', due: '17/06/2026', status: 'received', dueState: 'ok' },
    { id: 'QNG-2026-04771', citizen: 'Hồ Thị Kim Oanh',    phone: '0935 902 117', serviceId: 'svc05', pointId: 'sp04', ward: 'Trương Quang Trọng', officerId: null, submitted: '02/06/2026', due: '05/06/2026', status: 'submitted', dueState: 'overdue' },
    { id: 'QNG-2026-04748', citizen: 'Ngô Văn Thành',      phone: '0912 778 430', serviceId: 'svc09', pointId: 'sp06', ward: 'Nghĩa Chánh', officerId: 'of2', submitted: '01/06/2026', due: '08/06/2026', status: 'completed', dueState: 'done' },
    { id: 'QNG-2026-04702', citizen: 'Đinh Thị Lan',       phone: '0905 384 661', serviceId: 'svc12', pointId: 'sp01', ward: 'Quảng Phú', officerId: 'of3', submitted: '30/05/2026', due: '13/06/2026', status: 'processing', dueState: 'ok' },
    { id: 'QNG-2026-04688', citizen: 'Trương Công Danh',   phone: '0938 547 290', serviceId: 'svc08', pointId: 'sp05', ward: 'Nghĩa Lộ', officerId: 'of2', submitted: '29/05/2026', due: '03/06/2026', status: 'rejected', dueState: 'done' },
  ],

  // Phản ánh (mở rộng) — 3 mã đầu trùng dữ liệu công dân
  feedbacks: [
    { id: 'PA-2026-0161', categoryId: 'road',      title: 'Ổ gà lớn trên đường Lê Lợi đoạn gần chợ Quảng Ngãi', ward: 'Trần Hưng Đạo', priority: 'high',   status: 'submitted',  officerId: null,  submitted: '09/06/2026', lat: 15.1232, lng: 108.7958 },
    { id: 'PA-2026-0158', categoryId: 'construct', title: 'Công trình xây vượt tầng tại hẻm 42 Nguyễn Tự Tân', ward: 'Nghĩa Lộ', priority: 'medium', status: 'received',  officerId: null,  submitted: '08/06/2026', lat: 15.1129, lng: 108.7889 },
    { id: 'PA-2026-0156', categoryId: 'env',       title: 'Đốt rác gây khói tại khu dân cư Ngọc Bảo Viên',       ward: 'Quảng Phú', priority: 'medium', status: 'assigned',  officerId: 'of4', submitted: '08/06/2026', lat: 15.1289, 'lng': 108.8003 },
    { id: 'PA-2026-0153', categoryId: 'road',      title: 'Đèn tín hiệu giao thông hỏng tại ngã tư Quang Trung – Hùng Vương', ward: 'Cẩm Thành', priority: 'high', status: 'processing', officerId: 'of3', submitted: '06/06/2026', lat: 15.1218, lng: 108.7942 },
    { id: 'PA-2026-0151', categoryId: 'security',  title: 'Nhóm thanh niên tụ tập gây ồn sau 23h tại công viên Ba Tơ', ward: 'Chánh Lộ', priority: 'low', status: 'assigned', officerId: 'of5', submitted: '05/06/2026', lat: 15.1095, lng: 108.7990 },
    { id: 'PA-2026-0148', categoryId: 'env',       title: 'Rác thải tồn đọng tại bờ kè sông Trà Khúc', ward: 'Trương Quang Trọng', priority: 'medium', status: 'resolved', officerId: 'of4', submitted: '02/06/2026', lat: 15.1339, lng: 108.7901 },
    { id: 'PA-2026-0140', categoryId: 'flood',     title: 'Cống thoát nước tắc nghẽn đường Trường Chinh', ward: 'Nghĩa Chánh', priority: 'high', status: 'processing', officerId: 'of3', submitted: '30/05/2026', lat: 15.1052, lng: 108.7921 },
    { id: 'PA-2026-0132', categoryId: 'flood',     title: 'Ngập cục bộ đường Nguyễn Công Phương sau mưa lớn', ward: 'Nghĩa Lộ', priority: 'medium', status: 'received', officerId: null, submitted: '28/05/2026', lat: 15.1101, lng: 108.7873 },
    { id: 'PA-2026-0127', categoryId: 'service',   title: 'Máy lấy số thứ tự tại Trung tâm PVHCC bị lỗi', ward: 'Cẩm Thành', priority: 'low', status: 'closed', officerId: 'of2', submitted: '26/05/2026', lat: 15.1205, lng: 108.7965 },
  ],

  internalComments: {
    'PA-2026-0153': [
      { officerId: 'of3', at: '07/06/2026 08:02', text: 'Đã liên hệ đơn vị bảo trì tín hiệu, họ xác nhận ra hiện trường trong sáng nay.' },
      { officerId: 'of2', at: '07/06/2026 08:15', text: 'Lưu ý đây là nút giao gần trường học, ưu tiên xử lý trước 11h.' },
      { officerId: 'of3', at: '07/06/2026 10:40', text: 'Đơn vị thi công báo hỏng bộ điều khiển, đang thay thế. Dự kiến xong 15h.' },
    ],
    'PA-2026-0148': [
      { officerId: 'of4', at: '02/06/2026 09:35', text: 'Đã chuyển tổ thu gom khu vực 3, hẹn xử lý sáng mai.' },
    ],
  },

  requestNotes: {
    'QNG-2026-04812': [
      { officerId: 'of2', at: '04/06/2026 10:50', text: 'Hồ sơ đủ thành phần, đã chuyển anh Bảo thẩm định hộ tịch.' },
      { officerId: 'of1', at: '05/06/2026 08:25', text: 'Đối chiếu giấy chứng sinh với dữ liệu BVĐK — khớp. Dự kiến ký trả kết quả chiều nay.' },
    ],
    'QNG-2026-04866': [
      { officerId: 'of1', at: '07/06/2026 14:10', text: 'Thiếu giấy xác nhận tình trạng hôn nhân của bên nữ — đã gửi yêu cầu bổ sung.' },
    ],
    'QNG-2026-03977': [
      { officerId: 'of2', at: '14/05/2026 09:32', text: 'Đã gọi điện hướng dẫn công dân bổ sung hợp đồng thuê mặt bằng.' },
    ],
  },

  officerNotifications: [
    { id: 'on1', read: false, at: '12/06/2026 08:05', kind: 'request', refId: 'QNG-2026-04907',
      vi: 'Bạn được phân công xử lý hồ sơ QNG-2026-04907 — Đăng ký hộ kinh doanh', en: 'You were assigned request QNG-2026-04907 — Household business registration' },
    { id: 'on2', read: false, at: '11/06/2026 16:40', kind: 'feedback', refId: 'PA-2026-0156',
      vi: 'Phản ánh PA-2026-0156 (Đốt rác gây khói) được phân công cho tổ của bạn', en: 'Report PA-2026-0156 (smoke from burning waste) assigned to your team' },
    { id: 'on3', read: false, at: '11/06/2026 09:00', kind: 'due', refId: 'QNG-2026-04881',
      vi: 'Hồ sơ QNG-2026-04881 sắp đến hạn xử lý (11/06)', en: 'Request QNG-2026-04881 is due soon (11/06)' },
    { id: 'on4', read: true, at: '10/06/2026 15:20', kind: 'request', refId: 'QNG-2026-04748',
      vi: 'Hồ sơ QNG-2026-04748 đã được duyệt hoàn thành', en: 'Request QNG-2026-04748 marked completed' },
    { id: 'on5', read: true, at: '09/06/2026 08:12', kind: 'feedback', refId: 'PA-2026-0153',
      vi: 'Phản ánh PA-2026-0153 có bình luận mới từ Phan Văn Hùng', en: 'Report PA-2026-0153 has a new comment from Pham Van Hung' },
  ],

  citizenMessages: {
    'PA-2026-0153': [
      { from: 'officer', at: '07/06/2026 09:20', text: 'Cảm ơn phản ánh của ông/bà. Đơn vị thi công đang khắc phục, dự kiến hoàn thành trong ngày.' },
      { from: 'citizen', at: '07/06/2026 09:48', text: 'Cảm ơn anh/chị. Mong xử lý sớm vì giờ tan trường rất đông học sinh qua lại.' },
      { from: 'officer', at: '07/06/2026 15:10', text: 'Đèn tín hiệu đã hoạt động bình thường từ 15h00. Kính báo ông/bà được biết.' },
    ],
  },
};

window.PRIORITY_META = {
  high:   { labelKey: 'pr_high',   tone: 'danger' },
  medium: { labelKey: 'pr_medium', tone: 'warning' },
  low:    { labelKey: 'pr_low',    tone: 'neutral' },
};
