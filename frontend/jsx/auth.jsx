// ============================================================
// Đăng nhập / Đăng ký
// ============================================================

function AuthShell({ lang, children }) {
  const t = useT(lang);
  return (
    <main style={{ minHeight: 'calc(100vh - var(--header-h))', background: 'var(--bg-soft)', display: 'grid', placeItems: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>{children}</div>
    </main>
  );
}

function SocialButtons({ lang, onLogin }) {
  const t = useT(lang);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button className="btn" onClick={onLogin}
        style={{ width: '100%', background: '#0B2E66', color: '#fff', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" fill="#fff"/>
          <path d="M12 5.5l1.9 4 4.4.5-3.3 3 .9 4.4L12 15.2 8.1 17.4l.9-4.4-3.3-3 4.4-.5L12 5.5Z" fill="#0B2E66"/>
        </svg>
        {t('login_vneid')}
      </button>
      <button className="btn btn-secondary" onClick={onLogin} style={{ width: '100%', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h6.2c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.4-4.9 3.4-8.3Z"/>
          <path fill="#34A853" d="M12 23c3.1 0 5.7-1 7.6-2.8l-3.7-2.8c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v2.9C3.7 20.4 7.6 23 12 23Z"/>
          <path fill="#FBBC05" d="M5.6 13.8c-.2-.7-.4-1.4-.4-2.1s.1-1.5.4-2.1V6.7H1.8C1 8.3.6 10.1.6 12s.4 3.7 1.2 5.3l3.8-3.5Z"/>
          <path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7L19.7 4C17.7 2.2 15.1 1 12 1 7.6 1 3.7 3.6 1.8 7.3l3.8 2.9c.9-2.7 3.4-4.8 6.4-4.8Z"/>
        </svg>
        {t('login_google')}
      </button>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, color: 'var(--ink-4)', fontSize: 'var(--fs-13)', margin: '20px 0' }}>
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }}></span>
      {label}
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }}></span>
    </div>
  );
}

function LoginScreen({ lang, navigate, onLogin }) {
  const t = useT(lang);
  const [method, setMethod] = React.useState('phone');
  const [otpSent, setOtpSent] = React.useState(false);

  return (
    <AuthShell lang={lang}>
      <div style={{ textAlign: 'center', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Logo size={52}/>
        <div>
          <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800 }}>{t('login_title')}</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)', marginTop: 6 }}>{t('login_sub')}</p>
        </div>
      </div>

      <div className="card" style={{ padding: 28, boxShadow: 'var(--shadow-md)' }}>
        {/* Chuyển phương thức */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: 'var(--bg-sunken)', borderRadius: 'var(--r-md)', padding: 4, marginBottom: 20 }}>
          {[['phone', t('login_phone')], ['email', t('login_email')]].map(([m, label]) => (
            <button key={m} onClick={() => { setMethod(m); setOtpSent(false); }}
              style={{ border: 'none', borderRadius: 'var(--r-sm)', padding: '9px 10px', fontWeight: 600, fontSize: 'var(--fs-14)',
                background: method === m ? '#fff' : 'transparent', color: method === m ? 'var(--ink)' : 'var(--ink-3)',
                boxShadow: method === m ? 'var(--shadow-sm)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {method === 'phone' ? (
            <>
              <div className="field">
                <label className="field-label" htmlFor="lg-phone">{t('login_phone')}</label>
                <input id="lg-phone" className="input" type="tel" placeholder="0905 xxx xxx" defaultValue="0905 234 671"/>
              </div>
              {otpSent ? (
                <div className="field">
                  <label className="field-label" htmlFor="lg-otp">OTP</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[4, 7, 2, '', '', ''].map((d, i) => (
                      <input key={i} aria-label={`OTP ${i + 1}`} maxLength="1" defaultValue={d}
                        style={{ width: '100%', textAlign: 'center', fontSize: 'var(--fs-20)', fontWeight: 700, padding: '10px 0', border: '1.5px solid var(--line)', borderRadius: 'var(--r-md)' }}/>
                    ))}
                  </div>
                  <span className="field-hint">{t('otp_hint')}</span>
                </div>
              ) : (
                <button type="button" className="btn btn-soft" onClick={() => setOtpSent(true)} style={{ justifyContent: 'center' }}>
                  {t('send_otp')}
                </button>
              )}
            </>
          ) : (
            <>
              <div className="field">
                <label className="field-label" htmlFor="lg-email">{t('email')}</label>
                <input id="lg-email" className="input" type="email" placeholder="ban@email.com"/>
              </div>
              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label className="field-label" htmlFor="lg-pass">{t('password')}</label>
                  <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 'var(--fs-13)', fontWeight: 600 }}>{t('forgot_password')}</a>
                </div>
                <input id="lg-pass" className="input" type="password" placeholder="••••••••"/>
              </div>
            </>
          )}
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>{t('login_title')}</button>
        </form>

        <Divider label={t('or')}/>
        <SocialButtons lang={lang} onLogin={onLogin}/>
      </div>

      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 'var(--fs-14)', color: 'var(--ink-3)' }}>
        {t('no_account')}{' '}
        <a href="#/register" onClick={(e) => { e.preventDefault(); navigate('register'); }} style={{ fontWeight: 700 }}>{t('register')}</a>
      </p>
    </AuthShell>
  );
}

function RegisterScreen({ lang, navigate, onLogin }) {
  const t = useT(lang);
  return (
    <AuthShell lang={lang}>
      <div style={{ textAlign: 'center', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <Logo size={52}/>
        <div>
          <h1 style={{ fontSize: 'var(--fs-24)', fontWeight: 800 }}>{t('register_title')}</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 'var(--fs-14)', marginTop: 6 }}>{t('register_sub')}</p>
        </div>
      </div>

      <div className="card" style={{ padding: 28, boxShadow: 'var(--shadow-md)' }}>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label className="field-label" htmlFor="rg-name">{t('full_name')} <span className="req">*</span></label>
            <input id="rg-name" className="input" placeholder="Nguyễn Văn A"/>
          </div>
          <div className="auth-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field">
              <label className="field-label" htmlFor="rg-phone">{t('phone')} <span className="req">*</span></label>
              <input id="rg-phone" className="input" type="tel" placeholder="09xx xxx xxx"/>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="rg-cccd">{t('citizen_id')} <span className="req">*</span></label>
              <input id="rg-cccd" className="input" inputMode="numeric" placeholder="0511 9800 xxxx"/>
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="rg-email">{t('email')}</label>
            <input id="rg-email" className="input" type="email" placeholder="ban@email.com"/>
          </div>
          <div className="auth-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field">
              <label className="field-label" htmlFor="rg-pass">{t('password')} <span className="req">*</span></label>
              <input id="rg-pass" className="input" type="password" placeholder="••••••••"/>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="rg-pass2">{t('confirm_password')} <span className="req">*</span></label>
              <input id="rg-pass2" className="input" type="password" placeholder="••••••••"/>
            </div>
          </div>
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 'var(--fs-14)', color: 'var(--ink-2)', cursor: 'pointer' }}>
            <input type="checkbox" style={{ marginTop: 3, accentColor: 'var(--primary)', width: 16, height: 16 }}/>
            {t('agree_terms')}
          </label>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }}>{t('register')}</button>
        </form>
        <Divider label={t('or')}/>
        <SocialButtons lang={lang} onLogin={onLogin}/>
      </div>

      <p style={{ textAlign: 'center', marginTop: 18, fontSize: 'var(--fs-14)', color: 'var(--ink-3)' }}>
        {t('have_account')}{' '}
        <a href="#/login" onClick={(e) => { e.preventDefault(); navigate('login'); }} style={{ fontWeight: 700 }}>{t('login')}</a>
      </p>
      <style>{`@media (max-width: 480px) { .auth-2col { grid-template-columns: 1fr !important; } }`}</style>
    </AuthShell>
  );
}

Object.assign(window, { LoginScreen, RegisterScreen });
