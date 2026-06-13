// ============================================================
// Tầng tích hợp API — gọi backend REST của Cổng Dịch vụ công.
// Base URL mặc định http://localhost:5134 (đổi qua window.API_BASE_URL
// hoặc localStorage 'qng-api-base'). Toàn bộ endpoint là [AllowAnonymous].
//
// Expose: window.API (các lời gọi đã ánh xạ về shape mà frontend dùng)
//         window.useApiData (hook React: data + loading + error + reload)
// ============================================================
(function () {
  'use strict';

  const DEFAULT_BASE = 'http://localhost:5134';

  function readStored() {
    try { return localStorage.getItem('qng-api-base'); } catch (e) { return null; }
  }
  function baseUrl() {
    const configured = (window.API_BASE_URL || readStored() || DEFAULT_BASE);
    return String(configured).replace(/\/+$/, '');
  }

  // Token cho các endpoint admin ([Authorize]). Lấy từ window.API_TOKEN
  // hoặc localStorage 'qng-api-token'. Khi chưa đăng nhập → null (calls 401).
  function authToken() {
    try { return window.API_TOKEN || localStorage.getItem('qng-api-token') || null; }
    catch (e) { return window.API_TOKEN || null; }
  }

  // Các endpoint xác thực tự quản token — không can thiệp vòng retry-401.
  function isAuthPath(path) { return /^\/api\/auth\//.test(String(path)); }

  // Khi gặp 401, nếu module Auth có mặt thì thử làm mới token rồi gọi lại 1 lần.
  // Trả về access token mới (chuỗi) nếu làm mới được, ngược lại null.
  function tryRefresh() {
    if (window.Auth && typeof window.Auth.tryRefresh === 'function') return window.Auth.tryRefresh();
    return Promise.resolve(null);
  }

  // fetchJson dùng chung cho cả đọc (GET) lẫn ghi (POST/PUT/DELETE).
  // opts.method / opts.body cho ghi; tự đính kèm Bearer token nếu có.
  async function fetchJson(path, opts) {
    opts = opts || {};
    const headers = { Accept: 'application/json' };
    if (opts.body != null) headers['Content-Type'] = 'application/json';
    const token = authToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    const res = await fetch(baseUrl() + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body != null ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
    // 401 + có refresh token → làm mới rồi thử lại đúng 1 lần.
    if (res.status === 401 && !opts._retried && !isAuthPath(path)) {
      const fresh = await tryRefresh();
      if (fresh) return fetchJson(path, Object.assign({}, opts, { _retried: true }));
    }
    if (!res.ok) {
      let detail = '';
      try { detail = await res.text(); } catch (e) { /* bỏ qua */ }
      const err = new Error('API ' + res.status + ' — ' + path + (detail ? (' — ' + detail) : ''));
      err.status = res.status;
      err.body = detail;
      throw err;
    }
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  function enc(v) { return encodeURIComponent(v); }
  function write(path, method, body, opts) {
    return fetchJson(path, Object.assign({ method: method, body: body }, opts || {}));
  }

  // Tải file thật (CSV/Excel…): GET kèm Bearer, đọc blob rồi kích hoạt tải xuống.
  // Endpoint export là [Authorize] nên không thể dùng thẻ <a href> thuần.
  async function downloadFile(path, fallbackName, opts) {
    opts = opts || {};
    const headers = { Accept: '*/*' };
    const token = authToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    const res = await fetch(baseUrl() + path, { method: 'GET', headers: headers, signal: opts.signal });
    if (res.status === 401 && !opts._retried && !isAuthPath(path)) {
      const fresh = await tryRefresh();
      if (fresh) return downloadFile(path, fallbackName, Object.assign({}, opts, { _retried: true }));
    }
    if (!res.ok) {
      let detail = '';
      try { detail = await res.text(); } catch (e) { /* bỏ qua */ }
      const err = new Error('API ' + res.status + ' — ' + path + (detail ? (' — ' + detail) : ''));
      err.status = res.status;
      throw err;
    }
    const blob = await res.blob();
    let name = fallbackName;
    const cd = res.headers.get('Content-Disposition');
    if (cd) {
      const m = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
      if (m) { try { name = decodeURIComponent(m[1]); } catch (e) { name = m[1]; } }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    return name;
  }

  // Dựng query string từ object (bỏ qua null/''/undefined, bỏ 'all').
  function qsFrom(params) {
    params = params || {};
    const qs = [];
    Object.keys(params).forEach(function (k) {
      const v = params[k];
      if (v == null || v === '' || v === 'all') return;
      qs.push(enc(k) + '=' + enc(v));
    });
    return qs.length ? ('?' + qs.join('&')) : '';
  }

  // ---------- Tiện ích ánh xạ điểm lệch dữ liệu ----------

  // (#6) Icon tĩnh phía client theo mã danh mục — API không trả icon.
  const CATEGORY_ICONS = {
    hotich: 'family', cutru: 'idcard', datdai: 'land', kinhdoanh: 'store',
    giaoduc: 'school', yte: 'health', giaothong: 'car', tuphap: 'scale',
  };
  function categoryIcon(code) { return CATEGORY_ICONS[code] || 'doc'; }

  // (#2) ServiceLevel "Level1".."Level4" → 'full' | 'partial'.
  // Quy ước: Level4 (toàn trình) → 'full', còn lại → 'partial'.
  function mapServiceLevel(level) { return level === 'Level4' ? 'full' : 'partial'; }
  // Chiều ngược: 'full' → Level4, 'partial' → Level3 (theo taxonomy đã chốt).
  function serviceLevelToApi(level) { return level === 'full' ? 'Level4' : 'Level3'; }

  // (#6b) Icon tĩnh cho loại phản ánh (API feedback-categories không trả icon).
  const FEEDBACK_ICONS = {
    road: 'road', env: 'leaf', flood: 'water', security: 'shield',
    construct: 'building', service: 'service', fire: 'fire', abuse: 'abuse', fraud: 'fraud',
  };
  function feedbackIcon(code) { return FEEDBACK_ICONS[code] || 'megaphone'; }

  // Giờ làm việc: { weekday, saturday } ↔ chuỗi WorkingHours (1 cột ở backend).
  // Quy ước nối bằng ' || ' để tách lại không nhập nhằng với dấu phẩy trong giờ.
  const HOURS_SEP = ' || ';
  function parseHours(text) {
    if (!text) return { weekday: '', saturday: '' };
    const parts = String(text).split(HOURS_SEP);
    return { weekday: (parts[0] || '').trim(), saturday: (parts[1] || '').trim() };
  }
  function hoursToApi(hours) {
    hours = hours || {};
    const wd = (hours.weekday || '').trim();
    const sat = (hours.saturday || '').trim();
    if (!wd && !sat) return null;
    return wd + HOURS_SEP + sat;
  }

  // documents (mảng [vi,en] hoặc chuỗi nhiều dòng) → requiredDocuments (chuỗi nối \n).
  function documentsToText(docs) {
    if (!docs) return '';
    if (typeof docs === 'string') {
      return docs.split('\n').map(function (s) { return s.trim(); }).filter(Boolean).join('\n');
    }
    return docs
      .map(function (d) { return Array.isArray(d) ? (d[0] || '') : String(d); })
      .map(function (s) { return s.trim(); })
      .filter(Boolean)
      .join('\n');
  }

  // (#3) Ngày yyyy-MM-dd (DateOnly) → dd/MM/yyyy để hiển thị.
  function formatDate(iso) {
    if (!iso) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
    return m ? (m[3] + '/' + m[2] + '/' + m[1]) : String(iso);
  }

  // DateTime ISO (UTC) → 'dd/MM/yyyy HH:mm' theo giờ địa phương.
  function formatDateTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    const p = function (n) { return String(n).padStart(2, '0'); };
    return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear() +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  // Guid → 8 ký tự đầu để hiển thị gọn (giữ raw cho tra cứu).
  function shortId(id) { return id ? String(id).slice(0, 8) : ''; }

  // (#5) requiredDocuments (chuỗi nối bằng \n) → [[vi, en], ...].
  // Chưa có bản tiếng Anh nên dùng chung tiếng Việt (fallback song ngữ).
  function parseDocuments(text) {
    if (!text) return [];
    return String(text)
      .split('\n')
      .map(function (s) { return s.trim(); })
      .filter(Boolean)
      .map(function (line) { return [line, line]; });
  }

  function num(v) { return typeof v === 'number' ? v : (Number(v) || 0); }

  // ---------- Bộ ánh xạ từng thực thể ----------

  // (#1) Song ngữ: API chỉ trả tiếng Việt cho category/service/point →
  // dùng tiếng Việt cho cả vi lẫn en (fallback) cho tới khi backend bổ sung.
  function mapCategory(c) {
    return {
      id: c.id,
      code: c.code,
      icon: categoryIcon(c.code),
      vi: c.name,
      en: c.name,
      description: c.description || '',
      displayOrder: c.displayOrder != null ? c.displayOrder : 0,
      active: c.isActive !== false,
      count: null, // (#6) API không trả count — tính lại ở getCategoriesWithCounts
    };
  }

  function mapFeedbackCategory(c) {
    return {
      id: c.id,
      code: c.code,
      icon: feedbackIcon(c.code),
      vi: c.name,
      en: c.name,
      active: c.isActive !== false,
    };
  }

  function mapProvince(p) {
    return {
      code: p.code, name: p.name, codeName: p.codeName || '',
      divisionType: p.divisionType || '', phoneCode: p.phoneCode || '',
    };
  }
  function mapWard(w) {
    return {
      code: w.code, name: w.name, codeName: w.codeName || '',
      divisionType: w.divisionType || '', provinceCode: w.provinceCode,
    };
  }

  function mapService(s) {
    return {
      id: s.id,
      categoryId: s.categoryId,
      code: s.code,
      featured: !!s.isFeatured,
      level: mapServiceLevel(s.serviceLevel),
      vi: s.name,
      en: s.name,
      descVi: s.description || '',
      descEn: s.description || '',
      documents: parseDocuments(s.requiredDocuments),
      processingDays: s.processingTimeDays != null ? s.processingTimeDays : 0,
      fee: num(s.fee),
    };
  }

  function mapServicePoint(p) {
    return {
      id: p.id,
      code: p.code,
      vi: p.name,
      en: p.name,
      type: p.type || 'Ubnd',
      address: p.address || '',
      provinceCode: p.provinceCode != null ? p.provinceCode : null,
      wardCode: p.wardCode != null ? p.wardCode : null,
      ward: '', // điền ở tầng page bằng tra cứu wardCode → tên
      lat: p.latitude != null ? Number(p.latitude) : null,
      lng: p.longitude != null ? Number(p.longitude) : null,
      open: p.isActive !== false, // API chỉ có isActive, không có "open"
      phone: p.phone || '',
      email: p.email || '',
      website: p.website || '',
      hours: parseHours(p.workingHours),
      workingHours: p.workingHours || '',
      serviceIds: p.serviceIds || [],
      images: p.images || [],
      rating: p.rating != null ? p.rating : 0,
      ratingCount: p.ratingCount != null ? p.ratingCount : 0,
    };
  }

  function mapAnnouncement(a) {
    return {
      id: a.id,
      tag: a.tag,
      date: formatDate(a.date),
      rawDate: a.date,
      vi: a.titleVi,
      en: a.titleEn || a.titleVi,
      bodyVi: a.bodyVi || '',
      bodyEn: a.bodyEn || a.bodyVi || '',
    };
  }

  // (#4) Stats: số thuần → chuỗi đã format (dấu phân cách nghìn, ký hiệu %).
  function mapStats(s) {
    s = s || {};
    return {
      services: num(s.totalServices).toLocaleString('vi-VN'),
      points: num(s.totalServicePoints).toLocaleString('vi-VN'),
      resolved: num(s.totalResolved).toLocaleString('vi-VN'),
      satisfaction: num(s.satisfactionRate).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%',
    };
  }

  // Người dùng (AdminUserDto) → shape autocomplete người nhận.
  function mapAdminUser(u) {
    return {
      id: u.id,
      name: u.fullName || u.username || u.email || u.id,
      phone: u.phone || '',
      email: u.email || '',
      roles: u.roles || [],
    };
  }

  // Chiến dịch thông báo đã gửi (NotificationCampaignDto) → mục lịch sử.
  // type enum "Push"/"Broadcast"/"Emergency" → khóa thường mà UI dùng.
  function mapNotificationCampaign(c) {
    return {
      id: c.id,
      type: String(c.type || '').toLowerCase(),
      at: formatDateTime(c.sentAt),
      title: c.title || '',
      message: c.message || '',
      recipients: num(c.recipientCount).toLocaleString('vi-VN'),
      audience: c.audience || '',
    };
  }

  // (#audit) Hành động backend "Created/Updated/Deleted" ↔ khóa UI (AUDIT_ACTION_META).
  const AUDIT_ACTION_TO_API = { create: 'Created', update: 'Updated', delete: 'Deleted' };
  const AUDIT_ACTION_FROM_API = { Created: 'create', Updated: 'update', Deleted: 'delete' };
  function auditActionToApi(a) { return AUDIT_ACTION_TO_API[a] || a; }
  function auditActionFromApi(a) { return AUDIT_ACTION_FROM_API[a] || String(a || '').toLowerCase(); }

  // Dòng nhật ký (AuditLogDto) → shape bảng audit của UI.
  function mapAuditLog(a) {
    return {
      id: a.id,
      at: formatDateTime(a.createdAt),
      rawAt: a.createdAt,
      user: a.actorUserId ? shortId(a.actorUserId) : '—',
      rawUser: a.actorUserId || null,
      action: auditActionFromApi(a.action),
      rawAction: a.action,
      entity: a.entityType || '',
      detail: a.entityId ? ('#' + shortId(a.entityId)) : '',
      ip: a.ipAddress || '—',
    };
  }

  // PagedResult<T> backend → shape phân trang mà UI dùng.
  function mapPaged(p, mapItem) {
    p = p || {};
    const items = (p.items || []).map(mapItem);
    const pageSize = p.pageSize || items.length || 1;
    const total = p.totalCount != null ? p.totalCount : items.length;
    return {
      items: items,
      page: p.page || 1,
      pageSize: pageSize,
      total: total,
      totalPages: p.totalPages != null ? p.totalPages : Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  // ---------- Cổng cán bộ: thống kê + hồ sơ + thông báo ----------

  // Overview KPIs: giữ số thuần, FE tự tính delta & format vi-VN.
  function mapManageOverview(s) {
    s = s || {};
    return {
      totalRequests: num(s.totalRequests),
      openRequests: num(s.openRequests),
      resolvedRequests: num(s.resolvedRequests),
      openFeedback: num(s.openFeedback),
      onTimeRate: num(s.onTimeRate), // phần trăm 0–100 (1 chữ số thập phân)
      requestsThisMonth: num(s.requestsThisMonth),
      requestsLastMonth: num(s.requestsLastMonth),
      feedbackThisMonth: num(s.feedbackThisMonth),
      feedbackLastMonth: num(s.feedbackLastMonth),
    };
  }

  // [{ month:"yyyy-MM", received, resolved }] → thêm m (số tháng) cho nhãn cột.
  function mapRequestsByMonth(list) {
    return (list || []).map(function (d) {
      const mm = /^(\d{4})-(\d{2})/.exec(String(d.month || ''));
      return {
        month: d.month || '',
        year: mm ? +mm[1] : null,
        m: mm ? +mm[2] : null,
        received: num(d.received),
        resolved: num(d.resolved),
      };
    });
  }

  // [{ categoryId, categoryName, count }] → shape thanh ngang.
  function mapFeedbackByCategory(list) {
    return (list || []).map(function (d) {
      return { id: d.categoryId, name: d.categoryName || '', count: num(d.count) };
    });
  }

  // [{ lat, lng, weight }] → bỏ điểm thiếu toạ độ.
  function mapFeedbackHeatmap(list) {
    return (list || [])
      .filter(function (p) { return p && p.lat != null && p.lng != null; })
      .map(function (p) { return { lat: Number(p.lat), lng: Number(p.lng), weight: num(p.weight) }; })
      .filter(function (p) { return !isNaN(p.lat) && !isNaN(p.lng); });
  }

  // ServiceRequestStatus (enum chuỗi) → khóa UI của STATUS_META.
  const REQUEST_STATUS_FROM_API = {
    Submitted: 'submitted', Received: 'received', Processing: 'processing',
    WaitingSupplement: 'waiting', Completed: 'completed', Rejected: 'rejected', Cancelled: 'cancelled',
  };
  function requestStatusFromApi(s) { return REQUEST_STATUS_FROM_API[s] || String(s || '').toLowerCase(); }

  // Chiều ngược: khóa UI → ServiceRequestStatus (PascalCase) để gửi lên backend.
  const REQUEST_STATUS_TO_API = {
    submitted: 'Submitted', received: 'Received', processing: 'Processing',
    waiting: 'WaitingSupplement', completed: 'Completed', rejected: 'Rejected', cancelled: 'Cancelled',
  };
  function requestStatusToApi(s) { return REQUEST_STATUS_TO_API[s] || s; }

  // Tình trạng hạn xử lý suy ra từ DueAt + trạng thái (API không trả sẵn).
  const CLOSED_REQUEST_STATUSES = { Completed: 1, Rejected: 1, Cancelled: 1 };
  function dueStateFromApi(dueAt, status) {
    if (CLOSED_REQUEST_STATUSES[status]) return 'done';
    if (!dueAt) return 'ok';
    const due = new Date(dueAt);
    if (isNaN(due.getTime())) return 'ok';
    const diff = due.getTime() - Date.now();
    if (diff < 0) return 'overdue';
    if (diff < 2 * 24 * 60 * 60 * 1000) return 'soon';
    return 'ok';
  }

  // ServiceRequestDto → dòng danh sách hồ sơ cán bộ.
  // citizenName đã có từ backend (OB2); fallback mã/Guid nếu rỗng.
  function mapManageRequest(r) {
    return {
      id: r.code || shortId(r.id),
      rawId: r.id,
      code: r.code || '',
      serviceId: r.publicServiceId,
      pointId: r.servicePointId != null ? r.servicePointId : null,
      officerId: r.assignedOfficerId != null ? r.assignedOfficerId : null,
      citizen: r.citizenName || shortId(r.citizenId),
      phone: r.citizenPhone || '',
      status: requestStatusFromApi(r.status),
      rawStatus: r.status,
      submitted: formatDateTime(r.submittedAt),
      submittedAt: r.submittedAt,
      due: r.dueAt ? formatDate(r.dueAt) : '',
      dueAt: r.dueAt || null,
      dueState: dueStateFromApi(r.dueAt, r.status),
      completedAt: r.completedAt || null,
    };
  }

  // Viết tắt tên (2 từ cuối): "Lê Thị Thu Trang" → "TT".
  function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return parts.slice(-2).map(function (w) { return w[0].toUpperCase(); }).join('');
  }

  // OfficerSummaryDto → mục danh bạ cán bộ (dropdown phân công + tra tên theo id).
  // Giữ nguyên shape ODATA.officers (id/name/dept/initials) để các thành phần dùng chung resolve được Guid thật.
  function mapOfficerSummary(o) {
    return {
      id: o.id,
      userId: o.userId,
      name: o.fullName || '',
      dept: { vi: o.department || o.position || '', en: o.department || o.position || '' },
      position: o.position || '',
      initials: initials(o.fullName),
    };
  }

  // RequestDocumentDto → mục tài liệu đính kèm.
  function mapRequestDocument(d) {
    return {
      id: d.id, url: d.url, documentType: d.documentType || '',
      fileName: d.fileName || '', isSupplement: !!d.isSupplement,
    };
  }

  // RequestCommentDto → mục trao đổi (authorId là userId, kèm sẵn authorName).
  function mapRequestComment(c) {
    return {
      id: c.id, authorId: c.authorId, authorName: c.authorName || '',
      content: c.content || '', isInternal: !!c.isInternal,
      at: formatDateTime(c.createdAt), rawAt: c.createdAt,
      initials: initials(c.authorName),
    };
  }

  // RequestHistoryDto → mục dòng thời gian xử lý.
  function mapRequestHistory(h) {
    return {
      fromStatus: h.fromStatus ? requestStatusFromApi(h.fromStatus) : null,
      status: requestStatusFromApi(h.toStatus),
      changedById: h.changedById || null,
      changedByName: h.changedByName || '',
      note: h.note || '',
      at: formatDateTime(h.changedAt), rawAt: h.changedAt,
    };
  }

  // ServiceRequestDto (đầy đủ) → chi tiết hồ sơ cho cán bộ.
  function mapManageRequestDetail(r) {
    const base = mapManageRequest(r);
    base.note = r.note || '';
    base.documents = (r.documents || []).map(mapRequestDocument);
    base.comments = (r.comments || []).map(mapRequestComment);
    base.history = (r.history || []).map(mapRequestHistory);
    return base;
  }

  // NotificationType → khóa chuông; RelatedEntityType → tuyến điều hướng.
  const NOTIF_KIND = {
    Request: 'request', Feedback: 'feedback',
    Announcement: 'announcement', System: 'system', Emergency: 'emergency',
  };
  const NOTIF_REF_ROUTE = { ServiceRequest: 'requests', FeedbackReport: 'feedback' };
  function notifKind(type) { return NOTIF_KIND[type] || 'system'; }

  // NotificationDto → mục chuông thông báo.
  function mapNotification(n) {
    return {
      id: n.id,
      kind: notifKind(n.type),
      read: !!n.isRead,
      at: formatDateTime(n.createdAt),
      rawAt: n.createdAt,
      title: n.title || '',
      text: n.message || n.title || '',
      refRoute: NOTIF_REF_ROUTE[n.relatedEntityType] || null,
      refId: n.relatedEntityId || null,
    };
  }

  // ---------- Cổng cán bộ: phản ánh hiện trường (api/manage/feedback) ----------

  // FeedbackStatus (enum chuỗi) ↔ khóa UI của FB_STATUS_META.
  const FEEDBACK_STATUS_FROM_API = {
    Submitted: 'submitted', Received: 'received', Assigned: 'assigned',
    Processing: 'processing', Resolved: 'resolved', Rejected: 'rejected', Closed: 'closed',
  };
  const FEEDBACK_STATUS_TO_API = {
    submitted: 'Submitted', received: 'Received', assigned: 'Assigned',
    processing: 'Processing', resolved: 'Resolved', rejected: 'Rejected', closed: 'Closed',
  };
  function feedbackStatusFromApi(s) { return FEEDBACK_STATUS_FROM_API[s] || String(s || '').toLowerCase(); }
  function feedbackStatusToApi(s) { return FEEDBACK_STATUS_TO_API[s] || s; }

  // FeedbackPriority (Low/Normal/High/Urgent) ↔ khóa UI (Normal↔medium).
  const FEEDBACK_PRIORITY_FROM_API = { Low: 'low', Normal: 'medium', High: 'high', Urgent: 'urgent' };
  const FEEDBACK_PRIORITY_TO_API = { low: 'Low', medium: 'Normal', high: 'High', urgent: 'Urgent' };
  function feedbackPriorityFromApi(p) { return FEEDBACK_PRIORITY_FROM_API[p] || String(p || '').toLowerCase(); }
  function feedbackPriorityToApi(p) { return FEEDBACK_PRIORITY_TO_API[p] || p; }

  // FeedbackAttachmentDto → mục bằng chứng đính kèm.
  function mapFeedbackAttachment(a) {
    return { id: a.id, url: a.url, fileName: a.fileName || '', contentType: a.contentType || '' };
  }

  // FeedbackCommentDto → mục trao đổi (authorId là userId, kèm sẵn authorName + cờ isInternal).
  function mapFeedbackComment(c) {
    return {
      id: c.id, authorId: c.authorId, authorName: c.authorName || '',
      content: c.content || '', isInternal: !!c.isInternal,
      at: formatDateTime(c.createdAt), rawAt: c.createdAt,
      initials: initials(c.authorName),
    };
  }

  // FeedbackHistoryDto → mục dòng thời gian xử lý.
  function mapFeedbackHistory(h) {
    return {
      fromStatus: h.fromStatus ? feedbackStatusFromApi(h.fromStatus) : null,
      status: feedbackStatusFromApi(h.toStatus),
      changedById: h.changedById || null,
      changedByName: h.changedByName || '',
      note: h.note || '',
      at: formatDateTime(h.changedAt), rawAt: h.changedAt,
    };
  }

  // FeedbackReportDto → dòng danh sách phản ánh cho cán bộ.
  function mapManageFeedback(r) {
    return {
      id: r.code || shortId(r.id),
      rawId: r.id,
      code: r.code || '',
      categoryId: r.categoryId,
      citizenId: r.citizenId,
      citizen: r.citizenName || shortId(r.citizenId),
      phone: r.citizenPhone || '',
      title: r.title || '',
      desc: r.description || '',
      address: r.address || '',
      lat: r.latitude != null ? Number(r.latitude) : null,
      lng: r.longitude != null ? Number(r.longitude) : null,
      provinceCode: r.provinceCode != null ? r.provinceCode : null,
      wardCode: r.wardCode != null ? r.wardCode : null,
      status: feedbackStatusFromApi(r.status),
      rawStatus: r.status,
      priority: feedbackPriorityFromApi(r.priority),
      rawPriority: r.priority,
      officerId: r.assignedOfficerId != null ? r.assignedOfficerId : null,
      submitted: formatDateTime(r.submittedAt),
      submittedAt: r.submittedAt,
      due: r.dueAt ? formatDate(r.dueAt) : '',
      dueAt: r.dueAt || null,
      resolvedAt: r.resolvedAt || null,
      closedAt: r.closedAt || null,
    };
  }

  // FeedbackReportDto (đầy đủ) → chi tiết phản ánh (kèm tệp, trao đổi, lịch sử).
  function mapManageFeedbackDetail(r) {
    const base = mapManageFeedback(r);
    base.attachments = (r.attachments || []).map(mapFeedbackAttachment);
    base.comments = (r.comments || []).map(mapFeedbackComment);
    base.history = (r.history || []).map(mapFeedbackHistory);
    return base;
  }

  // ---------- Bộ dựng payload (frontend shape → DTO backend) ----------

  // Đối tượng broadcast: khóa UI 'all'|'ward'|'officers' → enum NotificationAudience.
  const AUDIENCE_TO_API = { all: 'All', ward: 'Ward', officers: 'Officers' };
  function broadcastDto(form) {
    return {
      audience: AUDIENCE_TO_API[form.audience] || 'All',
      wardCode: form.wardCode != null && form.wardCode !== '' ? +form.wardCode : null,
      department: form.department ? String(form.department) : null,
      title: (form.title || '').trim(),
      message: form.message || '',
    };
  }

  function categoryCreateDto(form) {
    return {
      code: (form.code || '').trim(),
      name: (form.vi || form.en || '').trim(),
      description: form.description ? String(form.description) : null,
      parentId: form.parentId || null,
      displayOrder: form.displayOrder != null ? +form.displayOrder : 0,
    };
  }
  function categoryUpdateDto(form) {
    return {
      name: (form.vi || form.en || '').trim(),
      description: form.description ? String(form.description) : null,
      parentId: form.parentId || null,
      displayOrder: form.displayOrder != null ? +form.displayOrder : 0,
      isActive: form.active !== false,
    };
  }

  function serviceCreateDto(form) {
    return {
      categoryId: form.categoryId,
      code: (form.code || '').trim(),
      name: (form.vi || form.en || '').trim(),
      description: form.descVi || form.description || null,
      requiredDocuments: documentsToText(form.docsText != null ? form.docsText : form.documents) || null,
      processingTimeDays: form.processingDays != null && form.processingDays !== '' ? +form.processingDays : null,
      fee: +form.fee || 0,
      serviceLevel: serviceLevelToApi(form.level),
    };
  }
  function serviceUpdateDto(form) {
    return {
      categoryId: form.categoryId,
      name: (form.vi || form.en || '').trim(),
      description: form.descVi || form.description || null,
      requiredDocuments: documentsToText(form.docsText != null ? form.docsText : form.documents) || null,
      processingTimeDays: form.processingDays != null && form.processingDays !== '' ? +form.processingDays : null,
      fee: +form.fee || 0,
      serviceLevel: serviceLevelToApi(form.level),
      isActive: form.active !== false,
    };
  }

  function feedbackCategoryCreateDto(form) {
    return { code: (form.code || '').trim(), name: (form.vi || form.en || '').trim() };
  }
  function feedbackCategoryUpdateDto(form) {
    return { name: (form.vi || form.en || '').trim(), isActive: form.active !== false };
  }

  function pointBaseDto(form) {
    return {
      name: (form.vi || form.en || '').trim(),
      type: form.type || 'Ubnd',
      address: (form.address || '').trim(),
      provinceCode: form.provinceCode != null && form.provinceCode !== '' ? +form.provinceCode : null,
      wardCode: form.wardCode != null && form.wardCode !== '' ? +form.wardCode : null,
      latitude: form.lat != null ? form.lat : null,
      longitude: form.lng != null ? form.lng : null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      workingHours: hoursToApi(form.hours),
      serviceIds: form.serviceIds || [],
    };
  }
  function pointCreateDto(form) {
    return Object.assign({ code: (form.code || '').trim() }, pointBaseDto(form));
  }
  function pointUpdateDto(form) {
    return Object.assign(pointBaseDto(form), { isActive: form.open !== false });
  }

  function provinceCreateDto(form) {
    return {
      code: +form.code, name: (form.name || '').trim(),
      codeName: form.codeName || null, divisionType: form.divisionType || null, phoneCode: form.phoneCode || null,
    };
  }
  function provinceUpdateDto(form) {
    return {
      name: (form.name || '').trim(),
      codeName: form.codeName || null, divisionType: form.divisionType || null, phoneCode: form.phoneCode || null,
    };
  }
  function wardCreateDto(form) {
    return {
      code: +form.code, name: (form.name || '').trim(),
      codeName: form.codeName || null, divisionType: form.divisionType || null, provinceCode: +form.provinceCode,
    };
  }
  function wardUpdateDto(form) {
    return {
      name: (form.name || '').trim(),
      codeName: form.codeName || null, divisionType: form.divisionType || null, provinceCode: +form.provinceCode,
    };
  }

  // ---------- API công khai ----------
  const API = {
    baseUrl: baseUrl,
    raw: fetchJson,

    getCategories: function (opts) {
      return fetchJson('/api/service-categories', opts)
        .then(function (list) { return (list || []).map(mapCategory); });
    },

    // Danh mục kèm số dịch vụ trong từng lĩnh vực (tính từ /public-services).
    getCategoriesWithCounts: function (opts) {
      return Promise.all([
        fetchJson('/api/service-categories', opts),
        fetchJson('/api/public-services', opts),
      ]).then(function (res) {
        const cats = res[0] || [];
        const services = res[1] || [];
        const counts = {};
        services.forEach(function (s) { counts[s.categoryId] = (counts[s.categoryId] || 0) + 1; });
        return cats.map(function (c) {
          const m = mapCategory(c);
          m.count = counts[c.id] || 0;
          return m;
        });
      });
    },

    getServices: function (params, opts) {
      params = params || {};
      const qs = [];
      if (params.featured != null) qs.push('featured=' + (params.featured ? 'true' : 'false'));
      if (params.categoryId) qs.push('categoryId=' + encodeURIComponent(params.categoryId));
      const path = '/api/public-services' + (qs.length ? ('?' + qs.join('&')) : '');
      return fetchJson(path, opts).then(function (list) { return (list || []).map(mapService); });
    },

    getFeaturedServices: function (opts) {
      return API.getServices({ featured: true }, opts);
    },

    getService: function (id, opts) {
      return fetchJson('/api/public-services/' + encodeURIComponent(id), opts)
        .then(function (s) { return s ? mapService(s) : null; });
    },

    getServicePoints: function (opts) {
      return fetchJson('/api/service-points', opts).then(function (list) {
        return (list || [])
          .map(mapServicePoint)
          .filter(function (p) { return p.lat != null && p.lng != null; });
      });
    },

    getStats: function (opts) {
      return fetchJson('/api/stats', opts).then(mapStats);
    },

    getAnnouncements: function (tag, opts) {
      const path = '/api/announcements' +
        (tag && tag !== 'all' ? ('?tag=' + encodeURIComponent(tag)) : '');
      return fetchJson(path, opts).then(function (list) { return (list || []).map(mapAnnouncement); });
    },

    getAnnouncement: function (id, opts) {
      return fetchJson('/api/announcements/' + encodeURIComponent(id), opts)
        .then(function (a) { return a ? mapAnnouncement(a) : null; });
    },

    // Loại phản ánh đang hoạt động (đọc công khai).
    getFeedbackCategories: function (opts) {
      return fetchJson('/api/feedback/categories', opts)
        .then(function (l) { return (l || []).map(mapFeedbackCategory); });
    },

    // ----- Geo công khai (đọc) -----
    getProvinces: function (opts) {
      return fetchJson('/api/provinces', opts).then(function (l) { return (l || []).map(mapProvince); });
    },
    getWards: function (provinceCode, opts) {
      return fetchJson('/api/provinces/' + enc(provinceCode) + '/wards', opts)
        .then(function (l) { return (l || []).map(mapWard); });
    },
    // Toàn bộ phường/xã (gộp mọi tỉnh) — phục vụ tra cứu ward theo tên/mã.
    getAllWards: function (opts) {
      return fetchJson('/api/provinces', opts).then(function (provs) {
        return Promise.all((provs || []).map(function (p) {
          return fetchJson('/api/provinces/' + enc(p.code) + '/wards', opts)
            .then(function (l) { return (l || []).map(mapWard); });
        })).then(function (lists) {
          return lists.reduce(function (acc, l) { return acc.concat(l); }, []);
        });
      });
    },

    // ----- Admin CRUD ([Authorize] admin,super — cần token) -----
    admin: {
      // Service categories
      getCategories: function (opts) {
        return fetchJson('/api/admin/service-categories', opts).then(function (l) { return (l || []).map(mapCategory); });
      },
      // Danh mục kèm số dịch vụ (gộp với /public-services).
      getCategoriesWithCounts: function (opts) {
        return Promise.all([
          fetchJson('/api/admin/service-categories', opts),
          fetchJson('/api/public-services', opts),
        ]).then(function (res) {
          const cats = res[0] || [], services = res[1] || [], counts = {};
          services.forEach(function (s) { counts[s.categoryId] = (counts[s.categoryId] || 0) + 1; });
          return cats.map(function (c) { const m = mapCategory(c); m.count = counts[c.id] || 0; return m; });
        });
      },
      createCategory: function (form, opts) {
        return write('/api/admin/service-categories', 'POST', categoryCreateDto(form), opts).then(mapCategory);
      },
      updateCategory: function (id, form, opts) {
        return write('/api/admin/service-categories/' + enc(id), 'PUT', categoryUpdateDto(form), opts).then(mapCategory);
      },
      deleteCategory: function (id, opts) {
        return write('/api/admin/service-categories/' + enc(id), 'DELETE', undefined, opts);
      },

      // Public services (đọc dùng endpoint công khai — chỉ trả mục đang hoạt động)
      getServices: function (params, opts) { return API.getServices(params, opts); },
      createService: function (form, opts) {
        return write('/api/admin/public-services', 'POST', serviceCreateDto(form), opts).then(mapService);
      },
      updateService: function (id, form, opts) {
        return write('/api/admin/public-services/' + enc(id), 'PUT', serviceUpdateDto(form), opts).then(mapService);
      },
      deleteService: function (id, opts) {
        return write('/api/admin/public-services/' + enc(id), 'DELETE', undefined, opts);
      },

      // Feedback categories
      getFeedbackCategories: function (opts) {
        return fetchJson('/api/admin/feedback-categories', opts).then(function (l) { return (l || []).map(mapFeedbackCategory); });
      },
      createFeedbackCategory: function (form, opts) {
        return write('/api/admin/feedback-categories', 'POST', feedbackCategoryCreateDto(form), opts).then(mapFeedbackCategory);
      },
      updateFeedbackCategory: function (id, form, opts) {
        return write('/api/admin/feedback-categories/' + enc(id), 'PUT', feedbackCategoryUpdateDto(form), opts).then(mapFeedbackCategory);
      },
      deleteFeedbackCategory: function (id, opts) {
        return write('/api/admin/feedback-categories/' + enc(id), 'DELETE', undefined, opts);
      },

      // Service points (đọc dùng endpoint công khai — chỉ trả điểm đang hoạt động)
      getPoints: function (opts) {
        return fetchJson('/api/service-points', opts).then(function (l) { return (l || []).map(mapServicePoint); });
      },
      createPoint: function (form, opts) {
        return write('/api/admin/service-points', 'POST', pointCreateDto(form), opts).then(mapServicePoint);
      },
      updatePoint: function (id, form, opts) {
        return write('/api/admin/service-points/' + enc(id), 'PUT', pointUpdateDto(form), opts).then(mapServicePoint);
      },
      deletePoint: function (id, opts) {
        return write('/api/admin/service-points/' + enc(id), 'DELETE', undefined, opts);
      },

      // Geo — provinces & wards (taxonomy 2 cấp: Tỉnh → Phường/Xã)
      getProvinces: function (opts) {
        return fetchJson('/api/admin/geo/provinces', opts).then(function (l) { return (l || []).map(mapProvince); });
      },
      createProvince: function (form, opts) {
        return write('/api/admin/geo/provinces', 'POST', provinceCreateDto(form), opts).then(mapProvince);
      },
      updateProvince: function (code, form, opts) {
        return write('/api/admin/geo/provinces/' + enc(code), 'PUT', provinceUpdateDto(form), opts).then(mapProvince);
      },
      deleteProvince: function (code, opts) {
        return write('/api/admin/geo/provinces/' + enc(code), 'DELETE', undefined, opts);
      },
      getWards: function (provinceCode, opts) {
        return fetchJson('/api/admin/geo/provinces/' + enc(provinceCode) + '/wards', opts)
          .then(function (l) { return (l || []).map(mapWard); });
      },
      createWard: function (form, opts) {
        return write('/api/admin/geo/wards', 'POST', wardCreateDto(form), opts).then(mapWard);
      },
      updateWard: function (code, form, opts) {
        return write('/api/admin/geo/wards/' + enc(code), 'PUT', wardUpdateDto(form), opts).then(mapWard);
      },
      deleteWard: function (code, opts) {
        return write('/api/admin/geo/wards/' + enc(code), 'DELETE', undefined, opts);
      },

      // Người dùng — tìm theo tên/sđt/email (autocomplete người nhận push).
      searchUsers: function (search, opts) {
        const path = '/api/admin/users' + qsFrom({ pageSize: 8, search: (search || '').trim() });
        return fetchJson(path, opts).then(function (p) { return mapPaged(p, mapAdminUser).items; });
      },

      // ----- Thông báo đẩy (api/manage/notifications) -----
      notifications: {
        getHistory: function (params, opts) {
          params = params || {};
          const path = '/api/manage/notifications/history' +
            qsFrom({ page: params.page || 1, pageSize: params.pageSize || 20 });
          return fetchJson(path, opts).then(function (p) { return mapPaged(p, mapNotificationCampaign); });
        },
        // Gửi tới danh sách người dùng cụ thể.
        push: function (form, opts) {
          return write('/api/manage/notifications/push', 'POST', {
            userIds: (form.userIds || []).filter(Boolean),
            title: (form.title || '').trim(),
            message: form.message || '',
            type: form.type || 'System',
          }, opts).then(mapNotificationCampaign);
        },
        // Broadcast theo đối tượng (toàn dân / phường / cán bộ).
        broadcast: function (form, opts) {
          return write('/api/manage/notifications/broadcast', 'POST', broadcastDto(form), opts)
            .then(mapNotificationCampaign);
        },
        // Cảnh báo khẩn cấp tới toàn bộ công dân.
        emergency: function (form, opts) {
          return write('/api/manage/notifications/emergency', 'POST', {
            title: (form.title || '').trim(),
            message: form.message || '',
          }, opts).then(mapNotificationCampaign);
        },
      },

      // ----- Nhật ký hệ thống (api/admin/audit-logs, [Authorize] super) -----
      audit: {
        list: function (params, opts) {
          params = params || {};
          const path = '/api/admin/audit-logs' + qsFrom({
            page: params.page || 1,
            pageSize: params.pageSize || 20,
            action: params.action ? auditActionToApi(params.action) : null,
            entityType: params.entityType || null,
            from: params.from || null,
            to: params.to || null,
            search: params.search ? params.search.trim() : null,
          });
          return fetchJson(path, opts).then(function (p) { return mapPaged(p, mapAuditLog); });
        },
        // Tải CSV đã lọc (cùng bộ lọc list, bỏ page/pageSize). Trả tên file đã tải.
        exportCsv: function (params, opts) {
          params = params || {};
          const path = '/api/admin/audit-logs/export' + qsFrom({
            action: params.action ? auditActionToApi(params.action) : null,
            entityType: params.entityType || null,
            from: params.from || null,
            to: params.to || null,
            search: params.search ? params.search.trim() : null,
          });
          return downloadFile(path, 'audit-logs.csv', opts);
        },
      },
    },

    // ----- Cổng cán bộ: thống kê dashboard (api/manage/stats, [Authorize] officer+) -----
    manage: {
      stats: {
        overview: function (opts) {
          return fetchJson('/api/manage/stats/overview', opts).then(mapManageOverview);
        },
        requestsByMonth: function (months, opts) {
          const path = '/api/manage/stats/requests-by-month' + qsFrom({ months: months || 6 });
          return fetchJson(path, opts).then(mapRequestsByMonth);
        },
        feedbackByCategory: function (opts) {
          return fetchJson('/api/manage/stats/feedback-by-category', opts).then(mapFeedbackByCategory);
        },
        feedbackHeatmap: function (opts) {
          return fetchJson('/api/manage/stats/feedback-heatmap', opts).then(mapFeedbackHeatmap);
        },
      },
      // Danh sách hồ sơ cho cán bộ (api/manage/service-requests). Trả PagedResult.
      // params.status nhận khóa UI ('submitted'…) — tự ánh xạ sang enum backend.
      requests: function (params, opts) {
        params = params || {};
        const path = '/api/manage/service-requests' + qsFrom({
          status: params.status ? requestStatusToApi(params.status) : null,
          assignedOfficerId: params.assignedOfficerId || null,
          publicServiceId: params.publicServiceId || null,
          servicePointId: params.servicePointId || null,
          page: params.page || 1,
          pageSize: params.pageSize || 20,
        });
        return fetchJson(path, opts).then(function (p) { return mapPaged(p, mapManageRequest); });
      },

      // Chi tiết một hồ sơ (kèm tài liệu, trao đổi nội bộ, lịch sử).
      request: function (id, opts) {
        return fetchJson('/api/manage/service-requests/' + enc(id), opts)
          .then(function (r) { return r ? mapManageRequestDetail(r) : null; });
      },

      // Phân công cán bộ xử lý (officerId = id hồ sơ cán bộ — OfficerProfile.Id).
      assign: function (id, officerId, opts) {
        return write('/api/manage/service-requests/' + enc(id) + '/assign', 'POST', { officerId: officerId }, opts)
          .then(mapManageRequestDetail);
      },

      // Đổi trạng thái theo workflow. status nhận khóa UI; backend trả 400/422 nếu không hợp lệ.
      changeStatus: function (id, status, note, opts) {
        return write('/api/manage/service-requests/' + enc(id) + '/status', 'POST',
          { status: requestStatusToApi(status), note: note || null }, opts)
          .then(mapManageRequestDetail);
      },

      // Yêu cầu bổ sung (chuyển sang WaitingSupplement).
      requestSupplement: function (id, note, opts) {
        return write('/api/manage/service-requests/' + enc(id) + '/request-supplement', 'POST',
          { status: 'WaitingSupplement', note: note || null }, opts)
          .then(mapManageRequestDetail);
      },

      // Thêm trao đổi (nội bộ mặc định cho cổng cán bộ).
      addComment: function (id, content, isInternal, opts) {
        return write('/api/manage/service-requests/' + enc(id) + '/comments', 'POST',
          { content: content, isInternal: isInternal !== false }, opts)
          .then(mapRequestComment);
      },

      // Đính kèm tài liệu (theo URL). isSupplement=false: tài liệu kết quả của cán bộ.
      addDocument: function (id, doc, opts) {
        doc = doc || {};
        return write('/api/manage/service-requests/' + enc(id) + '/documents', 'POST', {
          url: (doc.url || '').trim(),
          documentType: doc.documentType || null,
          fileName: doc.fileName ? String(doc.fileName).trim() : null,
          isSupplement: !!doc.isSupplement,
        }, opts).then(mapRequestDocument);
      },

      // Danh bạ cán bộ đang hoạt động (OF1 — /api/manage/officers) cho dropdown phân công.
      officers: function (opts) {
        return fetchJson('/api/manage/officers', opts)
          .then(function (l) { return (l || []).map(mapOfficerSummary); });
      },

      // ----- Phản ánh hiện trường (api/manage/feedback) -----
      // params.status / params.priority nhận khóa UI — tự ánh xạ sang enum backend.
      feedback: function (params, opts) {
        params = params || {};
        const path = '/api/manage/feedback' + qsFrom({
          status: params.status ? feedbackStatusToApi(params.status) : null,
          priority: params.priority ? feedbackPriorityToApi(params.priority) : null,
          categoryId: params.categoryId || null,
          assignedOfficerId: params.assignedOfficerId || null,
          wardCode: params.wardCode != null && params.wardCode !== '' ? params.wardCode : null,
          page: params.page || 1,
          pageSize: params.pageSize || 20,
        });
        return fetchJson(path, opts).then(function (p) { return mapPaged(p, mapManageFeedback); });
      },

      // Chi tiết một phản ánh (kèm toạ độ bản đồ, tệp đính kèm, trao đổi, lịch sử).
      feedbackDetail: function (id, opts) {
        return fetchJson('/api/manage/feedback/' + enc(id), opts)
          .then(function (r) { return r ? mapManageFeedbackDetail(r) : null; });
      },

      // Phân công cán bộ xử lý phản ánh.
      assignFeedback: function (id, officerId, opts) {
        return write('/api/manage/feedback/' + enc(id) + '/assign', 'POST', { officerId: officerId }, opts)
          .then(mapManageFeedbackDetail);
      },

      // Đổi trạng thái phản ánh theo workflow. status nhận khóa UI; backend trả 400/422 nếu không hợp lệ.
      changeFeedbackStatus: function (id, status, note, opts) {
        return write('/api/manage/feedback/' + enc(id) + '/status', 'POST',
          { status: feedbackStatusToApi(status), note: note || null }, opts)
          .then(mapManageFeedbackDetail);
      },

      // Thêm trao đổi. isInternal=false → chat công dân (backend gửi cho công dân + sinh notification);
      // isInternal=true → thảo luận nội bộ (chỉ cán bộ thấy).
      addFeedbackComment: function (id, content, isInternal, opts) {
        return write('/api/manage/feedback/' + enc(id) + '/comments', 'POST',
          { content: content, isInternal: isInternal === true }, opts)
          .then(mapFeedbackComment);
      },
    },

    // ----- Chuông thông báo của người dùng hiện tại (api/notifications, [Authorize]) -----
    notifications: {
      list: function (unreadOnly, opts) {
        const path = '/api/notifications' + (unreadOnly ? '?unreadOnly=true' : '');
        return fetchJson(path, opts).then(function (l) { return (l || []).map(mapNotification); });
      },
      markRead: function (id, opts) {
        return write('/api/notifications/' + enc(id) + '/read', 'POST', undefined, opts);
      },
      markAllRead: function (opts) {
        return write('/api/notifications/read-all', 'POST', undefined, opts);
      },
    },

    // Hàm ánh xạ thuần (test / tái sử dụng).
    map: {
      category: mapCategory, service: mapService, servicePoint: mapServicePoint,
      feedbackCategory: mapFeedbackCategory, province: mapProvince, ward: mapWard,
      announcement: mapAnnouncement, stats: mapStats,
      adminUser: mapAdminUser, notificationCampaign: mapNotificationCampaign, auditLog: mapAuditLog,
      manageOverview: mapManageOverview, requestsByMonth: mapRequestsByMonth,
      feedbackByCategory: mapFeedbackByCategory, feedbackHeatmap: mapFeedbackHeatmap,
      manageRequest: mapManageRequest, manageRequestDetail: mapManageRequestDetail,
      officerSummary: mapOfficerSummary, requestDocument: mapRequestDocument,
      requestComment: mapRequestComment, requestHistory: mapRequestHistory,
      manageFeedback: mapManageFeedback, manageFeedbackDetail: mapManageFeedbackDetail,
      feedbackAttachment: mapFeedbackAttachment, feedbackComment: mapFeedbackComment,
      feedbackHistory: mapFeedbackHistory,
      feedbackStatusFromApi: feedbackStatusFromApi, feedbackStatusToApi: feedbackStatusToApi,
      feedbackPriorityFromApi: feedbackPriorityFromApi, feedbackPriorityToApi: feedbackPriorityToApi,
      notification: mapNotification,
      requestStatusFromApi: requestStatusFromApi, requestStatusToApi: requestStatusToApi,
      dueStateFromApi: dueStateFromApi, notifKind: notifKind,
      paged: mapPaged,
      serviceLevel: mapServiceLevel, serviceLevelToApi: serviceLevelToApi,
      auditActionToApi: auditActionToApi, auditActionFromApi: auditActionFromApi,
      documents: parseDocuments, documentsToText: documentsToText,
      hours: parseHours, hoursToApi: hoursToApi,
      date: formatDate, dateTime: formatDateTime, categoryIcon: categoryIcon, feedbackIcon: feedbackIcon,
      // payload builders (frontend → DTO)
      dto: {
        categoryCreate: categoryCreateDto, categoryUpdate: categoryUpdateDto,
        serviceCreate: serviceCreateDto, serviceUpdate: serviceUpdateDto,
        feedbackCategoryCreate: feedbackCategoryCreateDto, feedbackCategoryUpdate: feedbackCategoryUpdateDto,
        pointCreate: pointCreateDto, pointUpdate: pointUpdateDto,
        provinceCreate: provinceCreateDto, provinceUpdate: provinceUpdateDto,
        wardCreate: wardCreateDto, wardUpdate: wardUpdateDto,
        broadcast: broadcastDto,
      },
    },
  };

  // ---------- Hook React: tải dữ liệu + loading/error + reload ----------
  // Dùng được vì React UMD đã nạp trước api.js. Hook chỉ chạy lúc render.
  function useApiData(fetcher, deps) {
    const React = window.React;
    const [state, setState] = React.useState({ data: null, loading: true, error: null });
    const [nonce, setNonce] = React.useState(0);

    React.useEffect(function () {
      let active = true;
      const controller = ('AbortController' in window) ? new AbortController() : null;
      const signal = controller ? controller.signal : undefined;

      setState(function (prev) { return { data: prev.data, loading: true, error: null }; });

      Promise.resolve()
        .then(function () { return fetcher(signal); })
        .then(function (data) { if (active) setState({ data: data, loading: false, error: null }); })
        .catch(function (err) {
          if (!active || (err && err.name === 'AbortError')) return;
          setState({ data: null, loading: false, error: err });
        });

      return function () { active = false; if (controller) controller.abort(); };
      // eslint-disable-next-line
    }, (deps || []).concat(nonce));

    const reload = React.useCallback(function () { setNonce(function (n) { return n + 1; }); }, []);
    return { data: state.data, loading: state.loading, error: state.error, reload: reload };
  }

  window.API = API;
  window.useApiData = useApiData;
})();
