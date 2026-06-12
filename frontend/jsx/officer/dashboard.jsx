// ============================================================
// Cổng cán bộ — Dashboard (KPI + biểu đồ)
// ============================================================

function KpiCard({ icon, label, value, delta, deltaTone = 'success' }) {
  return (
    <div className="card" style={{ padding: '18px 20px', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-3)', fontSize: 'var(--fs-13)', fontWeight: 600 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flex: 'none' }}>
          <Icon name={icon} size={17}/>
        </span>
        {label}
      </div>
      <div style={{ fontSize: 'var(--fs-30)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {delta && <div style={{ fontSize: 'var(--fs-12)', color: deltaTone === 'success' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{delta}</div>}
    </div>
  );
}

// Biểu đồ cột nhóm (SVG)
function BarChart({ data, lang }) {
  const t = useT(lang);
  const W = 560, H = 240, padL = 40, padB = 28, padT = 14;
  const max = Math.max(...data.map((d) => Math.max(d.received, d.resolved)));
  const niceMax = Math.ceil(max / 50) * 50;
  const chartW = W - padL - 10, chartH = H - padT - padB;
  const groupW = chartW / data.length;
  const barW = Math.min(22, groupW * 0.28);
  const y = (v) => padT + chartH - (v / niceMax) * chartH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label={t('ch_requests_by_month')}>
        {ticks.map((v) => (
          <g key={v}>
            <line x1={padL} x2={W - 10} y1={y(v)} y2={y(v)} stroke="var(--line-soft)" strokeWidth="1"/>
            <text x={padL - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--ink-4)" fontFamily="var(--font)">{v}</text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = padL + groupW * i + groupW / 2;
          return (
            <g key={i}>
              <rect x={cx - barW - 2} y={y(d.received)} width={barW} height={padT + chartH - y(d.received)} rx="4" fill="var(--primary)"/>
              <rect x={cx + 2} y={y(d.resolved)} width={barW} height={padT + chartH - y(d.resolved)} rx="4" fill="var(--primary-soft-2)" stroke="var(--primary-border)" strokeWidth="1"/>
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="11.5" fill="var(--ink-3)" fontFamily="var(--font)" fontWeight="600">{t('month_short')}{d.m}</text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 8, fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: 'var(--primary)' }}></span>{t('ch_received')}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 11, height: 11, borderRadius: 3, background: 'var(--primary-soft-2)', border: '1px solid var(--primary-border)' }}></span>{t('ch_resolved')}</span>
      </div>
    </div>
  );
}

// Thanh ngang theo loại phản ánh
function CategoryBars({ lang }) {
  const t = useT(lang);
  const data = window.ODATA.feedbackByCategory;
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {data.map((d) => {
        const c = window.DATA.feedbackCategories.find((x) => x.id === d.id);
        return (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 34px', gap: 12, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Icon name={c.icon} size={15} style={{ color: 'var(--ink-3)' }}/>{pick(c, lang)}
            </span>
            <span style={{ height: 10, background: 'var(--bg-sunken)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: `${(d.count / max) * 100}%`, background: 'var(--primary)', borderRadius: 'var(--r-full)' }}></span>
            </span>
            <strong style={{ fontSize: 'var(--fs-13)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.count}</strong>
          </div>
        );
      })}
    </div>
  );
}

// Bản đồ nhiệt phản ánh (circle markers theo cường độ)
function FeedbackHeatmap({ lang }) {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([15.119, 108.793], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    window.ODATA.heat.forEach(([lat, lng, w]) => {
      L.circle([lat, lng], {
        radius: 90 + w * 60,
        color: 'transparent',
        fillColor: w >= 7 ? '#B91C1C' : w >= 4 ? '#EA8C00' : '#15803D',
        fillOpacity: 0.16 + w * 0.035,
      }).addTo(map);
      L.circleMarker([lat, lng], { radius: 4, color: '#fff', weight: 1.5, fillColor: w >= 7 ? '#B91C1C' : w >= 4 ? '#EA8C00' : '#15803D', fillOpacity: 1 }).addTo(map);
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);
  return <div ref={ref} style={{ height: 300, zIndex: 0, position: 'relative', borderRadius: '0 0 var(--r-lg) var(--r-lg)' }}></div>;
}

function OfficerDashboard({ lang, navigate }) {
  const t = useT(lang);
  const k = window.ODATA.kpi;
  const myOpen = window.ODATA.requests.filter((r) => r.officerId === window.ODATA.me.id && !['completed', 'rejected'].includes(r.status));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '-0.01em' }}>{t('op_dashboard')}</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)', marginTop: 4 }}>{lang === 'en' ? 'Wednesday, June 11, 2026' : 'Thứ Tư, 11/06/2026'} · {t('city')}</p>
      </div>

      {/* KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
        <KpiCard icon="doc" label={t('kpi_total_requests')} value={k.total.toLocaleString('vi-VN')} delta={`${k.deltas.total} ${t('kpi_vs_last_month')}`}/>
        <KpiCard icon="clock" label={t('kpi_open_requests')} value={k.open} delta={`${k.deltas.open} ${t('kpi_vs_last_month')}`}/>
        <KpiCard icon="check" label={t('kpi_resolved_requests')} value={k.resolved.toLocaleString('vi-VN')} delta={`${k.deltas.resolved} ${t('kpi_vs_last_month')}`}/>
        <KpiCard icon="megaphone" label={t('kpi_open_feedback')} value={k.openFeedback} delta={`${k.deltas.openFeedback} ${t('kpi_vs_last_month')}`} deltaTone="danger"/>
        <KpiCard icon="shield" label={t('kpi_sla')} value={k.sla} delta={`${k.deltas.sla} ${t('kpi_vs_last_month')}`}/>
      </div>

      {/* Biểu đồ */}
      <div className="dash-charts" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, alignItems: 'start' }}>
        <section className="card" style={{ padding: '20px 22px', background: '#fff' }}>
          <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 16 }}>{t('ch_requests_by_month')} · 2026</h2>
          <BarChart data={window.ODATA.requestsByMonth} lang={lang}/>
        </section>
        <section className="card" style={{ padding: '20px 22px', background: '#fff' }}>
          <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 18 }}>{t('ch_feedback_by_category')}</h2>
          <CategoryBars lang={lang}/>
        </section>
      </div>

      <div className="dash-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 18, alignItems: 'start' }}>
        {/* Hồ sơ của tôi */}
        <section className="card" style={{ padding: '20px 22px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, gap: 10 }}>
            <h2 style={{ fontSize: 'var(--fs-16)' }}>{lang === 'en' ? 'Assigned to me' : 'Hồ sơ tôi đang xử lý'} ({myOpen.length})</h2>
            <button onClick={() => navigate('requests')} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 'var(--fs-13)', cursor: 'pointer' }}>{t('view_all')}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {myOpen.map((r, i) => {
              const s = window.DATA.services.find((x) => x.id === r.serviceId);
              return (
                <button key={r.id} onClick={() => navigate('requests/' + r.id)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '11px 2px', borderTop: i ? '1px solid var(--line-soft)' : 'none', background: 'none', border: 'none', borderTopStyle: i ? 'solid' : undefined, textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 'var(--fs-13)', fontVariantNumeric: 'tabular-nums' }}>{r.id}</strong>
                    <StatusBadge status={r.status} map={window.STATUS_META} lang={lang}/>
                  </span>
                  <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s ? pick(s, lang) : ''} — {r.citizen}</span>
                  <DueBadge dueState={r.dueState} due={r.due} lang={lang}/>
                </button>
              );
            })}
          </div>
        </section>

        {/* Heatmap */}
        <section className="card" style={{ background: '#fff', overflow: 'hidden' }}>
          <div style={{ padding: '20px 22px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: 'var(--fs-16)' }}>{t('ch_feedback_heatmap')}</h2>
            <div style={{ display: 'flex', gap: 14, fontSize: 'var(--fs-12)', color: 'var(--ink-3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#B91C1C' }}></span>{t('pr_high')}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EA8C00' }}></span>{t('pr_medium')}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#15803D' }}></span>{t('pr_low')}</span>
            </div>
          </div>
          <FeedbackHeatmap lang={lang}/>
        </section>
      </div>

      <style>{`@media (max-width: 980px) { .dash-charts { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

Object.assign(window, { OfficerDashboard, KpiCard });
