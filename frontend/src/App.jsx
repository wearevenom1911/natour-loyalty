import React, { useEffect, useState } from 'react';
import { api } from './api';

const translations = {
  en: {
    eyebrow: 'NATOUR CLINIC',
    title: 'Natour Rewards',
    subtitle: 'Your care journey, rewarded.',
    login: 'Customer login',
    register: 'Create account',
    phone: 'Mobile number',
    password: 'Password',
    firstName: 'First name',
    lastName: 'Last name (optional)',
    signIn: 'Sign in',
    signUp: 'Create account',
    toLogin: 'Already have an account? Sign in',
    toRegister: 'New here? Create an account',
    balanceLabel: 'YOUR POINTS BALANCE',
    balanceSub: 'Available loyalty points',
    rewardsTitle: 'Available rewards',
    noRewards: 'Rewards will appear here soon.',
    redeem: 'Redeem',
    historyTitle: 'Points history',
    signOut: 'Sign out',
    footer: 'Independent loyalty platform · Customer support at the clinic',
    pointsSuffix: 'points',
    langLabel: 'Language',
  },
  ar: {
    eyebrow: 'عيادة ناطور',
    title: 'مكافآت ناطور',
    subtitle: 'رحلتك العلاجية، مكافأة.',
    login: 'تسجيل دخول العميل',
    register: 'إنشاء حساب',
    phone: 'رقم الجوال',
    password: 'كلمة المرور',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة (اختياري)',
    signIn: 'دخول',
    signUp: 'إنشاء حساب',
    toLogin: 'لديك حساب؟ سجّل الدخول',
    toRegister: 'جديد هنا؟ أنشئ حساباً',
    balanceLabel: 'رصيد نقاطك',
    balanceSub: 'النقاط المتاحة',
    rewardsTitle: 'المكافآت المتاحة',
    noRewards: 'ستظهر المكافآت هنا قريباً.',
    redeem: 'استبدال',
    historyTitle: 'سجل النقاط',
    signOut: 'تسجيل الخروج',
    footer: 'منصة ولاء مستقلة · دعم العملاء في العيادة',
    pointsSuffix: 'نقطة',
    langLabel: 'اللغة',
  },
  he: {
    eyebrow: 'קליניקת נاطור',
    title: 'תגמולי נاطור',
    subtitle: 'מסע הטיפול שלך, מתוגמל.',
    login: 'כניסת לקוח',
    register: 'יצירת חשבון',
    phone: 'מספר טלפון',
    password: 'סיסמה',
    firstName: 'שם פרטי',
    lastName: 'שם משפחה (אופציונלי)',
    signIn: 'כניסה',
    signUp: 'יצירת חשבון',
    toLogin: 'יש לך חשבון? היכנס',
    toRegister: 'חדש כאן? צור חשבון',
    balanceLabel: 'יתרת הנקודות שלך',
    balanceSub: 'נקודות זמינות',
    rewardsTitle: 'תגמולים זמינים',
    noRewards: 'תגמולים יופיעו כאן בקרוב.',
    redeem: 'מימוש',
    historyTitle: 'היסטוריית נקודות',
    signOut: 'יציאה',
    footer: 'פלטפורמת נאמנות עצמאית · תמיכת לקוחות בקליניקה',
    pointsSuffix: 'נקודות',
    langLabel: 'שפה',
  },
};

const rtlLanguages = new Set(['ar', 'he']);
const rewardIcons = ['🎁', '✨', '💎', '🌟', '🎀', '🥂', '🧖', '🌸'];

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const [mode, setMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [token, setToken] = useState(localStorage.getItem('access') || '');
  const [profile, setProfile] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[lang] || translations.en;
  const isRtl = rtlLanguages.has(lang);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [lang, isRtl]);

  async function loadProfile(activeToken) {
    const [p, r] = await Promise.all([
      api('/loyalty/me/', { token: activeToken }),
      api('/loyalty/rewards/'),
    ]);
    setProfile(p);
    setRewards(r);
  }

  async function login(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/token/', { method: 'POST', body: JSON.stringify({ phone, password }) });
      localStorage.setItem('access', data.access);
      setToken(data.access);
      await loadProfile(data.access);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function register(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/auth/register/', {
        method: 'POST',
        body: JSON.stringify({ phone, password, first_name: firstName, last_name: lastName }),
      });
      const data = await api('/auth/token/', { method: 'POST', body: JSON.stringify({ phone, password }) });
      localStorage.setItem('access', data.access);
      setToken(data.access);
      await loadProfile(data.access);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (!token) return;
    loadProfile(token).catch(err => {
      setError(err.message);
      localStorage.removeItem('access');
      setToken('');
      setProfile(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function redeem(id) {
    try {
      await api('/loyalty/redeem/', { token, method: 'POST', body: JSON.stringify({ reward_id: id }) });
      const p = await api('/loyalty/me/', { token });
      setProfile(p);
    } catch (err) { setError(err.message); }
  }

  function signOut() {
    localStorage.removeItem('access');
    setToken('');
    setProfile(null);
    setRewards([]);
  }

  return (
    <div className="ambient" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="shell" dir={isRtl ? 'rtl' : 'ltr'}>
        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">N</span>
            <span className="brand-name">{t.eyebrow}</span>
          </div>
          <label className="lang-switch" title={t.langLabel}>
            <span className="lang-globe">🌐</span>
            <select value={lang} onChange={e => setLang(e.target.value)} aria-label={t.langLabel}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="he">עברית</option>
            </select>
          </label>
        </header>

        <section className="hero">
          <span className="hero-eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </section>

        {error && <div className="alert">{error}</div>}

        {!token ? (
          <form className="glass card auth" onSubmit={mode === 'login' ? login : register}>
            <h2>{mode === 'login' ? t.login : t.register}</h2>
            {mode === 'register' && (
              <>
                <label className="field">
                  <span>{t.firstName}</span>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} required autoComplete="given-name" />
                </label>
                <label className="field">
                  <span>{t.lastName}</span>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} autoComplete="family-name" />
                </label>
              </>
            )}
            <label className="field">
              <span>{t.phone}</span>
              <input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+972..." autoComplete="tel" dir="ltr" />
            </label>
            <label className="field">
              <span>{t.password}</span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </label>
            <button className="btn-gold" disabled={loading}>
              {loading ? '…' : mode === 'login' ? t.signIn : t.signUp}
            </button>
            <button type="button" className="btn-link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? t.toRegister : t.toLogin}
            </button>
          </form>
        ) : profile && (
          <div className="dashboard fade-up">
            <section className="balance glass">
              <span className="balance-label">{t.balanceLabel}</span>
              <strong className="balance-value">{profile.balance.toLocaleString()}</strong>
              <small>{t.balanceSub}</small>
            </section>

            <section className="glass card">
              <h2>{t.rewardsTitle}</h2>
              {rewards.length ? (
                <div className="reward-list">
                  {rewards.map((r, i) => (
                    <article className="reward" key={r.id}>
                      <span className="reward-icon">{rewardIcons[i % rewardIcons.length]}</span>
                      <div className="reward-body">
                        <b>{r.name}</b>
                        <p>{r.description}</p>
                      </div>
                      <div className="reward-cta">
                        <small className="points-pill">{r.points_cost} {t.pointsSuffix}</small>
                        <button className="btn-gold" disabled={profile.balance < r.points_cost} onClick={() => redeem(r.id)}>
                          {t.redeem}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <p className="muted">{t.noRewards}</p>}
            </section>

            <section className="glass card">
              <h2>{t.historyTitle}</h2>
              <div className="history-list">
                {profile.history.map(x => (
                  <article className="history" key={x.id}>
                    <span className={`history-dot ${x.points < 0 ? 'minus' : 'plus'}`} />
                    <span className="history-desc">{x.description}</span>
                    <b className={x.points < 0 ? 'negative' : 'positive'}>{x.points > 0 ? '+' : ''}{x.points}</b>
                  </article>
                ))}
              </div>
            </section>

            <button className="btn-ghost" onClick={signOut}>{t.signOut}</button>
          </div>
        )}

        <footer>{t.footer}</footer>
      </main>
    </div>
  );
}