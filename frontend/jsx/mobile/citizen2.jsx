// ============================================================
// App Công dân (mobile) — Hồ sơ, Phản ánh, Thông báo, Cá nhân
// ============================================================

// ---------- Nộp hồ sơ ----------
function McCreateRequest({ lang, nav, params }) {
  const t = useT(lang);
  const [serviceId, setServiceId] = React.useState((params && params.serviceId) || '');
  const [pointId, setPointId] = React.useState((params && params.pointId) || '');
  const [files, setFiles] = React.useState([]);
  const [done, setDone] = React.useState(false);
  const s = window.DATA.services.find((x) => x.id === serviceId);
  const availablePoints = serviceId ? window.DATA.servicePoints.filter((x) => x.serviceIds.includes(serviceId)) : window.DATA.servicePoints;

  if (done) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70%', padding: '40px 24px', textAlign: 'center', gap: 14 }}>
        <span style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--success-soft)', color: 'var(--success)', display: 'grid', placeItems: 'center' }}>
          <Icon name="check" size={36} stroke={2.4}/>
        </span>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>{t('req_success_title')}</h2>
        <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '0.03em', color: 'var(--primary)', background: 'var(--primary-soft)', borderRadius: 13, padding: '10px 18px' }}>QNG-2026-04913</div>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 280 }}>{t('req_success_note')}</p>
        <MBtn variant="soft" onClick={() => { setDone(false); setServiceId(''); setPointId(''); setFiles([]); nav.setTab('requests'); }} style={{ maxWidth: 240 }}>{t('qa_track')}</MBtn>
      </div>
    );
  }

  return (
    <div>
      <MHeader title={t('req_create_title')} big/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label className="field-label" style={{ fontSize: 13 }}>{t('req_select_service')} <span className="req">*</span></label>
          <select className="select" style={{ minHeight: 48, fontSize: 14.5, borderRadius: 13 }} value={serviceId} onChange={(e) => { setServiceId(e.target.value); setPointId(''); }}>
            <option value="">—</option>
            {window.DATA.services.map((x) => <option key={x.id} value={x.id}>{pick(x, lang)}</option>)}
          </select>
        </div>
        {s && (
          <div style={{ background: 'var(--info-soft)', border: '1px solid var(--info-border)', borderRadius: 14, padding: '11px 14px', fontSize: 12.5, color: 'var(--ink-2)', display: 'flex', gap: 9 }}>
            <Icon name="info" size={15} style={{ color: 'var(--info)', flex: 'none', marginTop: 1 }}/>
            <span>{s.documents.length} {lang === 'en' ? 'documents required' : 'loại giấy tờ cần nộp'} · {s.processingDays} {t('svc_working_days')} · {fmtFee(s.fee, t)}</span>
          </div>
        )}
        <div className="field">
          <label className="field-label" style={{ fontSize: 13 }}>{t('req_select_point')} <span className="req">*</span></label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {availablePoints.slice(0, 4).map((x) => (
              <label key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 11, border: '1.5px solid', borderColor: pointId === x.id ? 'var(--primary)' : 'var(--line)', background: pointId === x.id ? 'var(--primary-soft)' : '#fff', borderRadius: 13, padding: '11px 13px', cursor: 'pointer', minHeight: 48 }}>
                <input type="radio" name="m-point" checked={pointId === x.id} onChange={() => setPointId(x.id)} style={{ accentColor: 'var(--primary)' }}/>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ display: 'block', fontSize: 13, lineHeight: 1.3 }}>{pick(x, lang)}</strong>
                  <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{x.distance} km</span>
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field-label" style={{ fontSize: 13 }}>{t('req_upload')} <span className="req">*</span></label>
          <button type="button" onClick={() => setFiles([...files, { name: `giay-to-${files.length + 1}.jpg`, size: '2.1 MB' }])}
            style={{ border: '2px dashed var(--line)', borderRadius: 16, background: 'var(--bg-soft)', padding: '20px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, color: 'var(--ink-3)', width: '100%', cursor: 'pointer' }}>
            <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}><Icon name="camera" size={19}/></span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>{lang === 'en' ? 'Take photo or upload' : 'Chụp ảnh hoặc tải tệp'}</span>
          </button>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1px solid var(--line)', borderRadius: 12, padding: '8px 12px', fontSize: 13, marginTop: 7 }}>
              <Icon name="doc" size={15} style={{ color: 'var(--primary)' }}/>
              <span style={{ flex: 1 }}>{f.name}</span>
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} style={{ border: 'none', background: 'none', color: 'var(--ink-4)', padding: 4 }} aria-label="Xóa"><Icon name="x" size={14}/></button>
            </div>
          ))}
        </div>
        <MBtn disabled={!serviceId || !pointId || files.length === 0} onClick={() => setDone(true)}>
          <Icon name="send" size={16}/>{t('req_submit')}
        </MBtn>
      </div>
    </div>
  );
}

// ---------- Hồ sơ của tôi ----------
function McRequests({ lang, nav }) {
  const t = useT(lang);
  return (
    <div>
      <MHeader title={t('track_title')} big/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '0 16px 16px' }}>
        {window.DATA.requests.map((r) => {
          const s = window.DATA.services.find((x) => x.id === r.serviceId);
          return (
            <MCard key={r.id} onClick={() => nav.push('requestDetail', { id: r.id })} style={{ padding: 14, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <strong style={{ fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{r.id}</strong>
                <StatusBadge status={r.status} map={window.STATUS_META} lang={lang}/>
              </div>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, marginTop: 6 }}>{s ? pick(s, lang) : ''}</span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{r.submitted}</span>
            </MCard>
          );
        })}
      </div>
    </div>
  );
}

function McRequestDetail({ lang, nav, params }) {
  const t = useT(lang);
  const r = window.DATA.requests.find((x) => x.id === params.id) || window.DATA.requests[0];
  const s = window.DATA.services.find((x) => x.id === r.serviceId);
  return (
    <div>
      <MHeader title={r.id} onBack={nav.pop} trailing={<StatusBadge status={r.status} map={window.STATUS_META} lang={lang}/>}/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MCard style={{ padding: 14, borderRadius: 16 }}>
          <strong style={{ fontSize: 14, display: 'block' }}>{s ? pick(s, lang) : ''}</strong>
          <span style={{ fontSize: 12.5, color: 'var(--ink-3)', display: 'block', marginTop: 3 }}>{t('track_submitted_date')}: {r.submitted}</span>
        </MCard>
        {r.officerNote && (
          <div style={{ background: r.status === 'waiting' ? 'var(--warning-soft)' : 'var(--bg-soft)', border: `1px solid ${r.status === 'waiting' ? 'var(--warning-border)' : 'var(--line)'}`, borderRadius: 16, padding: 14, fontSize: 13, lineHeight: 1.55, display: 'flex', gap: 9 }}>
            <Icon name={r.status === 'waiting' ? 'alert' : 'info'} size={16} style={{ color: r.status === 'waiting' ? 'var(--warning)' : 'var(--info)', flex: 'none', marginTop: 1 }}/>
            <span>{lang === 'en' ? r.officerNote.en : r.officerNote.vi}</span>
          </div>
        )}
        <MCard style={{ padding: 16, borderRadius: 16 }}>
          <strong style={{ fontSize: 13.5, display: 'block', marginBottom: 14 }}>{t('req_timeline')}</strong>
          <Timeline items={r.timeline} statusMap={window.STATUS_META} lang={lang}/>
        </MCard>
        <MCard style={{ padding: '4px 14px', borderRadius: 16 }}>
          <strong style={{ fontSize: 13.5, display: 'block', padding: '12px 0 4px' }}>{t('req_docs')}</strong>
          {r.documents.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, padding: '10px 0', borderTop: '1px solid var(--line-soft)', fontSize: 13, alignItems: 'center' }}>
              <Icon name="doc" size={15} style={{ color: 'var(--primary)', flex: 'none' }}/>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{d.size}</span>
            </div>
          ))}
        </MCard>
      </div>
    </div>
  );
}

// ---------- Phản ánh ----------
function McCreateFeedback({ lang, nav }) {
  const t = useT(lang);
  const [catId, setCatId] = React.useState('');
  const [files, setFiles] = React.useState([]);
  const [done, setDone] = React.useState(false);
  const [confirm, setConfirm] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  React.useEffect(() => { if (!confirm) setAgreed(false); }, [confirm]);

  if (done) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70%', padding: '40px 24px', textAlign: 'center', gap: 14 }}>
        <span style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--success-soft)', color: 'var(--success)', display: 'grid', placeItems: 'center' }}>
          <Icon name="check" size={36} stroke={2.4}/>
        </span>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>{t('fb_success_title')}</h2>
        <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '0.03em', color: 'var(--primary)', background: 'var(--primary-soft)', borderRadius: 13, padding: '10px 18px' }}>PA-2026-0161</div>
        <MBtn variant="soft" onClick={() => { setDone(false); nav.push('fbList'); }} style={{ maxWidth: 240 }}>{t('fb_track_title')}</MBtn>
      </div>
    );
  }

  return (
    <div>
      <MHeader title={t('fb_create_title')} onBack={nav.pop}/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <span className="field-label" style={{ fontSize: 13 }}>{t('fb_category')} <span className="req">*</span></span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {window.DATA.feedbackCategories.map((c) => (
              <button key={c.id} type="button" onClick={() => setCatId(c.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, border: '1.5px solid', borderColor: catId === c.id ? 'var(--primary)' : 'var(--line)', background: catId === c.id ? 'var(--primary-soft)' : '#fff', color: catId === c.id ? 'var(--primary)' : 'var(--ink-2)', borderRadius: 14, padding: '12px 4px', fontWeight: 600, fontSize: 10.5, minHeight: 64, cursor: 'pointer' }}>
                <Icon name={c.icon} size={19}/>{pick(c, lang)}
              </button>
            ))}
          </div>
        </div>
        <MInput label={t('fb_title_field') + ' *'} placeholder={t('fb_title_ph')}/>
        <div className="field">
          <label className="field-label" style={{ fontSize: 13 }}>{t('svc_description')} <span className="req">*</span></label>
          <textarea className="textarea" style={{ fontSize: 14.5, borderRadius: 13, minHeight: 90 }} placeholder={t('fb_desc_ph')}></textarea>
        </div>
        <div className="field">
          <span className="field-label" style={{ fontSize: 13 }}>{t('fb_gps')}</span>
          <MMap height={140} points={[{ lat: 15.1218, lng: 108.7942 }]} center={[15.1218, 108.7942]} zoom={15} radius={13}/>
          <span className="field-hint" style={{ fontSize: 12 }}>{lang === 'en' ? 'Using current GPS location' : 'Đang dùng vị trí GPS hiện tại'} · 15.1218, 108.7942</span>
        </div>
        <div className="field">
          <span className="field-label" style={{ fontSize: 13 }}>{t('fb_media')}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={() => setFiles([...files, 1])}
              style={{ width: 72, height: 72, borderRadius: 14, border: '2px dashed var(--line)', background: 'var(--bg-soft)', display: 'grid', placeItems: 'center', color: 'var(--ink-4)', cursor: 'pointer', flex: 'none' }} aria-label={t('fb_media')}>
              <Icon name="camera" size={22}/>
            </button>
            {files.map((_, i) => (
              <div key={i} style={{ width: 72, height: 72, borderRadius: 14, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-4)', position: 'relative', flex: 'none' }}>
                <Icon name="camera" size={20}/>
                <button onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Xóa"
                  style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', border: 'none', background: 'var(--ink)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
                  <Icon name="x" size={11}/>
                </button>
              </div>
            ))}
          </div>
        </div>
        <MBtn disabled={!catId} onClick={() => setConfirm(true)}><Icon name="send" size={16}/>{t('fb_submit')}</MBtn>
        {confirm && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'grid', placeItems: 'end center', background: 'rgba(28,25,23,0.45)' }} onClick={() => setConfirm(false)}>
            <div className="fade-up" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: '22px 22px 0 0', padding: '22px 20px 34px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--warning-soft)', color: 'var(--warning)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <Icon name="alert" size={20}/>
                </span>
                <strong style={{ fontSize: 16 }}>{t('fb_confirm_title')}</strong>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.6 }}>{t('fb_confirm_text')}</p>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12, background: 'var(--bg-soft)', border: '1px solid var(--line)', borderRadius: 13, padding: '11px 13px' }}>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--primary)', width: 16, height: 16 }}/>
                {t('fb_confirm_agree')}
              </label>
              <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
                <MBtn variant="secondary" onClick={() => setConfirm(false)} style={{ flex: 1 }}>{t('cancel')}</MBtn>
                <MBtn disabled={!agreed} onClick={() => { setConfirm(false); setDone(true); }} style={{ flex: 1.4 }}><Icon name="send" size={15}/>{t('fb_confirm_send')}</MBtn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function McFeedbackList({ lang, nav }) {
  const t = useT(lang);
  return (
    <div>
      <MHeader title={t('my_feedback')} onBack={nav.pop}
        trailing={
          <button onClick={() => nav.push('fbCreate')} aria-label={t('qa_feedback')}
            style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
            <Icon name="megaphone" size={17}/>
          </button>
        }/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '0 16px 16px' }}>
        {window.DATA.feedbacks.map((f) => {
          const c = window.DATA.feedbackCategories.find((x) => x.id === f.categoryId);
          return (
            <MCard key={f.id} onClick={() => nav.push('fbDetail', { id: f.id })} style={{ padding: 14, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{f.id}</span>
                <StatusBadge status={f.status} map={window.FB_STATUS_META} lang={lang}/>
              </div>
              <strong style={{ display: 'block', fontSize: 13.5, lineHeight: 1.4, marginTop: 6 }}>{f.title}</strong>
              <span style={{ fontSize: 11.5, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                <Icon name={c.icon} size={12}/>{pick(c, lang)} · {f.submitted}
              </span>
            </MCard>
          );
        })}
      </div>
    </div>
  );
}

function McFeedbackDetail({ lang, nav, params }) {
  const t = useT(lang);
  const f = window.DATA.feedbacks.find((x) => x.id === params.id) || window.DATA.feedbacks[0];
  return (
    <div>
      <MHeader title={f.id} onBack={nav.pop} trailing={<StatusBadge status={f.status} map={window.FB_STATUS_META} lang={lang}/>}/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MCard style={{ padding: 14, borderRadius: 16 }}>
          <strong style={{ fontSize: 14.5, lineHeight: 1.4, display: 'block' }}>{f.title}</strong>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, marginTop: 7 }}>{f.desc}</p>
          <span style={{ fontSize: 12, color: 'var(--ink-3)', display: 'flex', gap: 5, marginTop: 8, alignItems: 'flex-start' }}>
            <Icon name="mappin" size={13} style={{ color: 'var(--primary)', marginTop: 1 }}/>{f.address}
          </span>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {f.attachments.map((a, i) => (
              <div key={i} style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-4)' }}>
                <Icon name={a.type === 'video' ? 'video' : 'camera'} size={20}/>
              </div>
            ))}
          </div>
        </MCard>
        {f.response && (
          <div style={{ background: 'var(--success-soft)', border: '1px solid var(--success-border)', borderRadius: 16, padding: 14, fontSize: 13, lineHeight: 1.55 }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6, fontSize: 13 }}>
              <Icon name="check" size={15} style={{ color: 'var(--success)' }}/>{t('fb_response')}
            </strong>
            {lang === 'en' ? f.response.en : f.response.vi}
          </div>
        )}
        <MCard style={{ padding: 16, borderRadius: 16 }}>
          <strong style={{ fontSize: 13.5, display: 'block', marginBottom: 14 }}>{t('fb_timeline')}</strong>
          <Timeline items={f.timeline} statusMap={window.FB_STATUS_META} lang={lang}/>
        </MCard>
      </div>
    </div>
  );
}

// ---------- Thông báo & Cá nhân ----------
function McNotifications({ lang, nav }) {
  const t = useT(lang);
  const [notifs, setNotifs] = React.useState(window.DATA.notifications);
  return (
    <div>
      <MHeader title={t('notif_title')} onBack={nav.pop}
        trailing={
          <button onClick={() => setNotifs(notifs.map((n) => ({ ...n, read: true })))}
            style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', padding: 8 }}>
            {t('notif_mark_all')}
          </button>
        }/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px 16px' }}>
        {notifs.map((n) => (
          <MCard key={n.id} onClick={() => setNotifs(notifs.map((x) => x.id === n.id ? { ...x, read: true } : x))}
            style={{ padding: 13, borderRadius: 15, display: 'flex', gap: 11, alignItems: 'flex-start', opacity: n.read ? 0.72 : 1 }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, flex: 'none', display: 'grid', placeItems: 'center',
              background: n.type === 'request' ? 'var(--info-soft)' : n.type === 'feedback' ? 'var(--warning-soft)' : 'var(--primary-soft)',
              color: n.type === 'request' ? 'var(--info)' : n.type === 'feedback' ? 'var(--warning)' : 'var(--primary)' }}>
              <Icon name={n.type === 'request' ? 'doc' : n.type === 'feedback' ? 'megaphone' : 'bell'} size={16}/>
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 13, fontWeight: n.read ? 500 : 700, lineHeight: 1.45 }}>{pick(n, lang)}</span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>{n.at}</span>
            </span>
            {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flex: 'none', marginTop: 5 }}></span>}
          </MCard>
        ))}
      </div>
    </div>
  );
}

function McProfile({ lang, nav, onLogout }) {
  const t = useT(lang);
  const u = window.DATA.user;
  const rows = [
    { icon: 'doc', label: t('my_requests'), go: () => nav.setTab('requests') },
    { icon: 'megaphone', label: t('my_feedback'), go: () => nav.push('fbList') },
    { icon: 'bell', label: t('notif_title'), go: () => nav.push('notifications') },
    { icon: 'shield', label: t('m_settings'), go: () => {} },
    { icon: 'headset', label: t('m_help'), go: () => {} },
  ];
  return (
    <div>
      <MHeader title={t('profile_title')} big/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MCard style={{ padding: 16, borderRadius: 18, display: 'flex', alignItems: 'center', gap: 13 }}>
          <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-soft-2)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 19, flex: 'none' }}>MH</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: 15.5 }}>{u.fullName}</strong>
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{u.phone}</span>
          </span>
          {u.verified && <Badge tone="success" dot={false}><Icon name="shield" size={12}/>{t('profile_verified')}</Badge>}
        </MCard>
        <MCard style={{ padding: '2px 6px', borderRadius: 18 }}>
          {rows.map((r, i) => (
            <button key={r.label} onClick={r.go}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', minHeight: 52, padding: '0 10px', border: 'none', background: 'none', borderTop: i ? '1px solid var(--line-soft)' : 'none', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}>
                <Icon name={r.icon} size={16}/>
              </span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{r.label}</span>
              <Icon name="chevronright" size={15} style={{ color: 'var(--ink-4)' }}/>
            </button>
          ))}
        </MCard>
        <MBtn variant="secondary" onClick={onLogout} style={{ color: 'var(--danger)' }}>{t('logout')}</MBtn>
        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-4)' }}>{t('m_version')}</p>
      </div>
    </div>
  );
}

// ---------- Chi tiết thông báo ----------
function McAnnouncementDetail({ lang, nav, params }) {
  const t = useT(lang);
  const a = window.DATA.announcements.find((x) => x.id === params.id) || window.DATA.announcements[0];
  const MC_AN_TONE = { thongbao: 'info', huongdan: 'success', khancap: 'danger' };
  const MC_AN_LABEL = { thongbao: { vi: 'Thông báo', en: 'Notice' }, huongdan: { vi: 'Hướng dẫn', en: 'Guide' }, khancap: { vi: 'Khẩn cấp', en: 'Urgent' } };
  const tone = MC_AN_TONE[a.tag];
  const body = (lang === 'en' ? a.bodyEn : a.bodyVi) || '';
  return (
    <div>
      <MHeader title={t('announcements_title')} onBack={nav.pop}/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MCard style={{ padding: 16, borderRadius: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            <Badge tone={tone} dot={false}>{pick(MC_AN_LABEL[a.tag], lang)}</Badge>
            <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{a.date}</span>
          </div>
          <strong style={{ display: 'block', fontSize: 16, lineHeight: 1.45, marginTop: 10 }}>{pick(a, lang)}</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {body.split('\n').filter(Boolean).map((par, i) => (
              <p key={i} style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink-2)' }}>{par}</p>
            ))}
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--ink-4)', borderTop: '1px solid var(--line-soft)', paddingTop: 11, marginTop: 13 }}>{t('an_source')}</p>
        </MCard>
      </div>
    </div>
  );
}

Object.assign(window, { McCreateRequest, McRequests, McRequestDetail, McCreateFeedback, McFeedbackList, McFeedbackDetail, McNotifications, McProfile, McAnnouncementDetail });
