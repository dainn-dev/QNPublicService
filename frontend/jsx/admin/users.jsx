// ============================================================
// Trang quản trị — Người dùng & Cán bộ
// ============================================================

function UserFormModal({ lang, user, onClose, onSave }) {
  const t = useT(lang);
  const [form, setForm] = React.useState(user || { name: '', phone: '', email: '', address: '', role: 'citizen', active: true, lastLogin: null });
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <Modal title={user ? t('u_edit') + ' — ' + user.name : t('u_create')} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label className="field-label" htmlFor="uf-name">{t('full_name')} <span className="req">*</span></label>
          <input id="uf-name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nguyễn Văn A" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="field">
            <label className="field-label" htmlFor="uf-phone">{t('phone')}</label>
            <input id="uf-phone" className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="09xx xxx xxx" />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="uf-role">{t('u_role')}</label>
            <select id="uf-role" className="select" value={form.role} onChange={(e) => set('role', e.target.value)}>
              {window.ADATA.roles.map((r) => <option key={r} value={r}>{t(window.ROLE_META[r].labelKey)}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="uf-email">{t('email')}</label>
          <input id="uf-email" className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="ban@email.com" />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="uf-address">{t('sp_address')}</label>
          <input id="uf-address" className="input" value={form.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="Số nhà, đường, phường/xã, tỉnh/TP…" />
        </div>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 'var(--fs-14)', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
          {t('u_active')}
        </label>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" disabled={!form.name.trim()} onClick={() => onSave(form)}>{t('save')}</button>
      </div>
    </Modal>);

}

function AdminUsers({ lang, users, setUsers, showToast }) {
  const t = useT(lang);
  const [fRole, setFRole] = React.useState('all');
  const [q, setQ] = React.useState('');
  const [editing, setEditing] = React.useState(undefined); // undefined=đóng, null=tạo mới, object=sửa

  const filtered = users.filter((u) =>
  (fRole === 'all' || u.role === fRole) && (
  !q || (u.name + u.email + u.phone).toLowerCase().includes(q.toLowerCase()))
  );
  const pg = usePagination(filtered, 8);

  const save = (form) => {
    if (editing) {
      setUsers(users.map((u) => u.id === editing.id ? { ...u, ...form } : u));
    } else {
      setUsers([{ ...form, id: 'u' + (users.length + 11), lastLogin: null }, ...users]);
    }
    setEditing(undefined);
    showToast(t('dt_saved'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageTitle title={t('ad_users')} sub={`${filtered.length} ${t('results')}`}
      actions={<button className="btn btn-primary" onClick={() => setEditing(null)}><Icon name="user" size={16} />{t('u_create')}</button>} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 1 300px', minWidth: 200 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'grid' }}><Icon name="search" size={16} /></span>
          <input className="input" style={{ paddingLeft: 38, paddingTop: 9, paddingBottom: 9, fontSize: 'var(--fs-14)' }} placeholder={t('op_search_ph')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="ad-tabs">
          <button className={'ad-tab' + (fRole === 'all' ? ' active' : '')} onClick={() => setFRole('all')}>{t('all')}</button>
          {window.ADATA.roles.map((r) =>
          <button key={r} className={'ad-tab' + (fRole === r ? ' active' : '')} onClick={() => setFRole(r)}>{t(window.ROLE_META[r].labelKey)}</button>
          )}
        </div>
      </div>

      <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
        <table className="op-table">
          <thead>
            <tr>
              <th>{t('full_name')}</th>
              <th>{t('phone')} / {t('email')}</th>
              <th>{t('u_role')}</th>
              <th>{t('u_status')}</th>
              <th>{t('u_last_login')}</th>
              <th style={{ width: 200 }}>{t('tbl_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {pg.pageItems.map((u) =>
            <tr key={u.id} style={{ opacity: u.active ? 1 : 0.55 }}>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, color: 'var(--ink-2)', flex: 'none' }}>
                      {u.name.split(' ').slice(-1)[0].charAt(0)}
                    </span>
                    <strong style={{ fontSize: 'var(--fs-14)', whiteSpace: 'nowrap' }}>{u.name}</strong>
                  </span>
                </td>
                <td>
                  <span style={{ display: 'block', fontSize: 'var(--fs-13)' }}>{u.phone}</span>
                  <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-4)' }}>{u.email}</span>
                </td>
                <td><StatusBadge status={u.role} map={window.ROLE_META} lang={lang} /></td>
                <td><Badge tone={u.active ? 'success' : 'neutral'}>{t(u.active ? 'u_active' : 'u_disabled')}</Badge></td>
                <td style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{u.lastLogin || t('u_never')}</td>
                <td>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(u)}>{t('u_edit')}</button>
                    <button className="btn btn-sm" style={{ background: u.active ? 'var(--danger-soft)' : 'var(--success-soft)', color: u.active ? 'var(--danger)' : 'var(--success)' }}
                  onClick={() => {setUsers(users.map((x) => x.id === u.id ? { ...x, active: !x.active } : x));showToast(t('dt_saved'));}}>
                      {t(u.active ? 'u_disable' : 'u_enable')}
                    </button>
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState title={t('empty')} />}
        <Pagination {...pg} lang={lang} />
      </div>

      {editing !== undefined && <UserFormModal lang={lang} user={editing} onClose={() => setEditing(undefined)} onSave={save} />}
    </div>);

}

// ---------- Cán bộ ----------
function OfficerEditModal({ lang, officer, onClose, onSave }) {
  const t = useT(lang);
  const [form, setForm] = React.useState(officer);
  const set = (k, v) => setForm({ ...form, [k]: v });
  return (
    <Modal title={t('o_assign_dept') + ' — ' + officer.name} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="field">
          <label className="field-label" htmlFor="of-dept">{t('o_department')}</label>
          <select id="of-dept" className="select" value={form.dept} onChange={(e) => set('dept', e.target.value)}>
            {window.ADATA.departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="of-pos">{t('o_position')}</label>
          <select id="of-pos" className="select" value={form.position} onChange={(e) => set('position', e.target.value)}>
            {window.ADATA.positions.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="of-area">{t('o_area')}</label>
          <input id="of-area" className="input" value={form.area} onChange={(e) => set('area', e.target.value)} placeholder="Cẩm Thành, Nghĩa Lộ…" />
          <span className="field-hint">{lang === 'en' ? 'Comma-separated ward names' : 'Tên các phường, cách nhau bằng dấu phẩy'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
        <button className="btn btn-primary" onClick={() => onSave(form)}>{t('save')}</button>
      </div>
    </Modal>);

}

function AdminOfficers({ lang, officers, setOfficers, showToast }) {
  const t = useT(lang);
  const [editing, setEditing] = React.useState(null);
  const pg = usePagination(officers, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageTitle title={t('ad_officers')} sub={`${officers.length} ${t('results')}`} />
      <div className="card op-table-scroll" style={{ background: '#fff', overflowX: 'auto' }}>
        <table className="op-table">
          <thead>
            <tr>
              <th>{t('full_name')}</th>
              <th>{t('o_department')}</th>
              <th>{t('o_position')}</th>
              <th>{t('o_area')}</th>
              <th>{t('o_workload')}</th>
              <th style={{ width: 130 }}>{t('tbl_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {pg.pageItems.map((o) =>
            <tr key={o.id}>
                <td>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <OfficerAvatar officerId={o.id} size={32} />
                    <strong style={{ fontSize: 'var(--fs-14)', whiteSpace: 'nowrap' }}>{o.name}</strong>
                  </span>
                </td>
                <td style={{ fontSize: 'var(--fs-13)', whiteSpace: 'nowrap' }}>{o.dept}</td>
                <td style={{ fontSize: 'var(--fs-13)', whiteSpace: 'nowrap' }}>{o.position}</td>
                <td style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{o.area}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 56, height: 7, background: 'var(--bg-sunken)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: '100%', width: `${Math.min(100, o.workload * 20)}%`, background: o.workload >= 4 ? 'var(--danger)' : 'var(--primary)', borderRadius: 'var(--r-full)' }}></span>
                    </span>
                    <strong style={{ fontSize: 'var(--fs-13)' }}>{o.workload}</strong>
                  </span>
                </td>
                <td><button className="btn btn-secondary btn-sm" onClick={() => setEditing(o)}>{t('o_assign_dept')}</button></td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination {...pg} lang={lang} />
      </div>
      {editing &&
      <OfficerEditModal lang={lang} officer={editing} onClose={() => setEditing(null)}
      onSave={(form) => {setOfficers(officers.map((x) => x.id === form.id ? form : x));setEditing(null);showToast(t('dt_saved'));}} />
      }
    </div>);

}

Object.assign(window, { AdminUsers, AdminOfficers });