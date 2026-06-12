// ============================================================
// Trang quản trị — Shell (sidebar + topbar)
// Cần: components.jsx, officer/shell.jsx (Modal, Toast)
// ============================================================

function AdminShell({ lang, setLang, route, navigate, children }) {
  const t = useT(lang);
  const [navOpen, setNavOpen] = React.useState(false);
  const me = window.ADATA.me;
  const nav = [
  { route: 'users', icon: 'user', key: 'ad_users' },
  { route: 'officers', icon: 'shield', key: 'ad_officers' },
  { route: 'services', icon: 'doc', key: 'c_services' },
  { route: 'points', icon: 'mappin', key: 'ad_points' },
  { route: 'catalogs', icon: 'land', key: 'ad_catalogs' },
  { route: 'notifications', icon: 'bell', key: 'ad_notifications' },
  { route: 'audit', icon: 'filesearch', key: 'ad_audit' }];

  const isActive = (r) => route === r || route.startsWith(r + '/');

  return (
    <div className="ad-layout" style={{ display: 'grid', gridTemplateColumns: '248px 1fr', minHeight: '100vh', background: 'var(--bg-soft)' }}>
      <aside className={'ad-sidebar' + (navOpen ? ' open' : '')}
      style={{ background: 'var(--ink)', color: '#D6D3D1', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 1100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '20px 20px 18px' }}>
          <Logo size={36} />
          <span style={{ lineHeight: 1.2 }}>
            <strong style={{ display: 'block', color: '#fff', fontSize: 'var(--fs-14)' }}>{t('ad_portal')}</strong>
            <span style={{ fontSize: 'var(--fs-12)' }}>{t('city')}</span>
          </span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '8px 12px', flex: 1 }}>
          {nav.map((n) =>
          <button key={n.route} onClick={() => {navigate(n.route);setNavOpen(false);}}
          style={{ display: 'flex', alignItems: 'center', gap: 12, border: 'none', borderRadius: 'var(--r-md)', padding: '11px 14px', fontWeight: 600, fontSize: 'var(--fs-14)', textAlign: 'left', cursor: 'pointer',
            background: isActive(n.route) ? 'rgba(255,255,255,0.12)' : 'transparent',
            color: isActive(n.route) ? '#fff' : '#A8A29E' }}>
              <Icon name={n.icon} size={18} />{t(n.key)}
            </button>
          )}
        </nav>
        <div style={{ padding: '14px 12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <a href="Home.html"
          style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 'var(--r-md)', padding: '9px 14px', fontWeight: 600, fontSize: 'var(--fs-13)', color: '#A8A29E', textDecoration: 'none' }}>
            <Icon name="external" size={16} />{t('op_citizen_portal')}
          </a>
          <a href="Manage.html"
          style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 'var(--r-md)', padding: '9px 14px', fontWeight: 600, fontSize: 'var(--fs-13)', color: '#A8A29E', textDecoration: 'none' }}>
            <Icon name="external" size={16} />{t('op_portal')}
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
            <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, flex: 'none' }}>{me.initials}</span>
            <span style={{ lineHeight: 1.25, minWidth: 0 }}>
              <strong style={{ display: 'block', color: '#fff', fontSize: 'var(--fs-13)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.name}</strong>
              <span style={{ fontSize: 'var(--fs-12)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{pick(me.role, lang)}</span>
            </span>
          </div>
        </div>
      </aside>
      {navOpen && <div onClick={() => setNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.45)', zIndex: 1050 }}></div>}

      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', height: 60 }}>
          <button className="ad-burger" onClick={() => setNavOpen(true)} aria-label="Menu"
          style={{ display: 'none', border: '1.5px solid var(--line)', background: '#fff', borderRadius: 'var(--r-sm)', width: 36, height: 36, placeItems: 'center', color: 'var(--ink-2)' }}>
            <Icon name="menu" size={18} />
          </button>
          <AdminSearchBox lang={lang} navigate={navigate}/>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} aria-label="Switch language"
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid var(--line)', background: '#fff', borderRadius: 'var(--r-full)', padding: '6px 12px', fontWeight: 700, fontSize: 'var(--fs-13)', color: 'var(--ink-2)' }}>
              <Icon name="globe" size={15} />{lang === 'vi' ? 'VI' : 'EN'}
            </button>
          </div>
        </header>
        <main style={{ padding: '26px 28px 48px', flex: 1, minWidth: 0 }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 920px) {
          .ad-layout { grid-template-columns: 1fr !important; }
          .ad-sidebar { position: fixed !important; left: 0; top: 0; width: 264px; transform: translateX(-100%); transition: transform .2s ease; }
          .ad-sidebar.open { transform: none; }
          .ad-burger { display: grid !important; }
        }
        .op-table { width: 100%; border-collapse: collapse; font-size: var(--fs-14); }
        .op-table th { text-align: left; font-size: var(--fs-12); text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-3); font-weight: 700; padding: 10px 14px; border-bottom: 1px solid var(--line); white-space: nowrap; }
        .op-table td { padding: 12px 14px; border-bottom: 1px solid var(--line-soft); vertical-align: middle; }
        .op-table tbody tr:last-child td { border-bottom: none; }
        .ad-tabs { display: flex; gap: 4; background: var(--bg-sunken); border-radius: var(--r-md); padding: 4px; flex-wrap: wrap; gap: 4px; width: fit-content; max-width: 100%; }
        .ad-tab { border: none; border-radius: var(--r-sm); padding: 8px 16px; font-weight: 600; font-size: var(--fs-13); background: transparent; color: var(--ink-3); cursor: pointer; white-space: nowrap; }
        .ad-tab.active { background: #fff; color: var(--ink); box-shadow: var(--shadow-sm); }
      `}</style>
    </div>);

}

// ---------- Ô tìm kiếm có gợi ý (≥3 ký tự) ----------
function AdminSearchBox({ lang, navigate }) {
  const t = useT(lang);
  const [q, setQ] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const ql = q.trim().toLowerCase();
  const active = ql.length >= 3;
  const match = (text) => text.toLowerCase().includes(ql);
  const groups = active ? [
    { label: t('ad_users'), icon: 'user', route: 'users',
      items: window.ADATA.users.filter((u) => match(u.name + u.phone + u.email)).slice(0, 4).map((u) => ({ title: u.name, sub: u.phone })) },
    { label: t('c_services'), icon: 'doc', route: 'services',
      items: window.DATA.services.filter((s) => match(s.vi + ' ' + s.en)).slice(0, 4).map((s) => ({ title: pick(s, lang), sub: fmtFee(s.fee, t) })) },
    { label: t('c_points'), icon: 'mappin', route: 'points',
      items: window.DATA.servicePoints.filter((p) => match(p.vi + ' ' + p.en + ' ' + p.address)).slice(0, 3).map((p) => ({ title: pick(p, lang), sub: p.address })) },
    { label: t('ad_officers'), icon: 'shield', route: 'officers',
      items: window.ADATA.officerProfiles.filter((o) => match(o.name + o.dept)).slice(0, 3).map((o) => ({ title: o.name, sub: o.dept })) },
  ].filter((g) => g.items.length > 0) : [];

  return (
    <div ref={ref} style={{ position: 'relative', flex: '0 1 420px' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'grid' }}><Icon name="search" size={16} /></span>
      <input className="input" style={{ paddingLeft: 38, paddingTop: 8, paddingBottom: 8, fontSize: 'var(--fs-14)', background: 'var(--bg-soft)' }}
        placeholder={t('ad_search_ph')} aria-label={t('search')}
        value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}/>
      {open && active && (
        <div className="fade-up" style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', zIndex: 1200, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-pop)', overflow: 'hidden', maxHeight: 420, overflowY: 'auto' }}>
          {groups.length === 0 && <p style={{ padding: '16px 18px', fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')} — “{q}”</p>}
          {groups.map((g) => (
            <div key={g.label}>
              <div style={{ padding: '9px 16px 5px', fontSize: 'var(--fs-11, 11px)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-4)', borderTop: '1px solid var(--line-soft)' }}>{g.label}</div>
              {g.items.map((it, i) => (
                <button key={i} onClick={() => { setOpen(false); setQ(''); navigate(g.route); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '9px 16px', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-soft)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                  <span style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}>
                    <Icon name={g.icon} size={15}/>
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 'var(--fs-13)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.title}</span>
                    <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PageTitle({ title, sub, actions }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h1>
        {sub && <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)', marginTop: 4 }}>{sub}</p>}
      </div>
      {actions}
    </div>);

}

Object.assign(window, { AdminShell, PageTitle, AdminSearchBox });