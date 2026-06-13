// ============================================================
// Cổng cán bộ — Quản lý hồ sơ (danh sách + chi tiết) — đọc/ghi API thật
// Nguồn: /api/manage/service-requests/* , /api/manage/officers , /api/public-services , /api/service-points
// ============================================================

const REQ_STATUS_ORDER = ['submitted', 'received', 'processing', 'waiting', 'completed', 'rejected', 'cancelled'];

// Workflow chuyển trạng thái (khớp backend RequestWorkflow). Khóa UI → các trạng thái kế tiếp hợp lệ.
const REQ_WORKFLOW = {
  submitted: ['received', 'rejected', 'cancelled'],
  received: ['processing', 'rejected', 'cancelled'],
  processing: ['waiting', 'completed', 'rejected', 'cancelled'],
  waiting: ['processing', 'rejected', 'cancelled'],
  completed: [],
  rejected: [],
  cancelled: [],
};

// Icon gợi ý theo trạng thái đích (menu thao tác trên dòng).
const REQ_STATUS_ICON = {
  received: 'check', processing: 'navigation', waiting: 'clock',
  completed: 'shield', rejected: 'x', cancelled: 'x',
};

// Tải danh bạ phụ trợ: dịch vụ + điểm tiếp nhận + cán bộ (OF1). Dùng chung cho list & chi tiết.
function useOfficerCatalogs() {
  const API = window.API;
  return useApiData((signal) => Promise.all([
    API.getServices({}, { signal }),
    API.getServicePoints({ signal }),
    API.manage.officers({ signal }),
  ]).then(([services, points, officers]) => {
    const serviceMap = {}; services.forEach((s) => { serviceMap[s.id] = s; });
    const pointMap = {}; points.forEach((p) => { pointMap[p.id] = p; });
    return { services, points, officers, serviceMap, pointMap };
  }), []);
}

// ---------- Menu thao tác trên dòng (chỉ hiện các chuyển trạng thái hợp lệ) ----------
function RowActions({ lang, status, onAction }) {
  const t = useT(lang);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const items = [{ id: 'assign', icon: 'user', label: t('act_assign') }];
  (REQ_WORKFLOW[status] || []).forEach((st) => {
    items.push({
      id: 'status:' + st,
      icon: REQ_STATUS_ICON[st] || 'check',
      label: t(window.STATUS_META[st].labelKey),
      danger: st === 'rejected' || st === 'cancelled',
    });
  });

  return (
    <span ref={ref} style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setOpen(!open)} aria-label={t('tbl_actions')}
      style={{ border: '1.5px solid var(--line)', background: '#fff', borderRadius: 'var(--r-sm)', width: 30, height: 30, display: 'grid', placeItems: 'center', color: 'var(--ink-3)', fontWeight: 800, letterSpacing: 1 }}>
        ⋯
      </button>
      {open &&
      <div className="fade-up" style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 500, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)', minWidth: 168, padding: 5 }}>
          {items.map((it) =>
        <button key={it.id} onClick={() => {setOpen(false);onAction(it.id);}}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 'none', background: 'none', padding: '9px 12px', borderRadius: 'var(--r-sm)', fontSize: 'var(--fs-14)', fontWeight: 600, color: it.danger ? 'var(--danger)' : 'var(--ink-2)', textAlign: 'left', cursor: 'pointer' }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-sunken)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
              <Icon name={it.icon} size={15} />{it.label}
            </button>
        )}
        </div>
      }
    </span>);

}

// ---------- Hộp thoại phân công ----------
function AssignModal({ lang, current, officers, onClose, onAssign }) {
  const t = useT(lang);
  const [sel, setSel] = React.useState(current || '');
  const list = officers || window.ODATA.officers;
  return (
    <Modal title={t('act_assign')} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((o) =>
        <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid', borderColor: sel === o.id ? 'var(--primary)' : 'var(--line)', background: sel === o.id ? 'var(--primary-soft)' : '#fff', borderRadius: 'var(--r-md)', padding: '11px 14px', cursor: 'pointer' }}>
            <input type="radio" name="assignee" checked={sel === o.id} onChange={() => setSel(o.id)} style={{ accentColor: 'var(--primary)' }} />
            <OfficerAvatar officerId={o.id} size={32} officers={list} />
            <span>
              <strong style={{ display: 'block', fontSize: 'var(--fs-14)' }}>{o.name}</strong>
              <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{pick(o.dept, lang)}</span>
            </span>
          </label>
        )}
        {list.length === 0 && <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')}</p>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
        <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" disabled={!sel} onClick={() => onAssign(sel)}>{t('act_assign')}</button>
      </div>
    </Modal>);

}

// ---------- Danh sách hồ sơ ----------
function OfficerRequests({ lang, navigate, showToast }) {
  const t = useT(lang);
  const API = window.API;
  const [fStatus, setFStatus] = React.useState('all');
  const [fService, setFService] = React.useState('all');
  const [fPoint, setFPoint] = React.useState('all');
  const [fOfficer, setFOfficer] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const [assigning, setAssigning] = React.useState(null); // raw request id
  const [busyId, setBusyId] = React.useState(null);

  const catalogs = useOfficerCatalogs();
  const cat = catalogs.data || { services: [], points: [], officers: [], serviceMap: {}, pointMap: {} };

  const PAGE_SIZE = 8;
  const list = useApiData((signal) => API.manage.requests({
    status: fStatus === 'all' ? null : fStatus,
    publicServiceId: fService === 'all' ? null : fService,
    servicePointId: fPoint === 'all' ? null : fPoint,
    assignedOfficerId: fOfficer === 'all' ? null : fOfficer,
    page, pageSize: PAGE_SIZE,
  }, { signal }), [fStatus, fService, fPoint, fOfficer, page]);

  // Đổi bộ lọc → quay về trang 1.
  React.useEffect(() => { setPage(1); }, [fStatus, fService, fPoint, fOfficer]);

  const paged = list.data;
  const rows = (paged && paged.items) || [];
  const total = paged ? paged.total : 0;

  const doStatus = (rawId, status) => {
    setBusyId(rawId);
    API.manage.changeStatus(rawId, status)
      .then(() => { showToast(t('dt_saved')); list.reload(); })
      .catch(() => showToast(t('err_status_change')))
      .finally(() => setBusyId(null));
  };
  const act = (r, action) => {
    if (action === 'assign') { setAssigning(r.rawId); return; }
    if (action.indexOf('status:') === 0) doStatus(r.rawId, action.slice(7));
  };

  const selStyle = { width: 'auto', flex: '0 1 auto', paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' };
  const pageProps = paged ? {
    page: paged.page, pageCount: paged.totalPages, setPage,
    from: total ? (paged.page - 1) * paged.pageSize + 1 : 0,
    to: Math.min(paged.page * paged.pageSize, total), total,
  } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '-0.01em' }}>{t('op_requests')}</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)', marginTop: 4 }}><strong style={{ color: 'var(--ink)' }}>{total}</strong> {t('results')}</p>
      </div>

      {/* Bộ lọc */}
      <div className="op-filter-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select className="select" style={selStyle} value={fStatus} onChange={(e) => setFStatus(e.target.value)} aria-label={t('tbl_status')}>
          <option value="all">{t('tbl_status')}: {t('all')}</option>
          {REQ_STATUS_ORDER.map((s) => <option key={s} value={s}>{t(window.STATUS_META[s].labelKey)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fService} onChange={(e) => setFService(e.target.value)} aria-label={t('tbl_service')}>
          <option value="all">{t('tbl_service')}: {t('all')}</option>
          {cat.services.map((s) => <option key={s.id} value={s.id}>{pick(s, lang)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fPoint} onChange={(e) => setFPoint(e.target.value)} aria-label={t('tbl_point')}>
          <option value="all">{t('tbl_point')}: {t('all')}</option>
          {cat.points.map((p) => <option key={p.id} value={p.id}>{pick(p, lang)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fOfficer} onChange={(e) => setFOfficer(e.target.value)} aria-label={t('tbl_officer')}>
          <option value="all">{t('tbl_officer')}: {t('all')}</option>
          {cat.officers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>

      {/* Bảng */}
      <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
        <OpApiState loading={list.loading} error={list.error} reload={list.reload} lang={lang} minHeight={260}>
          <table className="op-table">
            <thead>
              <tr>
                <th>{t('tbl_code')}</th>
                <th>{t('tbl_citizen')}</th>
                <th>{t('tbl_service')}</th>
                <th>{t('tbl_point')}</th>
                <th>{t('tbl_officer')}</th>
                <th>{t('tbl_due')}</th>
                <th>{t('tbl_status')}</th>
                <th style={{ width: 56 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const s = cat.serviceMap[r.serviceId];
                const p = r.pointId ? cat.pointMap[r.pointId] : null;
                return (
                  <tr key={r.rawId} onClick={() => navigate('requests/' + r.rawId)} style={{ opacity: busyId === r.rawId ? 0.5 : 1 }}>
                    <td><strong style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--fs-13)' }}>{r.id}</strong></td>
                    <td>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--fs-14)' }}>{r.citizen}</span>
                      <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{r.phone}</span>
                    </td>
                    <td style={{ maxWidth: 220 }}><span style={{ display: 'block', fontSize: 'var(--fs-13)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s ? pick(s, lang) : ''}</span></td>
                    <td style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{p ? pick(p, lang) : '—'}</td>
                    <td><OfficerCell officerId={r.officerId} lang={lang} officers={cat.officers} /></td>
                    <td style={{ whiteSpace: 'nowrap' }}><DueBadge dueState={r.dueState} due={r.due} lang={lang} /></td>
                    <td><StatusBadge status={r.status} map={window.STATUS_META} lang={lang} /></td>
                    <td><RowActions lang={lang} status={r.status} onAction={(a) => act(r, a)} /></td>
                  </tr>);

              })}
            </tbody>
          </table>
          {total === 0 && <EmptyState icon="filesearch" title={t('empty')} />}
          {pageProps && <Pagination {...pageProps} lang={lang} />}
        </OpApiState>
      </div>

      {assigning &&
      <AssignModal lang={lang} officers={cat.officers} current={(rows.find((r) => r.rawId === assigning) || {}).officerId} onClose={() => setAssigning(null)}
      onAssign={(officerId) => {
        const id = assigning; setAssigning(null);
        API.manage.assign(id, officerId).then(() => { showToast(t('dt_saved')); list.reload(); }).catch(() => showToast(t('err_save')));
      }} />
      }
    </div>);

}

// ---------- Avatar chữ cái (cho trao đổi — tác giả là userId, không tra được danh bạ) ----------
function InitialsAvatar({ text, size = 30 }) {
  const ini = String(text || '?').trim().split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0].toUpperCase()).join('') || '?';
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'var(--primary-soft-2)', color: 'var(--primary)', display: 'inline-grid', placeItems: 'center', fontWeight: 700, fontSize: size * 0.38, flex: 'none' }}>
      {ini}
    </span>);
}

// ---------- Chi tiết hồ sơ (cán bộ) ----------
function OfficerRequestDetail({ lang, navigate, showToast, requestId }) {
  const t = useT(lang);
  const API = window.API;
  const me = window.ODATA.me || {};

  const catalogs = useOfficerCatalogs();
  const cat = catalogs.data || { serviceMap: {}, pointMap: {}, officers: [] };
  const detail = useApiData((signal) => API.manage.request(requestId, { signal }), [requestId]);
  const r = detail.data;

  const [newStatus, setNewStatus] = React.useState('');
  const [note, setNote] = React.useState('');
  const [comment, setComment] = React.useState('');
  const [docUrl, setDocUrl] = React.useState('');
  const [docName, setDocName] = React.useState('');
  const [assigning, setAssigning] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [docBusy, setDocBusy] = React.useState(false);

  // Đồng bộ trạng thái đang chọn khi tải xong / đổi hồ sơ.
  React.useEffect(() => { if (r) setNewStatus(r.status); }, [r && r.status, requestId]);

  const reassign = (officerId) => {
    setAssigning(false);
    API.manage.assign(requestId, officerId).then(() => { showToast(t('dt_saved')); detail.reload(); }).catch(() => showToast(t('err_save')));
  };

  const save = () => {
    if (!r || busy) return;
    const changed = newStatus !== r.status;
    if (!changed && !note.trim()) return;
    setBusy(true);
    const op = changed
      ? API.manage.changeStatus(requestId, newStatus, note.trim() || null)
      : API.manage.addComment(requestId, note.trim(), true);
    op.then(() => { setNote(''); showToast(t('dt_saved')); detail.reload(); })
      .catch(() => showToast(changed ? t('err_status_change') : t('err_save')))
      .finally(() => setBusy(false));
  };

  const supplement = () => {
    if (!r || busy) return;
    setBusy(true);
    API.manage.requestSupplement(requestId, note.trim() || null)
      .then(() => { setNote(''); showToast(t('dt_saved')); detail.reload(); })
      .catch(() => showToast(t('err_status_change')))
      .finally(() => setBusy(false));
  };

  const addComment = () => {
    if (!comment.trim()) return;
    const text = comment.trim(); setComment('');
    API.manage.addComment(requestId, text, true).then(() => detail.reload()).catch(() => showToast(t('err_save')));
  };

  const attachDoc = () => {
    if (!docUrl.trim() || docBusy) return;
    setDocBusy(true);
    API.manage.addDocument(requestId, { url: docUrl.trim(), fileName: docName.trim() || null, isSupplement: false })
      .then(() => { setDocUrl(''); setDocName(''); showToast(t('dt_saved')); detail.reload(); })
      .catch(() => showToast(t('err_save')))
      .finally(() => setDocBusy(false));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('requests')}><Icon name="arrowleft" size={15} />{t('back')}</button>
        {r && <h1 style={{ fontSize: 'var(--fs-20)', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{r.id}</h1>}
        {r && <StatusBadge status={r.status} map={window.STATUS_META} lang={lang} />}
        {r && <span style={{ marginLeft: 'auto' }}><DueBadge dueState={r.dueState} due={r.due} lang={lang} /></span>}
      </div>

      <OpApiState loading={detail.loading} error={detail.error} reload={detail.reload} lang={lang} minHeight={320}>
        {r && (() => {
          const s = cat.serviceMap[r.serviceId];
          const p = r.pointId ? cat.pointMap[r.pointId] : null;
          const allowed = REQ_WORKFLOW[r.status] || [];
          const statusOptions = [r.status].concat(allowed);
          const terminal = allowed.length === 0;
          const canSupplement = allowed.indexOf('waiting') !== -1;
          const internalComments = (r.comments || []).filter((c) => c.isInternal);
          const timeline = (r.history || []).map((h) => ({
            status: h.status, at: h.at,
            noteVi: h.note || t(window.STATUS_META[h.status] ? window.STATUS_META[h.status].labelKey : h.status),
            noteEn: h.note || t(window.STATUS_META[h.status] ? window.STATUS_META[h.status].labelKey : h.status),
          }));

          return (
            <div className="ord-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Thông tin */}
                <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
                  <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 6 }}>{t('req_info')}</h2>
                  {[
                  [t('tbl_service'), s ? pick(s, lang) : '—'],
                  [t('tbl_point'), p ? pick(p, lang) : '—'],
                  [t('tbl_submitted'), r.submitted || '—'],
                  [t('tbl_due'), r.due || '—']].
                  map(([label, value], i) =>
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 12, padding: '10px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', fontSize: 'var(--fs-14)' }}>
                      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
                      <strong style={{ fontWeight: 600 }}>{value}</strong>
                    </div>
                  )}
                </section>

                {/* Công dân */}
                <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
                  <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 12 }}>{t('dt_citizen_info')}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                    <InitialsAvatar text={r.citizen} size={44} />
                    <span>
                      <strong style={{ display: 'block', fontSize: 'var(--fs-15)' }}>{r.citizen}</strong>
                      <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{r.phone || '—'}</span>
                    </span>
                  </div>
                </section>

                {/* Giấy tờ theo yêu cầu của dịch vụ */}
                {s && s.documents && s.documents.length > 0 &&
                <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
                  <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 12 }}>{t('dt_documents')}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {s.documents.map((d, i) =>
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '9px 13px', fontSize: 'var(--fs-14)' }}>
                        <Icon name="doc" size={16} style={{ color: 'var(--primary)', flex: 'none' }} />
                        <span style={{ flex: 1 }}>{lang === 'en' ? d[1] : d[0]}</span>
                      </div>
                    )}
                  </div>
                </section>}

                {/* Tài liệu đã đính kèm + đính kèm theo URL */}
                <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
                  <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 12 }}>{t('dt_attached_docs')}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(r.documents || []).length === 0 && <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')}</p>}
                    {(r.documents || []).map((d) =>
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '9px 13px', fontSize: 'var(--fs-14)' }}>
                        <Icon name="doc" size={16} style={{ color: 'var(--primary)', flex: 'none' }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.fileName || d.url}</span>
                        {d.isSupplement && <Badge tone="info" dot={false}>{t('doc_supplement')}</Badge>}
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ fontSize: 'var(--fs-13)' }}>{t('doc_open')}</a>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    <input className="input" style={{ fontSize: 'var(--fs-14)' }} placeholder={t('doc_attach_ph')} value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="input" style={{ flex: 1, fontSize: 'var(--fs-14)' }} placeholder={t('doc_filename_ph')} value={docName} onChange={(e) => setDocName(e.target.value)} />
                      <button className="btn btn-primary btn-sm" onClick={attachDoc} disabled={!docUrl.trim() || docBusy}><Icon name="upload" size={15} />{t('doc_add')}</button>
                    </div>
                  </div>
                </section>

                {/* Lịch sử */}
                <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
                  <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 16 }}>{t('dt_history')}</h2>
                  {timeline.length === 0
                    ? <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')}</p>
                    : <Timeline items={timeline} statusMap={window.STATUS_META} lang={lang} />}
                </section>
              </div>

              {/* Bảng điều khiển xử lý */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 76 }}>
                <section className="card" style={{ padding: '20px 24px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('act_update_status')}</h2>
                  <div className="field">
                    <label className="field-label">{t('dt_assign_to')}</label>
                    <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => setAssigning(true)}>
                      {r.officerId ? <OfficerCell officerId={r.officerId} lang={lang} officers={cat.officers} /> : <span style={{ color: 'var(--ink-3)' }}>{t('unassigned')}</span>}
                      <Icon name="chevrondown" size={15} style={{ marginLeft: 'auto', color: 'var(--ink-4)' }} />
                    </button>
                    {me.id && r.officerId !== me.id &&
                      <button className="btn btn-soft btn-sm" style={{ marginTop: 8, alignSelf: 'flex-start' }} onClick={() => reassign(me.id)}>
                        <Icon name="user" size={14} />{t('act_take_mine')}
                      </button>}
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="ord-status">{t('dt_new_status')}</label>
                    <select id="ord-status" className="select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} disabled={terminal}>
                      {statusOptions.map((st) => <option key={st} value={st}>{t(window.STATUS_META[st].labelKey)}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="ord-note">{t('dt_note_internal')}</label>
                    <textarea id="ord-note" className="textarea" style={{ minHeight: 84 }} placeholder={t('dt_note_ph')} value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                  </div>
                  <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={save} disabled={busy || (terminal && !note.trim())}>
                    <Icon name="check" size={16} />{t('act_save')}
                  </button>
                  {canSupplement &&
                    <button className="btn btn-secondary" style={{ justifyContent: 'center' }} onClick={supplement} disabled={busy}>
                      <Icon name="clock" size={16} />{t('act_request_supplement')}
                    </button>}
                </section>

                {/* Ghi chú nội bộ */}
                <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
                  <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('dt_internal_comments')}</h2>
                  <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 14px' }}>
                    <Icon name="lock" size={13}/>{t('op_internal_hint')}
                  </p>
                  {internalComments.length === 0 && <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {internalComments.map((n) =>
                      <div key={n.id} style={{ display: 'flex', gap: 10 }}>
                        <InitialsAvatar text={n.authorName} size={30} />
                        <div style={{ flex: 1, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)', padding: '9px 13px' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: 'var(--fs-13)' }}>{n.authorName}</strong>
                            <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{n.at}</span>
                          </div>
                          <p style={{ fontSize: 'var(--fs-14)', marginTop: 2 }}>{n.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
                    <InitialsAvatar text={me.name} size={30} />
                    <input className="input" style={{ flex: 1, fontSize: 'var(--fs-14)', paddingTop: 9, paddingBottom: 9 }} placeholder={t('dt_note_ph')} value={comment} onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}/>
                    <button className="btn btn-primary btn-sm" onClick={addComment} disabled={!comment.trim()} aria-label={t('act_add_note')} style={{ height: 38 }}>
                      <Icon name="send" size={15}/>
                    </button>
                  </div>
                </section>
              </div>
            </div>);
        })()}
      </OpApiState>

      {assigning && r &&
      <AssignModal lang={lang} officers={cat.officers} current={r.officerId} onClose={() => setAssigning(false)} onAssign={reassign} />
      }
      <style>{`@media (max-width: 980px) { .ord-grid { grid-template-columns: 1fr !important; } .ord-grid > div { position: static !important; } }`}</style>
    </div>);

}

Object.assign(window, { OfficerRequests, OfficerRequestDetail, AssignModal, RowActions, InitialsAvatar, REQ_STATUS_ORDER, REQ_WORKFLOW });
