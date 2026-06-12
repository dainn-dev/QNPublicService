// ============================================================
// Cổng cán bộ — Quản lý phản ánh (danh sách + chi tiết)
// ============================================================

const FB_STATUS_ORDER = ['submitted', 'received', 'assigned', 'processing', 'resolved', 'closed'];

function OfficerFeedback({ lang, navigate, feedbacks, updateFeedback, showToast }) {
  const t = useT(lang);
  const [fStatus, setFStatus] = React.useState('all');
  const [fCat, setFCat] = React.useState('all');
  const [fPriority, setFPriority] = React.useState('all');
  const [fWard, setFWard] = React.useState('all');
  const [assigning, setAssigning] = React.useState(null);

  const filtered = feedbacks.filter((f) =>
    (fStatus === 'all' || f.status === fStatus) &&
    (fCat === 'all' || f.categoryId === fCat) &&
    (fPriority === 'all' || f.priority === fPriority) &&
    (fWard === 'all' || f.ward === fWard)
  );

  const selStyle = { width: 'auto', flex: '0 1 auto', paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' };
  const pg = usePagination(filtered, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '-0.01em' }}>{t('op_feedback')}</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)', marginTop: 4 }}><strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> {t('results')}</p>
      </div>

      {/* Bộ lọc */}
      <div className="op-filter-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select className="select" style={selStyle} value={fStatus} onChange={(e) => setFStatus(e.target.value)} aria-label={t('tbl_status')}>
          <option value="all">{t('tbl_status')}: {t('all')}</option>
          {FB_STATUS_ORDER.map((s) => <option key={s} value={s}>{t(window.FB_STATUS_META[s].labelKey)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fCat} onChange={(e) => setFCat(e.target.value)} aria-label={t('tbl_category')}>
          <option value="all">{t('tbl_category')}: {t('all')}</option>
          {window.DATA.feedbackCategories.map((c) => <option key={c.id} value={c.id}>{pick(c, lang)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fPriority} onChange={(e) => setFPriority(e.target.value)} aria-label={t('tbl_priority')}>
          <option value="all">{t('tbl_priority')}: {t('all')}</option>
          {['high', 'medium', 'low'].map((p) => <option key={p} value={p}>{t(window.PRIORITY_META[p].labelKey)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fWard} onChange={(e) => setFWard(e.target.value)} aria-label={t('tbl_ward')}>
          <option value="all">{t('tbl_ward')}: {t('all')}</option>
          {window.DATA.wards.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>

      {/* Bảng */}
      <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
        <table className="op-table">
          <thead>
            <tr>
              <th>{t('tbl_code')}</th>
              <th>{t('tbl_title')}</th>
              <th>{t('tbl_category')}</th>
              <th>{t('tbl_ward')}</th>
              <th>{t('tbl_priority')}</th>
              <th>{t('tbl_officer')}</th>
              <th>{t('tbl_status')}</th>
              <th style={{ width: 56 }}></th>
            </tr>
          </thead>
          <tbody>
            {pg.pageItems.map((f) => {
              const c = window.DATA.feedbackCategories.find((x) => x.id === f.categoryId);
              return (
                <tr key={f.id} onClick={() => navigate('feedback/' + f.id)}>
                  <td><strong style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--fs-13)' }}>{f.id}</strong></td>
                  <td style={{ maxWidth: 280 }}>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--fs-14)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</span>
                    <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{f.submitted}</span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 'var(--fs-13)', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                      <Icon name={c.icon} size={15} style={{ color: 'var(--ink-3)' }}/>{pick(c, lang)}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{f.ward}</td>
                  <td><StatusBadge status={f.priority} map={window.PRIORITY_META} lang={lang}/></td>
                  <td><OfficerCell officerId={f.officerId} lang={lang}/></td>
                  <td><StatusBadge status={f.status} map={window.FB_STATUS_META} lang={lang}/></td>
                  <td>
                    <span onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setAssigning(f.id)} className="btn btn-secondary btn-sm" style={{ fontSize: 'var(--fs-13)' }}>
                        {t('act_assign')}
                      </button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon="megaphone" title={t('empty')}/>}
        <Pagination {...pg} lang={lang}/>
      </div>

      {assigning && (
        <AssignModal lang={lang} current={(feedbacks.find((f) => f.id === assigning) || {}).officerId} onClose={() => setAssigning(null)}
          onAssign={(officerId) => { updateFeedback(assigning, { officerId, status: 'assigned' }); setAssigning(null); showToast(t('dt_saved')); }}/>
      )}
    </div>
  );
}

// ---------- Chi tiết phản ánh (cán bộ) ----------
function OfficerFeedbackDetail({ lang, navigate, feedbacks, updateFeedback, showToast, feedbackId }) {
  const t = useT(lang);
  const f = feedbacks.find((x) => x.id === feedbackId) || feedbacks[0];
  const c = window.DATA.feedbackCategories.find((x) => x.id === f.categoryId);
  const citizenData = window.DATA.feedbacks.find((x) => x.id === f.id); // mô tả + tệp nếu có
  const [newStatus, setNewStatus] = React.useState(f.status);
  const [comments, setComments] = React.useState(window.ODATA.internalComments[f.id] || []);
  const [messages, setMessages] = React.useState(window.ODATA.citizenMessages[f.id] || []);
  const [comment, setComment] = React.useState('');
  const [reply, setReply] = React.useState('');
  const [assigning, setAssigning] = React.useState(false);

  // Bản đồ vị trí
  const mapDiv = React.useRef(null);
  const mapRef = React.useRef(null);
  React.useEffect(() => {
    if (!mapDiv.current || mapRef.current) return;
    const map = L.map(mapDiv.current, { scrollWheelZoom: false }).setView([f.lat, f.lng], 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    const icon = L.divIcon({ className: '', html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:var(--primary);border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`, iconSize: [32, 32], iconAnchor: [16, 28] });
    L.marker([f.lat, f.lng], { icon }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  const addComment = () => {
    if (!comment.trim()) return;
    setComments([...comments, { officerId: window.ODATA.me.id, at: '11/06/2026 ' + new Date().toTimeString().slice(0, 5), text: comment.trim() }]);
    setComment('');
  };
  const sendReply = () => {
    if (!reply.trim()) return;
    setMessages([...messages, { from: 'officer', at: '11/06/2026 ' + new Date().toTimeString().slice(0, 5), text: reply.trim() }]);
    setReply('');
    showToast(t('dt_sent'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('feedback')}><Icon name="arrowleft" size={15}/>{t('back')}</button>
        <h1 style={{ fontSize: 'var(--fs-20)', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{f.id}</h1>
        <StatusBadge status={f.status} map={window.FB_STATUS_META} lang={lang}/>
        <StatusBadge status={f.priority} map={window.PRIORITY_META} lang={lang}/>
      </div>

      <div className="ofd-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Sự việc */}
          <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', lineHeight: 1.4 }}>{f.title}</h2>
            <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 'var(--fs-13)', color: 'var(--ink-3)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={c.icon} size={14}/>{pick(c, lang)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" size={14}/>{f.submitted}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="mappin" size={14}/>{f.ward}</span>
            </div>
            {citizenData && <p style={{ fontSize: 'var(--fs-15)', color: 'var(--ink-2)', lineHeight: 1.7, marginTop: 14 }}>{citizenData.desc}</p>}

            {/* Bằng chứng */}
            <h3 style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '18px 0 10px' }}>{t('dt_evidence')}</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {(citizenData ? citizenData.attachments : [{ type: 'image', name: 'hien-truong-1.jpg' }, { type: 'image', name: 'hien-truong-2.jpg' }]).map((a, i) => (
                <div key={i} style={{ width: 138, borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <div style={{ height: 92, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-4)' }}>
                    <Icon name={a.type === 'video' ? 'video' : 'camera'} size={26}/>
                  </div>
                  <div style={{ padding: '7px 10px', fontSize: 'var(--fs-12)', color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Liên hệ người dân */}
          <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
            <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 14 }}>{t('dt_citizen_comm')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.length === 0 && <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')}</p>}
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.from === 'officer' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '78%', background: m.from === 'officer' ? 'var(--primary-soft)' : 'var(--bg-sunken)', borderRadius: m.from === 'officer' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px' }}>
                    <p style={{ fontSize: 'var(--fs-14)', lineHeight: 1.55 }}>{m.text}</p>
                    <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)', display: 'block', marginTop: 3, textAlign: m.from === 'officer' ? 'right' : 'left' }}>{m.at}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <input className="input" placeholder={t('dt_response_ph')} value={reply} onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }} style={{ flex: 1 }}/>
              <button className="btn btn-primary" onClick={sendReply}><Icon name="send" size={15}/>{t('act_send')}</button>
            </div>
          </section>
        </div>

        {/* Cột phải */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 76 }}>
          {/* Xử lý */}
          <section className="card" style={{ padding: '20px 24px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('act_update_status')}</h2>
            <div className="field">
              <label className="field-label">{t('dt_assign_to')}</label>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => setAssigning(true)}>
                {f.officerId ? <OfficerCell officerId={f.officerId} lang={lang}/> : <span style={{ color: 'var(--ink-3)' }}>{t('unassigned')}</span>}
                <Icon name="chevrondown" size={15} style={{ marginLeft: 'auto', color: 'var(--ink-4)' }}/>
              </button>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ofd-status">{t('dt_new_status')}</label>
              <select id="ofd-status" className="select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {FB_STATUS_ORDER.map((st) => <option key={st} value={st}>{t(window.FB_STATUS_META[st].labelKey)}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" style={{ justifyContent: 'center' }}
              onClick={() => { updateFeedback(f.id, { status: newStatus }); showToast(t('dt_saved')); }}>
              <Icon name="check" size={16}/>{t('act_save')}
            </button>
          </section>

          {/* Vị trí */}
          <section className="card" style={{ background: '#fff', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 10px' }}><h2 style={{ fontSize: 'var(--fs-15)' }}>{t('fb_gps')}</h2></div>
            <div ref={mapDiv} style={{ height: 210, zIndex: 0, position: 'relative' }}></div>
          </section>

          {/* Trao đổi nội bộ */}
          <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
            <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 12 }}>{t('dt_internal_comments')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comments.length === 0 && <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')}</p>}
              {comments.map((n, i) => {
                const o = window.ODATA.officers.find((x) => x.id === n.officerId);
                return (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <OfficerAvatar officerId={n.officerId} size={28}/>
                    <div style={{ flex: 1, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)', padding: '8px 12px' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 'var(--fs-13)' }}>{o ? o.name : ''}</strong>
                        <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{n.at}</span>
                      </div>
                      <p style={{ fontSize: 'var(--fs-13)', marginTop: 2, lineHeight: 1.55 }}>{n.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input className="input" style={{ flex: 1, fontSize: 'var(--fs-14)', paddingTop: 9, paddingBottom: 9 }} placeholder={t('dt_note_ph')} value={comment} onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}/>
              <button className="btn btn-secondary btn-sm" onClick={addComment} aria-label={t('act_add_note')}><Icon name="send" size={15}/></button>
            </div>
          </section>
        </div>
      </div>

      {assigning && (
        <AssignModal lang={lang} current={f.officerId} onClose={() => setAssigning(false)}
          onAssign={(officerId) => { updateFeedback(f.id, { officerId, status: f.status === 'submitted' || f.status === 'received' ? 'assigned' : f.status }); setAssigning(false); showToast(t('dt_saved')); }}/>
      )}
      <style>{`@media (max-width: 980px) { .ofd-grid { grid-template-columns: 1fr !important; } .ofd-grid > div { position: static !important; } }`}</style>
    </div>
  );
}

Object.assign(window, { OfficerFeedback, OfficerFeedbackDetail, FB_STATUS_ORDER });
