// ============================================================
// Mobile kit — thành phần dùng chung trong khung điện thoại
// ============================================================

// i18n bổ sung cho mobile
Object.assign(window.I18N.vi, {
  m_tab_home: 'Trang chủ',
  m_tab_points: 'Điểm DV',
  m_tab_submit: 'Nộp',
  m_tab_requests: 'Hồ sơ',
  m_tab_profile: 'Cá nhân',
  m_tab_dashboard: 'Tổng quan',
  m_tab_feedback: 'Phản ánh',
  m_greeting: 'Xin chào,',
  m_search_ph: 'Tìm thủ tục, điểm dịch vụ…',
  m_assigned_req: 'Hồ sơ được giao',
  m_assigned_fb: 'Phản ánh được giao',
  m_today: 'Hôm nay',
  m_see_map: 'Bản đồ',
  m_see_list: 'Danh sách',
  m_citizen_app: 'App Công dân',
  m_officer_app: 'App Cán bộ',
  m_version: 'Phiên bản 2.4.1',
  m_settings: 'Cài đặt',
  m_help: 'Trợ giúp & hỗ trợ',
  m_skip: 'Bỏ qua',
});
Object.assign(window.I18N.en, {
  m_tab_home: 'Home',
  m_tab_points: 'Points',
  m_tab_submit: 'Submit',
  m_tab_requests: 'Requests',
  m_tab_profile: 'Profile',
  m_tab_dashboard: 'Dashboard',
  m_tab_feedback: 'Feedback',
  m_greeting: 'Hello,',
  m_search_ph: 'Search procedures, service points…',
  m_assigned_req: 'Assigned requests',
  m_assigned_fb: 'Assigned feedback',
  m_today: 'Today',
  m_see_map: 'Map',
  m_see_list: 'List',
  m_citizen_app: 'Citizen App',
  m_officer_app: 'Officer App',
  m_version: 'Version 2.4.1',
  m_settings: 'Settings',
  m_help: 'Help & support',
  m_skip: 'Skip',
});

// ---------- Header trong app ----------
function MHeader({ title, onBack, trailing, big }) {
  return (
    <div style={{ padding: big ? '8px 18px 4px' : '6px 14px 10px', display: 'flex', alignItems: 'center', gap: 10, minHeight: 48 }}>
      {onBack && (
        <button onClick={onBack} aria-label="Quay lại"
          style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: '#fff', boxShadow: 'var(--shadow-sm)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}>
          <Icon name="arrowleft" size={18}/>
        </button>
      )}
      <h1 style={{ fontSize: big ? 24 : 17, fontWeight: 800, letterSpacing: '-0.01em', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</h1>
      {trailing}
    </div>
  );
}

// ---------- Tab bar ----------
function MTabBar({ tabs, active, onTab }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(14px)', borderTop: '1px solid var(--line-soft)', display: 'flex', paddingBottom: 22, paddingTop: 6 }}>
      {tabs.map((tb) => {
        const isCenter = tb.center;
        const isActive = active === tb.id;
        if (isCenter) {
          return (
            <button key={tb.id} onClick={() => onTab(tb.id)} aria-label={tb.label}
              style={{ flex: 1, border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', marginTop: -22 }}>
              <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 6px 16px rgba(185,28,28,0.4)' }}>
                <Icon name={tb.icon} size={24}/>
              </span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: isActive ? 'var(--primary)' : 'var(--ink-3)' }}>{tb.label}</span>
            </button>
          );
        }
        return (
          <button key={tb.id} onClick={() => onTab(tb.id)} aria-label={tb.label}
            style={{ flex: 1, border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 0', cursor: 'pointer', minHeight: 44 }}>
            <span style={{ position: 'relative', color: isActive ? 'var(--primary)' : 'var(--ink-4)', display: 'grid' }}>
              <Icon name={tb.icon} size={23} stroke={isActive ? 2.1 : 1.7}/>
              {tb.badge > 0 && <span style={{ position: 'absolute', top: -4, right: -8, background: 'var(--primary)', color: '#fff', fontSize: 9.5, fontWeight: 700, minWidth: 15, height: 15, borderRadius: 99, display: 'grid', placeItems: 'center', border: '1.5px solid #fff' }}>{tb.badge}</span>}
            </span>
            <span style={{ fontSize: 10.5, fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--primary)' : 'var(--ink-3)' }}>{tb.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Thẻ, ô, nút mobile ----------
function MCard({ children, onClick, style }) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp onClick={onClick} className="card"
      style={{ background: '#fff', textAlign: 'left', width: '100%', cursor: onClick ? 'pointer' : 'default', display: 'block', ...style }}>
      {children}
    </Comp>
  );
}

function MSection({ title, action, children, style }) {
  return (
    <div style={{ padding: '0 16px', marginTop: 20, ...style }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.01em' }}>{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function MBtn({ children, onClick, variant = 'primary', style, disabled }) {
  const variants = {
    primary: { background: 'var(--primary)', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: 'var(--ink)', border: '1.5px solid var(--line)' },
    soft: { background: 'var(--primary-soft)', color: 'var(--primary)', border: 'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ minHeight: 48, borderRadius: 14, fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', cursor: 'pointer', opacity: disabled ? 0.5 : 1, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ---------- Bản đồ Leaflet trong khung ----------
function MMap({ height = 200, points = [], center = [15.121, 108.794], zoom = 14, radius = 16, route }) {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false, zoomControl: false }).setView(center, zoom);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OSM &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    points.forEach((p) => {
      const icon = L.divIcon({ className: '', html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:${p.open === false ? '#A8A29E' : 'var(--primary)'};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`, iconSize: [28, 28], iconAnchor: [14, 25] });
      L.marker([p.lat, p.lng], { icon }).addTo(map);
    });
    if (route) {
      const line = L.polyline(route, { color: '#B91C1C', weight: 4, opacity: 0.85 }).addTo(map);
      L.circleMarker(route[0], { radius: 6, color: '#fff', weight: 2.5, fillColor: '#1D4ED8', fillOpacity: 1 }).addTo(map);
      map.fitBounds(line.getBounds(), { padding: [28, 28] });
    }
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);
  return <div ref={ref} style={{ height, borderRadius: radius, zIndex: 0, position: 'relative' }}></div>;
}

// ---------- Ô nhập mobile ----------
function MInput({ label, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label" style={{ fontSize: 13 }}>{label}</label>}
      <input className="input" style={{ minHeight: 48, fontSize: 15, borderRadius: 13 }} {...props}/>
    </div>
  );
}

Object.assign(window, { MHeader, MTabBar, MCard, MSection, MBtn, MMap, MInput });
