// ============================================================
// Trang quản trị — Quản lý điểm dịch vụ (chuyên sâu, có bản đồ)
// ============================================================

// Bản đồ chọn vị trí trong modal
function SpLocationPicker({ lat, lng, onPick }) {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current || mapRef.current || typeof L === 'undefined') return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([lat || 15.1205, lng || 108.7945], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OSM &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    const icon = L.divIcon({ className: '', html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 4px;transform:rotate(-45deg);background:var(--primary);border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`, iconSize: [30, 30], iconAnchor: [15, 27] });
    if (lat && lng) markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    map.on('click', (e) => {
      onPick(+e.latlng.lat.toFixed(5), +e.latlng.lng.toFixed(5));
      if (markerRef.current) markerRef.current.setLatLng(e.latlng);
      else markerRef.current = L.marker(e.latlng, { icon }).addTo(map);
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return <div ref={ref} style={{ height: 260, borderRadius: 'var(--r-md)', zIndex: 0, position: 'relative', border: '1px solid var(--line)' }}></div>;
}

// Modal thêm/sửa điểm dịch vụ
function SpEditModal({ lang, point, onClose, onSave }) {
  const t = useT(lang);
  const blank = { id: 'sp' + Date.now(), vi: '', en: '', address: '', ward: window.DATA.wards[0], phone: '', email: '', website: '', hours: { weekday: '07:00 – 11:30, 13:30 – 17:00', saturday: 'Nghỉ' }, rating: 0, ratingCount: 0, open: true, serviceIds: [], distance: 0, lat: 15.1205, lng: 108.7945 };
  const [form, setForm] = React.useState(point || blank);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setHours = (k, v) => setForm((f) => ({ ...f, hours: { ...f.hours, [k]: v } }));
  const toggleSvc = (id) => setForm((f) => ({ ...f, serviceIds: f.serviceIds.includes(id) ? f.serviceIds.filter((x) => x !== id) : [...f.serviceIds, id] }));

  return (
    <Modal title={point ? t('sp_edit_point') : t('sp_add_point')} onClose={onClose} width={780}>
      <div className="sp-edit-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
        {/* Cột trái: thông tin */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div className="field">
            <label className="field-label" htmlFor="sp-vi">{t('c_name_vi')} <span className="req">*</span></label>
            <input id="sp-vi" className="input" value={form.vi} onChange={(e) => set('vi', e.target.value)} placeholder="VD: Bộ phận Một cửa UBND phường…"/>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="sp-en">{t('c_name_en')}</label>
            <input id="sp-en" className="input" value={form.en} onChange={(e) => set('en', e.target.value)}/>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="sp-addr">{t('sp_address')} <span className="req">*</span></label>
            <input id="sp-addr" className="input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Số nhà, đường, phường…"/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="sp-ward">{t('sp_filter_ward')}</label>
              <select id="sp-ward" className="select" value={form.ward} onChange={(e) => set('ward', e.target.value)}>
                {window.DATA.wards.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="sp-phone">{t('sp_phone')}</label>
              <input id="sp-phone" className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0255 …"/>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="sp-email">{t('sp_email')}</label>
              <input id="sp-email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="sp-web">{t('sp_website')}</label>
              <input id="sp-web" className="input" value={form.website} onChange={(e) => set('website', e.target.value)}/>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label className="field-label" htmlFor="sp-hw">{t('sp_mon_fri')}</label>
              <input id="sp-hw" className="input" value={form.hours.weekday} onChange={(e) => setHours('weekday', e.target.value)}/>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="sp-hs">{t('sp_saturday')}</label>
              <input id="sp-hs" className="input" value={form.hours.saturday} onChange={(e) => setHours('saturday', e.target.value)}/>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer', padding: '4px 0' }}>
            <button type="button" role="switch" aria-checked={form.open} onClick={() => set('open', !form.open)}
              style={{ width: 44, height: 26, borderRadius: 99, border: 'none', background: form.open ? 'var(--success)' : 'var(--line)', position: 'relative', cursor: 'pointer', flex: 'none', transition: 'background .15s' }}>
              <span style={{ position: 'absolute', top: 3, left: form.open ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: 'var(--shadow-sm)' }}></span>
            </button>
            <span style={{ fontSize: 'var(--fs-14)', fontWeight: 600 }}>{form.open ? t('sp_open') : t('sp_closed')}</span>
          </label>
        </div>

        {/* Cột phải: bản đồ + dịch vụ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div className="field">
            <span className="field-label">{t('sp_location')} <span style={{ fontWeight: 400, color: 'var(--ink-4)' }}>· {t('sp_click_map')}</span></span>
            <SpLocationPicker lat={form.lat} lng={form.lng} onPick={(la, ln) => setForm((f) => ({ ...f, lat: la, lng: ln }))}/>
            <span className="field-hint" style={{ fontVariantNumeric: 'tabular-nums' }}>{form.lat}, {form.lng}</span>
          </div>
          <div className="field">
            <span className="field-label">{t('sp_services_offered')} <span style={{ fontWeight: 400, color: 'var(--ink-4)' }}>· {form.serviceIds.length}</span></span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 168, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: 8 }}>
              {window.DATA.services.map((s) => {
                const on = form.serviceIds.includes(s.id);
                return (
                  <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 9px', borderRadius: 'var(--r-sm)', cursor: 'pointer', background: on ? 'var(--primary-soft)' : 'transparent' }}>
                    <input type="checkbox" checked={on} onChange={() => toggleSvc(s.id)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }}/>
                    <span style={{ fontSize: 'var(--fs-13)', fontWeight: on ? 600 : 500, color: on ? 'var(--primary)' : 'var(--ink-2)' }}>{pick(s, lang)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
        <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" disabled={!form.vi.trim() || !form.address.trim()} onClick={() => onSave(form)}>
          <Icon name="check" size={16}/>{t('save')}
        </button>
      </div>
      <style>{`@media (max-width: 640px) { .sp-edit-grid { grid-template-columns: 1fr !important; } }`}</style>
    </Modal>
  );
}

function AdminServicePoints({ lang, points, setPoints, showToast }) {
  const t = useT(lang);
  const [q, setQ] = React.useState('');
  const [fWard, setFWard] = React.useState('all');
  const [fOpen, setFOpen] = React.useState('all');
  const [modal, setModal] = React.useState(undefined); // undefined=đóng, null=thêm, object=sửa
  const [deleting, setDeleting] = React.useState(null);

  const filtered = points.filter((p) =>
    (fWard === 'all' || p.ward === fWard) &&
    (fOpen === 'all' || (fOpen === 'open' ? p.open : !p.open)) &&
    (!q || (p.vi + ' ' + p.en + ' ' + p.address).toLowerCase().includes(q.toLowerCase()))
  );
  const pg = usePagination(filtered, 8);

  const save = (form) => {
    const exists = points.some((p) => p.id === form.id);
    setPoints(exists ? points.map((p) => p.id === form.id ? form : p) : [form, ...points]);
    setModal(undefined);
    showToast(t('dt_saved'));
  };

  const selStyle = { width: 'auto', flex: '0 1 auto', paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageTitle title={t('ad_points')} sub={`${filtered.length} ${t('results')}`}
        actions={<button className="btn btn-primary" onClick={() => setModal(null)}><Icon name="mappin" size={16}/>{t('sp_add_point')}</button>}/>

      <div className="op-filter-bar" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 1 300px', minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'grid' }}><Icon name="search" size={16}/></span>
          <input className="input" style={{ paddingLeft: 38, paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' }} placeholder={t('sp_search_ph')} value={q} onChange={(e) => setQ(e.target.value)}/>
        </div>
        <select className="select" style={selStyle} value={fWard} onChange={(e) => setFWard(e.target.value)} aria-label={t('sp_filter_ward')}>
          <option value="all">{t('sp_filter_ward')}: {t('all')}</option>
          {window.DATA.wards.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
        <select className="select" style={selStyle} value={fOpen} onChange={(e) => setFOpen(e.target.value)} aria-label={t('tbl_status')}>
          <option value="all">{t('tbl_status')}: {t('all')}</option>
          <option value="open">{t('sp_open')}</option>
          <option value="closed">{t('sp_closed')}</option>
        </select>
      </div>

      <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
        <table className="op-table">
          <thead>
            <tr>
              <th>{t('c_name_vi')}</th>
              <th>{t('sp_address')}</th>
              <th>{t('sp_filter_ward')}</th>
              <th>{t('sp_phone')}</th>
              <th>{t('sp_services')}</th>
              <th>{t('sp_rating')}</th>
              <th>{t('tbl_status')}</th>
              <th style={{ width: 120 }}>{t('tbl_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {pg.pageItems.map((p) => (
              <tr key={p.id}>
                <td style={{ maxWidth: 260 }}>
                  <strong style={{ fontSize: 'var(--fs-14)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pick(p, lang)}</strong>
                  <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)', fontVariantNumeric: 'tabular-nums' }}>{p.lat}, {p.lng}</span>
                </td>
                <td style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', maxWidth: 200 }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</span></td>
                <td style={{ fontSize: 'var(--fs-13)', whiteSpace: 'nowrap' }}>{p.ward}</td>
                <td style={{ fontSize: 'var(--fs-13)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{p.phone || '—'}</td>
                <td style={{ fontSize: 'var(--fs-13)', textAlign: 'center' }}><strong>{p.serviceIds.length}</strong></td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {p.ratingCount ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 'var(--fs-13)' }}><Stars rating={p.rating} size={12}/><strong>{p.rating}</strong></span> : <span style={{ color: 'var(--ink-4)', fontSize: 'var(--fs-13)' }}>—</span>}
                </td>
                <td><Badge tone={p.open ? 'success' : 'neutral'}>{t(p.open ? 'sp_open' : 'sp_closed')}</Badge></td>
                <td>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setModal(p)}>{t('u_edit')}</button>
                    <button onClick={() => setDeleting(p)} aria-label={t('c_delete')}
                      style={{ border: '1.5px solid var(--danger-border)', background: 'var(--danger-soft)', borderRadius: 'var(--r-sm)', width: 30, height: 30, display: 'grid', placeItems: 'center', color: 'var(--danger)' }}>
                      <Icon name="x" size={14}/>
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon="mappin" title={t('empty')}/>}
        <Pagination {...pg} lang={lang}/>
      </div>

      {modal !== undefined && (
        <SpEditModal lang={lang} point={modal} onClose={() => setModal(undefined)} onSave={save}/>
      )}
      {deleting && (
        <DeleteConfirm lang={lang} label={deleting.vi}
          onClose={() => setDeleting(null)}
          onConfirm={() => { setPoints(points.filter((p) => p.id !== deleting.id)); setDeleting(null); showToast(t('dt_saved')); }}/>
      )}
    </div>
  );
}

Object.assign(window, { AdminServicePoints, SpEditModal });
