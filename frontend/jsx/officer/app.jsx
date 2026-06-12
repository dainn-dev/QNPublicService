// ============================================================
// Cổng cán bộ — App (router + tweaks)
// ============================================================

const OP_PRIMARY_PALETTES = {
  '#B91C1C': { hover: '#9B1717', active: '#821313', soft: '#FEF2F2', soft2: '#FDE4E4', border: '#F5C6C6' },
  '#1D4ED8': { hover: '#1A44BE', active: '#16399F', soft: '#EFF4FE', soft2: '#DFE9FC', border: '#C7D8FA' },
  '#0F766E': { hover: '#0C635C', active: '#0A524C', soft: '#EFFAF8', soft2: '#D8F2EE', border: '#B5E2DC' },
};

const OP_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#B91C1C",
  "radius": 16,
  "tableDensity": "thoáng"
}/*EDITMODE-END*/;

function opParseHash() {
  const raw = (location.hash || '#/dashboard').replace(/^#\//, '');
  const [path] = raw.split('?');
  return path || 'dashboard';
}

function OfficerApp() {
  const [tw, setTweak] = useTweaks(OP_TWEAK_DEFAULTS);
  const [lang, setLang] = React.useState(() => localStorage.getItem('qng-portal-lang') || 'vi');
  const [path, setPath] = React.useState(opParseHash());
  const [toast, setToast] = React.useState('');
  const toastTimer = React.useRef(null);

  // Dữ liệu nghiệp vụ trong phiên
  const [requests, setRequests] = React.useState(window.ODATA.requests);
  const [feedbacks, setFeedbacks] = React.useState(window.ODATA.feedbacks);
  const updateRequest = (id, patch) => setRequests((rs) => rs.map((r) => r.id === id ? { ...r, ...patch } : r));
  const updateFeedback = (id, patch) => setFeedbacks((fs) => fs.map((f) => f.id === id ? { ...f, ...patch } : f));

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  React.useEffect(() => {
    const onHash = () => { setPath(opParseHash()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  React.useEffect(() => { localStorage.setItem('qng-portal-lang', lang); document.documentElement.lang = lang; }, [lang]);

  React.useEffect(() => {
    const r = document.documentElement.style;
    const pal = OP_PRIMARY_PALETTES[tw.primaryColor] || OP_PRIMARY_PALETTES['#B91C1C'];
    r.setProperty('--primary', tw.primaryColor);
    r.setProperty('--primary-hover', pal.hover);
    r.setProperty('--primary-active', pal.active);
    r.setProperty('--primary-soft', pal.soft);
    r.setProperty('--primary-soft-2', pal.soft2);
    r.setProperty('--primary-border', pal.border);
    r.setProperty('--r-lg', tw.radius + 'px');
    r.setProperty('--r-md', Math.max(6, Math.round(tw.radius * 0.75)) + 'px');
  }, [tw.primaryColor, tw.radius]);

  // Mật độ bảng
  React.useEffect(() => {
    let el = document.getElementById('op-density-style');
    if (!el) { el = document.createElement('style'); el.id = 'op-density-style'; document.head.appendChild(el); }
    el.textContent = tw.tableDensity === 'gọn'
      ? '.op-table td { padding: 8px 14px; } .op-table th { padding: 8px 14px; }'
      : '';
  }, [tw.tableDensity]);

  const navigate = (route) => {
    const hash = '#/' + route;
    if (location.hash === hash) { setPath(opParseHash()); window.scrollTo(0, 0); }
    else location.hash = hash;
  };

  const seg = path.split('/');
  let screen;
  if (path === 'dashboard') {
    screen = <OfficerDashboard lang={lang} navigate={navigate}/>;
  } else if (path === 'requests') {
    screen = <OfficerRequests lang={lang} navigate={navigate} requests={requests} updateRequest={updateRequest} showToast={showToast}/>;
  } else if (seg[0] === 'requests' && seg[1]) {
    screen = <OfficerRequestDetail lang={lang} navigate={navigate} requests={requests} updateRequest={updateRequest} showToast={showToast} requestId={decodeURIComponent(seg.slice(1).join('/'))}/>;
  } else if (path === 'feedback') {
    screen = <OfficerFeedback lang={lang} navigate={navigate} feedbacks={feedbacks} updateFeedback={updateFeedback} showToast={showToast}/>;
  } else if (seg[0] === 'feedback' && seg[1]) {
    screen = <OfficerFeedbackDetail lang={lang} navigate={navigate} feedbacks={feedbacks} updateFeedback={updateFeedback} showToast={showToast} feedbackId={decodeURIComponent(seg.slice(1).join('/'))}/>;
  } else {
    screen = <OfficerDashboard lang={lang} navigate={navigate}/>;
  }

  return (
    <React.Fragment>
      <OfficerShell lang={lang} setLang={setLang} route={path} navigate={navigate}>
        <div key={path} className="fade-up">{screen}</div>
      </OfficerShell>
      <Toast message={toast}/>
      <TweaksPanel>
        <TweakSection label="Giao diện"/>
        <TweakColor label="Màu chủ đạo" value={tw.primaryColor}
          options={['#B91C1C', '#1D4ED8', '#0F766E']}
          onChange={(v) => setTweak('primaryColor', v)}/>
        <TweakSlider label="Bo góc" value={tw.radius} min={4} max={28} unit="px"
          onChange={(v) => setTweak('radius', v)}/>
        <TweakSection label="Bảng dữ liệu"/>
        <TweakRadio label="Mật độ" value={tw.tableDensity} options={['thoáng', 'gọn']}
          onChange={(v) => setTweak('tableDensity', v)}/>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<OfficerApp/>);
