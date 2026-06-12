// ============================================================
// Cổng cán bộ — Shell (sidebar + topbar) và thành phần dùng chung
// ============================================================

function OfficerAvatar({ officerId, size = 30 }) {
  const o = officerId && window.ODATA.officers.find((x) => x.id === officerId);
  if (!o) return null;
  return (
    <span title={o.name} style={{ width: size, height: size, borderRadius: '50%', background: 'var(--primary-soft-2)', color: 'var(--primary)', display: 'inline-grid', placeItems: 'center', fontWeight: 700, fontSize: size * 0.38, flex: 'none' }}>
      {o.initials}
    </span>);

}

function OfficerCell({ officerId, lang }) {
  const t = useT(lang);
  const o = officerId && window.ODATA.officers.find((x) => x.id === officerId);
  if (!o) return <span style={{ color: 'var(--ink-4)', fontSize: 'var(--fs-13)', fontStyle: 'italic' }}>{t('unassigned')}</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <OfficerAvatar officerId={officerId} size={26} />
      <span style={{ fontSize: 'var(--fs-13)', fontWeight: 600 }}>{o.name}</span>
    </span>);

}

function DueBadge({ dueState, due, lang }) {
  const t = useT(lang);
  if (dueState === 'overdue') return <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: 'var(--fs-13)', display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="alert" size={13} />{due} · {t('overdue')}</span>;
  if (dueState === 'soon') return <span style={{ color: 'var(--warning)', fontWeight: 600, fontSize: 'var(--fs-13)' }}>{due} · {t('due_soon')}</span>;
  return <span style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-13)' }}>{due}</span>;
}

// ---------- Chuông thông báo (hồ sơ / phản ánh được phân công) ----------
function OfficerNotifBell({ lang, navigate }) {
  const t = useT(lang);
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState(window.ODATA.officerNotifications);
  const ref = React.useRef(null);
  const unread = items.filter((n) => !n.read).length;

  React.useEffect(() => {
    if (!open) return;
    const close = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const kindMeta = {
    request: { icon: 'doc', tone: 'info', labelKey: 'op_notif_assigned_req' },
    feedback: { icon: 'megaphone', tone: 'warning', labelKey: 'op_notif_assigned_fb' },
    due: { icon: 'alert', tone: 'danger', labelKey: 'op_notif_due' }
  };
  const go = (n) => {
    setItems(items.map((x) => x.id === n.id ? { ...x, read: true } : x));
    setOpen(false);
    navigate((n.kind === 'feedback' ? 'feedback/' : 'requests/') + n.refId);
  };

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button aria-label={t('op_notif_title')} onClick={() => setOpen(!open)}
      style={{ position: 'relative', border: '1.5px solid var(--line)', background: open ? 'var(--bg-sunken)' : '#fff', borderRadius: '50%', width: 36, height: 36, display: 'grid', placeItems: 'center', color: 'var(--ink-2)', cursor: 'pointer' }}>
        <Icon name="bell" size={17} />
        {unread > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, minWidth: 17, height: 17, borderRadius: 'var(--r-full)', display: 'grid', placeItems: 'center', border: '2px solid #fff' }}>{unread}</span>}
      </button>
      {open &&
      <div className="fade-up" style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 1200, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', width: 380, maxWidth: 'calc(100vw - 32px)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px 10px' }}>
            <strong style={{ fontSize: 'var(--fs-15)' }}>{t('op_notif_title')}{unread > 0 && <span style={{ color: 'var(--primary)', fontSize: 'var(--fs-13)', fontWeight: 700 }}> · {unread} {t('notif_unread')}</span>}</strong>
            <button onClick={() => setItems(items.map((x) => ({ ...x, read: true })))}
          style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 'var(--fs-12)', cursor: 'pointer', padding: 4 }}>
              {t('notif_mark_all')}
            </button>
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {items.map((n, i) => {
            const meta = kindMeta[n.kind];
            return (
              <button key={n.id} onClick={() => go(n)}
              style={{ display: 'flex', gap: 12, width: '100%', textAlign: 'left', border: 'none', borderTop: '1px solid var(--line-soft)', background: n.read ? '#fff' : 'var(--primary-soft)', padding: '12px 18px', cursor: 'pointer', alignItems: 'flex-start' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center', background: `var(--${meta.tone}-soft)`, color: `var(--${meta.tone})`, border: `1px solid var(--${meta.tone}-border)` }}>
                    <Icon name={meta.icon} size={16} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 'var(--fs-12)', fontWeight: 700, color: `var(--${meta.tone})`, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{t(meta.labelKey)}</span>
                    <span style={{ display: 'block', fontSize: 'var(--fs-13)', fontWeight: n.read ? 500 : 700, lineHeight: 1.5, marginTop: 2, color: 'var(--ink)' }}>{lang === 'en' ? n.en : n.vi}</span>
                    <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{n.at}</span>
                  </span>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flex: 'none', marginTop: 6 }}></span>}
                </button>);

          })}
          </div>
        </div>
      }
    </span>);

}

// ---------- Shell ----------
function OfficerShell({ lang, setLang, route, navigate, children }) {
  const t = useT(lang);
  const [navOpen, setNavOpen] = React.useState(false);
  const me = window.ODATA.me;
  const nav = [
  { route: 'dashboard', icon: 'land', key: 'op_dashboard' },
  { route: 'requests', icon: 'doc', key: 'op_requests' },
  { route: 'feedback', icon: 'megaphone', key: 'op_feedback' }];

  const isActive = (r) => route === r || route.startsWith(r + '/');

  return (
    <div className="op-layout" style={{ display: 'grid', gridTemplateColumns: '248px 1fr', minHeight: '100vh', background: 'var(--bg-soft)' }}>
      {/* Sidebar */}
      <aside className={'op-sidebar' + (navOpen ? ' open' : '')}
      style={{ background: 'var(--ink)', color: '#D6D3D1', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', zIndex: 1100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '20px 20px 18px' }}>
          <Logo size={36} />
          <span style={{ lineHeight: 1.2 }}>
            <strong style={{ display: 'block', color: '#fff', fontSize: 'var(--fs-14)' }}>{t('op_portal')}</strong>
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
          <a href="Cong Dich Vu Cong.html"
          style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 'var(--r-md)', padding: '10px 14px', fontWeight: 600, fontSize: 'var(--fs-13)', color: '#A8A29E', textDecoration: 'none' }}>
            <Icon name="external" size={16} />{t('op_citizen_portal')}
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
      {navOpen && <div className="op-scrim" onClick={() => setNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(28,25,23,0.45)', zIndex: 1050 }}></div>}

      {/* Main */}
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', height: 60 }}>
          <button className="op-burger" onClick={() => setNavOpen(true)} aria-label="Menu"
          style={{ display: 'none', border: '1.5px solid var(--line)', background: '#fff', borderRadius: 'var(--r-sm)', width: 36, height: 36, placeItems: 'center', color: 'var(--ink-2)' }}>
            <Icon name="menu" size={18} />
          </button>
          <div style={{ position: 'relative', flex: '0 1 420px' }} className="op-search">
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'grid' }}><Icon name="search" size={16} /></span>
            <input className="input" style={{ paddingLeft: 38, paddingTop: 8, paddingBottom: 8, fontSize: 'var(--fs-14)', background: 'var(--bg-soft)' }} placeholder={t('op_search_ph')} aria-label={t('search')} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} aria-label="Switch language"
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid var(--line)', background: '#fff', borderRadius: 'var(--r-full)', padding: '6px 12px', fontWeight: 700, fontSize: 'var(--fs-13)', color: 'var(--ink-2)' }}>
              <Icon name="globe" size={15} />{lang === 'vi' ? 'VI' : 'EN'}
            </button>
            <OfficerNotifBell lang={lang} navigate={navigate} />
          </div>
        </header>
        <main style={{ padding: '26px 28px 48px', flex: 1, minWidth: 0 }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 920px) {
          .op-layout { grid-template-columns: 1fr !important; }
          .op-sidebar { position: fixed !important; left: 0; top: 0; width: 264px; transform: translateX(-100%); transition: transform .2s ease; }
          .op-sidebar.open { transform: none; }
          .op-burger { display: grid !important; }
        }
        .op-table { width: 100%; border-collapse: collapse; font-size: var(--fs-14); }
        .op-table th { text-align: left; font-size: var(--fs-12); text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-3); font-weight: 700; padding: 10px 14px; border-bottom: 1px solid var(--line); white-space: nowrap; }
        .op-table td { padding: 13px 14px; border-bottom: 1px solid var(--line-soft); vertical-align: middle; }
        .op-table tbody tr { cursor: pointer; transition: background .12s; }
        .op-table tbody tr:hover { background: var(--bg-soft); }
        .op-table tbody tr:last-child td { border-bottom: none; }
      `}</style>
    </div>);

}

// ---------- Phân trang ----------
// Hook: cắt mảng theo trang; tự lùi trang khi bộ lọc thu nhỏ danh sách
function usePagination(items, perPage = 8) {
  const [page, setPage] = React.useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / perPage));
  React.useEffect(() => { if (page > pageCount) setPage(pageCount); }, [pageCount, page]);
  const cur = Math.min(page, pageCount);
  const start = (cur - 1) * perPage;
  const pageItems = items.slice(start, start + perPage);
  return { page: cur, setPage, pageCount, pageItems, total: items.length, from: items.length ? start + 1 : 0, to: Math.min(start + perPage, items.length) };
}

// Dải số trang gọn (1 … 4 5 6 … 12)
function pageRange(cur, count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out = [1];
  const lo = Math.max(2, cur - 1), hi = Math.min(count - 1, cur + 1);
  if (lo > 2) out.push('…');
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < count - 1) out.push('…');
  out.push(count);
  return out;
}

function Pagination({ page, pageCount, setPage, from, to, total, lang }) {
  const t = useT(lang);
  if (total === 0) return null;
  const btn = (disabled) => ({
    minWidth: 34, height: 34, padding: '0 9px', borderRadius: 'var(--r-sm)',
    border: '1.5px solid var(--line)', background: '#fff', color: disabled ? 'var(--ink-4)' : 'var(--ink-2)',
    fontWeight: 600, fontSize: 'var(--fs-14)', display: 'grid', placeItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '14px 16px', borderTop: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
      <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>
        {t('pg_showing')} <strong style={{ color: 'var(--ink-2)', fontVariantNumeric: 'tabular-nums' }}>{from}–{to}</strong> / {total}
      </span>
      <div className="pgnav" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button style={btn(page === 1)} disabled={page === 1} onClick={() => setPage(page - 1)} aria-label={t('pg_prev')}>
          <Icon name="chevronright" size={15} style={{ transform: 'rotate(180deg)' }}/>
        </button>
        {pageRange(page, pageCount).map((p, i) => p === '…'
          ? <span key={'e' + i} style={{ minWidth: 22, textAlign: 'center', color: 'var(--ink-4)', fontSize: 'var(--fs-14)' }}>…</span>
          : <button key={p} onClick={() => setPage(p)} aria-label={t('pg_page') + ' ' + p} aria-current={p === page}
              style={{ minWidth: 34, height: 34, borderRadius: 'var(--r-sm)', border: '1.5px solid', borderColor: p === page ? 'var(--primary)' : 'var(--line)', background: p === page ? 'var(--primary)' : '#fff', color: p === page ? '#fff' : 'var(--ink-2)', fontWeight: 700, fontSize: 'var(--fs-14)', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' }}>
              {p}
            </button>
        )}
        <button style={btn(page === pageCount)} disabled={page === pageCount} onClick={() => setPage(page + 1)} aria-label={t('pg_next')}>
          <Icon name="chevronright" size={15}/>
        </button>
      </div>
    </div>
  );
}

// ---------- Hộp thoại ----------
function Modal({ title, onClose, children, width = 460 }) {
  React.useEffect(() => {
    const onKey = (e) => {if (e.key === 'Escape') onClose();};
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'grid', placeItems: 'center', padding: 18 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,25,23,0.5)' }}></div>
      <div className="fade-up" role="dialog" aria-modal="true"
      style={{ position: 'relative', background: '#fff', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', width: '100%', maxWidth: width, maxHeight: '86vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 0' }}>
          <h2 style={{ fontSize: 'var(--fs-18)' }}>{title}</h2>
          <button onClick={onClose} aria-label="Đóng" style={{ border: 'none', background: 'var(--bg-sunken)', borderRadius: '50%', width: 32, height: 32, display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}>
            <Icon name="x" size={16} />
          </button>
        </div>
        <div style={{ padding: '16px 22px 22px' }}>{children}</div>
      </div>
    </div>);

}

// ---------- Toast ----------
function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fade-up" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 3000, background: 'var(--ink)', color: '#fff', borderRadius: 'var(--r-full)', padding: '11px 22px', fontSize: 'var(--fs-14)', fontWeight: 600, boxShadow: 'var(--shadow-pop)', display: 'flex', alignItems: 'center', gap: 9 }}>
      <Icon name="check" size={16} style={{ color: '#4ADE80' }} />{message}
    </div>);

}

Object.assign(window, { OfficerShell, OfficerAvatar, OfficerCell, DueBadge, Modal, Toast, OfficerNotifBell, Pagination, usePagination });