// ============================================================
// Mobile App — khung điện thoại + điều hướng stack/tab + tweaks
// ============================================================

const MB_PRIMARY_PALETTES = {
  '#B91C1C': { hover: '#9B1717', active: '#821313', soft: '#FEF2F2', soft2: '#FDE4E4', border: '#F5C6C6' },
  '#1D4ED8': { hover: '#1A44BE', active: '#16399F', soft: '#EFF4FE', soft2: '#DFE9FC', border: '#C7D8FA' },
  '#0F766E': { hover: '#0C635C', active: '#0A524C', soft: '#EFFAF8', soft2: '#D8F2EE', border: '#B5E2DC' },
};

const MB_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#B91C1C"
}/*EDITMODE-END*/;

// Toast nhỏ trong khung máy
function MToast({ message }) {
  if (!message) return null;
  return (
    <div style={{ position: 'absolute', bottom: 110, left: '50%', transform: 'translateX(-50%)', zIndex: 80, background: 'var(--ink)', color: '#fff', borderRadius: 99, padding: '9px 18px', fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-pop)', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
      <Icon name="check" size={14} style={{ color: '#4ADE80' }}/>{message}
    </div>
  );
}

// ---------- Ứng dụng trong khung máy ----------
function PhoneApp({ kind, lang, showToast, toast }) {
  const isCitizen = kind === 'citizen';
  const t = useT(lang);
  const [phase, setPhase] = React.useState(isCitizen ? 'splash' : 'main'); // splash | login | main
  const [tab, setTab] = React.useState(isCitizen ? 'home' : 'dashboard');
  const [tabParams, setTabParams] = React.useState({});
  const [stack, setStack] = React.useState([]);

  React.useEffect(() => {
    setPhase(isCitizen ? 'splash' : 'main');
    setTab(isCitizen ? 'home' : 'dashboard');
    setStack([]);
  }, [kind]);

  const nav = {
    push: (s, params) => setStack((st) => [...st, { s, params: params || {} }]),
    pop: () => setStack((st) => st.slice(0, -1)),
    setTab: (id, params) => { setStack([]); setTabParams(params || {}); setTab(id); },
  };

  const citizenTabs = [
    { id: 'home', icon: 'land', label: t('m_tab_home') },
    { id: 'points', icon: 'mappin', label: t('m_tab_points') },
    { id: 'submit', icon: 'fileplus', label: t('m_tab_submit'), center: true },
    { id: 'requests', icon: 'doc', label: t('m_tab_requests') },
    { id: 'profile', icon: 'user', label: t('m_tab_profile') },
  ];
  const officerTabs = [
    { id: 'dashboard', icon: 'land', label: t('m_tab_dashboard') },
    { id: 'requests', icon: 'doc', label: t('m_tab_requests'), badge: 3 },
    { id: 'feedback', icon: 'megaphone', label: t('m_tab_feedback'), badge: 2 },
    { id: 'profile', icon: 'user', label: t('m_tab_profile') },
  ];

  const renderTabScreen = () => {
    if (isCitizen) {
      if (tab === 'home') return <McHome lang={lang} nav={nav}/>;
      if (tab === 'points') return <McPoints lang={lang} nav={nav}/>;
      if (tab === 'submit') return <McCreateRequest lang={lang} nav={nav} params={tabParams}/>;
      if (tab === 'requests') return <McRequests lang={lang} nav={nav}/>;
      return <McProfile lang={lang} nav={nav} onLogout={() => setPhase('login')}/>;
    }
    if (tab === 'dashboard') return <MoDashboard lang={lang} nav={nav}/>;
    if (tab === 'requests') return <MoRequests lang={lang} nav={nav}/>;
    if (tab === 'feedback') return <MoFeedback lang={lang} nav={nav}/>;
    return <MoProfile lang={lang} nav={nav} onLogout={() => showToast(lang === 'en' ? 'Signed out (demo)' : 'Đã đăng xuất (demo)')}/>;
  };

  const renderStackScreen = (item) => {
    const props = { lang, nav, params: item.params, showToast };
    switch (item.s) {
      case 'services': return <McServices {...props}/>;
      case 'serviceDetail': return <McServiceDetail {...props}/>;
      case 'pointDetail': return <McPointDetail {...props}/>;
      case 'route': return <McRoute {...props}/>;
      case 'requestDetail': return <McRequestDetail {...props}/>;
      case 'fbCreate': return <McCreateFeedback {...props}/>;
      case 'fbList': return <McFeedbackList {...props}/>;
      case 'fbDetail': return <McFeedbackDetail {...props}/>;
      case 'notifications': return <McNotifications {...props}/>;
      case 'announceDetail': return <McAnnouncementDetail {...props}/>;
      case 'reqUpdate': return <MoRequestUpdate {...props}/>;
      case 'fbUpdate': return <MoFeedbackUpdate {...props}/>;
      default: return null;
    }
  };

  const top = stack[stack.length - 1];

  if (phase === 'splash') return <McSplash lang={lang} onDone={() => setPhase('login')}/>;
  if (phase === 'login') {
    return (
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--bg-soft)' }}>
        <McLogin lang={lang} onLogin={() => setPhase('main')}/>
      </div>
    );
  }

  return (
    <React.Fragment>
      {/* Màn hình tab */}
      <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 62, paddingBottom: 100, background: 'var(--bg-soft)', display: top ? 'none' : 'block' }}>
        {renderTabScreen()}
      </div>
      {/* Màn hình stack (chi tiết) */}
      {top && (
        <div key={stack.length} className="m-slide" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 62, paddingBottom: 30, background: 'var(--bg-soft)', zIndex: 5 }}>
          {renderStackScreen(top)}
        </div>
      )}
      {!top && <MTabBar tabs={isCitizen ? citizenTabs : officerTabs} active={tab} onTab={(id) => nav.setTab(id)}/>}
      <MToast message={toast}/>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .m-slide { animation: mSlideIn 0.22s ease; }
          @keyframes mSlideIn { from { transform: translateX(36px); } to { transform: none; } }
        }
      `}</style>
    </React.Fragment>
  );
}

// ---------- Trang trình bày ----------
function MobileApp() {
  const [tw, setTweak] = useTweaks(MB_TWEAK_DEFAULTS);
  const [lang, setLang] = React.useState(() => localStorage.getItem('qng-portal-lang') || 'vi');
  const [kind, setKind] = React.useState('citizen');
  const [scale, setScale] = React.useState(1);
  const [toast, setToast] = React.useState('');
  const toastTimer = React.useRef(null);
  const t = useT(lang);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2000);
  };

  React.useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 130) / 874, (window.innerWidth - 40) / 402));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  React.useEffect(() => { localStorage.setItem('qng-portal-lang', lang); document.documentElement.lang = lang; }, [lang]);

  React.useEffect(() => {
    const r = document.documentElement.style;
    const pal = MB_PRIMARY_PALETTES[tw.primaryColor] || MB_PRIMARY_PALETTES['#B91C1C'];
    r.setProperty('--primary', tw.primaryColor);
    r.setProperty('--primary-hover', pal.hover);
    r.setProperty('--primary-active', pal.active);
    r.setProperty('--primary-soft', pal.soft);
    r.setProperty('--primary-soft-2', pal.soft2);
    r.setProperty('--primary-border', pal.border);
  }, [tw.primaryColor]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-sunken)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '18px 0' }}>
      {/* Thanh chuyển app */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 4, background: '#fff', borderRadius: 99, padding: 4, boxShadow: 'var(--shadow-md)' }}>
          {[['citizen', 'm_citizen_app'], ['officer', 'm_officer_app']].map(([k, key]) => (
            <button key={k} onClick={() => setKind(k)}
              style={{ border: 'none', borderRadius: 99, padding: '9px 20px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
                background: kind === k ? 'var(--primary)' : 'transparent', color: kind === k ? '#fff' : 'var(--ink-3)' }}>
              {t(key)}
            </button>
          ))}
        </div>
        <button onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} aria-label="Switch language"
          style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: '#fff', borderRadius: 99, padding: '9px 16px', fontWeight: 700, fontSize: 13, color: 'var(--ink-2)', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}>
          <Icon name="globe" size={15}/>{lang === 'vi' ? 'VI' : 'EN'}
        </button>
      </div>

      {/* Khung máy */}
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', height: 874 * scale }}>
        <IOSDevice>
          <div style={{ position: 'absolute', inset: 0, fontFamily: 'var(--font)' }}>
            <PhoneApp key={kind} kind={kind} lang={lang} showToast={showToast} toast={toast}/>
          </div>
        </IOSDevice>
      </div>

      <TweaksPanel>
        <TweakSection label="Giao diện"/>
        <TweakColor label="Màu chủ đạo" value={tw.primaryColor}
          options={['#B91C1C', '#1D4ED8', '#0F766E']}
          onChange={(v) => setTweak('primaryColor', v)}/>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<MobileApp/>);
