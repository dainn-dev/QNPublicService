// ============================================================
// Phản ánh hiện trường — Gửi, Tra cứu, Chi tiết
// ============================================================

function FeedbackHub({ lang, navigate }) {
  const t = useT(lang);
  return (
    <main style={{ minHeight: '70vh' }}>
      <PageHead lang={lang} navigate={navigate}
      crumbs={[{ label: t('nav_feedback') }]}
      title={t('nav_feedback')}
      sub={t('fb_create_sub')}
      actions={
      <button className="btn btn-primary btn-lg" onClick={() => navigate('feedback/create')}>
            <Icon name="megaphone" size={17} />{t('qa_feedback')}
          </button>
      } />
      <div className="container" style={{ marginTop: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 14 }}>{t('my_feedback')}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {window.DATA.feedbacks.map((f) => {
            const c = window.DATA.feedbackCategories.find((x) => x.id === f.categoryId);
            return (
              <button key={f.id} onClick={() => navigate('feedback/' + f.id)} className="card card-hover"
              style={{ padding: '18px 22px', background: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-sunken)', color: 'var(--ink-2)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <Icon name={c.icon} size={20} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 'var(--fs-14)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-3)' }}>{f.id}</strong>
                    <StatusBadge status={f.status} map={window.FB_STATUS_META} lang={lang} />
                  </span>
                  <span style={{ display: 'block', fontSize: 'var(--fs-15)', fontWeight: 600, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</span>
                  <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{pick(c, lang)} · {f.submitted}</span>
                </span>
                <Icon name="chevronright" size={18} style={{ color: 'var(--ink-4)' }} />
              </button>);

          })}
        </div>
      </div>
    </main>);

}

// ---------- Popup cam kết trước khi gửi phản ánh ----------
function FbConfirmDialog({ lang, onClose, onConfirm }) {
  const t = useT(lang);
  const [agreed, setAgreed] = React.useState(false);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'grid', placeItems: 'center', padding: 18 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(28,25,23,0.5)' }}></div>
      <div className="fade-up" role="alertdialog" aria-modal="true" aria-label={t('fb_confirm_title')}
        style={{ position: 'relative', background: '#fff', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', width: '100%', maxWidth: 460, padding: '28px 26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--warning-soft)', color: 'var(--warning)', display: 'grid', placeItems: 'center', flex: 'none' }}>
            <Icon name="alert" size={22}/>
          </span>
          <h2 style={{ fontSize: 'var(--fs-18)' }}>{t('fb_confirm_title')}</h2>
        </div>
        <p style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-2)', lineHeight: 1.7 }}>{t('fb_confirm_text')}</p>
        <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 'var(--fs-14)', fontWeight: 600, color: 'var(--ink)', cursor: 'pointer', marginTop: 16, background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3, accentColor: 'var(--primary)', width: 16, height: 16 }}/>
          {t('fb_confirm_agree')}
        </label>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
          <button className="btn btn-primary" disabled={!agreed} onClick={onConfirm}><Icon name="send" size={15}/>{t('fb_confirm_send')}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Gửi phản ánh ----------
function CreateFeedback({ lang, navigate }) {
  const t = useT(lang);
  const [confirming, setConfirming] = React.useState(false);
  const [catId, setCatId] = React.useState('');
  const [files, setFiles] = React.useState([]);
  const [gps, setGps] = React.useState(null);
  const [submitted, setSubmitted] = React.useState(false);

  // Bản đồ chọn vị trí
  const mapDiv = React.useRef(null);
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);
  React.useEffect(() => {
    if (!mapDiv.current || mapRef.current) return;
    const map = L.map(mapDiv.current, { scrollWheelZoom: false }).setView([15.121, 108.794], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    map.on('click', (e) => {
      setGps([e.latlng.lat, e.latlng.lng]);
      if (markerRef.current) markerRef.current.remove();
      const icon = L.divIcon({ className: '', html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:var(--primary);border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`, iconSize: [30, 30], iconAnchor: [15, 27] });
      markerRef.current = L.marker(e.latlng, { icon }).addTo(map);
    });
    mapRef.current = map;
    return () => {map.remove();mapRef.current = null;};
  }, [submitted]);

  if (submitted) {
    return (
      <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '60px 16px' }}>
        <div className="card fade-up" style={{ maxWidth: 520, width: '100%', padding: '44px 36px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <span style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-soft)', color: 'var(--success)', display: 'inline-grid', placeItems: 'center', marginBottom: 20 }}>
            <Icon name="check" size={34} stroke={2.4} />
          </span>
          <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800 }}>{t('fb_success_title')}</h1>
          <p style={{ color: 'var(--ink-3)', marginTop: 10 }}>{t('fb_success_sub')}</p>
          <div style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--primary)', background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', padding: '12px 18px', margin: '14px 0 18px', fontVariantNumeric: 'tabular-nums' }}>
            PA-2026-0161
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('home')}>{t('nav_home')}</button>
            <button className="btn btn-primary" onClick={() => navigate('feedback')}>{t('fb_track_title')}</button>
          </div>
        </div>
      </main>);

  }

  return (
    <main style={{ minHeight: '70vh' }}>
      <PageHead lang={lang} navigate={navigate}
      crumbs={[{ label: t('nav_feedback'), route: 'feedback' }, { label: t('fb_create_title') }]}
      title={t('fb_create_title')} sub={t('fb_create_sub')} />

      <div className="container fbc-grid" style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24, marginTop: 24, alignItems: 'start', marginBottom: 24, maxWidth: 1080 }}>
        <div className="card" style={{ padding: '26px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Loại phản ánh */}
          <div className="field">
            <span className="field-label">{t('fb_category')} <span className="req">*</span></span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {window.DATA.feedbackCategories.map((c) =>
              <button key={c.id} type="button" onClick={() => setCatId(c.id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, border: '1.5px solid', borderColor: catId === c.id ? 'var(--primary)' : 'var(--line)', background: catId === c.id ? 'var(--primary-soft)' : '#fff', color: catId === c.id ? 'var(--primary)' : 'var(--ink-2)', borderRadius: 'var(--r-md)', padding: '14px 10px', fontWeight: 600, fontSize: 'var(--fs-13)' }}>
                  <Icon name={c.icon} size={21} />{pick(c, lang)}
                </button>
              )}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="fb-title">{t('fb_title_field')} <span className="req">*</span></label>
            <input id="fb-title" className="input" placeholder={t('fb_title_ph')} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="fb-desc">{t('svc_description')} <span className="req">*</span></label>
            <textarea id="fb-desc" className="textarea" placeholder={t('fb_desc_ph')}></textarea>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="fb-addr">{t('fb_address')} <span className="req">*</span></label>
            <input id="fb-addr" className="input" placeholder={t('fb_address_ph')} />
          </div>

          {/* Ảnh/video */}
          <div className="field">
            <span className="field-label">{t('fb_media')}</span>
            <UploadBox lang={lang} hintKey="fb_media_hint" files={files} setFiles={setFiles} />
          </div>

          <button className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} onClick={() => setConfirming(true)}>
            <Icon name="send" size={17} />{t('fb_submit')}
          </button>
          {confirming && (
            <FbConfirmDialog lang={lang} onClose={() => setConfirming(false)}
              onConfirm={() => { setConfirming(false); setSubmitted(true); }}/>
          )}
        </div>

        {/* Bản đồ chọn GPS */}
        <div className="card" style={{ overflow: 'hidden', position: 'sticky', top: 'calc(var(--header-h) + 16px)' }}>
          <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('fb_gps')}</h2>
            <span style={{ fontSize: 'var(--fs-13)', color: gps ? 'var(--success)' : 'var(--ink-4)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              {gps ? <><Icon name="check" size={14} />{gps[0].toFixed(4)}, {gps[1].toFixed(4)}</> : t('fb_gps_pick')}
            </span>
          </div>
          <div ref={mapDiv} style={{ height: 420, zIndex: 0, position: 'relative' }}></div>
        </div>
      </div>
      <style>{`@media (max-width: 880px) { .fbc-grid { grid-template-columns: 1fr !important; } .fbc-grid > div { position: static !important; } }`}</style>
    </main>);

}

// ---------- Chi tiết phản ánh ----------
function FeedbackDetail({ lang, navigate, feedbackId }) {
  const t = useT(lang);
  const f = window.DATA.feedbacks.find((x) => x.id === feedbackId) || window.DATA.feedbacks[0];
  const c = window.DATA.feedbackCategories.find((x) => x.id === f.categoryId);

  return (
    <main>
      <PageHead lang={lang} navigate={navigate}
      crumbs={[{ label: t('nav_feedback'), route: 'feedback' }, { label: f.id }]}
      title={f.title}
      sub={`${f.id} · ${pick(c, lang)} · ${f.submitted}`}
      actions={<StatusBadge status={f.status} map={window.FB_STATUS_META} lang={lang} />} />

      <div className="container fbd-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginTop: 24, alignItems: 'start', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Thông tin sự việc */}
          <section className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 12 }}>{t('fb_issue_info')}</h2>
            <p style={{ fontSize: 'var(--fs-15)', color: 'var(--ink-2)', lineHeight: 1.7 }}>{f.desc}</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 14, fontSize: 'var(--fs-14)', color: 'var(--ink-3)' }}>
              <Icon name="mappin" size={16} style={{ marginTop: 2, color: 'var(--primary)' }} />{f.address}
            </div>
            {/* Tệp đính kèm */}
            <h3 style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '20px 0 10px' }}>{t('fb_attachments')}</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {f.attachments.map((a, i) =>
              <div key={i} style={{ width: 130, borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div style={{ height: 86, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-4)' }}>
                    <Icon name={a.type === 'video' ? 'video' : 'camera'} size={26} />
                  </div>
                  <div style={{ padding: '7px 10px', fontSize: 'var(--fs-12)', color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                </div>
              )}
            </div>
          </section>

          {/* Tiến trình */}
          <section className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 18 }}>{t('fb_timeline')}</h2>
            <Timeline items={f.timeline} statusMap={window.FB_STATUS_META} lang={lang} />
          </section>

          {/* Phản hồi chính thức */}
          {f.response &&
          <section className="card" style={{ padding: '22px 24px', background: 'var(--success-soft)', borderColor: 'var(--success-border)' }}>
              <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon name="check" size={19} style={{ color: 'var(--success)' }} />{t('fb_response')}
              </h2>
              <p style={{ fontSize: 'var(--fs-15)', color: 'var(--ink-2)', lineHeight: 1.7 }}>{lang === 'en' ? f.response.en : f.response.vi}</p>
            </section>
          }
        </div>

        {/* Bản đồ vị trí */}
        <div className="card" style={{ overflow: 'hidden', position: 'sticky', top: 'calc(var(--header-h) + 16px)' }}>
          <div style={{ padding: '16px 20px 12px' }}>
            <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('fb_gps')}</h2>
          </div>
          <OsmMap height={320} points={[{ ...f, vi: f.title, open: true }]} center={[f.lat, f.lng]} zoom={16} radius="0" />
        </div>
      </div>
      <style>{`@media (max-width: 880px) { .fbd-grid { grid-template-columns: 1fr !important; } .fbd-grid > div { position: static !important; } }`}</style>
    </main>);

}

Object.assign(window, { FeedbackHub, CreateFeedback, FeedbackDetail });