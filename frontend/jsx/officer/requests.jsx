// ============================================================
// Cổng cán bộ — Quản lý hồ sơ (danh sách + chi tiết)
// ============================================================

const REQ_STATUS_ORDER = ['submitted', 'received', 'processing', 'waiting', 'completed', 'rejected'];

// ---------- Menu thao tác trên dòng ----------
function RowActions({ lang, onAction }) {
  const t = useT(lang);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const close = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  const items = [
  { id: 'assign', icon: 'user', label: t('act_assign') },
  { id: 'approve', icon: 'check', label: t('act_approve') },
  { id: 'reject', icon: 'x', label: t('act_reject'), danger: true },
  { id: 'complete', icon: 'shield', label: t('act_complete') }];

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
function AssignModal({ lang, current, onClose, onAssign }) {
  const t = useT(lang);
  const [sel, setSel] = React.useState(current || '');
  return (
    <Modal title={t('act_assign')} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {window.ODATA.officers.map((o) =>
        <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid', borderColor: sel === o.id ? 'var(--primary)' : 'var(--line)', background: sel === o.id ? 'var(--primary-soft)' : '#fff', borderRadius: 'var(--r-md)', padding: '11px 14px', cursor: 'pointer' }}>
            <input type="radio" name="assignee" checked={sel === o.id} onChange={() => setSel(o.id)} style={{ accentColor: 'var(--primary)' }} />
            <OfficerAvatar officerId={o.id} size={32} />
            <span>
              <strong style={{ display: 'block', fontSize: 'var(--fs-14)' }}>{o.name}</strong>
              <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{pick(o.dept, lang)}</span>
            </span>
          </label>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
        <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" disabled={!sel} onClick={() => onAssign(sel)}>{t('act_assign')}</button>
      </div>
    </Modal>);

}

// ---------- Danh sách hồ sơ ----------
function OfficerRequests({ lang, navigate, requests, updateRequest, showToast }) {
  const t = useT(lang);
  const [fStatus, setFStatus] = React.useState('all');
  const [fService, setFService] = React.useState('all');
  const [fWard, setFWard] = React.useState('all');
  const [fOfficer, setFOfficer] = React.useState('all');
  const [assigning, setAssigning] = React.useState(null); // request id

  const filtered = requests.filter((r) =>
  (fStatus === 'all' || r.status === fStatus) && (
  fService === 'all' || r.serviceId === fService) && (
  fWard === 'all' || r.ward === fWard) && (
  fOfficer === 'all' || (fOfficer === 'none' ? !r.officerId : r.officerId === fOfficer))
  );

  const act = (r, action) => {
    if (action === 'assign') {setAssigning(r.id);return;}
    const patch = action === 'approve' ? { status: 'processing' } : action === 'reject' ? { status: 'rejected', dueState: 'done' } : { status: 'completed', dueState: 'done' };
    updateRequest(r.id, patch);
    showToast(t('dt_saved'));
  };

  const selStyle = { width: 'auto', flex: '0 1 auto', paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' };
  const pg = usePagination(filtered, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '-0.01em' }}>{t('op_requests')}</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)', marginTop: 4 }}><strong style={{ color: 'var(--ink)' }}>{filtered.length}</strong> {t('results')}</p>
      </div>

      {/* Bộ lọc */}
      <div className="op-filter-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select className="select" style={selStyle} value={fStatus} onChange={(e) => setFStatus(e.target.value)} aria-label={t('tbl_status')}>
          <option value="all">{t('tbl_status')}: {t('all')}</option>
          {REQ_STATUS_ORDER.map((s) => <option key={s} value={s}>{t(window.STATUS_META[s].labelKey)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fService} onChange={(e) => setFService(e.target.value)} aria-label={t('tbl_service')}>
          <option value="all">{t('tbl_service')}: {t('all')}</option>
          {window.DATA.services.map((s) => <option key={s.id} value={s.id}>{pick(s, lang)}</option>)}
        </select>
        <select className="select" style={selStyle} value={fWard} onChange={(e) => setFWard(e.target.value)} aria-label={t('tbl_ward')}>
          <option value="all">{t('tbl_ward')}: {t('all')}</option>
          {window.DATA.wards.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
        <select className="select" style={selStyle} value={fOfficer} onChange={(e) => setFOfficer(e.target.value)} aria-label={t('tbl_officer')}>
          <option value="all">{t('tbl_officer')}: {t('all')}</option>
          <option value="none">{t('unassigned')}</option>
          {window.ODATA.officers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>

      {/* Bảng */}
      <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
        <table className="op-table">
          <thead>
            <tr>
              <th>{t('tbl_code')}</th>
              <th>{t('tbl_citizen')}</th>
              <th>{t('tbl_service')}</th>
              <th>{t('tbl_ward')}</th>
              <th>{t('tbl_officer')}</th>
              <th>{t('tbl_due')}</th>
              <th>{t('tbl_status')}</th>
              <th style={{ width: 56 }}></th>
            </tr>
          </thead>
          <tbody>
            {pg.pageItems.map((r) => {
              const s = window.DATA.services.find((x) => x.id === r.serviceId);
              return (
                <tr key={r.id} onClick={() => navigate('requests/' + r.id)}>
                  <td><strong style={{ fontVariantNumeric: 'tabular-nums', fontSize: 'var(--fs-13)' }}>{r.id}</strong></td>
                  <td>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--fs-14)' }}>{r.citizen}</span>
                    <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{r.phone}</span>
                  </td>
                  <td style={{ maxWidth: 220 }}><span style={{ display: 'block', fontSize: 'var(--fs-13)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s ? pick(s, lang) : ''}</span></td>
                  <td style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{r.ward}</td>
                  <td><OfficerCell officerId={r.officerId} lang={lang} /></td>
                  <td style={{ whiteSpace: 'nowrap' }}><DueBadge dueState={r.dueState} due={r.due} lang={lang} /></td>
                  <td><StatusBadge status={r.status} map={window.STATUS_META} lang={lang} /></td>
                  <td><RowActions lang={lang} onAction={(a) => act(r, a)} /></td>
                </tr>);

            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon="filesearch" title={t('empty')} />}
        <Pagination {...pg} lang={lang} />
      </div>

      {assigning &&
      <AssignModal lang={lang} current={(requests.find((r) => r.id === assigning) || {}).officerId} onClose={() => setAssigning(null)}
      onAssign={(officerId) => {updateRequest(assigning, { officerId, status: 'received' });setAssigning(null);showToast(t('dt_saved'));}} />
      }
    </div>);

}

// ---------- Chi tiết hồ sơ (cán bộ) ----------
function OfficerRequestDetail({ lang, navigate, requests, updateRequest, showToast, requestId }) {
  const t = useT(lang);
  const r = requests.find((x) => x.id === requestId) || requests[0];
  const s = window.DATA.services.find((x) => x.id === r.serviceId);
  const p = window.DATA.servicePoints.find((x) => x.id === r.pointId);
  const [newStatus, setNewStatus] = React.useState(r.status);
  const [note, setNote] = React.useState('');
  const [files, setFiles] = React.useState([]);
  const [assigning, setAssigning] = React.useState(false);
  const [notes, setNotes] = React.useState(r.notes || window.ODATA.requestNotes[r.id] || []);
  const [comment, setComment] = React.useState('');
  const addComment = () => {
    if (!comment.trim()) return;
    setNotes([...notes, { officerId: window.ODATA.me.id, at: '12/06/2026 ' + new Date().toTimeString().slice(0, 5), text: comment.trim() }]);
    setComment('');
  };

  // Timeline tổng hợp theo trạng thái hiện tại
  const histIdx = REQ_STATUS_ORDER.indexOf(['completed', 'rejected'].includes(r.status) ? 'processing' : r.status);
  const timeline = REQ_STATUS_ORDER.slice(0, Math.max(1, histIdx + 1)).
  filter((st) => st !== 'waiting' || r.status === 'waiting').
  map((st) => ({ status: st, at: r.submitted, noteVi: t(window.STATUS_META[st].labelKey), noteEn: t(window.STATUS_META[st].labelKey) }));
  if (['completed', 'rejected'].includes(r.status)) timeline.push({ status: r.status, at: r.due, noteVi: t(window.STATUS_META[r.status].labelKey), noteEn: t(window.STATUS_META[r.status].labelKey) });

  const save = () => {
    const patch = { status: newStatus };
    if (note.trim()) {
      const newNotes = [...notes, { officerId: window.ODATA.me.id, at: '11/06/2026 ' + new Date().toTimeString().slice(0, 5), text: note.trim() }];
      setNotes(newNotes);patch.notes = newNotes;setNote('');
    }
    if (['completed', 'rejected'].includes(newStatus)) patch.dueState = 'done';
    updateRequest(r.id, patch);
    showToast(t('dt_saved'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('requests')}><Icon name="arrowleft" size={15} />{t('back')}</button>
        <h1 style={{ fontSize: 'var(--fs-20)', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{r.id}</h1>
        <StatusBadge status={r.status} map={window.STATUS_META} lang={lang} />
        <span style={{ marginLeft: 'auto' }}><DueBadge dueState={r.dueState} due={r.due} lang={lang} /></span>
      </div>

      <div className="ord-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Thông tin */}
          <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
            <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 6 }}>{t('req_info')}</h2>
            {[
            [t('tbl_service'), s ? pick(s, lang) : '—'],
            [t('tbl_point'), p ? pick(p, lang) : '—'],
            [t('tbl_submitted'), r.submitted],
            [t('tbl_due'), r.due]].
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
              <span style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', fontWeight: 700, color: 'var(--ink-2)' }}>
                {r.citizen.split(' ').slice(-1)[0].charAt(0)}
              </span>
              <span>
                <strong style={{ display: 'block', fontSize: 'var(--fs-15)' }}>{r.citizen}</strong>
                <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{r.phone} · {r.ward}</span>
              </span>
            </div>
          </section>

          {/* Giấy tờ */}
          <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
            <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 12 }}>{t('dt_documents')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(s ? s.documents : []).map((d, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '9px 13px', fontSize: 'var(--fs-14)' }}>
                  <Icon name="doc" size={16} style={{ color: 'var(--primary)', flex: 'none' }} />
                  <span style={{ flex: 1 }}>{lang === 'en' ? d[1] : d[0]}</span>
                  <Badge tone="success" dot={false}><Icon name="check" size={12} />OK</Badge>
                </div>
              )}
            </div>
          </section>

          {/* Lịch sử */}
          <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
            <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 16 }}>{t('dt_history')}</h2>
            <Timeline items={timeline} statusMap={window.STATUS_META} lang={lang} />
          </section>
        </div>

        {/* Bảng điều khiển xử lý */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, position: 'sticky', top: 76 }}>
          <section className="card" style={{ padding: '20px 24px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('act_update_status')}</h2>
            <div className="field">
              <label className="field-label">{t('dt_assign_to')}</label>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} onClick={() => setAssigning(true)}>
                {r.officerId ? <OfficerCell officerId={r.officerId} lang={lang} /> : <span style={{ color: 'var(--ink-3)' }}>{t('unassigned')}</span>}
                <Icon name="chevrondown" size={15} style={{ marginLeft: 'auto', color: 'var(--ink-4)' }} />
              </button>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ord-status">{t('dt_new_status')}</label>
              <select id="ord-status" className="select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                {REQ_STATUS_ORDER.map((st) => <option key={st} value={st}>{t(window.STATUS_META[st].labelKey)}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ord-note">{t('dt_note_internal')}</label>
              <textarea id="ord-note" className="textarea" style={{ minHeight: 84 }} placeholder={t('dt_note_ph')} value={note} onChange={(e) => setNote(e.target.value)}></textarea>
            </div>
            <UploadBox lang={lang} hintKey="req_upload_hint" files={files} setFiles={setFiles} />
            <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={save}>
              <Icon name="check" size={16} />{t('act_save')}
            </button>
          </section>

          {/* Ghi chú nội bộ */}
          <section className="card" style={{ padding: '20px 24px', background: '#fff' }}>
            <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('dt_internal_comments')}</h2>
            <p style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 14px' }}>
              <Icon name="lock" size={13}/>{t('op_internal_hint')}
            </p>
            {notes.length === 0 && <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('empty')}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {notes.map((n, i) => {
                const o = window.ODATA.officers.find((x) => x.id === n.officerId);
                return (
                  <div key={i} style={{ display: 'flex', gap: 10 }}>
                    <OfficerAvatar officerId={n.officerId} size={30} />
                    <div style={{ flex: 1, background: 'var(--bg-soft)', borderRadius: 'var(--r-md)', padding: '9px 13px' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 'var(--fs-13)' }}>{o ? o.name : ''}</strong>
                        <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{n.at}</span>
                      </div>
                      <p style={{ fontSize: 'var(--fs-14)', marginTop: 2 }}>{n.text}</p>
                    </div>
                  </div>);

              })}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' }}>
              <OfficerAvatar officerId={window.ODATA.me.id} size={30}/>
              <input className="input" style={{ flex: 1, fontSize: 'var(--fs-14)', paddingTop: 9, paddingBottom: 9 }} placeholder={t('dt_note_ph')} value={comment} onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}/>
              <button className="btn btn-primary btn-sm" onClick={addComment} disabled={!comment.trim()} aria-label={t('act_add_note')} style={{ height: 38 }}>
                <Icon name="send" size={15}/>
              </button>
            </div>
          </section>
        </div>
      </div>

      {assigning &&
      <AssignModal lang={lang} current={r.officerId} onClose={() => setAssigning(false)}
      onAssign={(officerId) => {updateRequest(r.id, { officerId });setAssigning(false);showToast(t('dt_saved'));}} />
      }
      <style>{`@media (max-width: 980px) { .ord-grid { grid-template-columns: 1fr !important; } .ord-grid > div { position: static !important; } }`}</style>
    </div>);

}

Object.assign(window, { OfficerRequests, OfficerRequestDetail, AssignModal, RowActions, REQ_STATUS_ORDER });