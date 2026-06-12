// ============================================================
// Tài khoản — Thông tin, Hồ sơ của tôi, Phản ánh của tôi, Thông báo
// ============================================================

function ProfileScreen({ lang, navigate, tab: initialTab, onLogout }) {
  const t = useT(lang);
  const [tab, setTab] = React.useState(initialTab || 'info');
  const u = window.DATA.user;
  const [notifs, setNotifs] = React.useState(window.DATA.notifications);

  const tabs = [
    { id: 'info', icon: 'user', label: t('profile_info') },
    { id: 'requests', icon: 'doc', label: t('my_requests') },
    { id: 'feedback', icon: 'megaphone', label: t('my_feedback') },
    { id: 'notifications', icon: 'bell', label: t('notifications') },
  ];
  const unread = notifs.filter((n) => !n.read).length;

  return (
    <main style={{ minHeight: '70vh' }}>
      <PageHead lang={lang} navigate={navigate}
        crumbs={[{ label: t('profile_title') }]}
        title={t('profile_title')}/>

      <div className="container pf-grid" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, marginTop: 24, alignItems: 'start', marginBottom: 24 }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
            <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-soft-2)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 22 }}>MH</span>
            <div>
              <strong style={{ display: 'block', fontSize: 'var(--fs-15)' }}>{u.fullName}</strong>
              <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{u.ward}</span>
            </div>
            {u.verified && <Badge tone="success" dot={false}><Icon name="shield" size={13}/>{t('profile_verified')}</Badge>}
          </div>
          <nav className="card" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tabs.map((tb) => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 11, border: 'none', borderRadius: 'var(--r-md)', padding: '11px 14px', fontWeight: 600, fontSize: 'var(--fs-14)', textAlign: 'left',
                  background: tab === tb.id ? 'var(--primary-soft)' : 'transparent', color: tab === tb.id ? 'var(--primary)' : 'var(--ink-2)' }}>
                <Icon name={tb.icon} size={17}/>{tb.label}
                {tb.id === 'notifications' && unread > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'var(--primary)', color: '#fff', fontSize: 11, fontWeight: 700, minWidth: 19, height: 19, borderRadius: 'var(--r-full)', display: 'grid', placeItems: 'center' }}>{unread}</span>
                )}
              </button>
            ))}
            {onLogout && (
              <button onClick={onLogout}
                style={{ display: 'flex', alignItems: 'center', gap: 11, border: 'none', borderRadius: 'var(--r-md)', padding: '11px 14px', fontWeight: 600, fontSize: 'var(--fs-14)', textAlign: 'left', background: 'transparent', color: 'var(--danger)', borderTop: '1px solid var(--line-soft)', marginTop: 4 }}>
                <Icon name="x" size={16}/>{t('logout')}
              </button>
            )}
          </nav>
        </div>

        {/* Nội dung */}
        <div>
          {tab === 'info' && (
            <section className="card" style={{ padding: '24px 28px' }}>
              <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 8 }}>{t('profile_info')}</h2>
              {[
                [t('full_name'), u.fullName],
                [t('phone'), u.phone],
                [t('email'), u.email],
                [t('citizen_id'), u.citizenId.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')],
              ].map(([label, value], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 14, padding: '13px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', fontSize: 'var(--fs-15)' }}>
                  <span style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)' }}>{label}</span>
                  <strong style={{ fontWeight: 600 }}>{value}</strong>
                </div>
              ))}
              <button className="btn btn-secondary" style={{ marginTop: 18 }}>{lang === 'en' ? 'Edit information' : 'Chỉnh sửa thông tin'}</button>
            </section>
          )}

          {tab === 'requests' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {window.DATA.requests.map((r) => {
                const s = window.DATA.services.find((x) => x.id === r.serviceId);
                return (
                  <button key={r.id} onClick={() => navigate('requests/' + r.id)} className="card card-hover"
                    style={{ padding: '16px 20px', background: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                    <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name="doc" size={18}/></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 'var(--fs-14)', fontVariantNumeric: 'tabular-nums' }}>{r.id}</strong>
                        <StatusBadge status={r.status} map={window.STATUS_META} lang={lang}/>
                      </span>
                      <span style={{ display: 'block', fontSize: 'var(--fs-13)', color: 'var(--ink-3)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s ? pick(s, lang) : ''} · {r.submitted}</span>
                    </span>
                    <Icon name="chevronright" size={17} style={{ color: 'var(--ink-4)' }}/>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'feedback' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {window.DATA.feedbacks.map((f) => {
                const c = window.DATA.feedbackCategories.find((x) => x.id === f.categoryId);
                return (
                  <button key={f.id} onClick={() => navigate('feedback/' + f.id)} className="card card-hover"
                    style={{ padding: '16px 20px', background: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
                    <span style={{ width: 40, height: 40, borderRadius: 11, background: 'var(--bg-sunken)', color: 'var(--ink-2)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={c.icon} size={18}/></span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 'var(--fs-14)', fontVariantNumeric: 'tabular-nums', color: 'var(--ink-3)' }}>{f.id}</strong>
                        <StatusBadge status={f.status} map={window.FB_STATUS_META} lang={lang}/>
                      </span>
                      <span style={{ display: 'block', fontSize: 'var(--fs-14)', fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.title}</span>
                    </span>
                    <Icon name="chevronright" size={17} style={{ color: 'var(--ink-4)' }}/>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'notifications' && (
            <section className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 'var(--fs-18)' }}>{t('notif_title')} {unread > 0 && <span style={{ fontSize: 'var(--fs-13)', color: 'var(--primary)', fontWeight: 600 }}>· {unread} {t('notif_unread')}</span>}</h2>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', fontWeight: 600 }}
                  onClick={() => setNotifs(notifs.map((n) => ({ ...n, read: true })))}>
                  <Icon name="check" size={14}/>{t('notif_mark_all')}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {notifs.map((n, i) => (
                  <button key={n.id} onClick={() => setNotifs(notifs.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                    style={{ display: 'flex', gap: 13, padding: '14px 6px', borderTop: i ? '1px solid var(--line-soft)' : 'none', background: 'none', border: 'none', borderTopStyle: i ? 'solid' : undefined, textAlign: 'left', cursor: 'pointer', width: '100%', alignItems: 'flex-start' }}>
                    <span style={{ width: 36, height: 36, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center',
                      background: n.type === 'request' ? 'var(--info-soft)' : n.type === 'feedback' ? 'var(--warning-soft)' : 'var(--primary-soft)',
                      color: n.type === 'request' ? 'var(--info)' : n.type === 'feedback' ? 'var(--warning)' : 'var(--primary)' }}>
                      <Icon name={n.type === 'request' ? 'doc' : n.type === 'feedback' ? 'megaphone' : 'bell'} size={17}/>
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 'var(--fs-14)', fontWeight: n.read ? 500 : 700, color: n.read ? 'var(--ink-2)' : 'var(--ink)', lineHeight: 1.5 }}>{pick(n, lang)}</span>
                      <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{n.at}</span>
                    </span>
                    {!n.read && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--primary)', flex: 'none', marginTop: 6 }}></span>}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 760px) { .pf-grid { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}

Object.assign(window, { ProfileScreen });
