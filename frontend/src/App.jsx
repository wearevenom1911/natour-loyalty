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
  },
};

const rtlLanguages = new Set(['ar', 'he']);

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const [mode, setMode] = useState('login'); // login | register
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [token, setToken] = useState(localStorage.getItem('access') || '');
  const [profile, setProfile] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [error, setError] = useState('');

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
    try {
      const data = await api('/auth/token/', { method: 'POST', body: JSON.stringify({ phone, password }) });
      localStorage.setItem('access', data.access);
      setToken(data.access);
      await loadProfile(data.access);
    } catch (err) { setError(err.message); }
  }

  async function register(e) {
    e.preventDefault();
    setError('');
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
    <main className="shell" dir={isRtl ? 'rtl' : 'ltr'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span className="eyebrow">{t.eyebrow}</span>
        <select value={lang} onChange={e => setLang(e.target.value)} aria-label="Language">
          <option value="en">English</option>
          <option value="ar">العربية</option>
          <option value="he">עברית</option>
        </select>
      </div>
      <header><h1>{t.title}</h1><p>{t.subtitle}</p></header>
      {error && <p className="error">{error}</p>}
      {!token ? (
        <form className="panel login" onSubmit={mode === 'login' ? login : register}>
          <h2>{mode === 'login' ? t.login : t.register}</h2>
          {mode === 'register' && (
            <>
              <label>{t.firstName}<input value={firstName} onChange={e => setFirstName(e.target.value)} required /></label>
              <label>{t.lastName}<input value={lastName} onChange={e => setLastName(e.target.value)} /></label>
            </>
          )}
          <label>{t.phone}<input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+972..." /></label>
          <label>{t.password}<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} /></label>
          <button>{mode === 'login' ? t.signIn : t.signUp}</button>
          <small style={{ display: 'block', marginTop: 8, textAlign: 'center' }}>
            <button type="button" className="secondary" style={{ padding: '6px 10px' }}
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? t.toRegister : t.toLogin}
            </button>
          </small>
        </form>
      ) : profile && (
        <>
          <section className="balance">
            <span>{t.balanceLabel}</span>
            <strong>{profile.balance.toLocaleString()}</strong>
            <small>{t.balanceSub}</small>
          </section>
          <section className="panel">
            <h2>{t.rewardsTitle}</h2>
            {rewards.length ? rewards.map(r => (
              <article className="reward" key={r.id}>
                <div><b>{r.name}</b><p>{r.description}</p><small>{r.points_cost} {t.pointsSuffix}</small></div>
                <button disabled={profile.balance < r.points_cost} onClick={() => redeem(r.id)}>{t.redeem}</button>
              </article>
            )) : <p>{t.noRewards}</p>}
          </section>
          <section className="panel">
            <h2>{t.historyTitle}</h2>
            {profile.history.map(x => (
              <article className="history" key={x.id}>
                <span>{x.description}</span>
                <b className={x.points < 0 ? 'negative' : ''}>{x.points > 0 ? '+' : ''}{x.points}</b>
              </article>
            ))}
          </section>
          <button className="secondary" onClick={signOut}>{t.signOut}</button>
        </>
      )}
      <footer>{t.footer}</footer>
    </main>
  );
}