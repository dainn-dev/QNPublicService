// ============================================================
// Trang quản trị — Danh mục (CRUD): lĩnh vực, dịch vụ, điểm DV,
// loại phản ánh, đơn vị hành chính
// ============================================================

// Modal CRUD chung — fields: [{key, label, type:'text'|'number'|'select', options}]
function CrudModal({ title, fields, initial, onClose, onSave, lang }) {
  const t = useT(lang);
  const [form, setForm] = React.useState(initial);
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <Modal title={title} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {fields.map((f) => (
          <div className="field" key={f.key}>
            <label className="field-label" htmlFor={'cm-' + f.key}>{f.label}</label>
            {f.type === 'select' ? (
              <select id={'cm-' + f.key} className="select" value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}>
                {f.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea id={'cm-' + f.key} className="textarea" style={{ minHeight: 80 }} value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)}></textarea>
            ) : (
              <input id={'cm-' + f.key} className="input" type={f.type || 'text'} value={form[f.key] ?? ''} onChange={(e) => set(f.key, f.type === 'number' ? +e.target.value : e.target.value)} placeholder={f.placeholder || ''}/>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>{t('save')}</button>
      </div>
    </Modal>
  );
}

function DeleteConfirm({ lang, onClose, onConfirm, label }) {
  const t = useT(lang);
  return (
    <Modal title={t('c_delete')} onClose={onClose} width={400}>
      <p style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-2)' }}>{t('c_delete_confirm')}</p>
      <p style={{ fontWeight: 700, marginTop: 8 }}>{label}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={onConfirm}><Icon name="x" size={15}/>{t('c_delete')}</button>
      </div>
    </Modal>
  );
}

// Bảng CRUD chung
function CrudTable({ columns, rows, onEdit, onDelete, lang, rowKey }) {
  const t = useT(lang);
  const pg = usePagination(rows, 8);
  return (
    <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
      <table className="op-table">
        <thead>
          <tr>
            {columns.map((c) => <th key={c.label}>{c.label}</th>)}
            <th style={{ width: 120 }}>{t('tbl_actions')}</th>
          </tr>
        </thead>
        <tbody>
          {pg.pageItems.map((r) => (
            <tr key={r[rowKey]}>
              {columns.map((c) => <td key={c.label} style={c.style}>{c.render(r)}</td>)}
              <td>
                <span style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => onEdit(r)} aria-label={t('u_edit')}
                    style={{ border: '1.5px solid var(--line)', background: '#fff', borderRadius: 'var(--r-sm)', width: 30, height: 30, display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>
                    <Icon name="doc" size={14}/>
                  </button>
                  <button onClick={() => onDelete(r)} aria-label={t('c_delete')}
                    style={{ border: '1.5px solid var(--danger-border)', background: 'var(--danger-soft)', borderRadius: 'var(--r-sm)', width: 30, height: 30, display: 'grid', placeItems: 'center', color: 'var(--danger)' }}>
                    <Icon name="x" size={14}/>
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <EmptyState title={t('empty')}/>}
      <Pagination {...pg} lang={lang}/>
    </div>
  );
}

function AdminCatalogs({ lang, showToast }) {
  const t = useT(lang);
  const [tab, setTab] = React.useState('cats');
  const [cats, setCats] = React.useState(window.DATA.categories);
  const [services, setServices] = React.useState(window.DATA.services);
  const [fbCats, setFbCats] = React.useState(window.DATA.feedbackCategories);
  const [units, setUnits] = React.useState(window.ADATA.adminUnits);
  const [modal, setModal] = React.useState(null); // {kind, item|null}
  const [deleting, setDeleting] = React.useState(null); // {kind, item}

  const tabs = [
    { id: 'cats', key: 'c_service_categories', count: cats.length },
    { id: 'services', key: 'c_services', count: services.length },
    { id: 'fbcats', key: 'c_feedback_cats', count: fbCats.length },
    { id: 'units', key: 'c_admin_units', count: units.length },
  ];

  const levelLabel = { province: t('c_province'), district: t('c_district'), ward: t('c_ward') };
  const catName = (id) => { const c = cats.find((x) => x.id === id); return c ? pick(c, lang) : '—'; };

  // ----- cấu hình theo tab -----
  const config = {
    cats: {
      rows: cats, set: setCats, rowKey: 'id',
      newItem: { id: 'cat' + Date.now(), icon: 'doc', vi: '', en: '', count: 0 },
      fields: [
        { key: 'vi', label: t('c_name_vi') }, { key: 'en', label: t('c_name_en') },
        { key: 'count', label: t('c_procedures'), type: 'number' },
      ],
      columns: [
        { label: t('c_name_vi'), render: (r) => <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}><Icon name={r.icon} size={16}/></span><strong style={{ fontSize: 'var(--fs-14)' }}>{r.vi}</strong></span> },
        { label: t('c_name_en'), render: (r) => <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{r.en}</span> },
        { label: t('c_procedures'), render: (r) => <strong style={{ fontSize: 'var(--fs-13)' }}>{r.count}</strong> },
      ],
      label: (r) => r.vi,
    },
    services: {
      rows: services, set: setServices, rowKey: 'id',
      newItem: { id: 'svc' + Date.now(), categoryId: 'hotich', vi: '', en: '', descVi: '', descEn: '', documents: [], processingDays: 3, fee: 0, level: 'full', featured: false },
      fields: [
        { key: 'vi', label: t('c_name_vi') }, { key: 'en', label: t('c_name_en') },
        { key: 'categoryId', label: t('sp_filter_category'), type: 'select', options: cats.map((c) => ({ value: c.id, label: pick(c, lang) })) },
        { key: 'processingDays', label: t('svc_processing_time'), type: 'number' },
        { key: 'fee', label: t('svc_fee') + ' (đ)', type: 'number' },
        { key: 'level', label: t('svc_level'), type: 'select', options: [{ value: 'full', label: t('svc_level_full') }, { value: 'partial', label: t('svc_level_partial') }] },
      ],
      columns: [
        { label: t('svc_name'), style: { maxWidth: 280 }, render: (r) => <strong style={{ fontSize: 'var(--fs-14)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pick(r, lang)}</strong> },
        { label: t('sp_filter_category'), render: (r) => <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{catName(r.categoryId)}</span> },
        { label: t('svc_processing_time'), render: (r) => <span style={{ fontSize: 'var(--fs-13)', whiteSpace: 'nowrap' }}>{r.processingDays} {t('svc_working_days')}</span> },
        { label: t('svc_fee'), render: (r) => <span style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: r.fee ? 'var(--ink-2)' : 'var(--success)' }}>{fmtFee(r.fee, t)}</span> },
        { label: t('svc_level'), render: (r) => <Badge tone={r.level === 'full' ? 'success' : 'info'} dot={false}>{t(r.level === 'full' ? 'svc_level_full' : 'svc_level_partial')}</Badge> },
      ],
      label: (r) => r.vi,
    },
    points: {
      rows: [], set: () => {}, rowKey: 'id',
      newItem: {},
      fields: [],
      columns: [],
      label: (r) => r.vi,
    },
    fbcats: {
      rows: fbCats, set: setFbCats, rowKey: 'id',
      newItem: { id: 'fbc' + Date.now(), icon: 'megaphone', vi: '', en: '' },
      fields: [{ key: 'vi', label: t('c_name_vi') }, { key: 'en', label: t('c_name_en') }],
      columns: [
        { label: t('c_name_vi'), render: (r) => <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}><Icon name={r.icon} size={16}/></span><strong style={{ fontSize: 'var(--fs-14)' }}>{r.vi}</strong></span> },
        { label: t('c_name_en'), render: (r) => <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{r.en}</span> },
      ],
      label: (r) => r.vi,
    },
    units: {
      rows: units, set: setUnits, rowKey: 'code',
      newItem: { code: '', level: 'ward', name: '', parent: 'TP. Quảng Ngãi' },
      fields: [
        { key: 'name', label: t('c_name_vi') },
        { key: 'code', label: t('c_code') },
        { key: 'level', label: t('c_level'), type: 'select', options: [{ value: 'province', label: t('c_province') }, { value: 'district', label: t('c_district') }, { value: 'ward', label: t('c_ward') }] },
        { key: 'parent', label: lang === 'en' ? 'Parent unit' : 'Trực thuộc' },
      ],
      columns: [
        { label: t('c_code'), render: (r) => <strong style={{ fontSize: 'var(--fs-13)', fontVariantNumeric: 'tabular-nums' }}>{r.code}</strong> },
        { label: t('c_name_vi'), render: (r) => <strong style={{ fontSize: 'var(--fs-14)' }}>{r.name}</strong> },
        { label: t('c_level'), render: (r) => <Badge tone={r.level === 'province' ? 'danger' : r.level === 'district' ? 'warning' : 'info'} dot={false}>{levelLabel[r.level]}</Badge> },
        { label: lang === 'en' ? 'Parent unit' : 'Trực thuộc', render: (r) => <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{r.parent}</span> },
      ],
      label: (r) => r.name,
    },
  };

  const cfg = config[tab];

  const save = (form) => {
    const exists = cfg.rows.some((r) => r[cfg.rowKey] === form[cfg.rowKey]);
    cfg.set(exists ? cfg.rows.map((r) => r[cfg.rowKey] === form[cfg.rowKey] ? { ...r, ...form } : r) : [form, ...cfg.rows]);
    setModal(null);
    showToast(t('dt_saved'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageTitle title={t('ad_catalogs')}
        actions={<button className="btn btn-primary" onClick={() => setModal({ item: null })}><Icon name="fileplus" size={16}/>{t('c_add')}</button>}/>

      <div className="ad-tabs">
        {tabs.map((tb) => (
          <button key={tb.id} className={'ad-tab' + (tab === tb.id ? ' active' : '')} onClick={() => setTab(tb.id)}>
            {t(tb.key)} <span style={{ color: 'var(--ink-4)', fontWeight: 700 }}>{tb.count}</span>
          </button>
        ))}
      </div>

      <CrudTable lang={lang} columns={cfg.columns} rows={cfg.rows} rowKey={cfg.rowKey}
        onEdit={(r) => setModal({ item: r })}
        onDelete={(r) => setDeleting(r)}/>

      {modal && (
        <CrudModal lang={lang}
          title={modal.item ? t('u_edit') : t('c_add')}
          fields={cfg.fields}
          initial={modal.item || cfg.newItem}
          onClose={() => setModal(null)}
          onSave={save}/>
      )}
      {deleting && (
        <DeleteConfirm lang={lang} label={cfg.label(deleting)}
          onClose={() => setDeleting(null)}
          onConfirm={() => { cfg.set(cfg.rows.filter((r) => r[cfg.rowKey] !== deleting[cfg.rowKey])); setDeleting(null); showToast(t('dt_saved')); }}/>
      )}
    </div>
  );
}

// ---------- Màn hình quản lý Dịch vụ công (chuyên sâu) ----------
function AdminServices({ lang, showToast }) {
  const t = useT(lang);
  const [services, setServices] = React.useState(window.DATA.services);
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const [modal, setModal] = React.useState(null);
  const [deleting, setDeleting] = React.useState(null);
  const cats = window.DATA.categories;

  const filtered = services.filter((s) =>
    (cat === 'all' || s.categoryId === cat) &&
    (!q || (s.vi + ' ' + s.en).toLowerCase().includes(q.toLowerCase()))
  );
  const pg = usePagination(filtered, 8);

  const fields = [
    { key: 'vi', label: t('c_name_vi') }, { key: 'en', label: t('c_name_en') },
    { key: 'categoryId', label: t('sp_filter_category'), type: 'select', options: cats.map((c) => ({ value: c.id, label: pick(c, lang) })) },
    { key: 'descVi', label: t('svc_description'), type: 'textarea' },
    { key: 'processingDays', label: t('svc_processing_time') + ' (' + t('svc_working_days') + ')', type: 'number' },
    { key: 'fee', label: t('svc_fee') + ' (đ)', type: 'number' },
    { key: 'level', label: t('svc_level'), type: 'select', options: [{ value: 'full', label: t('svc_level_full') }, { value: 'partial', label: t('svc_level_partial') }] },
  ];

  const save = (form) => {
    const exists = services.some((s) => s.id === form.id);
    setServices(exists ? services.map((s) => s.id === form.id ? { ...s, ...form } : s) : [{ documents: [], featured: false, descEn: form.descVi, ...form }, ...services]);
    setModal(null);
    showToast(t('dt_saved'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageTitle title={t('c_services')} sub={`${filtered.length} ${t('results')}`}
        actions={<button className="btn btn-primary" onClick={() => setModal({ item: null })}><Icon name="fileplus" size={16}/>{t('c_add')}</button>}/>

      <div className="op-filter-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 1 300px', minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'grid' }}><Icon name="search" size={16}/></span>
          <input className="input" style={{ paddingLeft: 38, paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' }} placeholder={t('hero_search_ph')} value={q} onChange={(e) => setQ(e.target.value)}/>
        </div>
        <div className="ad-tabs">
          <button className={'ad-tab' + (cat === 'all' ? ' active' : '')} onClick={() => setCat('all')}>{t('all')}</button>
          {cats.map((c) => (
            <button key={c.id} className={'ad-tab' + (cat === c.id ? ' active' : '')} onClick={() => setCat(c.id)}>{pick(c, lang)}</button>
          ))}
        </div>
      </div>

      <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
        <table className="op-table">
          <thead>
            <tr>
              <th>{t('svc_name')}</th>
              <th>{t('sp_filter_category')}</th>
              <th>{t('svc_processing_time')}</th>
              <th>{t('svc_fee')}</th>
              <th>{t('svc_level')}</th>
              <th>{t('svc_documents')}</th>
              <th style={{ width: 120 }}>{t('tbl_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {pg.pageItems.map((s) => {
              const c = cats.find((x) => x.id === s.categoryId);
              return (
                <tr key={s.id}>
                  <td style={{ maxWidth: 300 }}>
                    <strong style={{ fontSize: 'var(--fs-14)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pick(s, lang)}</strong>
                    <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lang === 'en' ? s.vi : s.en}</span>
                  </td>
                  <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 'var(--fs-13)', whiteSpace: 'nowrap' }}>{c && <Icon name={c.icon} size={14} style={{ color: 'var(--ink-3)' }}/>}{c ? pick(c, lang) : '—'}</span></td>
                  <td style={{ fontSize: 'var(--fs-13)', whiteSpace: 'nowrap' }}>{s.processingDays} {t('svc_working_days')}</td>
                  <td style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: s.fee ? 'var(--ink-2)' : 'var(--success)', whiteSpace: 'nowrap' }}>{fmtFee(s.fee, t)}</td>
                  <td><Badge tone={s.level === 'full' ? 'success' : 'info'} dot={false}>{t(s.level === 'full' ? 'svc_level_full' : 'svc_level_partial')}</Badge></td>
                  <td style={{ fontSize: 'var(--fs-13)' }}>{(s.documents || []).length}</td>
                  <td>
                    <span style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setModal({ item: s })}>{t('u_edit')}</button>
                      <button onClick={() => setDeleting(s)} aria-label={t('c_delete')}
                        style={{ border: '1.5px solid var(--danger-border)', background: 'var(--danger-soft)', borderRadius: 'var(--r-sm)', width: 30, height: 30, display: 'grid', placeItems: 'center', color: 'var(--danger)' }}>
                        <Icon name="x" size={14}/>
                      </button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState title={t('empty')}/>}
        <Pagination {...pg} lang={lang}/>
      </div>

      {modal && (
        <CrudModal lang={lang}
          title={modal.item ? t('u_edit') + ' — ' + modal.item.vi : t('c_add')}
          fields={fields}
          initial={modal.item || { id: 'svc' + Date.now(), categoryId: 'hotich', vi: '', en: '', descVi: '', processingDays: 3, fee: 0, level: 'full' }}
          onClose={() => setModal(null)}
          onSave={save}/>
      )}
      {deleting && (
        <DeleteConfirm lang={lang} label={deleting.vi}
          onClose={() => setDeleting(null)}
          onConfirm={() => { setServices(services.filter((s) => s.id !== deleting.id)); setDeleting(null); showToast(t('dt_saved')); }}/>
      )}
    </div>
  );
}

Object.assign(window, { AdminCatalogs, CrudModal, DeleteConfirm, AdminServices });
