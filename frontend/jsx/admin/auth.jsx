// ============================================================
// Trang quản trị — Xác thực: màn đăng nhập + gate role admin/super.
// Bao ngoài AdminApp: chỉ render cổng khi đã đăng nhập và có quyền
// (admin / super). Phụ thuộc window.Auth (js/auth-api.js) — tầng xác thực
// dùng chung với Cổng cán bộ; api.js tự đính kèm Bearer + tự refresh khi 401.
// ============================================================

// Chỉ admin/super mới được vào Trang quản trị (chặt hơn officer của Cổng cán bộ).
const AD_ADMIN_ROLES = ['admin', 'super'];
function adHasAdminAccess(user) {
  const roles = ((user && user.roles) || []).map((r) => String(r).toLowerCase());
  return AD_ADMIN_ROLES.some((r) => roles.indexOf(r) !== -1);
}

// Viết tắt tên (2 từ cuối) — "Phạm Quốc Trung" → "QT".
function adInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(-2).map((w) => w[0].toUpperCase()).join('');
}

// Ghi danh tính quản trị viên thật vào window.ADATA.me (thay dữ liệu mock).
function adApplyIdentity(user) {
  const name = (user && user.name) || 'Quản trị viên';
  const roles = ((user && user.roles) || []).map((r) => String(r).toLowerCase());
  const isSuper = roles.indexOf('super') !== -1;
  window.ADATA.me = {
    id: (user && user.id) || null,
    userId: (user && user.id) || null,
    name: name,
    role: isSuper
      ? { vi: 'Quản trị cấp cao', en: 'Super Administrator' }
      : { vi: 'Quản trị viên hệ thống', en: 'System Administrator' },
    initials: adInitials(name),
    roles: (user && user.roles) || [],
  };
}

// ---------- Màn đăng nhập ----------
function AdminLogin({ lang, setLang, onSuccess }) {
  const t = useT(lang);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!email.trim() || !password) { setError(t('ad_login_required')); return; }
    setError('');
    setBusy(true);
    try {
      const user = await window.Auth.login(email, password);
      // Gate role: chỉ admin/super mới được vào.
      if (!adHasAdminAccess(user)) {
        await window.Auth.logout();
        setError(t('ad_login_err_forbidden'));
        setBusy(false);
        return;
      }
      adApplyIdentity(user);
      onSuccess(user);
    } catch (err) {
      const status = err && err.status;
      if (status === 400 || status === 401) setError(t('ad_login_err_credentials'));
      else if (status === 403) setError(t('ad_login_err_forbidden'));
      else setError(t('ad_login_err_generic'));
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20, background: 'var(--bg-soft)' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 408 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} aria-label="Switch language"
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid var(--line)', background: '#fff', borderRadius: 'var(--r-full)', padding: '6px 12px', fontWeight: 700, fontSize: 'var(--fs-13)', color: 'var(--ink-2)', cursor: 'pointer' }}>
            <Icon name="globe" size={15} />{lang === 'vi' ? 'VI' : 'EN'}
          </button>
        </div>
        <div className="card" style={{ padding: '32px 30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 24 }}>
            <Logo size={48} />
            <h1 style={{ fontSize: 'var(--fs-20)', marginTop: 14 }}>{t('ad_login_title')}</h1>
            <p style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>{t('ad_login_sub')}</p>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="field-label">{t('ad_login_email')}</span>
              <input className="input" type="email" autoComplete="username" autoFocus
                value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t('ad_login_email_ph')} disabled={busy} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span className="field-label">{t('ad_login_password')}</span>
              <input className="input" type="password" autoComplete="current-password"
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={t('ad_login_password_ph')} disabled={busy} />
            </label>

            {error &&
              <div role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'var(--danger-soft)', border: '1px solid var(--danger-border)', color: 'var(--danger)', borderRadius: 'var(--r-md)', padding: '10px 12px', fontSize: 'var(--fs-13)', fontWeight: 600 }}>
                <Icon name="alert" size={15} style={{ marginTop: 1 }} />
                <span>{error}</span>
              </div>}

            <button type="submit" className="btn btn-primary btn-lg" disabled={busy}
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {busy ? t('ad_login_signing') : t('ad_login_submit')}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <a href="Home.html" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--ink-3)' }}>
            <Icon name="arrowleft" size={15} />{t('ad_login_back_citizen')}
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------- Splash khi đang kiểm tra phiên ----------
function AdminAuthSplash({ lang }) {
  const t = useT(lang);
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-soft)', color: 'var(--ink-3)', fontSize: 'var(--fs-15)', gap: 14 }}>
      <Logo size={44} />
      <span>{t('ad_login_checking')}</span>
    </div>
  );
}

// ---------- Gate: checking → login → ready ----------
function AdminRoot() {
  const [lang, setLang] = React.useState(() => localStorage.getItem('qng-portal-lang') || 'vi');
  const [phase, setPhase] = React.useState('checking'); // checking | login | ready

  React.useEffect(() => { localStorage.setItem('qng-portal-lang', lang); document.documentElement.lang = lang; }, [lang]);

  // Kiểm tra phiên đã lưu khi tải trang.
  React.useEffect(() => {
    let active = true;
    (async () => {
      if (!window.Auth || !window.Auth.isAuthenticated()) { if (active) setPhase('login'); return; }
      try {
        const user = await window.Auth.me({ force: true });
        if (!adHasAdminAccess(user)) { window.Auth.clearSession(); if (active) setPhase('login'); return; }
        adApplyIdentity(user);
        if (active) setPhase('ready');
      } catch (e) {
        // Token hỏng / hết hạn không làm mới được.
        window.Auth.clearSession();
        if (active) setPhase('login');
      }
    })();
    return () => { active = false; };
  }, []);

  // Phiên hết hạn giữa chừng (refresh thất bại) → quay về đăng nhập.
  React.useEffect(() => {
    const onExpired = () => setPhase('login');
    window.addEventListener('qng-auth-expired', onExpired);
    return () => window.removeEventListener('qng-auth-expired', onExpired);
  }, []);

  const handleLogout = async () => {
    try { await window.Auth.logout(); } catch (e) { /* đã dọn local */ }
    setPhase('login');
  };

  if (phase === 'checking') return <AdminAuthSplash lang={lang} />;
  if (phase === 'login') return <AdminLogin lang={lang} setLang={setLang} onSuccess={() => setPhase('ready')} />;
  return <AdminApp onLogout={handleLogout} />;
}
