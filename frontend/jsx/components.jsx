// ============================================================
// Components chung — Icon, Header, Footer, Badge, Timeline…
// ============================================================
const { useState, useEffect, useRef, useMemo } = React;

// ---------- Bộ icon (nét mảnh, 24x24, stroke 1.8) ----------
const ICON_PATHS = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  mappin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  fileplus: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M12 12v6M9 15h6" /></>,
  filesearch: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><circle cx="11" cy="14" r="2.5" /><path d="m13 16 2 2" /></>,
  megaphone: <><path d="m3 11 14-5v12L3 14v-3Z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /><path d="M17 6c2 .7 3 2.5 3 5s-1 4.3-3 5" /></>,
  headset: <><path d="M3 14v-3a9 9 0 0 1 18 0v3" /><path d="M21 16a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5ZM3 16a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" /></>,
  family: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-2a6 6 0 0 1 9-5.2" /><circle cx="17" cy="9" r="2.5" /><path d="M13.5 21v-1.5a4.5 4.5 0 0 1 7.5-3.4" /></>,
  idcard: <><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="8" cy="11" r="2" /><path d="M5 17c.5-1.7 1.6-2.5 3-2.5s2.5.8 3 2.5" /><path d="M14 9h5M14 13h5" /></>,
  land: <><path d="m3 21 6-6 4 4 8-8" /><path d="M14 5h7v7" /><path d="M3 10V3h7" /></>,
  store: <><path d="M4 7 6 3h12l2 4" /><path d="M4 7h16v3a3 3 0 0 1-5.3 1.9A3 3 0 0 1 12 13a3 3 0 0 1-2.7-1.1A3 3 0 0 1 4 10V7Z" /><path d="M5 13v8h14v-8" /><path d="M9 21v-5h6v5" /></>,
  school: <><path d="m12 3 10 6-10 6L2 9l10-6Z" /><path d="M6 11.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5" /><path d="M22 9v6" /></>,
  health: <><path d="M12 21S4 14.5 4 9a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 5.5-8 12-8 12Z" /><path d="M9.5 11h2l1-2 1.5 4 1-2h2" /></>,
  car: <><path d="m5 11 1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11" /><path d="M3 11h18v6h-2" /><path d="M7 17H5v-6" /><circle cx="8" cy="17" r="2" /><circle cx="16" cy="17" r="2" /><path d="M10 17h4" /></>,
  scale: <><path d="M12 3v18" /><path d="M8 21h8" /><path d="M5 7h14" /><path d="m5 7-2.5 6a3 3 0 0 0 5 0L5 7ZM19 7l-2.5 6a3 3 0 0 0 5 0L19 7Z" /></>,
  road: <><path d="M4 21 9 3M20 21 15 3" /><path d="M12 7v2M12 12v2M12 17v2" /></>,
  leaf: <><path d="M5 19c0-9 5-14 14-14 0 9-5 14-14 14Z" /><path d="M5 19c3-3 6-6 10-8" /></>,
  water: <><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /><path d="M9 14a3 3 0 0 0 3 3" /></>,
  shield: <><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 11.5 2 2 4-4" /></>,
  building: <><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /><path d="M10 21v-3h4v3" /></>,
  service: <><circle cx="12" cy="12" r="9" /><path d="M8 13a4 4 0 0 0 8 0" /><circle cx="9" cy="9.5" r="0.5" /><circle cx="15" cy="9.5" r="0.5" /></>,
  fire: <><path d="M12 3c2.6 3.1 5 5.9 5 9.5a5 5 0 0 1-10 0c0-2.9 1.9-5 2.5-7 .8 1.2 1.5 1.9 2.5 2.4C11.6 6 11.5 4.6 12 3Z"/><path d="M12 21a3 3 0 0 0 3-3c0-1.6-1.5-3-3-4-1.5 1-3 2.4-3 4a3 3 0 0 0 3 3Z" opacity="0"/></>,
  abuse: <><path d="M12 21S4 14.5 4 9a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 5.5-8 12-8 12Z"/><path d="m12.5 6.5-2 3.5 3 2-2 3.5"/></>,
  fraud: <><path d="M5 4h4l1.5 4L8 9.5a12 12 0 0 0 6.5 6.5L16 13.5l4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/><path d="M18 3.5v4.5"/><circle cx="18" cy="11" r="0.5"/></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a8 8 0 0 1 16 0v1" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="12" cy="16" r="0.5"/></>,
  star: <><path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3Z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  phone: <><path d="M5 4h4l1.5 4L8 9.5a12 12 0 0 0 6.5 6.5L16 13.5l4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" /></>,
  chevronright: <path d="m9 5 7 7-7 7" />,
  chevrondown: <path d="m5 9 7 7 7-7" />,
  check: <path d="m4 12.5 5 5L20 6.5" />,
  x: <path d="M5 5l14 14M19 5 5 19" />,
  upload: <><path d="M12 16V4" /><path d="m6 10 6-6 6 6" /><path d="M4 20h16" /></>,
  camera: <><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.5" /></>,
  video: <><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m16 10 6-3v10l-6-3" /></>,
  arrowleft: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
  navigation: <path d="m3 11 18-8-8 18-2.5-7.5L3 11Z" />,
  walk: <><circle cx="13" cy="4.5" r="2" /><path d="m9.5 21 2-6.5L9 12.5V9l4-1.5 3 3 2.5 1" /><path d="M9 9 6.5 11M13.5 14.5 16 21" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  doc: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  send: <path d="m4 4 16 8-16 8 3-8-3-8Z" />,
  alert: <><path d="M12 3 2 20h20L12 3Z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><circle cx="12" cy="8" r="0.5" /></>,
  external: <><path d="M14 4h6v6" /><path d="M20 4 10 14" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h6" /></>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14h1v1h-1zM14 20h1v1h-1zM18 18h3v3h-3z" /></>
};

function Icon({ name, size = 20, stroke = 1.8, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', ...style }} aria-hidden="true">
      {ICON_PATHS[name] || <circle cx="12" cy="12" r="9" />}
    </svg>);

}

// ---------- Logo ----------
function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ flex: 'none' }}>
      <rect x="2" y="2" width="44" height="44" rx="13" fill="var(--primary)" />
      <path d="M24 10l3.2 6.8 7.3 1-5.3 5 1.3 7.2L24 26.6 17.5 30l1.3-7.2-5.3-5 7.3-1L24 10Z" fill="#FFD24A" />
    </svg>);

}

// ---------- i18n hook ----------
function useT(lang) {
  return (key) => window.I18N[lang] && window.I18N[lang][key] || window.I18N.vi[key] || key;
}
function pick(obj, lang) {return lang === 'en' ? obj.en ?? obj.vi : obj.vi;}
function fmtFee(fee, t) {
  if (!fee) return t('free');
  return fee.toLocaleString('vi-VN') + ' đ';
}

// ---------- Badge ----------
const TONE_STYLES = {
  info: { color: 'var(--info)', background: 'var(--info-soft)', borderColor: 'var(--info-border)' },
  success: { color: 'var(--success)', background: 'var(--success-soft)', borderColor: 'var(--success-border)' },
  warning: { color: 'var(--warning)', background: 'var(--warning-soft)', borderColor: 'var(--warning-border)' },
  danger: { color: 'var(--danger)', background: 'var(--danger-soft)', borderColor: 'var(--danger-border)' },
  neutral: { color: 'var(--ink-2)', background: 'var(--neutral-soft)', borderColor: 'var(--neutral-border)' },
  primary: { color: 'var(--primary)', background: 'var(--primary-soft)', borderColor: 'var(--primary-border)' }
};
function Badge({ tone = 'neutral', dot = true, children }) {
  return (
    <span className="badge" style={TONE_STYLES[tone]}>
      {dot && <span className="dot"></span>}{children}
    </span>);

}
function StatusBadge({ status, map, lang }) {
  const t = useT(lang);
  const meta = map[status] || { labelKey: status, tone: 'neutral' };
  return <Badge tone={meta.tone}>{t(meta.labelKey)}</Badge>;
}

// ---------- Đánh giá sao ----------
function Stars({ rating, size = 14 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: '#E9A100' }} aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((i) =>
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
      fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
          <path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3Z" />
        </svg>
      )}
    </span>);

}

// ---------- Timeline ----------
function Timeline({ items, statusMap, lang }) {
  const t = useT(lang);
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((item, i) => {
        const meta = statusMap[item.status] || { tone: 'neutral', labelKey: item.status };
        const tone = TONE_STYLES[meta.tone];
        const last = i === items.length - 1;
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center',
                background: last ? tone.color : tone.background, color: last ? '#fff' : tone.color,
                border: `1.5px solid ${last ? tone.color : tone.borderColor}`, flex: 'none', zIndex: 1
              }}>
                <Icon name={last ? 'check' : 'check'} size={13} stroke={2.4} />
              </span>
              {!last && <span style={{ width: 2, flex: 1, background: 'var(--line)', minHeight: 18 }}></span>}
            </div>
            <div style={{ paddingBottom: last ? 0 : 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 'var(--fs-15)' }}>{t(meta.labelKey)}</strong>
                <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{item.at}</span>
              </div>
              <p style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-2)', marginTop: 2 }}>
                {lang === 'en' ? item.noteEn : item.noteVi}
              </p>
            </div>
          </div>);

      })}
    </div>);

}

// ---------- Header ----------
function Header({ lang, setLang, route, navigate, loggedIn, city }) {
  const t = useT(lang);
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
  { key: 'nav_home', route: 'home' },
  { key: 'nav_services', route: 'services' },
  { key: 'nav_service_points', route: 'points' },
  { key: 'nav_requests', route: 'track' },
  { key: 'nav_feedback', route: 'feedback' }];

  const isActive = (r) => route === r || route.startsWith(r + '/');
  const unread = window.DATA.notifications.filter((n) => !n.read).length;

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 'var(--header-h)' }}>
        <a href="#/home" onClick={(e) => {e.preventDefault();navigate('home');}}
        style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'inherit', flex: 'none' }}>
          <Logo size={38} />
          <span style={{ lineHeight: 1.15 }}>
            <strong style={{ display: 'block', fontSize: 'var(--fs-15)', fontWeight: 700 }}>{t('portal_name')}</strong>
            <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-3)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 3 }}>{city ? <><Icon name="mappin" size={11}/>{city}</> : t('city')}</span>
          </span>
        </a>

        <nav className="hd-nav" style={{ display: 'flex', gap: 2, marginLeft: 12, flex: 1 }}>
          {navItems.map((n) =>
          <button key={n.route} onClick={() => navigate(n.route)}
          style={{
            border: 'none', background: isActive(n.route) ? 'var(--primary-soft)' : 'transparent',
            color: isActive(n.route) ? 'var(--primary)' : 'var(--ink-2)',
            fontWeight: 600, fontSize: 'var(--fs-14)', padding: '8px 14px', borderRadius: 'var(--r-full)'
          }}>
              {t(n.key)}
            </button>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} aria-label="Switch language"
          style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid var(--line)', background: 'var(--bg)', borderRadius: 'var(--r-full)', padding: '6px 12px', fontWeight: 700, fontSize: 'var(--fs-13)', color: 'var(--ink-2)' }}>
            <Icon name="globe" size={15} />{lang === 'vi' ? 'VI' : 'EN'}
          </button>
          {loggedIn ?
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => navigate('notifications')} aria-label={t('notifications')}
            style={{ position: 'relative', border: '1.5px solid var(--line)', background: 'var(--bg)', borderRadius: '50%', width: 38, height: 38, display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}>
                <Icon name="bell" size={18} />
                {unread > 0 && <span style={{ position: 'absolute', top: -3, right: -3, background: 'var(--primary)', color: '#fff', fontSize: 10.5, fontWeight: 700, minWidth: 17, height: 17, borderRadius: 'var(--r-full)', display: 'grid', placeItems: 'center', border: '2px solid #fff' }}>{unread}</span>}
              </button>
              <button onClick={() => navigate('profile')} aria-label={t('my_profile')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px solid var(--line)', background: 'var(--bg)', borderRadius: 'var(--r-full)', padding: '4px 12px 4px 4px', fontWeight: 600, fontSize: 'var(--fs-13)', color: 'var(--ink)' }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-soft-2)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>MH</span>
                <span className="hd-username">Minh Hà</span>
              </button>
            </div> :

          <button className="btn btn-primary btn-sm" onClick={() => navigate('login')}>{t('login')}</button>
          }
          <button className="hd-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"
          style={{ display: 'none', border: '1.5px solid var(--line)', background: 'var(--bg)', borderRadius: 'var(--r-sm)', width: 38, height: 38, placeItems: 'center', color: 'var(--ink-2)' }}>
            <Icon name={menuOpen ? 'x' : 'menu'} size={19} />
          </button>
        </div>
      </div>

      {menuOpen &&
      <nav style={{ borderTop: '1px solid var(--line)', background: '#fff', padding: '8px 16px 14px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map((n) =>
        <button key={n.route} onClick={() => {navigate(n.route);setMenuOpen(false);}}
        style={{ textAlign: 'left', border: 'none', background: isActive(n.route) ? 'var(--primary-soft)' : 'transparent', color: isActive(n.route) ? 'var(--primary)' : 'var(--ink)', fontWeight: 600, fontSize: 'var(--fs-15)', padding: '11px 14px', borderRadius: 'var(--r-md)' }}>
              {t(n.key)}
            </button>
        )}
        </nav>
      }

      <style>{`
        @media (max-width: 920px) {
          .hd-nav { display: none !important; }
          .hd-burger { display: grid !important; }
          .hd-username { display: none; }
        }
      `}</style>
    </header>);

}

// ---------- Footer ----------
function Footer({ lang, navigate }) {
  const t = useT(lang);
  return (
    <footer style={{ background: 'var(--ink)', color: '#D6D3D1', marginTop: 80 }}>
      <div className="container" style={{ padding: '52px 24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr', gap: 40 }} className="ft-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <Logo size={36} />
              <span style={{ lineHeight: 1.2 }}>
                <strong style={{ display: 'block', color: '#fff', fontSize: 'var(--fs-15)' }}>{t('portal_name')}</strong>
                <span style={{ fontSize: 'var(--fs-12)' }}>{t('city')}</span>
              </span>
            </div>
            <p style={{ fontSize: 'var(--fs-13)', lineHeight: 1.7, maxWidth: 340 }}>{t('footer_about')}</p>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: 'var(--fs-14)', marginBottom: 14 }}>{t('footer_links')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 'var(--fs-13)' }}>
              <a style={{ color: '#D6D3D1' }} href="#/services" onClick={(e) => {e.preventDefault();navigate('services');}}>{t('nav_services')}</a>
              <a style={{ color: '#D6D3D1' }} href="#/points" onClick={(e) => {e.preventDefault();navigate('points');}}>{t('nav_service_points')}</a>
              <a style={{ color: '#D6D3D1' }} href="#/track" onClick={(e) => {e.preventDefault();navigate('track');}}>{t('qa_track')}</a>
              <a style={{ color: '#D6D3D1' }} href="#/feedback" onClick={(e) => {e.preventDefault();navigate('feedback');}}>{t('qa_feedback')}</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: 'var(--fs-14)', marginBottom: 14 }}>{t('footer_support')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, fontSize: 'var(--fs-13)' }}>
              <a style={{ color: '#D6D3D1' }} href="#">{t('footer_guide')}</a>
              <a style={{ color: '#D6D3D1' }} href="#">{t('footer_faq')}</a>
              <a style={{ color: '#D6D3D1' }} href="#">{t('footer_terms')}</a>
              <a style={{ color: '#D6D3D1' }} href="#">{t('footer_privacy')}</a>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', fontSize: 'var(--fs-14)', marginBottom: 14 }}>{t('footer_contact')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 'var(--fs-13)' }}>
              <span style={{ display: 'flex', gap: 9, alignItems: 'center' }}><Icon name="phone" size={15} />{t('footer_hotline')}: <strong style={{ color: '#fff' }}>1900 1096</strong></span>
              <span style={{ display: 'flex', gap: 9, alignItems: 'center' }}><Icon name="mail" size={15} />hotro@quangngai.gov.vn</span>
              <span style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}><Icon name="mappin" size={15} style={{ marginTop: 3 }} />52 Hùng Vương, P. Cẩm Thành, TP. Quảng Ngãi</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', marginTop: 36, paddingTop: 22, fontSize: 'var(--fs-12)', color: '#A8A29E' }}>
          {t('footer_copyright')}
        </div>
      </div>
      <style>{`
        @media (max-width: 880px) { .ft-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px) { .ft-grid { grid-template-columns: 1fr !important; gap: 28px !important; } }
      `}</style>
    </footer>);

}

// ---------- Tiêu đề trang + breadcrumb ----------
function PageHead({ lang, navigate, crumbs, title, sub, actions }) {
  const t = useT(lang);
  return (
    <div className="container" style={{ paddingTop: 36, paddingBottom: 8 }}>
      {crumbs &&
      <nav style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 'var(--fs-13)', color: 'var(--ink-3)', marginBottom: 14, flexWrap: 'wrap' }}>
          <a href="#/home" style={{ color: 'var(--ink-3)' }} onClick={(e) => {e.preventDefault();navigate('home');}}>{t('nav_home')}</a>
          {crumbs.map((c, i) =>
        <React.Fragment key={i}>
              <Icon name="chevronright" size={13} />
              {c.route ?
          <a href={'#/' + c.route} style={{ color: 'var(--ink-3)' }} onClick={(e) => {e.preventDefault();navigate(c.route);}}>{c.label}</a> :
          <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{c.label}</span>}
            </React.Fragment>
        )}
        </nav>
      }
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 'var(--fs-30)', fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</h1>
          {sub && <p style={{ color: 'var(--ink-3)', marginTop: 8, maxWidth: 620 }}>{sub}</p>}
        </div>
        {actions && <div className="pagehead-actions" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </div>);

}

// ---------- Trạng thái rỗng ----------
function EmptyState({ icon = 'search', title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--ink-3)' }}>
      <span style={{ display: 'inline-grid', placeItems: 'center', width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-sunken)', marginBottom: 14 }}>
        <Icon name={icon} size={26} />
      </span>
      <h3 style={{ fontSize: 'var(--fs-16)', color: 'var(--ink-2)' }}>{title}</h3>
      {sub && <p style={{ fontSize: 'var(--fs-14)', marginTop: 6 }}>{sub}</p>}
    </div>);

}

// ---------- Khối tải tệp (mô phỏng) ----------
function UploadBox({ lang, hintKey = 'req_upload_hint', files, setFiles }) {
  const t = useT(lang);
  return (
    <div>
      <button type="button"
      onClick={() => setFiles([...files, { name: `tep-dinh-kem-${files.length + 1}.pdf`, size: (Math.random() * 4 + 0.5).toFixed(1) + ' MB' }])}
      style={{ width: '100%', border: '2px dashed var(--line)', borderRadius: 'var(--r-lg)', background: 'var(--bg-soft)', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, color: 'var(--ink-3)' }}>
        <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
          <Icon name="upload" size={20} />
        </span>
        <span style={{ fontSize: 'var(--fs-14)', fontWeight: 600, color: 'var(--ink-2)' }}>{t('req_upload')}</span>
        <span style={{ fontSize: 'var(--fs-13)' }}>{t(hintKey)}</span>
      </button>
      {files.length > 0 &&
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {files.map((f, i) =>
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '9px 12px', fontSize: 'var(--fs-14)' }}>
              <Icon name="doc" size={17} style={{ color: 'var(--primary)' }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ color: 'var(--ink-4)', fontSize: 'var(--fs-13)' }}>{f.size}</span>
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Xóa tệp"
          style={{ border: 'none', background: 'none', color: 'var(--ink-4)', display: 'grid', placeItems: 'center', padding: 4 }}>
                <Icon name="x" size={15} />
              </button>
            </div>
        )}
        </div>
      }
    </div>);

}

Object.assign(window, {
  Icon, Logo, useT, pick, fmtFee, Badge, StatusBadge, Stars, Timeline,
  Header, Footer, PageHead, EmptyState, UploadBox, TONE_STYLES
});