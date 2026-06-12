// ============================================================
// Điểm dịch vụ — Tìm kiếm (danh sách + bản đồ), Chi tiết, Chỉ đường
// ============================================================

function SpCard({ p, lang, navigate, active, onHover }) {
  const t = useT(lang);
  return (
    <button onClick={() => navigate('points/' + p.id)} onMouseEnter={onHover}
    className="card card-hover"
    style={{ padding: 18, background: '#fff', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 9, cursor: 'pointer',
      borderColor: active ? 'var(--primary)' : undefined, width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
        <strong style={{ fontSize: 'var(--fs-15)', lineHeight: 1.4 }}>{pick(p, lang)}</strong>
        <Badge tone={p.open ? 'success' : 'neutral'}>{t(p.open ? 'sp_open' : 'sp_closed')}</Badge>
      </div>
      <span style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 'var(--fs-14)', color: 'var(--ink-3)' }}>
        <Icon name="mappin" size={15} style={{ marginTop: 3 }} />{p.address}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 'var(--fs-13)', color: 'var(--ink-3)', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600, color: 'var(--ink-2)' }}>
          <Icon name="navigation" size={13} />{p.distance} {t('km')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Stars rating={p.rating} size={13} />
          <strong style={{ color: 'var(--ink-2)' }}>{p.rating}</strong>({p.ratingCount})
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="doc" size={13} />{p.serviceIds.length} {t('svc_count')}</span>
      </div>
    </button>);

}

function ServicePointSearch({ lang, navigate }) {
  const t = useT(lang);
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const [ward, setWard] = React.useState('all');
  const [view, setView] = React.useState('split'); // split | list | map
  const [flyTo, setFlyTo] = React.useState(null);
  const [activeId, setActiveId] = React.useState(null);

  const points = window.DATA.servicePoints.filter((p) => {
    const text = (p.vi + p.en + p.address).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (ward !== 'all' && p.ward !== ward) return false;
    if (cat !== 'all') {
      const catServices = window.DATA.services.filter((s) => s.categoryId === cat).map((s) => s.id);
      if (!p.serviceIds.some((id) => catServices.includes(id))) return false;
    }
    return true;
  });

  return (
    <main style={{ minHeight: '70vh' }}>
      <PageHead lang={lang} navigate={navigate}
      crumbs={[{ label: t('nav_service_points') }]}
      title={t('sp_search_title')} />

      {/* Bộ lọc */}
      <div className="container" style={{ marginTop: 16 }}>
        <div className="sp-filter-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 220 }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'grid' }}><Icon name="search" size={17} /></span>
            <input className="input" style={{ paddingLeft: 40 }} placeholder={t('sp_search_ph')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('search')} />
          </div>
          <select className="select" style={{ width: 'auto', flex: '0 1 200px' }} value={cat} onChange={(e) => setCat(e.target.value)} aria-label={t('sp_filter_category')}>
            <option value="all">{t('sp_filter_category')}: {t('sp_all')}</option>
            {window.DATA.categories.map((c) => <option key={c.id} value={c.id}>{pick(c, lang)}</option>)}
          </select>
          <select className="select" style={{ width: 'auto', flex: '0 1 200px' }} value={ward} onChange={(e) => setWard(e.target.value)} aria-label={t('sp_filter_ward')}>
            <option value="all">{t('sp_filter_ward')}: {t('sp_all')}</option>
            {window.DATA.wards.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={() => setFlyTo([15.1205, 108.7965])}>
            <Icon name="navigation" size={16} />{t('sp_nearby')}
          </button>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)', padding: 4, marginLeft: 'auto' }} className="sp-viewtoggle">
            {[['list', 'sp_list'], ['map', 'sp_map']].map(([v, k]) =>
            <button key={v} onClick={() => setView(view === v ? 'split' : v)}
            style={{ border: 'none', borderRadius: 'var(--r-sm)', padding: '8px 16px', fontWeight: 600, fontSize: 'var(--fs-13)',
              background: view === v ? '#fff' : 'transparent', color: view === v ? 'var(--ink)' : 'var(--ink-3)', boxShadow: view === v ? 'var(--shadow-sm)' : 'none' }}>
                {t(k)}
              </button>
            )}
          </div>
        </div>
        <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', marginTop: 12 }}>
          <strong style={{ color: 'var(--ink)' }}>{points.length}</strong> {t('sp_results')}
        </p>
      </div>

      {/* Danh sách + bản đồ */}
      <div className="container" style={{ marginTop: 12, marginBottom: 24 }}>
        <div className="sp-grid" style={{
          display: 'grid', gap: 20, alignItems: 'start',
          gridTemplateColumns: view === 'split' ? '420px 1fr' : '1fr'
        }}>
          {view !== 'map' &&
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: view === 'split' ? 640 : 'none', overflowY: view === 'split' ? 'auto' : 'visible', paddingRight: view === 'split' ? 6 : 0 }}>
              {points.length === 0 && <EmptyState title={t('empty')} />}
              {points.map((p) =>
            <SpCard key={p.id} p={p} lang={lang} navigate={navigate} active={activeId === p.id}
            onHover={() => {setActiveId(p.id);}} />
            )}
            </div>
          }
          {view !== 'list' &&
          <div className="card" style={{ overflow: 'hidden', position: 'sticky', top: 'calc(var(--header-h) + 16px)' }}>
              <OsmMap height={view === 'map' ? 600 : 640} points={points} flyTo={flyTo} radius="0"
            onMarkerClick={(p) => navigate('points/' + p.id)} />
            </div>
          }
        </div>
      </div>
      <style>{`@media (max-width: 880px) {
        .sp-grid { grid-template-columns: 1fr !important; }
        .sp-grid > div:first-child { max-height: none !important; overflow: visible !important; }
      }`}</style>
    </main>);

}

// ---------- Hộp thoại viết đánh giá ----------
function ReviewDialog({ lang, pointName, onClose, onSubmit }) {
  const t = useT(lang);
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [text, setText] = React.useState('');
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const shown = hover || rating;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'grid', placeItems: 'center', padding: 18 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,25,23,0.5)' }}></div>
      <div className="fade-up" role="dialog" aria-modal="true" aria-label={t('rv_title')}
        style={{ position: 'relative', background: '#fff', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', width: '100%', maxWidth: 460, padding: '26px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 'var(--fs-18)' }}>{t('rv_title')}</h2>
            <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', marginTop: 3 }}>{pointName}</p>
          </div>
          <button onClick={onClose} aria-label={t('close')} style={{ border: 'none', background: 'var(--bg-sunken)', borderRadius: '50%', width: 32, height: 32, display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}>
            <Icon name="x" size={16}/>
          </button>
        </div>
        <div className="field" style={{ marginTop: 18 }}>
          <span className="field-label">{t('rv_rating')} <span className="req">*</span></span>
          <div style={{ display: 'flex', gap: 4 }} role="radiogroup" aria-label={t('rv_rating')}>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={i + ' / 5'}
                onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
                style={{ border: 'none', background: 'none', padding: 2, cursor: 'pointer', color: i <= shown ? '#E9A100' : 'var(--line)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill={i <= shown ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                  <path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3Z"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label className="field-label" htmlFor="rv-text">{t('rv_comment')}</label>
          <textarea id="rv-text" className="textarea" placeholder={t('rv_comment_ph')} value={text} onChange={(e) => setText(e.target.value)}></textarea>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
          <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={rating === 0} onClick={() => onSubmit({ rating, text })}>
            <Icon name="star" size={15}/>{t('rv_submit')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Chi tiết điểm dịch vụ ----------
function ServicePointDetail({ lang, navigate, pointId }) {
  const t = useT(lang);
  const p = window.DATA.servicePoints.find((x) => x.id === pointId) || window.DATA.servicePoints[0];
  const [reviews, setReviews] = React.useState(window.DATA.reviews[p.id] || []);
  const [writing, setWriting] = React.useState(false);
  const services = p.serviceIds.map((id) => window.DATA.services.find((s) => s.id === id)).filter(Boolean);
  const submitReview = ({ rating, text }) => {
    setReviews([{ name: window.DATA.user.fullName, rating, date: '12/06/2026', vi: text || '—', en: text || '—' }, ...reviews]);
    setWriting(false);
  };

  const InfoRow = ({ icon, label, value, link }) => value ?
  <div style={{ display: 'flex', gap: 12, padding: '11px 0', borderTop: '1px solid var(--line-soft)', fontSize: 'var(--fs-14)' }}>
      <Icon name={icon} size={17} style={{ color: 'var(--ink-4)', marginTop: 2 }} />
      <span style={{ width: 110, color: 'var(--ink-3)', flex: 'none' }}>{label}</span>
      {link ? <a href="#" onClick={(e) => e.preventDefault()} style={{ fontWeight: 600 }}>{value}</a> : <strong style={{ fontWeight: 600 }}>{value}</strong>}
    </div> :
  null;

  return (
    <main>
      <PageHead lang={lang} navigate={navigate}
      crumbs={[{ label: t('nav_service_points'), route: 'points' }, { label: pick(p, lang) }]}
      title={pick(p, lang)}
      sub={p.address}
      actions={
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('route/' + p.id)}>
              <Icon name="navigation" size={16} />{t('sp_get_directions')}
            </button>
            <button className="btn btn-primary" onClick={() => navigate('requests/create', { pointId: p.id })}>
              <Icon name="fileplus" size={16} />{t('qa_submit')}
            </button>
          </div>
      } />

      <div className="container" style={{ marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Badge tone={p.open ? 'success' : 'neutral'}>{t(p.open ? 'sp_open' : 'sp_closed')}</Badge>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-14)' }}>
            <Stars rating={p.rating} /><strong>{p.rating}</strong>
            <span style={{ color: 'var(--ink-3)' }}>· {p.ratingCount} {t('sp_rating')}</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 'var(--fs-14)', color: 'var(--ink-3)' }}>
            <Icon name="navigation" size={14} />{p.distance} {t('km')}
          </span>
        </div>
      </div>

      <div className="container spd-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 28, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Thông tin chung */}
          <section className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 10 }}>{t('sp_basic_info')}</h2>
            <InfoRow icon="mappin" label={t('sp_address')} value={p.address + ', TP. Quảng Ngãi'} />
            <InfoRow icon="phone" label={t('sp_phone')} value={p.phone} />
            <InfoRow icon="mail" label={t('sp_email')} value={p.email} />
            <InfoRow icon="globe" label={t('sp_website')} value={p.website} link />
            <InfoRow icon="clock" label={t('sp_mon_fri')} value={p.hours.weekday} />
            <InfoRow icon="clock" label={t('sp_saturday')} value={p.hours.saturday} />
          </section>

          {/* Dịch vụ tiếp nhận */}
          <section className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 14 }}>{t('sp_services')} ({services.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {services.map((s, i) =>
              <button key={s.id} onClick={() => navigate('services/detail/' + s.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 4px', borderTop: i ? '1px solid var(--line-soft)' : 'none', border: 'none', borderTopStyle: i ? 'solid' : 'none', background: 'none', textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}>
                    <Icon name={(window.DATA.categories.find((c) => c.id === s.categoryId) || {}).icon || 'doc'} size={17} />
                  </span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: 'var(--fs-14)' }}>{pick(s, lang)}</strong>
                    <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{s.processingDays} {t('svc_working_days')} · {fmtFee(s.fee, t)}</span>
                  </span>
                  <Icon name="chevronright" size={16} style={{ color: 'var(--ink-4)' }} />
                </button>
              )}
            </div>
          </section>

          {/* Đánh giá */}
          <section className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 'var(--fs-18)' }}>{t('sp_reviews')}</h2>
              <button className="btn btn-soft btn-sm" onClick={() => setWriting(true)}><Icon name="star" size={14} />{t('sp_write_review')}</button>
            </div>
            {reviews.length === 0 && <EmptyState icon="star" title={t('empty')} />}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {reviews.map((r, i) =>
              <div key={i} style={{ padding: '15px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, color: 'var(--ink-2)' }}>
                      {r.name.split(' ').slice(-1)[0].charAt(0)}
                    </span>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: 'var(--fs-14)', display: 'block' }}>{r.name}</strong>
                      <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{r.date}</span>
                    </div>
                    <Stars rating={r.rating} size={13} />
                  </div>
                  <p style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-2)' }}>{lang === 'en' ? r.en : r.vi}</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Cột phải: bản đồ */}
        <div style={{ position: 'sticky', top: 'calc(var(--header-h) + 16px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 12px' }}>
              <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('sp_location')}</h2>
            </div>
            <OsmMap height={300} points={[p]} center={[p.lat, p.lng]} zoom={16} radius="0" />
            <div style={{ padding: 14 }}>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('route/' + p.id)}>
                <Icon name="navigation" size={16} />{t('sp_get_directions')}
              </button>
            </div>
          </section>
        </div>
      </div>
      {writing && <ReviewDialog lang={lang} pointName={pick(p, lang)} onClose={() => setWriting(false)} onSubmit={submitReview}/>}
      <style>{`@media (max-width: 880px) { .spd-grid { grid-template-columns: 1fr !important; } .spd-grid > div { position: static !important; } }`}</style>
    </main>);

}

// ---------- Chỉ đường ----------
function RouteScreen({ lang, navigate, pointId }) {
  const t = useT(lang);
  const p = window.DATA.servicePoints.find((x) => x.id === pointId) || window.DATA.servicePoints[0];
  const [mode, setMode] = React.useState('driving');
  const userPos = [15.1158, 108.7989]; // vị trí mô phỏng
  const est = mode === 'driving' ?
  { dist: p.distance, time: Math.max(3, Math.round(p.distance * 3)) } :
  { dist: p.distance, time: Math.max(6, Math.round(p.distance * 13)) };

  const steps = lang === 'en' ? [
  'Head north on Phan Dinh Phung St.',
  'Turn left onto Hung Vuong St.',
  'Continue 650 m, destination on the right'] :
  [
  'Đi về hướng Bắc trên đường Phan Đình Phùng',
  'Rẽ trái vào đường Hùng Vương',
  'Đi tiếp 650 m, điểm đến bên phải'];


  // Vẽ tuyến đường mô phỏng bằng polyline
  const mapRef = React.useRef(null);
  const divRef = React.useRef(null);
  React.useEffect(() => {
    if (!divRef.current || mapRef.current) return;
    const map = L.map(divRef.current, { scrollWheelZoom: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    const mid = [(userPos[0] + p.lat) / 2 + 0.002, (userPos[1] + p.lng) / 2 - 0.003];
    const line = L.polyline([userPos, mid, [p.lat, p.lng]], { color: '#B91C1C', weight: 5, opacity: 0.85, dashArray: null }).addTo(map);
    L.circleMarker(userPos, { radius: 8, color: '#fff', weight: 3, fillColor: '#1D4ED8', fillOpacity: 1 }).addTo(map).bindPopup(t('route_from'));
    const icon = L.divIcon({ className: '', html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:var(--primary);border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`, iconSize: [34, 34], iconAnchor: [17, 30] });
    L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(p.vi);
    map.fitBounds(line.getBounds(), { padding: [40, 40] });
    mapRef.current = map;
    return () => {map.remove();mapRef.current = null;};
  }, []);

  return (
    <main>
      <PageHead lang={lang} navigate={navigate}
      crumbs={[{ label: t('nav_service_points'), route: 'points' }, { label: pick(p, lang), route: 'points/' + p.id }, { label: t('route_title') }]}
      title={t('route_title')} />

      <div className="container rt-grid" style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, marginTop: 20, alignItems: 'start' }}>
        <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="field">
            <label className="field-label">{t('route_from')}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid var(--line)', borderRadius: 'var(--r-md)', padding: '11px 14px', fontSize: 'var(--fs-14)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--info)', flex: 'none' }}></span>
              {lang === 'en' ? 'Your current location' : 'Vị trí hiện tại của bạn'}
            </div>
          </div>
          <div className="field">
            <label className="field-label">{t('route_to')}</label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, border: '1.5px solid var(--line)', borderRadius: 'var(--r-md)', padding: '11px 14px', fontSize: 'var(--fs-14)' }}>
              <Icon name="mappin" size={16} style={{ color: 'var(--primary)', marginTop: 2 }} />
              <span><strong style={{ display: 'block' }}>{pick(p, lang)}</strong><span style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-13)' }}>{p.address}</span></span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)', padding: 4 }}>
            {[['driving', 'car', 'route_driving'], ['walking', 'walk', 'route_walking']].map(([m, ic, k]) =>
            <button key={m} onClick={() => setMode(m)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', borderRadius: 'var(--r-sm)', padding: '9px 10px', fontWeight: 600, fontSize: 'var(--fs-14)',
              background: mode === m ? '#fff' : 'transparent', color: mode === m ? 'var(--ink)' : 'var(--ink-3)', boxShadow: mode === m ? 'var(--shadow-sm)' : 'none' }}>
                <Icon name={ic} size={16} />{t(k)}
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
              <div style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-3)', fontWeight: 600 }}>{t('route_distance')}</div>
              <div style={{ fontSize: 'var(--fs-24)', fontWeight: 800, color: 'var(--primary)' }}>{est.dist} <span style={{ fontSize: 'var(--fs-14)' }}>{t('km')}</span></div>
            </div>
            <div style={{ background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
              <div style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-3)', fontWeight: 600 }}>{t('route_eta')}</div>
              <div style={{ fontSize: 'var(--fs-24)', fontWeight: 800 }}>{est.time} <span style={{ fontSize: 'var(--fs-14)', fontWeight: 600 }}>{t('minutes')}</span></div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>{t('route_steps')}</h3>
            <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
              {steps.map((s, i) =>
              <li key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', fontSize: 'var(--fs-14)' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, flex: 'none' }}>{i + 1}</span>
                  {s}
                </li>
              )}
            </ol>
          </div>
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div ref={divRef} style={{ height: 560, zIndex: 0, position: 'relative' }}></div>
        </div>
      </div>
      <style>{`@media (max-width: 880px) { .rt-grid { grid-template-columns: 1fr !important; } }`}</style>
    </main>);

}

Object.assign(window, { ServicePointSearch, ServicePointDetail, RouteScreen });