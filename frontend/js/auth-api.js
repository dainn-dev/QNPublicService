// ============================================================
// Tầng xác thực dùng chung — login / token / refresh / logout / me.
// Dùng cho CẢ Cổng cán bộ (Manage.html) lẫn Trang quản trị (Administator.html).
// Nạp NGAY SAU js/api.js: chia sẻ khóa token 'qng-api-token' mà api.js đọc,
// và đăng ký hook làm mới token để api.js tự retry khi gặp 401.
//
// Expose: window.Auth
//   - login(email, password)         → đăng nhập, lưu token + nạp hồ sơ /me
//   - logout()                       → thu hồi phiên ở server + xóa sạch local
//   - me({ force })                  → GET /api/auth/me (có cache trong phiên)
//   - getCurrentOfficer({ force })   → map UserId(/me) → OfficerProfile.Id
//   - isAuthenticated()              → có access token hay không
//   - getToken() / getUser()        → đọc token / hồ sơ /me đã cache
//   - hasRole(role) / hasAnyRole([]) / hasOfficerAccess()
//   - tryRefresh()                   → làm mới access token (single-flight)
//
// Sự kiện: phát 'qng-auth-expired' trên window khi refresh thất bại (phiên hết
// hạn) để lớp UI quay về màn đăng nhập.
// ============================================================
(function () {
  'use strict';

  const DEFAULT_BASE = 'http://localhost:5134';
  // Khóa localStorage — 'qng-api-token' trùng với khóa api.js đọc khi đính kèm Bearer.
  const K_ACCESS = 'qng-api-token';
  const K_REFRESH = 'qng-api-refresh';
  const K_USER = 'qng-api-user';
  const K_OFFICER = 'qng-officer';

  // Vai trò được phép vào Cổng cán bộ (officer/admin/super).
  const OFFICER_ROLES = ['officer', 'admin', 'super'];

  function readStored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStored(key, value) {
    try {
      if (value == null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch (e) { /* private mode — bỏ qua */ }
  }
  function baseUrl() {
    // Dùng chung cấu hình base với api.js nếu đã nạp.
    if (window.API && typeof window.API.baseUrl === 'function') return window.API.baseUrl();
    const configured = (window.API_BASE_URL || readStored('qng-api-base') || DEFAULT_BASE);
    return String(configured).replace(/\/+$/, '');
  }

  function getToken() { return readStored(K_ACCESS); }
  function getRefreshToken() { return readStored(K_REFRESH); }
  function isAuthenticated() { return !!getToken(); }

  // Lưu cặp token từ AuthResult ({ accessToken, refreshToken, ... }).
  function storeTokens(result) {
    if (!result || !result.accessToken) return false;
    writeStored(K_ACCESS, result.accessToken);
    if (result.refreshToken) writeStored(K_REFRESH, result.refreshToken);
    return true;
  }

  // Xóa toàn bộ dấu vết phiên (token + cache /me + cache officer).
  function clearSession() {
    writeStored(K_ACCESS, null);
    writeStored(K_REFRESH, null);
    writeStored(K_USER, null);
    writeStored(K_OFFICER, null);
    cachedUser = null;
    cachedOfficer = null;
  }

  // Fetch thuần cho các endpoint /api/auth/* — KHÔNG dùng vòng retry-401 của
  // api.js để tránh đệ quy với chính endpoint refresh.
  async function rawFetch(path, opts) {
    opts = opts || {};
    const headers = { Accept: 'application/json' };
    if (opts.body != null) headers['Content-Type'] = 'application/json';
    if (opts.auth !== false) {
      const token = getToken();
      if (token) headers.Authorization = 'Bearer ' + token;
    }
    const res = await fetch(baseUrl() + path, {
      method: opts.method || 'GET',
      headers: headers,
      body: opts.body != null ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
    if (!res.ok) {
      let detail = '';
      try { detail = await res.text(); } catch (e) { /* bỏ qua */ }
      const err = new Error('AUTH ' + res.status + ' — ' + path + (detail ? (' — ' + detail) : ''));
      err.status = res.status;
      err.body = detail;
      throw err;
    }
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  // ---------- Cache trong phiên ----------
  let cachedUser = null;     // kết quả /api/auth/me
  let cachedOfficer = null;  // { profileId, userId, fullName, department, position } | null
  let refreshPromise = null; // single-flight cho tryRefresh()

  function loadCaches() {
    if (cachedUser == null) { try { cachedUser = JSON.parse(readStored(K_USER) || 'null'); } catch (e) { cachedUser = null; } }
    if (cachedOfficer == null) { try { cachedOfficer = JSON.parse(readStored(K_OFFICER) || 'null'); } catch (e) { cachedOfficer = null; } }
  }
  loadCaches();

  function getUser() { loadCaches(); return cachedUser; }

  function rolesOf(user) {
    user = user || getUser();
    const roles = (user && user.roles) || [];
    return roles.map(function (r) { return String(r).toLowerCase(); });
  }
  function hasRole(role) { return rolesOf().indexOf(String(role).toLowerCase()) !== -1; }
  function hasAnyRole(list) {
    const have = rolesOf();
    return (list || []).some(function (r) { return have.indexOf(String(r).toLowerCase()) !== -1; });
  }
  function hasOfficerAccess(user) {
    const have = rolesOf(user);
    return OFFICER_ROLES.some(function (r) { return have.indexOf(r) !== -1; });
  }

  // ---------- Làm mới access token (single-flight) ----------
  // Trả về access token mới, hoặc null nếu không thể làm mới (phiên hết hạn).
  function tryRefresh() {
    if (refreshPromise) return refreshPromise;
    const rt = getRefreshToken();
    if (!rt) return Promise.resolve(null);

    refreshPromise = rawFetch('/api/auth/refresh', { method: 'POST', body: { refreshToken: rt }, auth: false })
      .then(function (result) {
        if (storeTokens(result)) return getToken();
        throw new Error('refresh: phản hồi thiếu accessToken');
      })
      .catch(function () {
        // Refresh hỏng → phiên hết hạn: dọn sạch và báo cho UI.
        clearSession();
        try { window.dispatchEvent(new CustomEvent('qng-auth-expired')); } catch (e) { /* bỏ qua */ }
        return null;
      })
      .then(function (token) { refreshPromise = null; return token; });
    return refreshPromise;
  }

  // ---------- /api/auth/me ----------
  async function me(opts) {
    opts = opts || {};
    if (!opts.force) { loadCaches(); if (cachedUser) return cachedUser; }
    const user = await rawFetch('/api/auth/me', { signal: opts.signal });
    cachedUser = user;
    writeStored(K_USER, JSON.stringify(user));
    return user;
  }

  // ---------- Đăng nhập ----------
  // POST /api/auth/login → lưu token → nạp /me. KHÔNG kiểm tra vai trò ở đây;
  // việc chặn theo role do lớp gate quyết định (xem hasOfficerAccess).
  async function login(email, password, opts) {
    opts = opts || {};
    const result = await rawFetch('/api/auth/login', {
      method: 'POST', auth: false,
      body: { email: (email || '').trim(), password: password || '' },
      signal: opts.signal,
    });
    if (!storeTokens(result)) throw new Error('login: phản hồi thiếu accessToken');
    const user = await me({ force: true, signal: opts.signal });
    return user;
  }

  // ---------- Đăng xuất ----------
  async function logout() {
    try { await rawFetch('/api/auth/logout', { method: 'POST' }); }
    catch (e) { /* thu hồi server best-effort — vẫn dọn local */ }
    finally { clearSession(); }
  }

  // ---------- Xác định OfficerProfile của chính mình ----------
  // /me chỉ trả user id + roles (không có OfficerProfile.Id). Gọi
  // GET /api/manage/officers rồi khớp userId === me.id để lấy profileId.
  async function getCurrentOfficer(opts) {
    opts = opts || {};
    if (!opts.force) { loadCaches(); if (cachedOfficer) return cachedOfficer; }

    const user = await me({ signal: opts.signal });
    const myId = user && user.id ? String(user.id).toLowerCase() : null;
    if (!myId) return null;

    const list = (await rawFetch('/api/manage/officers', { signal: opts.signal })) || [];
    const match = list.find(function (o) {
      return o && o.userId && String(o.userId).toLowerCase() === myId;
    });
    if (!match) { cachedOfficer = null; writeStored(K_OFFICER, null); return null; }

    cachedOfficer = {
      profileId: match.id,
      userId: match.userId,
      fullName: match.fullName || (user && user.name) || '',
      department: match.department || '',
      position: match.position || '',
    };
    writeStored(K_OFFICER, JSON.stringify(cachedOfficer));
    return cachedOfficer;
  }

  function getOfficer() { loadCaches(); return cachedOfficer; }

  window.Auth = {
    baseUrl: baseUrl,
    login: login,
    logout: logout,
    me: me,
    getCurrentOfficer: getCurrentOfficer,
    getOfficer: getOfficer,
    tryRefresh: tryRefresh,
    isAuthenticated: isAuthenticated,
    getToken: getToken,
    getUser: getUser,
    hasRole: hasRole,
    hasAnyRole: hasAnyRole,
    hasOfficerAccess: hasOfficerAccess,
    clearSession: clearSession,
    OFFICER_ROLES: OFFICER_ROLES.slice(),
  };
})();
