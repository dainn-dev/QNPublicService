// ============================================================
// Trang quản trị — Thông báo đẩy & Nhật ký hệ thống
// ============================================================

const NOTIF_TYPE_META = {
  push: { labelKey: 'n_push', tone: 'info', icon: 'bell' },
  broadcast: { labelKey: 'n_broadcast', tone: 'success', icon: 'megaphone' },
  emergency: { labelKey: 'n_emergency', tone: 'danger', icon: 'alert' }
};

function AdminNotifications({ lang, showToast }) {
  const t = useT(lang);
  const [type, setType] = React.useState('broadcast');
  const [audience, setAudience] = React.useState('all');
  const [ward, setWard] = React.useState(window.DATA.wards[0]);
  const [dept, setDept] = React.useState('all');
  const [recipients, setRecipients] = React.useState([]);
  const [recQ, setRecQ] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [history, setHistory] = React.useState(window.ADATA.sentNotifications);

  const recMatches = recQ.trim().length >= 1
    ? window.ADATA.users.filter((u) => !recipients.some((r) => r.id === u.id) && (u.name + ' ' + u.phone).toLowerCase().includes(recQ.trim().toLowerCase())).slice(0, 5)
    : [];

  const send = () => {
    if (!title.trim() || (type === 'push' && recipients.length === 0)) return;
    const count = type === 'push' ? String(recipients.length)
      : audience === 'ward' ? '6.412'
      : audience === 'officers' ? (dept === 'all' ? '214' : '38')
      : '52.114';
    setHistory([{ id: 'sn' + Date.now(), type, at: '12/06/2026 ' + new Date().toTimeString().slice(0, 5), title: title.trim(), recipients: count }, ...history]);
    setTitle(''); setContent(''); setRecipients([]); setRecQ('');
    showToast(t('n_sent'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageTitle title={t('ad_notifications')} />

      <div className="adn-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 18, alignItems: 'start' }}>
        {/* Soạn thông báo */}
        <section className="card" style={{ padding: '22px 24px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('n_compose')}</h2>

          <div className="field">
            <span className="field-label">{t('n_type')}</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {Object.entries(NOTIF_TYPE_META).map(([k, meta]) =>
              <button key={k} type="button" onClick={() => setType(k)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, border: '1.5px solid', padding: '13px 8px', borderRadius: 'var(--r-md)', fontWeight: 600, fontSize: 'var(--fs-12)',
                borderColor: type === k ? 'var(--primary)' : 'var(--line)',
                background: type === k ? 'var(--primary-soft)' : '#fff',
                color: type === k ? 'var(--primary)' : 'var(--ink-2)' }}>
                  <Icon name={meta.icon} size={19} />{t(meta.labelKey)}
                </button>
              )}
            </div>
          </div>

          {type === 'emergency' &&
          <div style={{ display: 'flex', gap: 10, background: 'var(--danger-soft)', border: '1px solid var(--danger-border)', borderRadius: 'var(--r-md)', padding: '11px 14px', fontSize: 'var(--fs-13)', color: 'var(--danger)' }}>
              <Icon name="alert" size={16} style={{ flex: 'none', marginTop: 1 }} />{t('n_emergency_note')}
            </div>
          }

          {type !== 'push' &&
          <div className="field">
              <label className="field-label" htmlFor="nt-aud">{t('n_audience')}</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <select id="nt-aud" className="select" style={{ flex: 1, minWidth: 160 }} value={audience} onChange={(e) => setAudience(e.target.value)}>
                  <option value="all">{t('n_all_citizens')}</option>
                  <option value="ward">{t('n_by_ward')}</option>
                  <option value="officers">{t('n_officers_only')}</option>
                </select>
                {audience === 'ward' &&
              <select className="select" style={{ flex: 1, minWidth: 140 }} value={ward} onChange={(e) => setWard(e.target.value)} aria-label={t('sp_filter_ward')}>
                    {window.DATA.wards.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
              }
                {audience === 'officers' &&
              <select className="select" style={{ flex: 1, minWidth: 170 }} value={dept} onChange={(e) => setDept(e.target.value)} aria-label={t('o_department')}>
                    <option value="all">{t('o_department')}: {t('all')}</option>
                    {window.ADATA.departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
              }
              </div>
            </div>
          }

          {type === 'push' &&
          <div className="field">
              <label className="field-label" htmlFor="nt-rec">{t('n_recipients')} <span className="req">*</span></label>
              {recipients.length > 0 &&
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                  {recipients.map((r) =>
              <span key={r.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--primary-soft)', border: '1px solid var(--primary-border)', color: 'var(--primary)', borderRadius: 'var(--r-full)', padding: '4px 6px 4px 11px', fontSize: 'var(--fs-13)', fontWeight: 600 }}>
                      {r.name}
                      <button onClick={() => setRecipients(recipients.filter((x) => x.id !== r.id))} aria-label={t('c_delete')}
                  style={{ border: 'none', background: 'rgba(0,0,0,0.06)', borderRadius: '50%', width: 18, height: 18, display: 'grid', placeItems: 'center', color: 'inherit', cursor: 'pointer', padding: 0 }}>
                        <Icon name="x" size={10}/>
                      </button>
                    </span>
              )}
                </div>
            }
              <div style={{ position: 'relative' }}>
                <input id="nt-rec" className="input" value={recQ} onChange={(e) => setRecQ(e.target.value)} placeholder={t('n_recipients_ph')} autoComplete="off"/>
                {recMatches.length > 0 &&
              <div className="fade-up" style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)', zIndex: 600, background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>
                    {recMatches.map((u) =>
                <button key={u.id} onClick={() => { setRecipients([...recipients, u]); setRecQ(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', border: 'none', background: 'none', padding: '9px 13px', cursor: 'pointer' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-soft)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}>
                        <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 11, color: 'var(--ink-2)', flex: 'none' }}>{u.name.split(' ').slice(-1)[0].charAt(0)}</span>
                        <span style={{ minWidth: 0 }}>
                          <span style={{ display: 'block', fontSize: 'var(--fs-13)', fontWeight: 600 }}>{u.name}</span>
                          <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{u.phone}</span>
                        </span>
                      </button>
                )}
                  </div>
              }
              </div>
            </div>
          }

          <div className="field">
            <label className="field-label" htmlFor="nt-title">{t('n_title')} <span className="req">*</span></label>
            <input id="nt-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={lang === 'en' ? 'e.g. Power outage schedule Jun 12…' : 'VD: Lịch cắt điện ngày 12/6…'} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="nt-content">{t('n_content')}</label>
            <textarea id="nt-content" className="textarea" value={content} onChange={(e) => setContent(e.target.value)}></textarea>
          </div>

          <button className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={!title.trim() || (type === 'push' && recipients.length === 0)} onClick={send}>
            <Icon name="send" size={16} />{t('n_send_now')}{type === 'push' && recipients.length > 0 ? ` (${recipients.length})` : ''}
          </button>
        </section>

        {/* Lịch sử */}
        <section className="card" style={{ padding: '22px 24px', background: '#fff' }}>
          <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 12 }}>{t('n_history')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {history.map((h, i) => {
              const meta = NOTIF_TYPE_META[h.type];
              return (
                <div key={h.id} style={{ display: 'flex', gap: 13, padding: '13px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', alignItems: 'flex-start' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center', background: `var(--${meta.tone}-soft)`, color: `var(--${meta.tone})` }}>
                    <Icon name={meta.icon} size={17} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                      <Badge tone={meta.tone} dot={false}>{t(meta.labelKey)}</Badge>
                      <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{h.at}</span>
                    </span>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: 'var(--fs-14)', marginTop: 4, lineHeight: 1.45 }}>{h.title}</span>
                    <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{h.recipients} {t('n_sent_to')}</span>
                  </span>
                </div>);

            })}
          </div>
        </section>
      </div>
      <style>{`@media (max-width: 980px) { .adn-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>);

}

// ---------- Nhật ký hệ thống ----------
function AdminAudit({ lang, showToast }) {
  const t = useT(lang);
  const [q, setQ] = React.useState('');
  const [fAction, setFAction] = React.useState('all');
  const [fEntity, setFEntity] = React.useState('all');
  const logs = window.ADATA.auditLogs;
  const entities = [...new Set(logs.map((l) => l.entity))];

  const filtered = logs.filter((l) =>
  (fAction === 'all' || l.action === fAction) && (
  fEntity === 'all' || l.entity === fEntity) && (
  !q || (l.user + l.detail + l.entity).toLowerCase().includes(q.toLowerCase()))
  );
  const pg = usePagination(filtered, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageTitle title={t('ad_audit')} sub={`${filtered.length} ${t('results')}`}
      actions={
      <button className="btn btn-secondary" onClick={() => showToast(t('au_exported'))}>
            <Icon name="doc" size={16} />{t('au_export')}
          </button>
      } />

      <div className="op-filter-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '0 1 300px', minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'grid' }}><Icon name="search" size={16} /></span>
          <input className="input" style={{ paddingLeft: 38, paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' }} placeholder={t('au_user') + ', ' + t('au_detail') + '…'} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select" style={{ width: 'auto', paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' }} value={fAction} onChange={(e) => setFAction(e.target.value)} aria-label={t('au_action')}>
          <option value="all">{t('au_action')}: {t('all')}</option>
          {Object.keys(window.AUDIT_ACTION_META).map((a) => <option key={a} value={a}>{t(window.AUDIT_ACTION_META[a].labelKey)}</option>)}
        </select>
        <select className="select" style={{ width: 'auto', paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' }} value={fEntity} onChange={(e) => setFEntity(e.target.value)} aria-label={t('au_entity')}>
          <option value="all">{t('au_entity')}: {t('all')}</option>
          {entities.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
        <table className="op-table">
          <thead>
            <tr>
              <th>{t('au_time')}</th>
              <th>{t('au_user')}</th>
              <th>{t('au_action')}</th>
              <th>{t('au_entity')}</th>
              <th>{t('au_detail')}</th>
              <th>{t('au_ip')}</th>
            </tr>
          </thead>
          <tbody>
            {pg.pageItems.map((l, i) =>
            <tr key={i}>
                <td style={{ fontSize: 'var(--fs-13)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-3)' }}>{l.at}</td>
                <td style={{ whiteSpace: 'nowrap' }}><strong style={{ fontSize: 'var(--fs-13)' }}>{l.user}</strong></td>
                <td><StatusBadge status={l.action} map={window.AUDIT_ACTION_META} lang={lang} /></td>
                <td><code style={{ fontSize: 'var(--fs-12)', background: 'var(--bg-sunken)', padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>{l.entity}</code></td>
                <td style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-2)', minWidth: 240 }}>{l.detail}</td>
                <td style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{l.ip}</td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState title={t('empty')} />}
        <Pagination {...pg} lang={lang} />
      </div>
    </div>);

}

Object.assign(window, { AdminNotifications, AdminAudit });