// ============================================================
// Cổng cán bộ — Quản lý phản ánh (danh sách + chi tiết) — đọc/ghi API thật
// Nguồn: /api/manage/feedback/* , /api/manage/officers , /api/feedback/categories , /api/provinces/*/wards
// ============================================================

const FB_STATUS_ORDER = ['submitted', 'received', 'assigned', 'processing', 'resolved', 'rejected', 'closed'];
const FB_PRIORITY_ORDER = ['urgent', 'high', 'medium', 'low'];

// Workflow chuyển trạng thái phản ánh (khớp backend FeedbackWorkflow). Khóa UI → các trạng thái kế tiếp hợp lệ.
const FB_WORKFLOW = {
  submitted: ['received', 'assigned', 'rejected'],
  received: ['assigned', 'processing', 'rejected'],
  assigned: ['processing', 'rejected'],
  processing: ['resolved', 'rejected'],
  resolved: ['closed'],
  rejected: ['closed'],
  closed: [],
};

// Tải danh bạ phụ trợ cho phản ánh: loại phản ánh + cán bộ (OF1) + phường/xã.
function useFeedbackCatalogs() {
  const API = window.API;
  return useApiData((signal) => Promise.all([
    API.getFeedbackCategories({ signal }),
    API.manage.officers({ signal }),
    API.getAllWards({ signal }),
  ]).then(([categories, officers, wards]) => {
    const categoryMap = {}; categories.forEach((c) => { categoryMap[c.id] = c; });
    const wardMap = {}; wards.forEach((w) => { wardMap[w.code] = w.name; });
    return { categories, officers, wards, categoryMap, wardMap };
  }), []);
}

// ---------- Danh sách phản ánh ----------
function OfficerFeedback({ lang, navigate, showToast }) {
  const t = useT(lang);
  const API = window.API;
  const [fStatus, setFStatus] = React.useState('all');
  const [fCat, setFCat] = React.useState('all');
  const [fPriority, setFPriority] = React.useState('all');
  const [fWard, setFWard] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [assigning, setAssigning] = React.useState(null); // raw feedback id

  const catalogs = useFeedbackCatalogs();
  const cat = catalogs.data || { categories: [], officers: [], wards: [], categoryMap: {}, wardMap: {} };

  const PAGE_SIZE = 8;
  const list = useApiData((signal) => API.manage.feedback({
    status: fStatus === 'all' ? null : fStatus,
    categoryId: fCat === 'all' ? null : fCat,
    priority: fPriority === 'all' ? null : fPriority,
    wardCode: fWard === 'all' ? null : fWard,
    page, pageSize: PAGE_SIZE,
  }, { signal }), [fStatus, fCat, fPriority, fWard, page]);

  // Đổi bộ lọc → quay về trang 1.
  React.useEffect(() => { setPage(1); }, [fStatus, fCat, fPriority, fWard]);

  const paged = list.data;
  const rows = (paged && paged.items) || [];
  const total = paged ? paged.total : 0;

  const selStyle = { width: 'auto', flex: '0 1 auto', paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' };
  const pageProps = paged ? {
    page: paged.page, pageCount: paged.totalPages, setPage,
    from: total ? (paged.page - 1) * paged.pageSize + 1 : 0,
    to: Math.min(paged.page * paged.pageSize, total), total,
  } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '-0.01em' }}>{t('op_feedback')}</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)', marginTop: 4 }}><strong style={{ color: 'var(--ink)' }}>{total}</strong> {t('results')}</p>
      </div>

      {/* Bộ lọc */}
      <div className="op-filter-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select className="select" style={selStyle} value={fStatus} onChange={(e) => setFStatus(e.target.value)} aria-label={t('tbl_status')}>
          <option value="all">{t('tbl_status')}: {t('all')}</option>
          {FB_STATUS_ORDER.map((s) => <option key={s} value={s}>{t(window.FB_STATUS_META[s].labelKey)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fCat} onChange={(e) => setFCat(e.target.value)} aria-label={t('tbl_category')}>
          <option value="all">{t('tbl_category')}: {t('all')}</option>
          {cat.categories.map((c) => <option key={c.id} value={c.id}>{pick(c, lang)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fPriority} onChange={(e) => setFPriority(e.target.value)} aria-label={t('tbl_priority')}>
          <option value="all">{t('tbl_priority')}: {t('all')}</option>
          {FB_PRIORITY_ORDER.map((p) => <option key={p} value={p}>{t(window.PRIORITY_META[p].labelKey)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fWard} onChange={(e) => setFWard(e.target.value)} aria-label={t('tbl_ward')}>
          <option value="all">{t('tbl_ward')}: {t('all')}</option>
          {cat.wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
        </select>
      </div>

      {/* Bảng */}
      <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
        <OpApiState loading={list.loading} error={list.error} reload={list.reload} lang={lang} minHeight={260}>
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
              {rows.map((f) => {
                const c = cat.categoryMap[f.categoryId];
                const wardName = f.wardCode != null ? (cat.wardMap[f.wardCode] || f.wardCode) : '—';
                return (
                  <tr key={f.rawId} onClick={() => navigate('feedback/' + f.rawId)}>
                    <td><strong style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--fs-13)' }}>{f.id}</strong></td>
                    <td style={{ maxWidth: 280 }}>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--fs-14)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</span>
                      <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{f.submitted}</span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 'var(--fs-13)', color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                        {c && <Icon name={c.icon} size={15} style={{ color: 'var(--ink-3)' }}/>}{c ? pick(c, lang) : '—'}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{wardName}</td>
                    <td><StatusBadge status={f.priority} map={window.PRIORITY_META} lang={lang}/></td>
                    <td><OfficerCell officerId={f.officerId} lang={lang} officers={cat.officers}/></td>
                    <td><StatusBadge status={f.status} map={window.FB_STATUS_META} lang={lang}/></td>
                    <td>
                      <span onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setAssigning(f.rawId)} className="btn btn-secondary btn-sm" style={{ fontSize: 'var(--fs-13)' }}>
                          {t('act_assign')}
                        </button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {total === 0 && <EmptyState icon="megaphone" title={t('empty')}/>}
          {pageProps && <Pagination {...pageProps} lang={lang}/>}
        </OpApiState>
      </div>

      {assigning &&
        <AssignModal lang={lang} officers={cat.officers} current={(rows.find((f) => f.rawId === assigning) || {}).officerId} onClose={() => setAssigning(null)}
          onAssign={(officerId) => {
            const id = assigning; setAssigning(null);
            API.manage.assignFeedback(id, officerId).then(() => { showToast(t('dt_saved')); list.reload(); }).catch(() => showToast(t('err_save')));
          }}/>
      }
    </div>
  );
}

// ---------- Chi tiết phản ánh (cán bộ) ----------
function OfficerFeedbackDetail({ lang, navigate, showToast, feedbackId }) {
  const t = useT(lang);
  const API = window.API;
  const me = window.ODATA.me || {};

  const catalogs = useFeedbackCatalogs();
  const cat = catalogs.data || { categoryMap: {}, wardMap: {}, officers: [] };
  const detail = useApiData((signal) => API.manage.feedbackDetail(feedbackId, { signal }), [feedbackId]);
  const f = detail.data;

  const [newStatus, setNewStatus] = React.useState('');
  const [note, setNote] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [reply, setReply] = React.useState('');
  const [assigning, setAssigning] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // Đồng bộ trạng thái đang chọn khi tải xong / đổi phản ánh.
  React.useEffect(() => { if (f) setNewStatus(f.status); }, [f && f.status, feedbackId]);

  // Bản đồ vị trí — khởi tạo sau khi tải xong và có toạ độ.
  const mapDiv = React.useRef(null);
  const mapRef = React.useRef(null);
  React.useEffect(() => {
    if (!f || f.lat == null || f.lng == null || !mapDiv.current || mapRef.current) return;
    const map = L.map(mapDiv.current, { scrollWheelZoom: false }).setView([f.lat, f.lng], 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    const icon = L.divIcon({ className: '', html: `<div style="width:32px;height:32px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:var(--primary);border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`, iconSize: [32, 32], iconAnchor: [16, 28] });
    L.marker([f.lat, f.lng], { icon }).addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, [f && f.rawId, f && f.lat, f && f.lng]);

  const reassign = (officerId) => {
    setAssigning(false);
    API.manage.assignFeedback(feedbackId, officerId).then(() => { showToast(t('dt_saved')); detail.reload(); }).catch(() => showToast(t('err_save')));
  };

  const save = () => {
    if (!f || busy) return;
    const changed = newStatus !== f.status;
    if (!changed && !note.trim()) return;
    setBusy(true);
    const op = changed
      ? API.manage.changeFeedbackStatus(feedbackId, newStatus, note.trim() || null)
      : API.manage.addFeedbackComment(feedbackId, note.trim(), true);
    op.then(() => { setNote(''); showToast(t('dt_saved')); detail.reload(); })
      .catch(() => showToast(changed ? t('err_status_change') : t('err_save')))
      .finally(() => setBusy(false));
  };

  const addComment = () => {
    if (!comment.trim()) return;
    const text = comment.trim(); setComment('');
    API.manage.addFeedbackComment(feedbackId, text, true).then(() => detail.reload()).catch(() => showToast(t('err_save')));
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    const text = reply.trim(); setReply('');
    API.manage.addFeedbackComment(feedbackId, text, false)
      .then(() => { showToast(t('dt_sent')); detail.reload(); })
      .catch(() => showToast(t('err_save')));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('feedback')}><Icon name="arrowleft" size={15}/>{t('back')}</button>
        {f && <h1 style={{ fontSize: 'var(--fs-20)', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{f.id}</h1>}
        {f && <StatusBadge status={f.status} map={window.FB_STATUS_META} lang={lang}/>}
        {f && <StatusBadge status={f.priority} map={window.PRIORITY_META} lang={lang}/>}
      </div>

      <OpApiState loading={detail.loading} error={detail.error} reload={detail.reload} lang={lang} minHeight={320}>
        {f && (() => {
          const c = cat.categoryMap[f.categoryId];
          const wardName = f.wardCode != null ? (cat.wardMap[f.wardCode] || f.wardCode) : '';
          const allowed = FB_WORKFLOW[f.status] || [];
          const statusOptions = [f.status].concat(allowed);
          const terminal = allowed.length === 0;
          const publicComments = (f.comments || []).filter((m) => !m.isInternal);
          const internalComments = (f.comments || []).filter((m) => m.isInternal);

          return (
            <div className="ofd-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Sự việc */}
                <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
                  <h2 style={{ fontSize: 'var(--fs-18)', lineHeight: 1.4 }}>{f.title}</h2>
                  <div style={{ display: 'flex', gap: 14, marginTop: 8, fontSize: 'var(--fs-13)', color: 'var(--ink-3)', flexWrap: 'wrap' }}>
                    {c && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={c.icon} size={14}/>{pick(c, lang)}</span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" size={14}/>{f.submitted}</span>
                    {(f.address || wardName) && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="mappin" size={14}/>{f.address || wardName}</span>}
                  </div>
                  {f.desc && <p style={{ fontSize: 'var(--fs-15)', color: 'var(--ink-2)', lineHeight: 1.7, marginTop: 14 }}>{f.desc}</p>}

                  {/* Người gửi */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginTop: 16 }}>
                    <InitialsAvatar text={f.citizen} size={40}/>
                    <span>
                      <strong style={{ display: 'block', fontSize: 'var(--fs-14)' }}>{f.citizen}</strong>
                      <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{f.phone || '—'}</span>
                    </span>
                  </div>

                  {/* Bằng chứng */}
                  <h3 style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '18px 0 10px' }}>{t('dt_evidence')}</h3>
                  {(f.attachments || []).length === 0
                    ? <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')}</p>
                    : <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {f.attachments.map((a) => {
                          const isVideo = /^video\//i.test(a.contentType) || /\.(mp4|mov|webm)$/i.test(a.fileName || a.url);
                          return (
                            <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" style={{ width: 138, borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--line)', textDecoration: 'none', color: 'inherit' }}>
                              <div style={{ height: 92, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-4)' }}>
                                <Icon name={isVideo ? 'video' : 'camera'} size={26}/>
                              </div>
                              <div style={{ padding: '7px 10px', fontSize: 'var(--fs-12)', color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.fileName || a.url}</div>
                            </a>
                          );
                        })}
                      </div>}
                </section>

                {/* Liên hệ người dân (chat công dân — comment công khai) */}
                <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
                  <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 14 }}>{t('dt_citizen_comm')}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {publicComments.length === 0 && <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')}</p>}
                    {publicComments.map((m) => {
                      const fromOfficer = m.authorId !== f.citizenId;
                      return (
                        <div key={m.id} style={{ display: 'flex', justifyContent: fromOfficer ? 'flex-end' : 'flex-start' }}>
                          <div style={{ maxWidth: '78%', background: fromOfficer ? 'var(--primary-soft)' : 'var(--bg-sunken)', borderRadius: fromOfficer ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px' }}>
                            <p style={{ fontSize: 'var(--fs-14)', lineHeight: 1.55 }}>{m.content}</p>
                            <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)', display: 'block', marginTop: 3, textAlign: fromOfficer ? 'right' : 'left' }}>{m.authorName} · {m.at}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                    <input className="input" placeholder={t('dt_response_ph')} value={reply} onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }} style={{ flex: 1 }}/>
                    <button className="btn btn-primary" onClick={sendReply} disabled={!reply.trim()}><Icon name="send" size={15}/>{t('act_send')}</button>
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
                      {f.officerId ? <OfficerCell officerId={f.officerId} lang={lang} officers={cat.officers}/> : <span style={{ color: 'var(--ink-3)' }}>{t('unassigned')}</span>}
                      <Icon name="chevrondown" size={15} style={{ marginLeft: 'auto', color: 'var(--ink-4)' }}/>
                    </button>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="ofd-status">{t('dt_new_status')}</label>
                    <select id="ofd-status" className="select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} disabled={terminal}>
                      {statusOptions.map((st) => <option key={st} value={st}>{t(window.FB_STATUS_META[st].labelKey)}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="ofd-note">{t('dt_note_internal')}</label>
                    <textarea id="ofd-note" className="textarea" style={{ minHeight: 72 }} placeholder={t('dt_note_ph')} value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                  </div>
                  <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={save} disabled={busy || (terminal && !note.trim())}>
                    <Icon name="check" size={16}/>{t('act_save')}
                  </button>
                </section>

                {/* Vị trí */}
                {f.lat != null && f.lng != null &&
                  <section className="card" style={{ background: '#fff', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px 10px' }}><h2 style={{ fontSize: 'var(--fs-15)' }}>{t('fb_gps')}</h2></div>
                    <div ref={mapDiv} style={{ height: 210, zIndex: 0, position: 'relative' }}></div>
                  </section>}

                {/* Trao đổi nội bộ (comment isInternal) */}
                <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
                  <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('dt_internal_comments')}</h2>
                  <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 14px' }}>
                    <Icon name="lock" size={13}/>{t('op_internal_hint')}
                  </p>
                  {internalComments.length === 0 && <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {internalComments.map((n) =>
                      <div key={n.id} style={{ display: 'flex', gap: 10 }}>
                        <InitialsAvatar text={n.authorName} size={30}/>
                        <div style={{ flex: 1, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)', padding: '9px 13px' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: 'var(--fs-13)' }}>{n.authorName}</strong>
                            <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{n.at}</span>
                          </div>
                          <p style={{ fontSize: 'var(--fs-14)', marginTop: 2, lineHeight: 1.55 }}>{n.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
                    <InitialsAvatar text={me.name} size={30}/>
                    <input className="input" style={{ flex: 1, fontSize: 'var(--fs-14)', paddingTop: 9, paddingBottom: 9 }} placeholder={t('dt_note_ph')} value={comment} onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}/>
                    <button className="btn btn-primary btn-sm" onClick={addComment} disabled={!comment.trim()} aria-label={t('act_add_note')} style={{ height: 38 }}><Icon name="send" size={15}/></button>
                  </div>
                </section>
              </div>
            </div>
          );
        })()}
      </OpApiState>

      {assigning && f &&
        <AssignModal lang={lang} officers={cat.officers} current={f.officerId} onClose={() => setAssigning(false)} onAssign={reassign}/>
      }
      <style>{`@media (max-width: 980px) { .ofd-grid { grid-template-columns: 1fr !important; } .ofd-grid > div { position: static !important; } }`}</style>
    </div>
  );
}

Object.assign(window, { OfficerFeedback, OfficerFeedbackDetail, FB_STATUS_ORDER, FB_WORKFLOW });
