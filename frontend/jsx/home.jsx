// ============================================================
// Trang chủ — 2 phương án (A: Hero trung tâm, B: Hero + bản đồ)
// ============================================================

// ---------- Bản đồ Leaflet dùng chung ----------
function OsmMap({ height = 380, points, center = [15.121, 108.794], zoom = 14, onMarkerClick, radius = 'var(--r-lg)', flyTo }) {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  const markersRef = React.useRef([]);

  React.useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView(center, zoom);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    mapRef.current = map;
    return () => {map.remove();mapRef.current = null;};
  }, []);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = (points || []).map((p) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:${p.open ? 'var(--primary)' : '#A8A29E'};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:grid;place-items:center;">
          <span style="transform:rotate(45deg);color:#fff;font-size:13px;font-weight:800;font-family:var(--font)">${p.vi.charAt(0)}</span></div>`,
        iconSize: [34, 34], iconAnchor: [17, 30]
      });
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map);
      marker.bindPopup(`<strong style="font-size:13.5px">${p.vi}</strong><br><span style="color:#78716C;font-size:12.5px">${p.address}</span>`);
      if (onMarkerClick) marker.on('click', () => onMarkerClick(p));
      return marker;
    });
  }, [points]);

  React.useEffect(() => {
    if (mapRef.current && flyTo) mapRef.current.flyTo(flyTo, 16, { duration: 0.8 });
  }, [flyTo && flyTo[0], flyTo && flyTo[1]]);

  return <div ref={ref} style={{ height, borderRadius: radius, zIndex: 0, position: 'relative' }}></div>;
}

// ---------- Khối dùng chung của trang chủ ----------
function QuickActionCards({ lang, navigate, compact }) {
  const t = useT(lang);
  const actions = [
  { icon: 'mappin', key: 'qa_find_point', route: 'points' },
  { icon: 'fileplus', key: 'qa_submit', route: 'requests/create' },
  { icon: 'filesearch', key: 'qa_track', route: 'track' },
  { icon: 'megaphone', key: 'qa_feedback', route: 'feedback/create' },
  { icon: 'headset', key: 'qa_support', route: 'support' }];

  return (
    <div className="qa-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${compact ? 150 : 170}px, 1fr))`, gap: 14 }}>
      {actions.map((a) =>
      <button key={a.key} onClick={() => navigate(a.route)} className="card card-hover"
      style={{ padding: compact ? '18px 14px' : '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: '#fff', cursor: 'pointer', textAlign: 'center' }}>
          <span style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
            <Icon name={a.icon} size={23} />
          </span>
          <span style={{ fontWeight: 600, fontSize: 'var(--fs-14)', color: 'var(--ink)' }}>{t(a.key)}</span>
        </button>
      )}
    </div>);

}

function CategoryGrid({ lang, navigate }) {
  const t = useT(lang);
  return (
    <section className="container" style={{ marginTop: 64 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <h2 style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '-0.01em' }}>{t('service_categories')}</h2>
        <a href="#/services" onClick={(e) => {e.preventDefault();navigate('services');}} style={{ fontWeight: 600, fontSize: 'var(--fs-14)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {t('view_all')} <Icon name="chevronright" size={15} />
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {window.DATA.categories.map((c) =>
        <button key={c.id} onClick={() => navigate('services/' + c.id)} className="card card-hover"
        style={{ padding: '18px 18px', display: 'flex', alignItems: 'center', gap: 14, background: '#fff', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--bg-sunken)', color: 'var(--ink-2)', display: 'grid', placeItems: 'center', flex: 'none' }}>
              <Icon name={c.icon} size={22} />
            </span>
            <span>
              <strong style={{ display: 'block', fontSize: 'var(--fs-15)' }}>{pick(c, lang)}</strong>
              <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{c.count} {t('svc_count')}</span>
            </span>
          </button>
        )}
      </div>
    </section>);

}

function FeaturedServices({ lang, navigate }) {
  const t = useT(lang);
  const featured = window.DATA.services.filter((s) => s.featured);
  return (
    <section className="container" style={{ marginTop: 64 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 22 }}>
        <h2 style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '-0.01em' }}>{t('featured_services')}</h2>
        <a href="#/services" onClick={(e) => {e.preventDefault();navigate('services');}} style={{ fontWeight: 600, fontSize: 'var(--fs-14)', display: 'flex', alignItems: 'center', gap: 4 }}>
          {t('view_all')} <Icon name="chevronright" size={15} />
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {featured.map((s) => {
          const cat = window.DATA.categories.find((c) => c.id === s.categoryId);
          return (
            <button key={s.id} onClick={() => navigate('services/detail/' + s.id)} className="card card-hover"
            style={{ padding: 22, background: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-13)', color: 'var(--ink-3)', fontWeight: 600 }}>
                  <Icon name={cat.icon} size={15} />{pick(cat, lang)}
                </span>
                <Badge tone={s.level === 'full' ? 'success' : 'info'} dot={false}>
                  {t(s.level === 'full' ? 'svc_level_full' : 'svc_level_partial')}
                </Badge>
              </div>
              <strong style={{ fontSize: 'var(--fs-16)', lineHeight: 1.4 }}>{pick(s, lang)}</strong>
              <div style={{ display: 'flex', gap: 16, fontSize: 'var(--fs-13)', color: 'var(--ink-3)', marginTop: 'auto' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={14} />{s.processingDays} {t('svc_working_days')}</span>
                <span style={{ fontWeight: 600, color: s.fee ? 'var(--ink-2)' : 'var(--success)' }}>{fmtFee(s.fee, t)}</span>
              </div>
            </button>);

        })}
      </div>
    </section>);

}

function AnnouncementList({ lang, items, navigate }) {
  const t = useT(lang);
  const tagTone = { thongbao: 'info', huongdan: 'success', khancap: 'danger' };
  const tagLabel = { thongbao: { vi: 'Thông báo', en: 'Notice' }, huongdan: { vi: 'Hướng dẫn', en: 'Guide' }, khancap: { vi: 'Khẩn cấp', en: 'Urgent' } };
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {items.map((a, i) =>
      <a key={a.id} href={'#/announcements/' + a.id} onClick={(e) => {e.preventDefault();navigate('announcements/' + a.id);}}
      style={{ display: 'flex', gap: 14, padding: '15px 4px', borderTop: i ? '1px solid var(--line-soft)' : 'none', color: 'inherit', textDecoration: 'none', alignItems: 'flex-start' }}>
          <span style={{ flex: 'none', marginTop: 2 }}>
            <Badge tone={tagTone[a.tag]} dot={false}>{pick(tagLabel[a.tag], lang)}</Badge>
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--fs-14)', lineHeight: 1.5 }}>{pick(a, lang)}</span>
            <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{a.date}</span>
          </span>
        </a>
      )}
    </div>);

}

function StatsBand({ lang }) {
  const t = useT(lang);
  const s = window.DATA.stats;
  const items = [
  { value: s.services, key: 'stat_services' },
  { value: s.points, key: 'stat_points' },
  { value: s.resolved, key: 'stat_resolved' },
  { value: s.satisfaction, key: 'stat_satisfaction' }];

  return (
    <section style={{ background: 'var(--primary)', marginTop: 72 }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, padding: '40px 24px' }}>
        {items.map((it) =>
        <div key={it.key} style={{ textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 'var(--fs-38)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{it.value}</div>
            <div style={{ fontSize: 'var(--fs-14)', opacity: 0.85, marginTop: 6 }}>{t(it.key)}</div>
          </div>
        )}
      </div>
    </section>);

}

function HeroSearch({ lang, navigate, big }) {
  const t = useT(lang);
  const [q, setQ] = React.useState('');
  const submit = (e) => {e.preventDefault();navigate('services', { q });};
  return (
    <form onSubmit={submit} role="search"
    style={{ display: 'flex', gap: 8, background: '#fff', border: '1.5px solid var(--line)', borderRadius: 'var(--r-full)', padding: 6, boxShadow: 'var(--shadow-lg)', maxWidth: big ? 680 : '100%', width: '100%' }}>
      <span style={{ display: 'grid', placeItems: 'center', paddingLeft: 14, color: 'var(--ink-4)' }}><Icon name="search" size={20} /></span>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('hero_search_ph')} aria-label={t('search')}
      style={{ flex: 1, border: 'none', outline: 'none', fontSize: 'var(--fs-15)', background: 'transparent', minWidth: 0 }} />
      <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--r-full)', padding: big ? '12px 26px' : '10px 20px' }}>{t('search')}</button>
    </form>);

}

// ================== PHƯƠNG ÁN A — Hero trung tâm ==================
function HomeA({ lang, navigate }) {
  const t = useT(lang);
  return (
    <main>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, var(--primary-soft) 0%, #fff 88%)', borderBottom: '1px solid var(--line-soft)' }}>
        <div className="container" style={{ padding: '72px 24px 56px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 22 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--primary-border)', color: 'var(--primary)', fontWeight: 700, fontSize: 'var(--fs-13)', borderRadius: 'var(--r-full)', padding: '6px 14px' }}>
            <Icon name="shield" size={15} />{t('tagline')}
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, var(--fs-48))', fontWeight: 800, letterSpacing: '-0.025em', maxWidth: 720 }}>{t('hero_title')}</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-16)', maxWidth: 580 }}>{t('hero_sub')}</p>
          <HeroSearch lang={lang} navigate={navigate} big />
        </div>
      </section>

      {/* Thao tác nhanh */}
      <section className="container" style={{ marginTop: -34 }}>
        <QuickActionCards lang={lang} navigate={navigate} />
      </section>

      <CategoryGrid lang={lang} navigate={navigate} />
      <FeaturedServices lang={lang} navigate={navigate} />

      {/* Bản đồ + thông báo */}
      <section className="container" style={{ marginTop: 64 }}>
        <div className="home-map-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 28, alignItems: 'start' }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontSize: 'var(--fs-18)', fontWeight: 700 }}>{t('map_title')}</h2>
                <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', marginTop: 2 }}>{t('map_sub')}</p>
              </div>
              <button className="btn btn-soft btn-sm" onClick={() => navigate('points')}>
                <Icon name="mappin" size={15} />{t('open_map')}
              </button>
            </div>
            <OsmMap height={350} points={window.DATA.servicePoints} radius="0" onMarkerClick={(p) => navigate('points/' + p.id)} />
          </div>
          <div className="card" style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <h2 style={{ fontSize: 'var(--fs-18)', fontWeight: 700 }}>{t('recent_announcements')}</h2>
              <a href="#/announcements" onClick={(e) => {e.preventDefault();navigate('announcements');}} style={{ fontSize: 'var(--fs-13)', fontWeight: 600 }}>{t('view_all')}</a>
            </div>
            <AnnouncementList lang={lang} items={window.DATA.announcements} navigate={navigate} />
          </div>
        </div>
      </section>

      <StatsBand lang={lang} />
      <style>{`@media (max-width: 880px) { .home-map-grid { grid-template-columns: 1fr !important; } }`}</style>
    </main>);

}

// ================== PHƯƠNG ÁN B — Hero chia đôi với bản đồ ==================
function HomeB({ lang, navigate }) {
  const t = useT(lang);
  const qa = [
  { icon: 'fileplus', key: 'qa_submit', route: 'requests/create' },
  { icon: 'filesearch', key: 'qa_track', route: 'track' },
  { icon: 'megaphone', key: 'qa_feedback', route: 'feedback/create' },
  { icon: 'headset', key: 'qa_support', route: 'support' }];

  return (
    <main>
      {/* Hero chia đôi */}
      <section style={{ borderBottom: '1px solid var(--line-soft)', background: 'var(--bg-soft)' }}>
        <div className="container homeb-hero" style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 40, padding: '56px 24px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid var(--primary-border)', color: 'var(--primary)', fontWeight: 700, fontSize: 'var(--fs-13)', borderRadius: 'var(--r-full)', padding: '6px 14px' }}>
              <Icon name="shield" size={15} />{t('city')}
            </span>
            <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', fontWeight: 800, letterSpacing: '-0.025em' }}>{t('hero_title')}</h1>
            <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-16)', maxWidth: 520 }}>{t('hero_sub')}</p>
            <HeroSearch lang={lang} navigate={navigate} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {qa.map((a) =>
              <button key={a.key} onClick={() => navigate(a.route)}
              style={{ display: 'flex', alignItems: 'center', gap: 11, border: '1px solid var(--line)', background: '#fff', borderRadius: 'var(--r-md)', padding: '12px 14px', fontWeight: 600, fontSize: 'var(--fs-14)', color: 'var(--ink)', textAlign: 'left', transition: 'border-color .15s' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                    <Icon name={a.icon} size={18} />
                  </span>
                  {t(a.key)}
                </button>
              )}
            </div>
          </div>
          <div className="card" style={{ overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            <OsmMap height={430} points={window.DATA.servicePoints} radius="0" onMarkerClick={(p) => navigate('points/' + p.id)} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', gap: 12 }}>
              <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Icon name="mappin" size={15} style={{ color: 'var(--primary)' }} />{window.DATA.servicePoints.length} {t('stat_points')} · {t('city')}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('points')} style={{ color: 'var(--primary)', fontWeight: 700 }}>
                {t('open_map')} <Icon name="chevronright" size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <CategoryGrid lang={lang} navigate={navigate} />
      <FeaturedServices lang={lang} navigate={navigate} />

      {/* Thông báo */}
      <section className="container" style={{ marginTop: 64 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
          <h2 style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '-0.01em' }}>{t('recent_announcements')}</h2>
          <a href="#/announcements" onClick={(e) => {e.preventDefault();navigate('announcements');}} style={{ fontWeight: 600, fontSize: 'var(--fs-14)' }}>{t('view_all')}</a>
        </div>
        <div className="card" style={{ padding: '8px 22px' }}>
          <AnnouncementList lang={lang} items={window.DATA.announcements} navigate={navigate} />
        </div>
      </section>

      <StatsBand lang={lang} />
      <style>{`@media (max-width: 920px) { .homeb-hero { grid-template-columns: 1fr !important; } }`}</style>
    </main>);

}

// ---------- Trang danh sách & chi tiết thông báo ----------
const AN_TAG_TONE = { thongbao: 'info', huongdan: 'success', khancap: 'danger' };
const AN_TAG_LABEL = { thongbao: { vi: 'Thông báo', en: 'Notice' }, huongdan: { vi: 'Hướng dẫn', en: 'Guide' }, khancap: { vi: 'Khẩn cấp', en: 'Urgent' } };

function AnnouncementsScreen({ lang, navigate }) {
  const t = useT(lang);
  const [tag, setTag] = React.useState('all');
  const items = window.DATA.announcements.filter((a) => tag === 'all' || a.tag === tag);
  return (
    <main style={{ minHeight: '70vh' }}>
      <PageHead lang={lang} navigate={navigate}
        crumbs={[{ label: t('announcements_title') }]}
        title={t('announcements_title')}/>
      <div className="container" style={{ marginTop: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <button onClick={() => setTag('all')}
            style={{ border: '1.5px solid', borderColor: tag === 'all' ? 'var(--primary)' : 'var(--line)', background: tag === 'all' ? 'var(--primary-soft)' : '#fff', color: tag === 'all' ? 'var(--primary)' : 'var(--ink-2)', fontWeight: 600, fontSize: 'var(--fs-14)', borderRadius: 'var(--r-full)', padding: '8px 16px' }}>
            {t('sp_all')}
          </button>
          {Object.keys(AN_TAG_LABEL).map((k) => (
            <button key={k} onClick={() => setTag(k)}
              style={{ border: '1.5px solid', borderColor: tag === k ? 'var(--primary)' : 'var(--line)', background: tag === k ? 'var(--primary-soft)' : '#fff', color: tag === k ? 'var(--primary)' : 'var(--ink-2)', fontWeight: 600, fontSize: 'var(--fs-14)', borderRadius: 'var(--r-full)', padding: '8px 16px' }}>
              {pick(AN_TAG_LABEL[k], lang)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 820 }}>
          {items.map((a) => (
            <button key={a.id} onClick={() => navigate('announcements/' + a.id)} className="card card-hover"
              style={{ padding: '20px 24px', background: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 9, width: '100%' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Badge tone={AN_TAG_TONE[a.tag]} dot={false}>{pick(AN_TAG_LABEL[a.tag], lang)}</Badge>
                <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{a.date}</span>
              </span>
              <strong style={{ fontSize: 'var(--fs-16)', lineHeight: 1.45 }}>{pick(a, lang)}</strong>
              <span style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                {(lang === 'en' ? a.bodyEn : a.bodyVi).split('\n')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

function AnnouncementDetail({ lang, navigate, announceId }) {
  const t = useT(lang);
  const a = window.DATA.announcements.find((x) => x.id === announceId) || window.DATA.announcements[0];
  const body = (lang === 'en' ? a.bodyEn : a.bodyVi) || '';
  return (
    <main style={{ minHeight: '70vh' }}>
      <PageHead lang={lang} navigate={navigate}
        crumbs={[{ label: t('announcements_title'), route: 'announcements' }, { label: a.date }]}
        title={pick(a, lang)}/>
      <div className="container" style={{ marginTop: 6, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Badge tone={AN_TAG_TONE[a.tag]} dot={false}>{pick(AN_TAG_LABEL[a.tag], lang)}</Badge>
          <span style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="calendar" size={15}/>{a.date}
          </span>
        </div>
        <article className="card" style={{ maxWidth: 820, padding: '30px 34px', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {body.split('\n').filter(Boolean).map((par, i) => (
            <p key={i} style={{ fontSize: 'var(--fs-16)', lineHeight: 1.75, color: 'var(--ink-2)' }}>{par}</p>
          ))}
          <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)', borderTop: '1px solid var(--line-soft)', paddingTop: 16, marginTop: 6 }}>{t('an_source')}</p>
        </article>
        <button className="btn btn-secondary" style={{ marginTop: 22 }} onClick={() => navigate('announcements')}>
          <Icon name="arrowleft" size={16}/>{t('back')}
        </button>
      </div>
    </main>
  );
}

Object.assign(window, { OsmMap, HomeA, HomeB, QuickActionCards, AnnouncementList, AnnouncementsScreen, AnnouncementDetail, AN_TAG_TONE, AN_TAG_LABEL });