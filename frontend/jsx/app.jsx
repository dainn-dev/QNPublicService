// ============================================================
// App — Router (hash) + Tweaks
// ============================================================

const PRIMARY_PALETTES = {
  '#B91C1C': { hover: '#9B1717', active: '#821313', soft: '#FEF2F2', soft2: '#FDE4E4', border: '#F5C6C6' },
  '#1D4ED8': { hover: '#1A44BE', active: '#16399F', soft: '#EFF4FE', soft2: '#DFE9FC', border: '#C7D8FA' },
  '#0F766E': { hover: '#0C635C', active: '#0A524C', soft: '#EFFAF8', soft2: '#D8F2EE', border: '#B5E2DC' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "homeVariant": "A",
  "primaryColor": "#B91C1C",
  "radius": 16,
  "density": "thoáng"
}/*EDITMODE-END*/;

function parseHash() {
  const raw = (location.hash || '#/home').replace(/^#\//, '');
  const [path, qs] = raw.split('?');
  const params = {};
  if (qs) qs.split('&').forEach((kv) => { const [k, v] = kv.split('='); params[k] = decodeURIComponent(v || ''); });
  return { path: path || 'home', params };
}

function SupportScreen({ lang, navigate }) {
  const t = useT(lang);
  return (
    <main style={{ minHeight: '70vh' }}>
      <PageHead lang={lang} navigate={navigate} crumbs={[{ label: t('qa_support') }]} title={t('qa_support')}/>
      <div className="container" style={{ marginTop: 24, maxWidth: 720, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { icon: 'phone', label: t('footer_hotline'), value: '1900 1096', sub: '7:00 – 22:00' },
            { icon: 'mail', label: 'Email', value: 'hotro@quangngai.gov.vn', sub: lang === 'en' ? 'Replies within 24h' : 'Phản hồi trong 24 giờ' },
            { icon: 'mappin', label: t('footer_contact'), value: '52 Hùng Vương', sub: 'P. Cẩm Thành, TP. Quảng Ngãi' },
          ].map((x, i) => (
            <div key={i} className="card" style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                <Icon name={x.icon} size={21}/>
              </span>
              <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', fontWeight: 600 }}>{x.label}</span>
              <strong style={{ fontSize: 'var(--fs-16)' }}>{x.value}</strong>
              <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{x.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function LoginRequired({ lang, navigate }) {
  const t = useT(lang);
  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '60px 16px' }}>
      <div className="card" style={{ maxWidth: 480, width: '100%', padding: '44px 36px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
        <span style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'inline-grid', placeItems: 'center', marginBottom: 18 }}>
          <Icon name="lock" size={30}/>
        </span>
        <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800 }}>{t('login_required_title')}</h1>
        <p style={{ color: 'var(--ink-3)', marginTop: 10, fontSize: 'var(--fs-14)', lineHeight: 1.65 }}>{t('login_required_sub')}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => navigate('register')}>{t('register')}</button>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('login')}><Icon name="user" size={16}/>{t('login')}</button>
        </div>
      </div>
    </main>
  );
}

// ---------- Hộp thoại chọn khu vực (mô phỏng xin quyền vị trí) ----------
const APP_PROVINCES = ['TP. Quảng Ngãi', 'Tỉnh Quảng Nam', 'TP. Đà Nẵng', 'Tỉnh Bình Định', 'TP. Hồ Chí Minh', 'TP. Hà Nội'];

function LocationDialog({ lang, onSelect }) {
  const t = useT(lang);
  const [detecting, setDetecting] = React.useState(false);
  const [manual, setManual] = React.useState('TP. Quảng Ngãi');
  const allow = () => {
    setDetecting(true);
    setTimeout(() => onSelect('TP. Quảng Ngãi'), 1400);
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'grid', placeItems: 'center', padding: 18, background: 'rgba(28,25,23,0.55)' }}>
      <div className="fade-up" role="dialog" aria-modal="true" aria-label={t('loc_title')}
        style={{ background: '#fff', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-pop)', width: '100%', maxWidth: 440, padding: '34px 30px', textAlign: 'center' }}>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'inline-grid', placeItems: 'center', marginBottom: 16 }}>
          <Icon name="mappin" size={30}/>
        </span>
        <h1 style={{ fontSize: 'var(--fs-20)', fontWeight: 800 }}>{t('loc_title')}</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)', lineHeight: 1.65, marginTop: 9 }}>{t('loc_text')}</p>
        <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 22 }} disabled={detecting} onClick={allow}>
          {detecting ? <><span className="loc-spin" aria-hidden="true"></span>{t('loc_detecting')}</> : <><Icon name="navigation" size={17}/>{t('loc_allow')}</>}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-4)', fontSize: 'var(--fs-13)', margin: '18px 0 12px' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--line)' }}></span>{t('loc_manual')}<span style={{ flex: 1, height: 1, background: 'var(--line)' }}></span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select className="select" style={{ flex: 1 }} value={manual} onChange={(e) => setManual(e.target.value)} aria-label={t('loc_manual')} disabled={detecting}>
            {APP_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn btn-secondary" disabled={detecting} onClick={() => onSelect(manual)}>{t('loc_confirm')}</button>
        </div>
        <style>{`
          .loc-spin { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; display: inline-block; animation: locSpin 0.8s linear infinite; }
          @keyframes locSpin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}

function App() {
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLang] = React.useState(() => localStorage.getItem('qng-portal-lang') || 'vi');
  const [loggedIn, setLoggedIn] = React.useState(() => localStorage.getItem('qng-portal-auth') !== 'no');
  const [{ path, params }, setRoute] = React.useState(parseHash());
  const [province, setProvince] = React.useState(() => localStorage.getItem('qng-portal-province'));

  React.useEffect(() => {
    const onHash = () => { setRoute(parseHash()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  React.useEffect(() => { localStorage.setItem('qng-portal-lang', lang); document.documentElement.lang = lang; }, [lang]);

  // Áp tweaks vào CSS variables
  React.useEffect(() => {
    const r = document.documentElement.style;
    const pal = PRIMARY_PALETTES[tw.primaryColor] || PRIMARY_PALETTES['#B91C1C'];
    r.setProperty('--primary', tw.primaryColor);
    r.setProperty('--primary-hover', pal.hover);
    r.setProperty('--primary-active', pal.active);
    r.setProperty('--primary-soft', pal.soft);
    r.setProperty('--primary-soft-2', pal.soft2);
    r.setProperty('--primary-border', pal.border);
    r.setProperty('--r-lg', tw.radius + 'px');
    r.setProperty('--r-md', Math.max(6, Math.round(tw.radius * 0.75)) + 'px');
    r.setProperty('--r-xl', Math.round(tw.radius * 1.5) + 'px');
  }, [tw.primaryColor, tw.radius]);

  const navigate = (route, p) => {
    let hash = '#/' + route;
    if (p && Object.keys(p).length) {
      hash += '?' + Object.entries(p).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
    }
    if (location.hash === hash) { setRoute(parseHash()); window.scrollTo(0, 0); }
    else location.hash = hash;
  };

  const onLogin = () => { setLoggedIn(true); localStorage.setItem('qng-portal-auth', 'yes'); navigate('home'); };

  // ---- Định tuyến ----
  // Các trang yêu cầu đăng nhập
  const seg = path.split('/');
  const isProtected =
    ['track', 'profile', 'notifications', 'feedback', 'feedback/create', 'requests/create'].includes(path) ||
    (seg[0] === 'requests' && seg[1]) || (seg[0] === 'feedback' && seg[1]);

  let screen;
  if (!loggedIn && isProtected) {
    screen = <LoginRequired lang={lang} navigate={navigate}/>;
  } else if (path === 'home') {
    screen = tw.homeVariant === 'B' ? <HomeB lang={lang} navigate={navigate}/> : <HomeA lang={lang} navigate={navigate}/>;
  } else if (path === 'login') {
    screen = <LoginScreen lang={lang} navigate={navigate} onLogin={onLogin}/>;
  } else if (path === 'register') {
    screen = <RegisterScreen lang={lang} navigate={navigate} onLogin={onLogin}/>;
  } else if (path === 'points') {
    screen = <ServicePointSearch lang={lang} navigate={navigate}/>;
  } else if (seg[0] === 'points' && seg[1]) {
    screen = <ServicePointDetail lang={lang} navigate={navigate} pointId={seg[1]}/>;
  } else if (seg[0] === 'route' && seg[1]) {
    screen = <RouteScreen lang={lang} navigate={navigate} pointId={seg[1]}/>;
  } else if (path === 'services') {
    screen = <ServiceCatalog lang={lang} navigate={navigate} initialQuery={params.q}/>;
  } else if (seg[0] === 'services' && seg[1] === 'detail' && seg[2]) {
    screen = <ServiceDetail lang={lang} navigate={navigate} serviceId={seg[2]}/>;
  } else if (seg[0] === 'services' && seg[1]) {
    screen = <ServiceCatalog lang={lang} navigate={navigate} categoryId={seg[1]}/>;
  } else if (path === 'requests/create') {
    screen = <CreateRequest lang={lang} navigate={navigate} params={params}/>;
  } else if (path === 'track') {
    screen = <TrackRequest lang={lang} navigate={navigate}/>;
  } else if (seg[0] === 'requests' && seg[1]) {
    screen = <RequestDetail lang={lang} navigate={navigate} requestId={decodeURIComponent(seg.slice(1).join('/'))}/>;
  } else if (path === 'feedback') {
    screen = <FeedbackHub lang={lang} navigate={navigate}/>;
  } else if (path === 'feedback/create') {
    screen = <CreateFeedback lang={lang} navigate={navigate}/>;
  } else if (seg[0] === 'feedback' && seg[1]) {
    screen = <FeedbackDetail lang={lang} navigate={navigate} feedbackId={decodeURIComponent(seg.slice(1).join('/'))}/>;
  } else if (path === 'profile') {
    screen = <ProfileScreen lang={lang} navigate={navigate} tab={params.tab} onLogout={() => { setLoggedIn(false); localStorage.setItem('qng-portal-auth', 'no'); navigate('home'); }}/>;
  } else if (path === 'notifications') {
    screen = <ProfileScreen lang={lang} navigate={navigate} tab="notifications" onLogout={() => { setLoggedIn(false); localStorage.setItem('qng-portal-auth', 'no'); navigate('home'); }}/>;
  } else if (path === 'announcements') {
    screen = <AnnouncementsScreen lang={lang} navigate={navigate}/>;
  } else if (seg[0] === 'announcements' && seg[1]) {
    screen = <AnnouncementDetail lang={lang} navigate={navigate} announceId={seg[1]}/>;
  } else if (path === 'support') {
    screen = <SupportScreen lang={lang} navigate={navigate}/>;
  } else {
    screen = tw.homeVariant === 'B' ? <HomeB lang={lang} navigate={navigate}/> : <HomeA lang={lang} navigate={navigate}/>;
  }

  const isAuthScreen = path === 'login' || path === 'register';

  return (
    <React.Fragment>
      <Header lang={lang} setLang={setLang} route={path === 'track' ? 'track' : path} navigate={navigate} loggedIn={loggedIn} city={province}/>
      <div key={path} className="fade-up">{screen}</div>
      {!isAuthScreen && <Footer lang={lang} navigate={navigate}/>}
      {!province && <LocationDialog lang={lang} onSelect={(p) => { setProvince(p); localStorage.setItem('qng-portal-province', p); }}/>}

      <TweaksPanel>
        <TweakSection label="Bố cục"/>
        <TweakRadio label="Trang chủ" value={tw.homeVariant} options={['A', 'B']}
          onChange={(v) => setTweak('homeVariant', v)}/>
        <TweakSection label="Giao diện"/>
        <TweakColor label="Màu chủ đạo" value={tw.primaryColor}
          options={['#B91C1C', '#1D4ED8', '#0F766E']}
          onChange={(v) => setTweak('primaryColor', v)}/>
        <TweakSlider label="Bo góc" value={tw.radius} min={4} max={28} unit="px"
          onChange={(v) => setTweak('radius', v)}/>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
