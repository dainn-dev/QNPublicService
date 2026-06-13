// ============================================================
// Trang quản trị — Danh mục (CRUD): lĩnh vực, dịch vụ, loại phản ánh,
// đơn vị hành chính (Tỉnh/TP → Phường/Xã). Dữ liệu lấy từ API thật:
//   - Lĩnh vực:    api/admin/service-categories  (đọc: getCategoriesWithCounts)
//   - Dịch vụ:     api/admin/public-services      (đọc: /public-services)
//   - Loại phản ánh: api/admin/feedback-categories (đọc: /feedback/categories)
//   - Đơn vị HC:   api/admin/geo/{provinces,wards} (đọc: /provinces, /provinces/{code}/wards)
// Ghi (POST/PUT/DELETE) cần token admin (Authorization: Bearer …).
// ============================================================

// Bọc trạng thái tải/lỗi cho các màn admin (admin không nạp home.jsx).
function CrudLoader({ loading, error, reload, lang, minHeight = 160, children }) {
  const t = useT(lang);
  const box = { minHeight, display: 'grid', placeItems: 'center', gap: 10, background: '#fff' };
  if (loading) {
    return <div className="card" style={box}><span style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-3)' }}>{t('loading')}</span></div>;
  }
  if (error) {
    return (
      <div className="card" style={box}>
        <Icon name="alert" size={22} style={{ color: 'var(--danger)' }} />
        <span style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-2)' }}>{t('load_error')}</span>
        {reload && <button className="btn btn-soft btn-sm" onClick={reload}><Icon name="navigation" size={14} />{t('retry')}</button>}
      </div>
    );
  }
  return children;
}

// Modal CRUD chung — fields: [{key, label, type:'text'|'number'|'select'|'textarea'|'bool', options, disabled}]
// onSave có thể trả Promise; nút Lưu tự khóa trong lúc gọi API.
function CrudModal({ title, fields, initial, onClose, onSave, lang }) {
  const t = useT(lang);
  const [form, setForm] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);
  const mounted = React.useRef(true);
  React.useEffect(() => () => { mounted.current = false; }, []);
  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = () => {
    if (busy) return;
    const r = onSave(form);
    if (r && typeof r.then === 'function') {
      setBusy(true);
      r.finally(() => { if (mounted.current) setBusy(false); });
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {fields.map((f) => (
          <div className="field" key={f.key}>
            <label className="field-label" htmlFor={'cm-' + f.key}>{f.label}</label>
            {f.type === 'select' ? (
              <select id={'cm-' + f.key} className="select" value={form[f.key] ?? ''} disabled={f.disabled} onChange={(e) => set(f.key, e.target.value)}>
                {f.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea id={'cm-' + f.key} className="textarea" style={{ minHeight: 90 }} value={form[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder || ''}></textarea>
            ) : f.type === 'bool' ? (
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form[f.key]} onChange={(e) => set(f.key, e.target.checked)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                <span style={{ fontSize: 'var(--fs-14)' }}>{f.boolLabel || ''}</span>
              </label>
            ) : (
              <input id={'cm-' + f.key} className="input" type={f.type || 'text'} disabled={f.disabled} value={form[f.key] ?? ''} onChange={(e) => set(f.key, f.type === 'number' ? +e.target.value : e.target.value)} placeholder={f.placeholder || ''} />
            )}
            {f.hint && <span className="field-hint">{f.hint}</span>}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onClose} disabled={busy}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? t('loading') : t('save')}</button>
      </div>
    </Modal>
  );
}

function DeleteConfirm({ lang, onClose, onConfirm, label }) {
  const t = useT(lang);
  const [busy, setBusy] = React.useState(false);
  const mounted = React.useRef(true);
  React.useEffect(() => () => { mounted.current = false; }, []);
  const submit = () => {
    if (busy) return;
    const r = onConfirm();
    if (r && typeof r.then === 'function') {
      setBusy(true);
      r.finally(() => { if (mounted.current) setBusy(false); });
    }
  };
  return (
    <Modal title={t('c_delete')} onClose={onClose} width={400}>
      <p style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-2)' }}>{t('c_delete_confirm')}</p>
      <p style={{ fontWeight: 700, marginTop: 8 }}>{label}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onClose} disabled={busy}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={submit} disabled={busy}><Icon name="x" size={15} />{t('c_delete')}</button>
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

// ---------- Đơn vị hành chính (Tỉnh/TP → Phường/Xã) ----------
function AdminUnits({ lang, showToast }) {
  const t = useT(lang);
  const geoQ = useApiData((s) => Promise.all([
    API.getProvinces({ signal: s }),
    API.getAllWards({ signal: s }),
  ]).then((r) => ({ provinces: r[0], wards: r[1] })), []);
  const [modal, setModal] = React.useState(null);   // { kind:'province'|'ward', item|null }
  const [deleting, setDeleting] = React.useState(null);

  const data = geoQ.data || { provinces: [], wards: [] };
  const provName = (code) => { const p = data.provinces.find((x) => x.code === code); return p ? p.name : ('#' + code); };

  const rows = data.provinces.map((p) => ({ kind: 'province', code: p.code, name: p.name, parent: '—', raw: p }))
    .concat(data.wards.map((w) => ({ kind: 'ward', code: w.code, name: w.name, parent: provName(w.provinceCode), provinceCode: w.provinceCode, raw: w })));
  const pg = usePagination(rows, 10);

  const fieldsFor = (kind, isEdit) => {
    const base = [
      { key: 'code', label: t('c_code'), type: 'number', disabled: isEdit, hint: isEdit ? null : (lang === 'en' ? 'Government numeric code (immutable)' : 'Mã số nhà nước (không đổi sau khi tạo)') },
      { key: 'name', label: t('c_name_vi') },
    ];
    if (kind === 'ward') {
      base.push({
        key: 'provinceCode', label: t('c_province'), type: 'select',
        options: data.provinces.map((p) => ({ value: p.code, label: p.name })),
      });
    }
    return base;
  };

  const initialFor = (modal) => {
    if (modal.item) {
      const r = modal.item.raw;
      return modal.kind === 'province'
        ? { code: r.code, name: r.name, codeName: r.codeName, divisionType: r.divisionType, phoneCode: r.phoneCode }
        : { code: r.code, name: r.name, codeName: r.codeName, divisionType: r.divisionType, provinceCode: r.provinceCode };
    }
    return modal.kind === 'province'
      ? { code: '', name: '' }
      : { code: '', name: '', provinceCode: data.provinces[0] ? data.provinces[0].code : '' };
  };

  const save = (form) => {
    const kind = modal.kind, isEdit = !!modal.item;
    const call = kind === 'province'
      ? (isEdit ? API.admin.updateProvince(modal.item.code, form) : API.admin.createProvince(form))
      : (isEdit ? API.admin.updateWard(modal.item.code, form) : API.admin.createWard(form));
    return call
      .then(() => { geoQ.reload(); setModal(null); showToast(t('dt_saved')); })
      .catch(() => { showToast(t('dt_save_error')); });
  };

  const del = () => {
    const { kind, code } = deleting;
    const call = kind === 'province' ? API.admin.deleteProvince(code) : API.admin.deleteWard(code);
    return call
      .then(() => { geoQ.reload(); setDeleting(null); showToast(t('dt_deleted')); })
      .catch(() => { showToast(t('dt_save_error')); });
  };

  return (
    <CrudLoader loading={geoQ.loading} error={geoQ.error} reload={geoQ.reload} lang={lang}>
      <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 12px 0' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setModal({ kind: 'province', item: null })}><Icon name="fileplus" size={14}/>{t('c_add_province')}</button>
          <button className="btn btn-primary btn-sm" onClick={() => setModal({ kind: 'ward', item: null })} disabled={!data.provinces.length}><Icon name="fileplus" size={14}/>{t('c_add_ward')}</button>
        </div>
        <table className="op-table">
          <thead>
            <tr>
              <th>{t('c_code')}</th>
              <th>{t('c_name_vi')}</th>
              <th>{t('c_level')}</th>
              <th>{lang === 'en' ? 'Parent unit' : 'Trực thuộc'}</th>
              <th style={{ width: 120 }}>{t('tbl_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {pg.pageItems.map((r) => (
              <tr key={r.kind + '-' + r.code}>
                <td><strong style={{ fontSize: 'var(--fs-13)', fontVariantNumeric: 'tabular-nums' }}>{r.code}</strong></td>
                <td><strong style={{ fontSize: 'var(--fs-14)' }}>{r.name}</strong></td>
                <td><Badge tone={r.kind === 'province' ? 'danger' : 'info'} dot={false}>{r.kind === 'province' ? t('c_province') : t('c_ward')}</Badge></td>
                <td><span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{r.parent}</span></td>
                <td>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setModal({ kind: r.kind, item: r })} aria-label={t('u_edit')}
                      style={{ border: '1.5px solid var(--line)', background: '#fff', borderRadius: 'var(--r-sm)', width: 30, height: 30, display: 'grid', placeItems: 'center', color: 'var(--ink-3)' }}>
                      <Icon name="doc" size={14}/>
                    </button>
                    <button onClick={() => setDeleting(r)} aria-label={t('c_delete')}
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

      {modal && (
        <CrudModal lang={lang}
          title={(modal.item ? t('u_edit') : t('c_add')) + ' — ' + (modal.kind === 'province' ? t('c_province') : t('c_ward'))}
          fields={fieldsFor(modal.kind, !!modal.item)}
          initial={initialFor(modal)}
          onClose={() => setModal(null)}
          onSave={save}/>
      )}
      {deleting && (
        <DeleteConfirm lang={lang} label={deleting.name}
          onClose={() => setDeleting(null)}
          onConfirm={del}/>
      )}
    </CrudLoader>
  );
}

function AdminCatalogs({ lang, showToast }) {
  const t = useT(lang);
  const [tab, setTab] = React.useState('cats');
  const [modal, setModal] = React.useState(null);    // { item|null }
  const [deleting, setDeleting] = React.useState(null);

  // Đọc bằng endpoint công khai (không cần token) để bảng hiển thị được ngay;
  // mọi thao tác ghi vẫn đi qua API.admin.* (cần token admin). Lưu ý: bản đọc
  // công khai chỉ trả mục đang hoạt động — mục bị vô hiệu sẽ ẩn sau khi reload.
  const catsQ = useApiData((s) => API.getCategoriesWithCounts({ signal: s }), []);
  const fbQ = useApiData((s) => API.getFeedbackCategories({ signal: s }), []);

  const cats = catsQ.data || [];
  const fbCats = fbQ.data || [];

  const tabs = [
    { id: 'cats', key: 'c_service_categories', count: cats.length },
    { id: 'fbcats', key: 'c_feedback_cats', count: fbCats.length },
    { id: 'units', key: 'c_admin_units', count: null },
  ];

  // ----- cấu hình theo tab -----
  const config = {
    cats: {
      query: catsQ, rows: cats, rowKey: 'id',
      fields: (item) => [
        { key: 'code', label: t('c_code'), disabled: !!item, hint: item ? null : (lang === 'en' ? 'Unique code, e.g. "hotich"' : 'Mã duy nhất, vd "hotich"') },
        { key: 'vi', label: t('c_name_vi') },
        { key: 'description', label: t('svc_description'), type: 'textarea' },
        { key: 'displayOrder', label: t('c_displayorder'), type: 'number' },
      ].concat(item ? [{ key: 'active', label: t('c_status'), type: 'bool', boolLabel: t('c_active') }] : []),
      newItem: { code: '', vi: '', en: '', description: '', displayOrder: 0, active: true },
      columns: [
        { label: t('c_name_vi'), render: (r) => <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}><Icon name={r.icon} size={16}/></span><strong style={{ fontSize: 'var(--fs-14)' }}>{r.vi}</strong></span> },
        { label: t('c_code'), render: (r) => <code style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{r.code}</code> },
        { label: t('c_procedures'), render: (r) => <strong style={{ fontSize: 'var(--fs-13)' }}>{r.count}</strong> },
        { label: t('c_status'), render: (r) => <Badge tone={r.active ? 'success' : 'neutral'} dot={false}>{t(r.active ? 'c_active' : 'c_inactive')}</Badge> },
      ],
      label: (r) => r.vi,
      create: (form) => API.admin.createCategory(form),
      update: (id, form) => API.admin.updateCategory(id, form),
      remove: (id) => API.admin.deleteCategory(id),
    },
    fbcats: {
      query: fbQ, rows: fbCats, rowKey: 'id',
      fields: (item) => [
        { key: 'code', label: t('c_code'), disabled: !!item, hint: item ? null : (lang === 'en' ? 'Unique code, e.g. "road"' : 'Mã duy nhất, vd "road"') },
        { key: 'vi', label: t('c_name_vi') },
      ].concat(item ? [{ key: 'active', label: t('c_status'), type: 'bool', boolLabel: t('c_active') }] : []),
      newItem: { code: '', vi: '', en: '', active: true },
      columns: [
        { label: t('c_name_vi'), render: (r) => <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}><Icon name={r.icon} size={16}/></span><strong style={{ fontSize: 'var(--fs-14)' }}>{r.vi}</strong></span> },
        { label: t('c_code'), render: (r) => <code style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{r.code}</code> },
        { label: t('c_status'), render: (r) => <Badge tone={r.active ? 'success' : 'neutral'} dot={false}>{t(r.active ? 'c_active' : 'c_inactive')}</Badge> },
      ],
      label: (r) => r.vi,
      create: (form) => API.admin.createFeedbackCategory(form),
      update: (id, form) => API.admin.updateFeedbackCategory(id, form),
      remove: (id) => API.admin.deleteFeedbackCategory(id),
    },
  };

  const cfg = config[tab];

  const save = (form) => {
    const call = modal.item ? cfg.update(modal.item[cfg.rowKey], form) : cfg.create(form);
    return call
      .then(() => { cfg.query.reload(); setModal(null); showToast(t('dt_saved')); })
      .catch(() => { showToast(t('dt_save_error')); });
  };

  const del = () => cfg.remove(deleting[cfg.rowKey])
    .then(() => { cfg.query.reload(); setDeleting(null); showToast(t('dt_deleted')); })
    .catch(() => { showToast(t('dt_save_error')); });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageTitle title={t('ad_catalogs')}
        actions={tab !== 'units' ? <button className="btn btn-primary" onClick={() => setModal({ item: null })}><Icon name="fileplus" size={16}/>{t('c_add')}</button> : null}/>

      <div className="ad-tabs">
        {tabs.map((tb) => (
          <button key={tb.id} className={'ad-tab' + (tab === tb.id ? ' active' : '')} onClick={() => setTab(tb.id)}>
            {t(tb.key)} {tb.count != null && <span style={{ color: 'var(--ink-4)', fontWeight: 700 }}>{tb.count}</span>}
          </button>
        ))}
      </div>

      {tab === 'units' ? (
        <AdminUnits lang={lang} showToast={showToast}/>
      ) : (
        <CrudLoader loading={cfg.query.loading} error={cfg.query.error} reload={cfg.query.reload} lang={lang}>
          <CrudTable lang={lang} columns={cfg.columns} rows={cfg.rows} rowKey={cfg.rowKey}
            onEdit={(r) => setModal({ item: r })}
            onDelete={(r) => setDeleting(r)}/>
        </CrudLoader>
      )}

      {tab !== 'units' && modal && (
        <CrudModal lang={lang}
          title={modal.item ? t('u_edit') : t('c_add')}
          fields={cfg.fields(modal.item)}
          initial={modal.item || cfg.newItem}
          onClose={() => setModal(null)}
          onSave={save}/>
      )}
      {tab !== 'units' && deleting && (
        <DeleteConfirm lang={lang} label={cfg.label(deleting)}
          onClose={() => setDeleting(null)}
          onConfirm={del}/>
      )}
    </div>
  );
}

// ---------- Màn hình quản lý Dịch vụ công (chuyên sâu) ----------
function AdminServices({ lang, showToast }) {
  const t = useT(lang);
  const svcQ = useApiData((s) => API.admin.getServices({}, { signal: s }), []);
  const catsQ = useApiData((s) => API.getCategories({ signal: s }), []);
  const [q, setQ] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const [modal, setModal] = React.useState(null);
  const [deleting, setDeleting] = React.useState(null);

  const services = svcQ.data || [];
  const cats = catsQ.data || [];

  const filtered = services.filter((s) =>
    (cat === 'all' || s.categoryId === cat) &&
    (!q || (s.vi + ' ' + s.en).toLowerCase().includes(q.toLowerCase()))
  );
  const pg = usePagination(filtered, 8);

  const fields = (item) => [
    { key: 'code', label: t('c_code'), disabled: !!item, hint: item ? null : (lang === 'en' ? 'Unique procedure code' : 'Mã thủ tục (duy nhất)') },
    { key: 'vi', label: t('c_name_vi') },
    { key: 'categoryId', label: t('sp_filter_category'), type: 'select', options: cats.map((c) => ({ value: c.id, label: pick(c, lang) })) },
    { key: 'descVi', label: t('svc_description'), type: 'textarea' },
    { key: 'docsText', label: t('svc_documents'), type: 'textarea', placeholder: lang === 'en' ? 'One document per line' : 'Mỗi dòng một loại giấy tờ' },
    { key: 'processingDays', label: t('svc_processing_time') + ' (' + t('svc_working_days') + ')', type: 'number' },
    { key: 'fee', label: t('svc_fee') + ' (đ)', type: 'number' },
    { key: 'level', label: t('svc_level'), type: 'select', options: [{ value: 'full', label: t('svc_level_full') }, { value: 'partial', label: t('svc_level_partial') }] },
  ].concat(item ? [{ key: 'active', label: t('c_status'), type: 'bool', boolLabel: t('c_active') }] : []);

  // Khởi tạo form: nối documents (mảng [vi,en]) thành chuỗi nhiều dòng cho textarea.
  const toForm = (s) => Object.assign({}, s, { docsText: (s.documents || []).map((d) => Array.isArray(d) ? d[0] : d).join('\n') });
  const blank = { code: '', categoryId: cats[0] ? cats[0].id : '', vi: '', en: '', descVi: '', docsText: '', processingDays: 3, fee: 0, level: 'full', active: true };

  const save = (form) => {
    const call = modal.item ? API.admin.updateService(modal.item.id, form) : API.admin.createService(form);
    return call
      .then(() => { svcQ.reload(); setModal(null); showToast(t('dt_saved')); })
      .catch(() => { showToast(t('dt_save_error')); });
  };
  const del = () => API.admin.deleteService(deleting.id)
    .then(() => { svcQ.reload(); setDeleting(null); showToast(t('dt_deleted')); })
    .catch(() => { showToast(t('dt_save_error')); });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageTitle title={t('c_services')} sub={`${filtered.length} ${t('results')}`}
        actions={<button className="btn btn-primary" disabled={!cats.length} onClick={() => setModal({ item: null })}><Icon name="fileplus" size={16}/>{t('c_add')}</button>}/>

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

      <CrudLoader loading={svcQ.loading || catsQ.loading} error={svcQ.error || catsQ.error} reload={() => { svcQ.reload(); catsQ.reload(); }} lang={lang}>
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
                      <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.code}</span>
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
      </CrudLoader>

      {modal && (
        <CrudModal lang={lang}
          title={modal.item ? t('u_edit') + ' — ' + modal.item.vi : t('c_add')}
          fields={fields(modal.item)}
          initial={modal.item ? toForm(modal.item) : blank}
          onClose={() => setModal(null)}
          onSave={save}/>
      )}
      {deleting && (
        <DeleteConfirm lang={lang} label={deleting.vi}
          onClose={() => setDeleting(null)}
          onConfirm={del}/>
      )}
    </div>
  );
}

Object.assign(window, { AdminCatalogs, AdminUnits, CrudModal, DeleteConfirm, CrudLoader, AdminServices });
