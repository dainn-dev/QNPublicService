// ============================================================
// Danh mục dịch vụ công + Chi tiết thủ tục
// ============================================================

function ServiceCatalog({ lang, navigate, categoryId, initialQuery }) {
  const t = useT(lang);
  const [q, setQ] = React.useState(initialQuery || '');
  const [cat, setCat] = React.useState(categoryId || 'all');

  const services = window.DATA.services.filter((s) => {
    if (cat !== 'all' && s.categoryId !== cat) return false;
    if (q) {
      const text = (s.vi + ' ' + s.en + ' ' + s.descVi).toLowerCase();
      if (!text.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <main style={{ minHeight: '70vh' }}>
      <PageHead lang={lang} navigate={navigate}
        crumbs={[{ label: t('nav_services') }]}
        title={t('svc_catalog_title')} sub={t('svc_catalog_sub')}/>

      <div className="container" style={{ marginTop: 16 }}>
        {/* Tìm kiếm */}
        <div style={{ position: 'relative', maxWidth: 520 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', display: 'grid' }}><Icon name="search" size={17}/></span>
          <input className="input" style={{ paddingLeft: 40 }} placeholder={t('hero_search_ph')} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t('search')}/>
        </div>

        {/* Pills lĩnh vực */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
          <button onClick={() => setCat('all')}
            style={{ border: '1.5px solid', borderColor: cat === 'all' ? 'var(--primary)' : 'var(--line)', background: cat === 'all' ? 'var(--primary-soft)' : '#fff', color: cat === 'all' ? 'var(--primary)' : 'var(--ink-2)', fontWeight: 600, fontSize: 'var(--fs-14)', borderRadius: 'var(--r-full)', padding: '8px 16px' }}>
            {t('sp_all')}
          </button>
          {window.DATA.categories.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, border: '1.5px solid', borderColor: cat === c.id ? 'var(--primary)' : 'var(--line)', background: cat === c.id ? 'var(--primary-soft)' : '#fff', color: cat === c.id ? 'var(--primary)' : 'var(--ink-2)', fontWeight: 600, fontSize: 'var(--fs-14)', borderRadius: 'var(--r-full)', padding: '8px 16px' }}>
              <Icon name={c.icon} size={15}/>{pick(c, lang)}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', margin: '18px 0 12px' }}>
          <strong style={{ color: 'var(--ink)' }}>{services.length}</strong> {t('svc_count')}
        </p>

        {/* Danh sách thủ tục */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 16, marginBottom: 24 }}>
          {services.length === 0 && <EmptyState title={t('empty')}/>}
          {services.map((s) => {
            const c = window.DATA.categories.find((x) => x.id === s.categoryId);
            return (
              <button key={s.id} onClick={() => navigate('services/detail/' + s.id)} className="card card-hover"
                style={{ padding: 22, background: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 'var(--fs-13)', color: 'var(--ink-3)', fontWeight: 600 }}>
                    <Icon name={c.icon} size={15}/>{pick(c, lang)}
                  </span>
                  <Badge tone={s.level === 'full' ? 'success' : 'info'} dot={false}>{t(s.level === 'full' ? 'svc_level_full' : 'svc_level_partial')}</Badge>
                </div>
                <strong style={{ fontSize: 'var(--fs-16)', lineHeight: 1.4 }}>{pick(s, lang)}</strong>
                <p style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {lang === 'en' ? s.descEn : s.descVi}
                </p>
                <div style={{ display: 'flex', gap: 16, fontSize: 'var(--fs-13)', color: 'var(--ink-3)', marginTop: 'auto' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={14}/>{s.processingDays} {t('svc_working_days')}</span>
                  <span style={{ fontWeight: 600, color: s.fee ? 'var(--ink-2)' : 'var(--success)' }}>{fmtFee(s.fee, t)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

// ---------- Chi tiết thủ tục ----------
function ServiceDetail({ lang, navigate, serviceId }) {
  const t = useT(lang);
  const s = window.DATA.services.find((x) => x.id === serviceId) || window.DATA.services[0];
  const c = window.DATA.categories.find((x) => x.id === s.categoryId);
  const points = window.DATA.servicePoints.filter((p) => p.serviceIds.includes(s.id));

  return (
    <main>
      <PageHead lang={lang} navigate={navigate}
        crumbs={[{ label: t('nav_services'), route: 'services' }, { label: pick(c, lang), route: 'services/' + c.id }, { label: pick(s, lang) }]}
        title={pick(s, lang)}
        actions={
          <button className="btn btn-primary btn-lg" onClick={() => navigate('requests/create', { serviceId: s.id })}>
            <Icon name="fileplus" size={17}/>{t('svc_apply')}
          </button>
        }/>

      <div className="container" style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Badge tone={s.level === 'full' ? 'success' : 'info'} dot={false}>{t('svc_level')}: {t(s.level === 'full' ? 'svc_level_full' : 'svc_level_partial')}</Badge>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 'var(--fs-13)', color: 'var(--ink-3)', fontWeight: 600 }}>
            <Icon name={c.icon} size={15}/>{pick(c, lang)}
          </span>
        </div>
      </div>

      <div className="container svd-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginTop: 26, alignItems: 'start', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 10 }}>{t('svc_description')}</h2>
            <p style={{ fontSize: 'var(--fs-15)', color: 'var(--ink-2)', lineHeight: 1.7 }}>{lang === 'en' ? s.descEn : s.descVi}</p>
          </section>

          <section className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 14 }}>{t('svc_documents')}</h2>
            <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
              {s.documents.map((d, i) => (
                <li key={i} style={{ display: 'flex', gap: 13, padding: '12px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', fontSize: 'var(--fs-15)', alignItems: 'flex-start' }}>
                  <span style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, flex: 'none' }}>{i + 1}</span>
                  {lang === 'en' ? d[1] : d[0]}
                </li>
              ))}
            </ol>
          </section>

          <section className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 14 }}>{t('svc_where')} ({points.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {points.map((p, i) => (
                <button key={p.id} onClick={() => navigate('points/' + p.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 4px', borderTop: i ? '1px solid var(--line-soft)' : 'none', background: 'none', border: 'none', borderTopStyle: i ? 'solid' : undefined, textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                  <Icon name="mappin" size={18} style={{ color: 'var(--primary)' }}/>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: 'var(--fs-14)' }}>{pick(p, lang)}</strong>
                    <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{p.address} · {p.distance} {t('km')}</span>
                  </span>
                  <Badge tone={p.open ? 'success' : 'neutral'}>{t(p.open ? 'sp_open' : 'sp_closed')}</Badge>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Cột tóm tắt */}
        <div style={{ position: 'sticky', top: 'calc(var(--header-h) + 16px)' }}>
          <section className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { icon: 'clock', label: t('svc_processing_time'), value: `${s.processingDays} ${t('svc_working_days')}` },
              { icon: 'doc', label: t('svc_documents'), value: `${s.documents.length} ${lang === 'en' ? 'documents' : 'loại giấy tờ'}` },
              { icon: 'scale', label: t('svc_fee'), value: fmtFee(s.fee, t) },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none' }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--bg-sunken)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', flex: 'none' }}>
                  <Icon name={row.icon} size={18}/>
                </span>
                <span>
                  <span style={{ display: 'block', fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{row.label}</span>
                  <strong style={{ fontSize: 'var(--fs-15)' }}>{row.value}</strong>
                </span>
              </div>
            ))}
            <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}
              onClick={() => navigate('requests/create', { serviceId: s.id })}>
              <Icon name="fileplus" size={17}/>{t('svc_apply')}
            </button>
          </section>
        </div>
      </div>
      <style>{`@media (max-width: 880px) { .svd-grid { grid-template-columns: 1fr !important; } .svd-grid > div { position: static !important; } }`}</style>
    </main>
  );
}

Object.assign(window, { ServiceCatalog, ServiceDetail });
