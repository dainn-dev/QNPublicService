// ============================================================
// App Công dân (mobile) — Splash, Login, Home, Điểm DV, Chỉ đường
// ============================================================

function McSplash({ lang, onDone }) {
  const t = useT(lang);
  React.useEffect(() => {
    const id = setTimeout(onDone, 1600);
    return () => clearTimeout(id);
  }, []);
  return (
    <div onClick={onDone} style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg, var(--primary) 0%, var(--primary-active) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, cursor: 'pointer', zIndex: 30 }}>
      <span style={{ width: 92, height: 92, borderRadius: 26, background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 18px 44px rgba(0,0,0,0.3)' }}>
        <svg width="56" height="56" viewBox="0 0 48 48"><path d="M24 6l4.2 9 9.8 1.3-7.1 6.7 1.8 9.7L24 28.1 15.3 32.7l1.8-9.7L10 16.3 19.8 15 24 6Z" fill="var(--primary)"/></svg>
      </span>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em' }}>{t('portal_name')}</div>
        <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>{t('city')}</div>
      </div>
      <div style={{ position: 'absolute', bottom: 70, display: 'flex', gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', animation: `mcPulse 1.2s ${i * 0.2}s infinite` }}></span>
        ))}
      </div>
      <style>{`@keyframes mcPulse { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}

function McLogin({ lang, onLogin }) {
  const t = useT(lang);
  const [otpSent, setOtpSent] = React.useState(false);
  return (
    <div style={{ padding: '70px 22px 30px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 14 }}>
        <Logo size={62}/>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>{t('login_title')}</h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 5, maxWidth: 280 }}>{t('login_sub')}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 8 }}>
        <MInput label={t('login_phone')} type="tel" defaultValue="0905 234 671"/>
        {otpSent && (
          <div className="field">
            <label className="field-label" style={{ fontSize: 13 }}>OTP</label>
            <div style={{ display: 'flex', gap: 7 }}>
              {[4, 7, 2, '', '', ''].map((d, i) => (
                <input key={i} aria-label={`OTP ${i + 1}`} maxLength="1" defaultValue={d}
                  style={{ width: '100%', textAlign: 'center', fontSize: 19, fontWeight: 700, minHeight: 48, border: '1.5px solid var(--line)', borderRadius: 13 }}/>
              ))}
            </div>
            <span className="field-hint" style={{ fontSize: 12.5 }}>{t('otp_hint')}</span>
          </div>
        )}
        {otpSent
          ? <MBtn onClick={onLogin}>{t('login_title')}</MBtn>
          : <MBtn variant="soft" onClick={() => setOtpSent(true)}>{t('send_otp')}</MBtn>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink-4)', fontSize: 13 }}>
        <span style={{ flex: 1, height: 1, background: 'var(--line)' }}></span>{t('or')}<span style={{ flex: 1, height: 1, background: 'var(--line)' }}></span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <MBtn style={{ background: '#0B2E66' }} onClick={onLogin}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" fill="#fff"/><path d="M12 5.5l1.9 4 4.4.5-3.3 3 .9 4.4L12 15.2 8.1 17.4l.9-4.4-3.3-3 4.4-.5L12 5.5Z" fill="#0B2E66"/></svg>
          {t('login_vneid')}
        </MBtn>
        <MBtn variant="secondary" onClick={onLogin}>
          <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M23 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.2c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.4-4.9 3.4-8.3Z"/><path fill="#34A853" d="M12 23c3.1 0 5.7-1 7.6-2.8l-3.7-2.8c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v2.9C3.7 20.4 7.6 23 12 23Z"/><path fill="#FBBC05" d="M5.6 13.8c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V6.7H1.8C1 8.3.6 10.1.6 12s.4 3.7 1.2 5.3l3.8-3.5Z"/><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7L19.7 4C17.7 2.2 15.1 1 12 1 7.6 1 3.7 3.6 1.8 7.3l3.8 2.9c.9-2.7 3.4-4.8 6.4-4.8Z"/></svg>
          {t('login_google')}
        </MBtn>
      </div>
      <button onClick={onLogin} style={{ border: 'none', background: 'none', color: 'var(--ink-3)', fontWeight: 600, fontSize: 14, marginTop: 'auto', padding: 10 }}>{t('m_skip')} →</button>
    </div>
  );
}

// ---------- Trang chủ ----------
function McHome({ lang, nav }) {
  const t = useT(lang);
  const featured = window.DATA.services.filter((s) => s.featured).slice(0, 5);
  // Kéo-cuộn ngang dải dịch vụ nổi bật bằng chuột/cảm ứng
  const stripRef = React.useRef(null);
  const dragRef = React.useRef(null);
  const stripDrag = {
    onPointerDown: (e) => { dragRef.current = { x: e.clientX, sl: stripRef.current.scrollLeft, moved: false }; },
    onPointerMove: (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 5) d.moved = true;
      stripRef.current.scrollLeft = d.sl - dx;
    },
    onPointerUp: () => { setTimeout(() => { dragRef.current = null; }, 0); },
    onPointerLeave: () => { dragRef.current = null; },
    onClickCapture: (e) => { if (dragRef.current && dragRef.current.moved) { e.preventDefault(); e.stopPropagation(); } },
  };
  const qa = [
    { icon: 'mappin', key: 'qa_find_point', go: () => nav.setTab('points') },
    { icon: 'fileplus', key: 'qa_submit', go: () => nav.setTab('submit') },
    { icon: 'filesearch', key: 'qa_track', go: () => nav.setTab('requests') },
    { icon: 'megaphone', key: 'qa_feedback', go: () => nav.push('fbCreate') },
  ];
  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Đầu trang */}
      <div style={{ padding: '6px 18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{t('m_greeting')}</div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em' }}>{window.DATA.user.fullName}</div>
        </div>
        <button onClick={() => nav.push('notifications')} aria-label={t('notifications')}
          style={{ position: 'relative', width: 42, height: 42, borderRadius: '50%', border: 'none', background: '#fff', boxShadow: 'var(--shadow-sm)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}>
          <Icon name="bell" size={19}/>
          <span style={{ position: 'absolute', top: 3, right: 4, width: 9, height: 9, borderRadius: '50%', background: 'var(--primary)', border: '2px solid #fff' }}></span>
        </button>
      </div>

      {/* Tìm kiếm */}
      <div style={{ padding: '14px 16px 0' }}>
        <button onClick={() => nav.push('services')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 48, borderRadius: 14, border: '1.5px solid var(--line)', background: '#fff', padding: '0 16px', color: 'var(--ink-4)', fontSize: 14.5, cursor: 'pointer', textAlign: 'left' }}>
          <Icon name="search" size={18}/>{t('m_search_ph')}
        </button>
      </div>

      {/* Thao tác nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '16px 16px 0' }}>
        {qa.map((a) => (
          <button key={a.key} onClick={a.go}
            style={{ border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '4px 0' }}>
            <span style={{ width: 54, height: 54, borderRadius: 17, background: '#fff', boxShadow: 'var(--shadow-sm)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
              <Icon name={a.icon} size={23}/>
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.25 }}>{t(a.key)}</span>
          </button>
        ))}
      </div>

      {/* Dịch vụ nổi bật — cuộn ngang */}
      <MSection title={t('featured_services')} style={{ paddingRight: 0 }}
        action={<button onClick={() => nav.push('services')} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginRight: 16 }}>{t('view_all')}</button>}>
        <div ref={stripRef} {...stripDrag} style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingRight: 16, paddingBottom: 4, scrollbarWidth: 'none', cursor: 'grab', touchAction: 'pan-x pan-y' }}>
          {featured.map((s) => {
            const cat = window.DATA.categories.find((c) => c.id === s.categoryId);
            return (
              <MCard key={s.id} onClick={() => nav.push('serviceDetail', { id: s.id })} style={{ flex: '0 0 200px', padding: 14, borderRadius: 18 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>
                  <Icon name={cat.icon} size={13}/>{pick(cat, lang)}
                </span>
                <strong style={{ display: 'block', fontSize: 14, lineHeight: 1.4, marginTop: 7, minHeight: 39 }}>{pick(s, lang)}</strong>
                <span style={{ display: 'flex', gap: 10, fontSize: 11.5, color: 'var(--ink-3)', marginTop: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={12}/>{s.processingDays} {lang === 'en' ? 'days' : 'ngày'}</span>
                  <strong style={{ color: s.fee ? 'var(--ink-2)' : 'var(--success)' }}>{fmtFee(s.fee, t)}</strong>
                </span>
              </MCard>
            );
          })}
        </div>
      </MSection>

      {/* Thông báo mới */}
      <MSection title={t('recent_announcements')}>
        <MCard style={{ padding: '4px 14px', borderRadius: 18 }}>
          {window.DATA.announcements.slice(0, 3).map((a, i) => (
            <button key={a.id} onClick={() => nav.push('announceDetail', { id: a.id })}
              style={{ display: 'flex', gap: 10, padding: '12px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', alignItems: 'flex-start', width: '100%', border: 'none', borderTopStyle: i ? 'solid' : undefined, background: 'none', textAlign: 'left', cursor: 'pointer' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.tag === 'khancap' ? 'var(--danger)' : 'var(--info)', flex: 'none', marginTop: 6 }}></span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, lineHeight: 1.45 }}>{pick(a, lang)}</span>
                <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{a.date}</span>
              </span>
              <Icon name="chevronright" size={14} style={{ color: 'var(--ink-4)', marginTop: 3 }}/>
            </button>
          ))}
        </MCard>
      </MSection>
    </div>
  );
}

// ---------- Danh mục dịch vụ (mobile, từ tìm kiếm) ----------
function McServices({ lang, nav }) {
  const t = useT(lang);
  const [q, setQ] = React.useState('');
  const services = window.DATA.services.filter((s) => !q || (s.vi + s.en).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <MHeader title={t('nav_services')} onBack={nav.pop}/>
      <div style={{ padding: '0 16px' }}>
        <MInput placeholder={t('m_search_ph')} value={q} onChange={(e) => setQ(e.target.value)}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 16px' }}>
        {services.map((s) => {
          const cat = window.DATA.categories.find((c) => c.id === s.categoryId);
          return (
            <MCard key={s.id} onClick={() => nav.push('serviceDetail', { id: s.id })} style={{ padding: 14, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}>
                <Icon name={cat.icon} size={19}/>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block', fontSize: 14, lineHeight: 1.35 }}>{pick(s, lang)}</strong>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.processingDays} {t('svc_working_days')} · {fmtFee(s.fee, t)}</span>
              </span>
              <Icon name="chevronright" size={16} style={{ color: 'var(--ink-4)' }}/>
            </MCard>
          );
        })}
      </div>
    </div>
  );
}

function McServiceDetail({ lang, nav, params }) {
  const t = useT(lang);
  const s = window.DATA.services.find((x) => x.id === params.id) || window.DATA.services[0];
  return (
    <div>
      <MHeader title={pick(s, lang)} onBack={nav.pop}/>
      <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge tone={s.level === 'full' ? 'success' : 'info'} dot={false}>{t(s.level === 'full' ? 'svc_level_full' : 'svc_level_partial')}</Badge>
          <Badge tone="neutral" dot={false}><Icon name="clock" size={12}/>{s.processingDays} {t('svc_working_days')}</Badge>
          <Badge tone={s.fee ? 'neutral' : 'success'} dot={false}>{fmtFee(s.fee, t)}</Badge>
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>{lang === 'en' ? s.descEn : s.descVi}</p>
        <MCard style={{ padding: 14, borderRadius: 16 }}>
          <strong style={{ fontSize: 13.5, display: 'block', marginBottom: 8 }}>{t('svc_documents')}</strong>
          {s.documents.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', fontSize: 13.5, alignItems: 'flex-start' }}>
              <span style={{ width: 21, height: 21, borderRadius: 7, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 11, flex: 'none' }}>{i + 1}</span>
              {lang === 'en' ? d[1] : d[0]}
            </div>
          ))}
        </MCard>
        <MBtn onClick={() => nav.setTab('submit', { serviceId: s.id })}><Icon name="fileplus" size={17}/>{t('svc_apply')}</MBtn>
      </div>
    </div>
  );
}

// ---------- Điểm dịch vụ ----------
function McPoints({ lang, nav }) {
  const t = useT(lang);
  const [view, setView] = React.useState('list');
  const [q, setQ] = React.useState('');
  const points = window.DATA.servicePoints.filter((p) => !q || (p.vi + p.address).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <MHeader title={t('sp_search_title')} big
        trailing={
          <div style={{ display: 'flex', gap: 3, background: 'var(--bg-sunken)', borderRadius: 11, padding: 3 }}>
            {[['list', 'm_see_list'], ['map', 'm_see_map']].map(([v, k]) => (
              <button key={v} onClick={() => setView(v)}
                style={{ border: 'none', borderRadius: 9, padding: '7px 12px', fontWeight: 700, fontSize: 12, background: view === v ? '#fff' : 'transparent', color: view === v ? 'var(--ink)' : 'var(--ink-3)', boxShadow: view === v ? 'var(--shadow-sm)' : 'none' }}>
                {t(k)}
              </button>
            ))}
          </div>
        }/>
      <div style={{ padding: '0 16px' }}>
        <MInput placeholder={t('sp_search_ph')} value={q} onChange={(e) => setQ(e.target.value)}/>
      </div>
      {view === 'map' ? (
        <div style={{ padding: '14px 16px' }}>
          <MMap height={420} points={points} radius={18}/>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '14px 16px' }}>
          {points.map((p) => (
            <MCard key={p.id} onClick={() => nav.push('pointDetail', { id: p.id })} style={{ padding: 14, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <strong style={{ fontSize: 14, lineHeight: 1.35, flex: 1 }}>{pick(p, lang)}</strong>
                <Badge tone={p.open ? 'success' : 'neutral'}>{t(p.open ? 'sp_open' : 'sp_closed')}</Badge>
              </div>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-3)', marginTop: 5 }}>{p.address}</span>
              <span style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--ink-3)', marginTop: 7, alignItems: 'center' }}>
                <strong style={{ color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="navigation" size={12}/>{p.distance} km</strong>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Stars rating={p.rating} size={11}/>{p.rating}</span>
              </span>
            </MCard>
          ))}
        </div>
      )}
    </div>
  );
}

function McPointDetail({ lang, nav, params }) {
  const t = useT(lang);
  const p = window.DATA.servicePoints.find((x) => x.id === params.id) || window.DATA.servicePoints[0];
  const services = p.serviceIds.map((id) => window.DATA.services.find((s) => s.id === id)).filter(Boolean);
  return (
    <div>
      <MHeader title={pick(p, lang)} onBack={nav.pop}/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MMap height={170} points={[p]} center={[p.lat, p.lng]} zoom={16}/>
        <div style={{ display: 'flex', gap: 8 }}>
          <MBtn variant="secondary" onClick={() => nav.push('route', { id: p.id })} style={{ flex: 1 }}><Icon name="navigation" size={16}/>{t('sp_get_directions')}</MBtn>
          <MBtn onClick={() => nav.setTab('submit', { pointId: p.id })} style={{ flex: 1 }}><Icon name="fileplus" size={16}/>{t('qa_submit')}</MBtn>
        </div>
        <MCard style={{ padding: '4px 14px', borderRadius: 16 }}>
          {[
            ['mappin', p.address + ', TP. Quảng Ngãi'],
            ['phone', p.phone],
            ['clock', `${t('sp_mon_fri')}: ${p.hours.weekday}`],
            ['clock', `${t('sp_saturday')}: ${p.hours.saturday}`],
          ].map(([ic, v], i) => (
            <div key={i} style={{ display: 'flex', gap: 11, padding: '11px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', fontSize: 13.5, alignItems: 'flex-start' }}>
              <Icon name={ic} size={16} style={{ color: 'var(--ink-4)', marginTop: 1, flex: 'none' }}/>{v}
            </div>
          ))}
        </MCard>
        <MCard style={{ padding: '4px 14px', borderRadius: 16 }}>
          <strong style={{ fontSize: 13.5, display: 'block', padding: '12px 0 4px' }}>{t('sp_services')} ({services.length})</strong>
          {services.map((s, i) => (
            <button key={s.id} onClick={() => nav.push('serviceDetail', { id: s.id })}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 0', borderTop: '1px solid var(--line-soft)', background: 'none', border: 'none', borderTopStyle: 'solid', textAlign: 'left', cursor: 'pointer', minHeight: 44 }}>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{pick(s, lang)}</span>
              <Icon name="chevronright" size={15} style={{ color: 'var(--ink-4)' }}/>
            </button>
          ))}
        </MCard>
        <MCard style={{ padding: 14, borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stars rating={p.rating} size={15}/>
            <strong style={{ fontSize: 15 }}>{p.rating}</strong>
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>· {p.ratingCount} {t('sp_rating')}</span>
          </div>
          {(window.DATA.reviews[p.id] || []).slice(0, 2).map((r, i) => (
            <div key={i} style={{ marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--line-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 13 }}>{r.name}</strong>
                <Stars rating={r.rating} size={10}/>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 3, lineHeight: 1.5 }}>{lang === 'en' ? r.en : r.vi}</p>
            </div>
          ))}
        </MCard>
      </div>
    </div>
  );
}

function McRoute({ lang, nav, params }) {
  const t = useT(lang);
  const p = window.DATA.servicePoints.find((x) => x.id === params.id) || window.DATA.servicePoints[0];
  const [mode, setMode] = React.useState('driving');
  const userPos = [15.1158, 108.7989];
  const mid = [(userPos[0] + p.lat) / 2 + 0.002, (userPos[1] + p.lng) / 2 - 0.003];
  const est = mode === 'driving'
    ? { time: Math.max(3, Math.round(p.distance * 3)) }
    : { time: Math.max(6, Math.round(p.distance * 13)) };
  return (
    <div>
      <MHeader title={t('route_title')} onBack={nav.pop}/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MMap key={mode} height={300} points={[p]} route={[userPos, mid, [p.lat, p.lng]]}/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: 'var(--bg-sunken)', borderRadius: 13, padding: 4 }}>
          {[['driving', 'car', 'route_driving'], ['walking', 'walk', 'route_walking']].map(([m, ic, k]) => (
            <button key={m} onClick={() => setMode(m)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: 'none', borderRadius: 10, minHeight: 42, fontWeight: 700, fontSize: 13.5,
                background: mode === m ? '#fff' : 'transparent', color: mode === m ? 'var(--ink)' : 'var(--ink-3)', boxShadow: mode === m ? 'var(--shadow-sm)' : 'none' }}>
              <Icon name={ic} size={16}/>{t(k)}
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'var(--primary-soft)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>{t('route_distance')}</div>
            <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--primary)' }}>{p.distance} km</div>
          </div>
          <div style={{ background: 'var(--bg-sunken)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600 }}>{t('route_eta')}</div>
            <div style={{ fontSize: 21, fontWeight: 800 }}>{est.time} {t('minutes')}</div>
          </div>
        </div>
        <MCard style={{ padding: '4px 14px', borderRadius: 16 }}>
          <strong style={{ fontSize: 13, display: 'block', padding: '11px 0 3px', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{t('route_to')}</strong>
          <div style={{ display: 'flex', gap: 10, padding: '8px 0 13px', alignItems: 'flex-start' }}>
            <Icon name="mappin" size={16} style={{ color: 'var(--primary)', marginTop: 2 }}/>
            <span>
              <strong style={{ display: 'block', fontSize: 13.5 }}>{pick(p, lang)}</strong>
              <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{p.address}</span>
            </span>
          </div>
        </MCard>
      </div>
    </div>
  );
}

Object.assign(window, { McSplash, McLogin, McHome, McServices, McServiceDetail, McPoints, McPointDetail, McRoute });
