// ============================================================
// App Cán bộ (mobile) — Tổng quan, HS được giao, PA được giao,
// Cập nhật trạng thái, Thông báo, Cá nhân
// ============================================================

function MoDashboard({ lang, nav }) {
  const t = useT(lang);
  const k = window.ODATA.kpi;
  const me = window.ODATA.me;
  const mine = window.ODATA.requests.filter((r) => r.officerId === me.id && !['completed', 'rejected'].includes(r.status));
  const kpis = [
    { label: t('kpi_open_requests'), value: k.open, icon: 'clock', tone: 'warning' },
    { label: t('kpi_open_feedback'), value: k.openFeedback, icon: 'megaphone', tone: 'danger' },
    { label: t('kpi_resolved_requests'), value: k.resolved.toLocaleString('vi-VN'), icon: 'check', tone: 'success' },
    { label: t('kpi_sla'), value: k.sla, icon: 'shield', tone: 'info' },
  ];
  return (
    <div>
      <div style={{ padding: '6px 18px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{t('m_greeting')}</div>
          <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em' }}>{me.name}</div>
        </div>
        <button onClick={() => nav.push('notifications')} aria-label={t('notifications')}
          style={{ position: 'relative', width: 42, height: 42, borderRadius: '50%', border: 'none', background: '#fff', boxShadow: 'var(--shadow-sm)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)' }}>
          <Icon name="bell" size={19}/>
          <span style={{ position: 'absolute', top: 3, right: 4, width: 9, height: 9, borderRadius: '50%', background: 'var(--primary)', border: '2px solid #fff' }}></span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, padding: '16px 16px 0' }}>
        {kpis.map((x) => (
          <MCard key={x.label} style={{ padding: 14, borderRadius: 17 }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: `var(--${x.tone}-soft)`, color: `var(--${x.tone})`, display: 'grid', placeItems: 'center' }}>
              <Icon name={x.icon} size={16}/>
            </span>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 8, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{x.value}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 600, lineHeight: 1.3 }}>{x.label}</div>
          </MCard>
        ))}
      </div>

      <MSection title={t('m_assigned_req') + ` (${mine.length})`}
        action={<button onClick={() => nav.setTab('requests')} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{t('view_all')}</button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {mine.slice(0, 3).map((r) => {
            const s = window.DATA.services.find((x) => x.id === r.serviceId);
            return (
              <MCard key={r.id} onClick={() => nav.push('reqUpdate', { id: r.id })} style={{ padding: 13, borderRadius: 15 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <strong style={{ fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>{r.id}</strong>
                  <StatusBadge status={r.status} map={window.STATUS_META} lang={lang}/>
                </div>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, marginTop: 5 }}>{s ? pick(s, lang) : ''} — {r.citizen}</span>
                <span style={{ marginTop: 4, display: 'block' }}><DueBadge dueState={r.dueState} due={r.due} lang={lang}/></span>
              </MCard>
            );
          })}
        </div>
      </MSection>
    </div>
  );
}

// ---------- Hồ sơ được giao ----------
function MoRequests({ lang, nav }) {
  const t = useT(lang);
  const [filter, setFilter] = React.useState('open');
  const me = window.ODATA.me;
  const mine = window.ODATA.requests.filter((r) => r.officerId === me.id);
  const list = filter === 'open' ? mine.filter((r) => !['completed', 'rejected'].includes(r.status)) : mine;
  return (
    <div>
      <MHeader title={t('m_assigned_req')} big/>
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 3, background: 'var(--bg-sunken)', borderRadius: 12, padding: 3, width: 'fit-content' }}>
          {[['open', lang === 'en' ? 'Open' : 'Đang mở'], ['all', t('all')]].map(([v, label]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ border: 'none', borderRadius: 9, padding: '8px 16px', fontWeight: 700, fontSize: 12.5, background: filter === v ? '#fff' : 'transparent', color: filter === v ? 'var(--ink)' : 'var(--ink-3)', boxShadow: filter === v ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '12px 16px 16px' }}>
        {list.map((r) => {
          const s = window.DATA.services.find((x) => x.id === r.serviceId);
          return (
            <MCard key={r.id} onClick={() => nav.push('reqUpdate', { id: r.id })} style={{ padding: 14, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <strong style={{ fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>{r.id}</strong>
                <StatusBadge status={r.status} map={window.STATUS_META} lang={lang}/>
              </div>
              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, marginTop: 6 }}>{s ? pick(s, lang) : ''}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{r.citizen} · {r.ward}</span>
              <span style={{ marginTop: 5, display: 'block' }}><DueBadge dueState={r.dueState} due={r.due} lang={lang}/></span>
            </MCard>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Cập nhật trạng thái hồ sơ ----------
function MoRequestUpdate({ lang, nav, params, showToast }) {
  const t = useT(lang);
  const r = window.ODATA.requests.find((x) => x.id === params.id) || window.ODATA.requests[0];
  const s = window.DATA.services.find((x) => x.id === r.serviceId);
  const [status, setStatus] = React.useState(r.status);
  const [note, setNote] = React.useState('');
  const order = ['submitted', 'received', 'processing', 'waiting', 'completed', 'rejected'];
  return (
    <div>
      <MHeader title={r.id} onBack={nav.pop}/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MCard style={{ padding: 14, borderRadius: 16 }}>
          <strong style={{ fontSize: 14, display: 'block' }}>{s ? pick(s, lang) : ''}</strong>
          <span style={{ fontSize: 12.5, color: 'var(--ink-3)', display: 'block', marginTop: 4 }}>{r.citizen} · {r.phone}</span>
          <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{r.ward} · {t('tbl_submitted')}: {r.submitted}</span>
          <span style={{ marginTop: 7, display: 'block' }}><DueBadge dueState={r.dueState} due={r.due} lang={lang}/></span>
        </MCard>

        <MCard style={{ padding: 16, borderRadius: 16 }}>
          <strong style={{ fontSize: 13.5, display: 'block', marginBottom: 12 }}>{t('act_update_status')}</strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {order.map((st) => {
              const meta = window.STATUS_META[st];
              const active = status === st;
              return (
                <label key={st} style={{ display: 'flex', alignItems: 'center', gap: 11, border: '1.5px solid', borderColor: active ? 'var(--primary)' : 'var(--line)', background: active ? 'var(--primary-soft)' : '#fff', borderRadius: 13, padding: '0 13px', minHeight: 46, cursor: 'pointer' }}>
                  <input type="radio" name="mo-status" checked={active} onChange={() => setStatus(st)} style={{ accentColor: 'var(--primary)' }}/>
                  <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{t(meta.labelKey)}</span>
                  {active && <Icon name="check" size={15} style={{ color: 'var(--primary)' }}/>}
                </label>
              );
            })}
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" style={{ fontSize: 13 }}>{t('dt_note_internal')}</label>
            <textarea className="textarea" style={{ fontSize: 14, borderRadius: 13, minHeight: 70 }} placeholder={t('dt_note_ph')} value={note} onChange={(e) => setNote(e.target.value)}></textarea>
          </div>
          <MBtn style={{ marginTop: 12 }} onClick={() => { r.status = status; if (['completed','rejected'].includes(status)) r.dueState = 'done'; showToast(t('dt_saved')); nav.pop(); }}>
            <Icon name="check" size={16}/>{t('act_save')}
          </MBtn>
        </MCard>
      </div>
    </div>
  );
}

// ---------- Phản ánh được giao ----------
function MoFeedback({ lang, nav }) {
  const t = useT(lang);
  const list = window.ODATA.feedbacks.filter((f) => f.officerId === 'of3' || f.officerId === window.ODATA.me.id || !f.officerId);
  return (
    <div>
      <MHeader title={t('m_assigned_fb')} big/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '0 16px 16px' }}>
        {list.map((f) => {
          const c = window.DATA.feedbackCategories.find((x) => x.id === f.categoryId);
          return (
            <MCard key={f.id} onClick={() => nav.push('fbUpdate', { id: f.id })} style={{ padding: 14, borderRadius: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{f.id}</span>
                <span style={{ display: 'flex', gap: 6 }}>
                  <StatusBadge status={f.priority} map={window.PRIORITY_META} lang={lang}/>
                  <StatusBadge status={f.status} map={window.FB_STATUS_META} lang={lang}/>
                </span>
              </div>
              <strong style={{ display: 'block', fontSize: 13.5, lineHeight: 1.4, marginTop: 6 }}>{f.title}</strong>
              <span style={{ fontSize: 11.5, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                <Icon name={c.icon} size={12}/>{pick(c, lang)} · {f.ward}
              </span>
            </MCard>
          );
        })}
      </div>
    </div>
  );
}

function MoFeedbackUpdate({ lang, nav, params, showToast }) {
  const t = useT(lang);
  const f = window.ODATA.feedbacks.find((x) => x.id === params.id) || window.ODATA.feedbacks[0];
  const citizenData = window.DATA.feedbacks.find((x) => x.id === f.id);
  const [status, setStatus] = React.useState(f.status);
  const [reply, setReply] = React.useState('');
  const order = ['received', 'assigned', 'processing', 'resolved', 'closed'];
  return (
    <div>
      <MHeader title={f.id} onBack={nav.pop} trailing={<StatusBadge status={f.priority} map={window.PRIORITY_META} lang={lang}/>}/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MCard style={{ padding: 14, borderRadius: 16 }}>
          <strong style={{ fontSize: 14, lineHeight: 1.4, display: 'block' }}>{f.title}</strong>
          {citizenData && <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, marginTop: 6 }}>{citizenData.desc}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {(citizenData ? citizenData.attachments : [{ type: 'image' }]).map((a, i) => (
              <div key={i} style={{ width: 60, height: 60, borderRadius: 12, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-4)' }}>
                <Icon name={a.type === 'video' ? 'video' : 'camera'} size={19}/>
              </div>
            ))}
          </div>
        </MCard>
        <MMap height={150} points={[{ lat: f.lat, lng: f.lng }]} center={[f.lat, f.lng]} zoom={15}/>

        <MCard style={{ padding: 16, borderRadius: 16 }}>
          <strong style={{ fontSize: 13.5, display: 'block', marginBottom: 12 }}>{t('act_update_status')}</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {order.map((st) => {
              const meta = window.FB_STATUS_META[st];
              const active = status === st;
              return (
                <button key={st} onClick={() => setStatus(st)}
                  style={{ border: '1.5px solid', borderColor: active ? 'var(--primary)' : 'var(--line)', background: active ? 'var(--primary-soft)' : '#fff', color: active ? 'var(--primary)' : 'var(--ink-2)', borderRadius: 99, padding: '10px 15px', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', minHeight: 44 }}>
                  {t(meta.labelKey)}
                </button>
              );
            })}
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label" style={{ fontSize: 13 }}>{t('act_respond_citizen')}</label>
            <textarea className="textarea" style={{ fontSize: 14, borderRadius: 13, minHeight: 70 }} placeholder={t('dt_response_ph')} value={reply} onChange={(e) => setReply(e.target.value)}></textarea>
          </div>
          <MBtn style={{ marginTop: 12 }} onClick={() => { f.status = status; showToast(t('dt_saved')); nav.pop(); }}>
            <Icon name="send" size={16}/>{t('act_save')}
          </MBtn>
        </MCard>
      </div>
    </div>
  );
}

function MoProfile({ lang, nav, onLogout }) {
  const t = useT(lang);
  const me = window.ODATA.me;
  const profile = window.ADATA ? window.ADATA.officerProfiles.find((o) => o.id === me.id) : null;
  return (
    <div>
      <MHeader title={t('profile_title')} big/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MCard style={{ padding: 16, borderRadius: 18, display: 'flex', alignItems: 'center', gap: 13 }}>
          <span style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 18, flex: 'none' }}>{me.initials}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: 15.5 }}>{me.name}</strong>
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{pick(me.role, lang)}</span>
          </span>
        </MCard>
        {profile && (
          <MCard style={{ padding: '4px 14px', borderRadius: 16 }}>
            {[
              [t('o_department'), profile.dept],
              [t('o_position'), profile.position],
              [t('o_area'), profile.area],
            ].map(([label, v], i) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', fontSize: 13.5 }}>
                <span style={{ color: 'var(--ink-3)' }}>{label}</span>
                <strong style={{ textAlign: 'right' }}>{v}</strong>
              </div>
            ))}
          </MCard>
        )}
        <MBtn variant="secondary" onClick={onLogout} style={{ color: 'var(--danger)' }}>{t('logout')}</MBtn>
        <p style={{ textAlign: 'center', fontSize: 11.5, color: 'var(--ink-4)' }}>{t('m_version')}</p>
      </div>
    </div>
  );
}

Object.assign(window, { MoDashboard, MoRequests, MoRequestUpdate, MoFeedback, MoFeedbackUpdate, MoProfile });
