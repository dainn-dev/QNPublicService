// ============================================================
// Cổng cán bộ — Dashboard (KPI + biểu đồ + heatmap) — đọc API thật
// Nguồn: /api/manage/stats/* , /api/manage/service-requests , /api/public-services
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

// Delta tháng này so với tháng trước: % khi có nền (tháng trước > 0),
// ngược lại hiển thị chênh lệch tuyệt đối. invert=true → tăng là xấu (tô đỏ).
function monthDelta(thisV, lastV, t, invert) {
  const diff = thisV - lastV;
  const text = lastV > 0
    ? (diff / lastV * 100).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: 'exceptZero' }) + '%'
    : diff.toLocaleString('vi-VN', { signDisplay: 'exceptZero' });
  const tone = invert ? (diff > 0 ? 'danger' : 'success') : (diff >= 0 ? 'success' : 'danger');
  return { delta: text + ' ' + t('kpi_vs_last_month'), deltaTone: tone };
}

// Biểu đồ cột nhóm (SVG) — data: [{ m, received, resolved }]
function BarChart({ data, lang }) {
  const t = useT(lang);
  const W = 560, H = 240, padL = 40, padB = 28, padT = 14;
  const max = Math.max(1, ...data.map((d) => Math.max(d.received, d.resolved)));
  const niceMax = Math.max(50, Math.ceil(max / 50) * 50);
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
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="11.5" fill="var(--ink-3)" fontFamily="var(--font)" fontWeight="600">{t('month_short')}{d.m != null ? d.m : (i + 1)}</text>
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

// Thanh ngang theo loại phản ánh — data: [{ id, name, count }], catMap: id → {icon, vi, en}
function CategoryBars({ data, catMap, lang }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {data.map((d) => {
        const c = catMap[d.id];
        const name = c ? pick(c, lang) : d.name;
        return (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 34px', gap: 12, alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <Icon name={(c && c.icon) || 'megaphone'} size={15} style={{ color: 'var(--ink-3)' }}/>{name}
            </span>
            <span style={{ height: 10, background: 'var(--bg-sunken)', borderRadius: 'var(--r-full)', overflow: 'hidden' }}>
              <span style={{ display: 'block', height: '100%', width: `${(d.count / max) * 100}%`, background: 'var(--primary)', borderRadius: 'var(--r-full)' }}></span>
            </span>
            <strong style={{ fontSize: 'var(--fs-13)', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{d.count.toLocaleString('vi-VN')}</strong>
          </div>
        );
      })}
    </div>
  );
}

// Bản đồ nhiệt phản ánh — data: [{ lat, lng, weight }]
function FeedbackHeatmap({ data }) {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  const layerRef = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: false }).setView([15.119, 108.793], 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap contributors &copy; CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  React.useEffect(() => {
    const lg = layerRef.current;
    if (!lg) return;
    lg.clearLayers();
    (data || []).forEach((p) => {
      const w = p.weight;
      const color = w >= 7 ? '#B91C1C' : w >= 4 ? '#EA8C00' : '#15803D';
      L.circle([p.lat, p.lng], { radius: 90 + w * 60, color: 'transparent', fillColor: color, fillOpacity: Math.min(0.6, 0.16 + w * 0.035) }).addTo(lg);
      L.circleMarker([p.lat, p.lng], { radius: 4, color: '#fff', weight: 1.5, fillColor: color, fillOpacity: 1 }).addTo(lg);
    });
  }, [data]);

  return <div ref={ref} style={{ height: 300, zIndex: 0, position: 'relative', borderRadius: '0 0 var(--r-lg) var(--r-lg)' }}></div>;
}

// Card rỗng nhỏ gọn khi không có dữ liệu.
function DashEmpty({ lang, minHeight = 120 }) {
  const t = useT(lang);
  return (
    <div style={{ display: 'grid', placeItems: 'center', gap: 8, minHeight, color: 'var(--ink-4)' }}>
      <Icon name="doc" size={20} /><span style={{ fontSize: 'var(--fs-13)' }}>{t('empty')}</span>
    </div>
  );
}

function OfficerDashboard({ lang, navigate }) {
  const t = useT(lang);
  const API = window.API;
  const me = window.ODATA.me || {};

  // KPI tổng quan.
  const overview = useApiData((signal) => API.manage.stats.overview({ signal }), []);
  // Biểu đồ cột theo tháng (6 tháng gần nhất).
  const byMonth = useApiData((signal) => API.manage.stats.requestsByMonth(6, { signal }), []);
  // Phản ánh theo lĩnh vực + bản đồ icon loại phản ánh.
  const byCat = useApiData((signal) => Promise.all([
    API.manage.stats.feedbackByCategory({ signal }),
    API.getFeedbackCategories({ signal }),
  ]).then(([rows, cats]) => {
    const map = {};
    cats.forEach((c) => { map[c.id] = c; });
    return { rows, catMap: map };
  }), []);
  // Heatmap phản ánh.
  const heat = useApiData((signal) => API.manage.stats.feedbackHeatmap({ signal }), []);
  // Hồ sơ của tôi (lọc trạng thái mở ở FE) + tên dịch vụ.
  const mine = useApiData((signal) => {
    if (!me.id) return Promise.resolve({ items: [], serviceMap: {} });
    return Promise.all([
      API.manage.requests({ assignedOfficerId: me.id, pageSize: 100 }, { signal }),
      API.getServices({}, { signal }),
    ]).then(([paged, services]) => {
      const serviceMap = {};
      services.forEach((s) => { serviceMap[s.id] = s; });
      const open = (paged.items || []).filter((r) => !['completed', 'rejected', 'cancelled'].includes(r.status));
      return { items: open, serviceMap };
    });
  }, [me.id]);

  const k = overview.data;
  const deltaTotal = k ? monthDelta(k.requestsThisMonth, k.requestsLastMonth, t, false) : null;
  const deltaFeedback = k ? monthDelta(k.feedbackThisMonth, k.feedbackLastMonth, t, true) : null;

  const myItems = (mine.data && mine.data.items) || [];
  const serviceMap = (mine.data && mine.data.serviceMap) || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '-0.01em' }}>{t('op_dashboard')}</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)', marginTop: 4 }}>{t('city')}</p>
      </div>

      {/* KPI */}
      <OpApiState loading={overview.loading} error={overview.error} reload={overview.reload} lang={lang} minHeight={130}>
        {k &&
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
            <KpiCard icon="doc" label={t('kpi_total_requests')} value={k.totalRequests.toLocaleString('vi-VN')} delta={deltaTotal.delta} deltaTone={deltaTotal.deltaTone}/>
            <KpiCard icon="clock" label={t('kpi_open_requests')} value={k.openRequests.toLocaleString('vi-VN')}/>
            <KpiCard icon="check" label={t('kpi_resolved_requests')} value={k.resolvedRequests.toLocaleString('vi-VN')}/>
            <KpiCard icon="megaphone" label={t('kpi_open_feedback')} value={k.openFeedback.toLocaleString('vi-VN')} delta={deltaFeedback.delta} deltaTone={deltaFeedback.deltaTone}/>
            <KpiCard icon="shield" label={t('kpi_sla')} value={k.onTimeRate.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%'}/>
          </div>}
      </OpApiState>

      {/* Biểu đồ */}
      <div className="dash-charts" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, alignItems: 'start' }}>
        <section className="card" style={{ padding: '20px 22px', background: '#fff' }}>
          <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 16 }}>{t('ch_requests_by_month')}</h2>
          <OpApiState loading={byMonth.loading} error={byMonth.error} reload={byMonth.reload} lang={lang} minHeight={240}>
            {byMonth.data && (byMonth.data.length ? <BarChart data={byMonth.data} lang={lang}/> : <DashEmpty lang={lang} minHeight={200}/>)}
          </OpApiState>
        </section>
        <section className="card" style={{ padding: '20px 22px', background: '#fff' }}>
          <h2 style={{ fontSize: 'var(--fs-16)', marginBottom: 18 }}>{t('ch_feedback_by_category')}</h2>
          <OpApiState loading={byCat.loading} error={byCat.error} reload={byCat.reload} lang={lang} minHeight={200}>
            {byCat.data && (byCat.data.rows.length ? <CategoryBars data={byCat.data.rows} catMap={byCat.data.catMap} lang={lang}/> : <DashEmpty lang={lang} minHeight={180}/>)}
          </OpApiState>
        </section>
      </div>

      <div className="dash-charts" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 18, alignItems: 'start' }}>
        {/* Hồ sơ của tôi */}
        <section className="card" style={{ padding: '20px 22px', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, gap: 10 }}>
            <h2 style={{ fontSize: 'var(--fs-16)' }}>{lang === 'en' ? 'Assigned to me' : 'Hồ sơ tôi đang xử lý'} ({myItems.length})</h2>
            <button onClick={() => navigate('requests')} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 'var(--fs-13)', cursor: 'pointer' }}>{t('view_all')}</button>
          </div>
          <OpApiState loading={mine.loading} error={mine.error} reload={mine.reload} lang={lang} minHeight={160}>
            {mine.data && (myItems.length === 0
              ? <DashEmpty lang={lang} minHeight={140}/>
              : <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {myItems.map((r, i) => {
                    const s = serviceMap[r.serviceId];
                    return (
                      <button key={r.rawId} onClick={() => navigate('requests/' + r.rawId)}
                        style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '11px 2px', borderTop: i ? '1px solid var(--line-soft)' : 'none', background: 'none', border: 'none', borderTopStyle: i ? 'solid' : undefined, textAlign: 'left', cursor: 'pointer', width: '100%' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: 'var(--fs-13)', fontVariantNumeric: 'tabular-nums' }}>{r.id}</strong>
                          <StatusBadge status={r.status} map={window.STATUS_META} lang={lang}/>
                        </span>
                        <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s ? pick(s, lang) : ''}{r.citizen ? ' — ' + r.citizen : ''}</span>
                        <DueBadge dueState={r.dueState} due={r.due} lang={lang}/>
                      </button>
                    );
                  })}
                </div>)}
          </OpApiState>
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
          <OpApiState loading={heat.loading} error={heat.error} reload={heat.reload} lang={lang} minHeight={300}>
            {heat.data && <FeedbackHeatmap data={heat.data}/>}
          </OpApiState>
        </section>
      </div>

      <style>{`@media (max-width: 980px) { .dash-charts { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

Object.assign(window, { OfficerDashboard, KpiCard });
