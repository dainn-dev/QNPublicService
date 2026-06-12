// ============================================================
// Trang quản trị — App (router + tweaks)
// ============================================================

const AD_PRIMARY_PALETTES = {
  '#B91C1C': { hover: '#9B1717', active: '#821313', soft: '#FEF2F2', soft2: '#FDE4E4', border: '#F5C6C6' },
  '#1D4ED8': { hover: '#1A44BE', active: '#16399F', soft: '#EFF4FE', soft2: '#DFE9FC', border: '#C7D8FA' },
  '#0F766E': { hover: '#0C635C', active: '#0A524C', soft: '#EFFAF8', soft2: '#D8F2EE', border: '#B5E2DC' }
};

const AD_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#B91C1C",
  "radius": 16
} /*EDITMODE-END*/;

function adParseHash() {
  const raw = (location.hash || '#/users').replace(/^#\//, '');
  return raw.split('?')[0] || 'users';
}

function AdminApp() {
  const [tw, setTweak] = useTweaks(AD_TWEAK_DEFAULTS);
  const [lang, setLang] = React.useState(() => localStorage.getItem('qng-portal-lang') || 'vi');
  const [path, setPath] = React.useState(adParseHash());
  const [toast, setToast] = React.useState('');
  const toastTimer = React.useRef(null);

  const [users, setUsers] = React.useState(window.ADATA.users);
  const [officers, setOfficers] = React.useState(window.ADATA.officerProfiles);
  const [points, setPoints] = React.useState(window.DATA.servicePoints);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  React.useEffect(() => {
    const onHash = () => {setPath(adParseHash());window.scrollTo(0, 0);};
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  React.useEffect(() => {localStorage.setItem('qng-portal-lang', lang);document.documentElement.lang = lang;}, [lang]);

  React.useEffect(() => {
    const r = document.documentElement.style;
    const pal = AD_PRIMARY_PALETTES[tw.primaryColor] || AD_PRIMARY_PALETTES['#B91C1C'];
    r.setProperty('--primary', tw.primaryColor);
    r.setProperty('--primary-hover', pal.hover);
    r.setProperty('--primary-active', pal.active);
    r.setProperty('--primary-soft', pal.soft);
    r.setProperty('--primary-soft-2', pal.soft2);
    r.setProperty('--primary-border', pal.border);
    r.setProperty('--r-lg', tw.radius + 'px');
    r.setProperty('--r-md', Math.max(6, Math.round(tw.radius * 0.75)) + 'px');
  }, [tw.primaryColor, tw.radius]);

  const navigate = (route) => {
    const hash = '#/' + route;
    if (location.hash === hash) {setPath(adParseHash());window.scrollTo(0, 0);} else
    location.hash = hash;
  };

  let screen;
  if (path === 'users') screen = <AdminUsers lang={lang} users={users} setUsers={setUsers} showToast={showToast} />;else
  if (path === 'officers') screen = <AdminOfficers lang={lang} officers={officers} setOfficers={setOfficers} showToast={showToast} />;else
  if (path === 'services') screen = <AdminServices lang={lang} showToast={showToast} />;else
  if (path === 'points') screen = <AdminServicePoints lang={lang} points={points} setPoints={setPoints} showToast={showToast} />;else
  if (path === 'catalogs') screen = <AdminCatalogs lang={lang} showToast={showToast} />;else
  if (path === 'notifications') screen = <AdminNotifications lang={lang} showToast={showToast} />;else
  if (path === 'audit') screen = <AdminAudit lang={lang} showToast={showToast} />;else
  screen = <AdminUsers lang={lang} users={users} setUsers={setUsers} showToast={showToast} />;

  return (
    <React.Fragment>
      <AdminShell lang={lang} setLang={setLang} route={path} navigate={navigate}>
        <div key={path} className="fade-up">{screen}</div>
      </AdminShell>
      <Toast message={toast} />
      <TweaksPanel>
        <TweakSection label="Giao diện" />
        <TweakColor label="Màu chủ đạo" value={tw.primaryColor}
        options={['#B91C1C', '#1D4ED8', '#0F766E']}
        onChange={(v) => setTweak('primaryColor', v)} />
        <TweakSlider label="Bo góc" value={tw.radius} min={4} max={28} unit="px"
        onChange={(v) => setTweak('radius', v)} />
      </TweaksPanel>
    </React.Fragment>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp />);