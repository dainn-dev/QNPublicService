// ============================================================
// Hồ sơ — Nộp trực tuyến (wizard), Tra cứu, Chi tiết
// ============================================================

function Stepper({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32, overflowX: 'auto', paddingBottom: 4 }}>
      {steps.map((label, i) =>
      <React.Fragment key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 'none' }}>
            <span style={{
            width: 30, height: 30, borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13.5,
            background: i < current ? 'var(--success)' : i === current ? 'var(--primary)' : 'var(--bg-sunken)',
            color: i <= current ? '#fff' : 'var(--ink-4)', flex: 'none'
          }}>
              {i < current ? <Icon name="check" size={15} stroke={2.6} /> : i + 1}
            </span>
            <span style={{ fontWeight: 600, fontSize: 'var(--fs-14)', color: i === current ? 'var(--ink)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>{label}</span>
          </div>
          {i < steps.length - 1 && <span style={{ flex: '1 0 24px', height: 2, background: i < current ? 'var(--success)' : 'var(--line)', margin: '0 12px', minWidth: 24 }}></span>}
        </React.Fragment>
      )}
    </div>);

}

function CreateRequest({ lang, navigate, params }) {
  const t = useT(lang);
  const [step, setStep] = React.useState(0);
  const [serviceId, setServiceId] = React.useState(params && params.serviceId || '');
  const [pointId, setPointId] = React.useState(params && params.pointId || '');
  const [desc, setDesc] = React.useState('');
  const [files, setFiles] = React.useState([]);
  const [submitted, setSubmitted] = React.useState(false);

  const s = window.DATA.services.find((x) => x.id === serviceId);
  const p = window.DATA.servicePoints.find((x) => x.id === pointId);
  const availablePoints = serviceId ? window.DATA.servicePoints.filter((x) => x.serviceIds.includes(serviceId)) : window.DATA.servicePoints;
  const [payState, setPayState] = React.useState('idle'); // idle | checking | paid
  const hasFee = !!(s && s.fee > 0);
  const stepKeys = ['service', 'info', 'docs', ...(hasFee ? ['payment'] : []), 'confirm'];
  const stepKey = stepKeys[Math.min(step, stepKeys.length - 1)];
  const stepLabels = { service: 'req_step_service', info: 'req_step_info', docs: 'req_step_docs', payment: 'req_step_payment', confirm: 'req_step_confirm' };
  const steps = stepKeys.map((k) => t(stepLabels[k]));
  const canNext = stepKey === 'service' ? !!serviceId : stepKey === 'info' ? !!pointId : stepKey === 'docs' ? files.length > 0 : true;
  const confirmPayment = () => {
    setPayState('checking');
    setTimeout(() => {
      setPayState('paid');
      setTimeout(() => setStep((x) => x + 1), 900);
    }, 1400);
  };

  if (submitted) {
    return (
      <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '60px 16px' }}>
        <div className="card fade-up" style={{ maxWidth: 520, width: '100%', padding: '44px 36px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <span style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--success-soft)', color: 'var(--success)', display: 'inline-grid', placeItems: 'center', marginBottom: 20 }}>
            <Icon name="check" size={34} stroke={2.4} />
          </span>
          <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800 }}>{t('req_success_title')}</h1>
          <p style={{ color: 'var(--ink-3)', marginTop: 10 }}>{t('req_success_sub')}</p>
          <div style={{ fontSize: 'var(--fs-24)', fontWeight: 800, letterSpacing: '0.04em', color: 'var(--primary)', background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', padding: '12px 18px', margin: '14px 0 18px', fontVariantNumeric: 'tabular-nums' }}>
            QNG-2026-04913
          </div>
          <p style={{ fontSize: 'var(--fs-14)', color: 'var(--ink-3)' }}>{t('req_success_note')}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 26, flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('home')}>{t('nav_home')}</button>
            <button className="btn btn-primary" onClick={() => navigate('track')}>{t('qa_track')}</button>
          </div>
        </div>
      </main>);

  }

  return (
    <main style={{ minHeight: '70vh' }}>
      <PageHead lang={lang} navigate={navigate}
      crumbs={[{ label: t('req_create_title') }]}
      title={t('req_create_title')} />

      <div className="container" style={{ maxWidth: 860, marginTop: 24, marginBottom: 24 }}>
        <Stepper steps={steps} current={step} />

        <div className="card" style={{ padding: '28px 30px' }}>
          {stepKey === 'service' &&
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="field">
                <label className="field-label" htmlFor="cr-svc">{t('req_select_service')} <span className="req">*</span></label>
                <select id="cr-svc" className="select" value={serviceId} onChange={(e) => {setServiceId(e.target.value);setPointId('');}}>
                  <option value="">—</option>
                  {window.DATA.services.map((x) => <option key={x.id} value={x.id}>{pick(x, lang)}</option>)}
                </select>
              </div>
              {s &&
            <div style={{ background: 'var(--bg-soft)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <strong style={{ fontSize: 'var(--fs-15)' }}>{pick(s, lang)}</strong>
                  <div style={{ display: 'flex', gap: 18, fontSize: 'var(--fs-13)', color: 'var(--ink-3)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="clock" size={14} />{s.processingDays} {t('svc_working_days')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="doc" size={14} />{s.documents.length} {lang === 'en' ? 'documents' : 'loại giấy tờ'}</span>
                    <span style={{ fontWeight: 600 }}>{fmtFee(s.fee, t)}</span>
                  </div>
                </div>
            }
            </div>
          }

          {stepKey === 'info' &&
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="field">
                <label className="field-label">{t('req_select_point')} <span className="req">*</span></label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {availablePoints.map((x) =>
                <label key={x.id} style={{ display: 'flex', alignItems: 'center', gap: 13, border: '1.5px solid', borderColor: pointId === x.id ? 'var(--primary)' : 'var(--line)', background: pointId === x.id ? 'var(--primary-soft)' : '#fff', borderRadius: 'var(--r-md)', padding: '13px 16px', cursor: 'pointer' }}>
                      <input type="radio" name="point" checked={pointId === x.id} onChange={() => setPointId(x.id)} style={{ accentColor: 'var(--primary)' }} />
                      <span style={{ flex: 1 }}>
                        <strong style={{ display: 'block', fontSize: 'var(--fs-14)' }}>{pick(x, lang)}</strong>
                        <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-3)' }}>{x.address} · {x.distance} {t('km')}</span>
                      </span>
                      <Badge tone={x.open ? 'success' : 'neutral'}>{t(x.open ? 'sp_open' : 'sp_closed')}</Badge>
                    </label>
                )}
                </div>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="cr-desc">{t('req_description')}</label>
                <textarea id="cr-desc" className="textarea" placeholder={t('req_description_ph')} value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
              </div>
            </div>
          }

          {stepKey === 'docs' &&
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {s &&
            <div style={{ background: 'var(--info-soft)', border: '1px solid var(--info-border)', borderRadius: 'var(--r-md)', padding: '14px 16px', fontSize: 'var(--fs-14)', display: 'flex', gap: 10 }}>
                  <Icon name="info" size={17} style={{ color: 'var(--info)', marginTop: 2, flex: 'none' }} />
                  <span>
                    <strong>{t('svc_documents')}:</strong>
                    <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                      {s.documents.map((d, i) => <li key={i}>{lang === 'en' ? d[1] : d[0]}</li>)}
                    </ul>
                  </span>
                </div>
            }
              <UploadBox lang={lang} files={files} setFiles={setFiles} />
            </div>
          }

          {stepKey === 'payment' && s &&
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 'var(--fs-18)' }}>{t('pay_title')}</h2>
                <Badge tone="info" dot={false}>{t('pay_bank_transfer')}</Badge>
              </div>
              <div className="pay-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24, alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 180, height: 180, borderRadius: 'var(--r-md)', border: '1.5px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--ink-2)', background: '#fff' }}>
                    <Icon name="qr" size={120} stroke={1.1}/>
                  </span>
                  <span style={{ fontSize: 'var(--fs-12)', color: 'var(--ink-3)', textAlign: 'center' }}>{t('pay_qr_hint')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {[
                [t('pay_bank'), 'Vietcombank — CN Quảng Ngãi'],
                [t('pay_account'), '0271 000 482 996'],
                [t('pay_account_name'), 'UBND TP QUANG NGAI'],
                [t('pay_note'), 'QNG 04913 ' + window.DATA.user.phone.replace(/\s/g, '')]].
                map(([label, value], i) =>
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 12, padding: '11px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', fontSize: 'var(--fs-14)' }}>
                      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
                      <strong style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{value}</strong>
                    </div>
                )}
                  <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 12, padding: '12px 0', borderTop: '1px solid var(--line-soft)', fontSize: 'var(--fs-14)', alignItems: 'center' }}>
                    <span style={{ color: 'var(--ink-3)' }}>{t('pay_amount')}</span>
                    <strong style={{ fontSize: 'var(--fs-20)', color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}>{fmtFee(s.fee, t)}</strong>
                  </div>
                  {payState === 'paid' ?
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--success-soft)', border: '1px solid var(--success-border)', color: 'var(--success)', borderRadius: 'var(--r-md)', padding: '12px 16px', fontWeight: 700, fontSize: 'var(--fs-14)', marginTop: 8 }}>
                      <Icon name="check" size={17} stroke={2.4}/>{t('pay_success')}
                    </div> :
                <button className="btn btn-primary" style={{ marginTop: 8, alignSelf: 'flex-start' }} disabled={payState === 'checking'} onClick={confirmPayment}>
                      {payState === 'checking' ?
                  <><span className="pay-spin" aria-hidden="true"></span>{t('pay_checking')}</> :
                  <><Icon name="check" size={16}/>{t('pay_paid_btn')}</>}
                    </button>
                }
                </div>
              </div>
              <style>{`
                .pay-spin { width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; display: inline-block; animation: paySpin 0.8s linear infinite; }
                @keyframes paySpin { to { transform: rotate(360deg); } }
                @media (max-width: 640px) { .pay-grid { grid-template-columns: 1fr !important; justify-items: center; } }
              `}</style>
            </div>
          }

          {stepKey === 'confirm' &&
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
            [t('req_select_service'), s ? pick(s, lang) : '—'],
            [t('req_select_point'), p ? pick(p, lang) : '—'],
            [t('req_description'), desc || '—'],
            [t('req_docs'), files.map((f) => f.name).join(', ') || '—'],
            [t('svc_fee'), s ? fmtFee(s.fee, t) + (hasFee ? ' — ' + t('pay_success') : '') : '—'],
            [t('svc_processing_time'), s ? `${s.processingDays} ${t('svc_working_days')}` : '—']].
            map(([label, value], i) =>
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 14, padding: '13px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', fontSize: 'var(--fs-14)' }}>
                  <span style={{ color: 'var(--ink-3)' }}>{label}</span>
                  <strong style={{ fontWeight: 600 }}>{value}</strong>
                </div>
            )}
            </div>
          }

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, gap: 12 }}>
            <button className="btn btn-secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <Icon name="arrowleft" size={16} />{t('back')}
            </button>
            {stepKey !== 'confirm' ?
            <button className="btn btn-primary" disabled={!canNext || stepKey === 'payment'} onClick={() => setStep(step + 1)} style={{ visibility: stepKey === 'payment' ? 'hidden' : 'visible' }}>{t('next')}<Icon name="chevronright" size={16} /></button> :
            <button className="btn btn-primary btn-lg" onClick={() => setSubmitted(true)}><Icon name="send" size={16} />{t('req_submit')}</button>}
          </div>
        </div>
      </div>
    </main>);

}

// ---------- Tra cứu hồ sơ ----------
function TrackRequest({ lang, navigate }) {
  const t = useT(lang);
  const [q, setQ] = React.useState('');
  const [searched, setSearched] = React.useState(false);
  const results = searched ?
  window.DATA.requests.filter((r) => !q || r.id.toLowerCase().includes(q.toLowerCase()) || q.replace(/\s/g, '').length >= 9) :
  window.DATA.requests;

  return (
    <main style={{ minHeight: '70vh' }}>
      <PageHead lang={lang} navigate={navigate}
      crumbs={[{ label: t('track_title') }]}
      title={t('track_title')} sub={t('track_sub')} />

      <div className="container" style={{ maxWidth: 860, marginTop: 20, marginBottom: 24 }}>
        <form onSubmit={(e) => {e.preventDefault();setSearched(true);}}
        style={{ display: 'flex', gap: 8, background: '#fff', border: '1.5px solid var(--line)', borderRadius: 'var(--r-full)', padding: 6, boxShadow: 'var(--shadow-md)' }}>
          <span style={{ display: 'grid', placeItems: 'center', paddingLeft: 14, color: 'var(--ink-4)' }}><Icon name="filesearch" size={19} /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('track_ph')} aria-label={t('track_title')}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 'var(--fs-15)', background: 'transparent', minWidth: 0 }} />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--r-full)' }}>{t('track_btn')}</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 28 }}>
          {results.length === 0 && <EmptyState icon="filesearch" title={t('empty')} />}
          {results.map((r) => {
            const s = window.DATA.services.find((x) => x.id === r.serviceId);
            return (
              <button key={r.id} onClick={() => navigate('requests/' + r.id)} className="card card-hover"
              style={{ padding: '18px 22px', background: '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flex: 'none' }}>
                  <Icon name="doc" size={20} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 'var(--fs-15)', fontVariantNumeric: 'tabular-nums' }}>{r.id}</strong>
                    <StatusBadge status={r.status} map={window.STATUS_META} lang={lang} />
                  </span>
                  <span style={{ display: 'block', fontSize: 'var(--fs-14)', color: 'var(--ink-2)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s ? pick(s, lang) : ''}
                  </span>
                  <span style={{ fontSize: 'var(--fs-13)', color: 'var(--ink-4)' }}>{t('track_submitted_date')}: {r.submitted}</span>
                </span>
                <Icon name="chevronright" size={18} style={{ color: 'var(--ink-4)' }} />
              </button>);

          })}
        </div>
      </div>
    </main>);

}

// ---------- Chi tiết hồ sơ ----------
function RequestDetail({ lang, navigate, requestId }) {
  const t = useT(lang);
  const r = window.DATA.requests.find((x) => x.id === requestId) || window.DATA.requests[0];
  const s = window.DATA.services.find((x) => x.id === r.serviceId);
  const p = window.DATA.servicePoints.find((x) => x.id === r.pointId);

  return (
    <main>
      <PageHead lang={lang} navigate={navigate}
      crumbs={[{ label: t('track_title'), route: 'track' }, { label: r.id }]}
      title={r.id}
      sub={s ? pick(s, lang) : ''}
      actions={<StatusBadge status={r.status} map={window.STATUS_META} lang={lang} />} />

      <div className="container rqd-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginTop: 24, alignItems: 'start', marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Tiến trình */}
          <section className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 18 }}>{t('req_timeline')}</h2>
            <Timeline items={r.timeline} statusMap={window.STATUS_META} lang={lang} />
          </section>

          {/* Ghi chú cán bộ */}
          {r.officerNote &&
          <section className="card" style={{ padding: '22px 24px', background: r.status === 'waiting' ? 'var(--warning-soft)' : 'var(--bg-soft)', borderColor: r.status === 'waiting' ? 'var(--warning-border)' : 'var(--line)' }}>
              <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 9 }}>
                <Icon name={r.status === 'waiting' ? 'alert' : 'info'} size={19} style={{ color: r.status === 'waiting' ? 'var(--warning)' : 'var(--info)' }} />
                {t('req_officer_notes')}
              </h2>
              <p style={{ fontSize: 'var(--fs-15)', color: 'var(--ink-2)', lineHeight: 1.7 }}>{lang === 'en' ? r.officerNote.en : r.officerNote.vi}</p>
              {r.status === 'waiting' &&
            <button className="btn btn-primary" style={{ marginTop: 16 }}><Icon name="upload" size={16} />{lang === 'en' ? 'Upload supplement' : 'Nộp bổ sung'}</button>
            }
            </section>
          }
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Thông tin hồ sơ */}
          <section className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 8 }}>{t('req_info')}</h2>
            {[
            [t('req_select_service'), s ? pick(s, lang) : '—'],
            [t('req_select_point'), p ? pick(p, lang) : '—'],
            [t('track_submitted_date'), r.submitted],
            [t('req_description'), r.description]].
            map(([label, value], i) =>
            <div key={i} style={{ padding: '10px 0', borderTop: i ? '1px solid var(--line-soft)' : 'none', fontSize: 'var(--fs-14)' }}>
                <span style={{ display: 'block', color: 'var(--ink-3)', fontSize: 'var(--fs-13)', marginBottom: 2 }}>{label}</span>
                <strong style={{ fontWeight: 600, lineHeight: 1.5 }}>{value}</strong>
              </div>
            )}
          </section>

          {/* Giấy tờ */}
          <section className="card" style={{ padding: '22px 24px' }}>
            <h2 style={{ fontSize: 'var(--fs-18)', marginBottom: 12 }}>{t('req_docs')} ({r.documents.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {r.documents.map((d, i) =>
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--line)', borderRadius: 'var(--r-md)', padding: '10px 13px', fontSize: 'var(--fs-14)' }}>
                  <Icon name="doc" size={17} style={{ color: 'var(--primary)', flex: 'none' }} />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
                  <span style={{ color: 'var(--ink-4)', fontSize: 'var(--fs-13)', flex: 'none' }}>{d.size}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <style>{`@media (max-width: 880px) { .rqd-grid { grid-template-columns: 1fr !important; } }`}</style>
    </main>);

}

Object.assign(window, { CreateRequest, TrackRequest, RequestDetail, Stepper });