import React, {useEffect, useState} from 'react';
import {api} from './api';

export default function App() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('access') || '');
  const [profile, setProfile] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [error, setError] = useState('');

  async function login(e) {
    e.preventDefault(); setError('');
    try {
      const data = await api('/auth/token/', {method:'POST', body:JSON.stringify({phone, password})});
      localStorage.setItem('access', data.access); setToken(data.access);
    } catch (err) { setError(err.message); }
  }
  useEffect(() => {
    if (!token) return;
    Promise.all([api('/loyalty/me/', {token}), api('/loyalty/rewards/')])
      .then(([p, r]) => {setProfile(p); setRewards(r);})
      .catch(err => {setError(err.message); localStorage.removeItem('access'); setToken('');});
  }, [token]);

  async function redeem(id) {
    try { await api('/loyalty/redeem/', {token, method:'POST', body:JSON.stringify({reward_id:id})});
      const p = await api('/loyalty/me/', {token}); setProfile(p);
    } catch(err) {setError(err.message);}
  }
  return <main className="shell">
    <header><span className="eyebrow">NATOUR CLINIC</span><h1>Natour Rewards</h1><p>Your care journey, rewarded.</p></header>
    {error && <p className="error">{error}</p>}
    {!token ? <form className="panel login" onSubmit={login}>
      <h2>Customer login</h2><label>Mobile number<input value={phone} onChange={e=>setPhone(e.target.value)} required placeholder="+972..." /></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <button>Sign in</button><small>New accounts are created by the clinic team for this starter version.</small>
    </form> : profile && <>
      <section className="balance"><span>YOUR POINTS BALANCE</span><strong>{profile.balance.toLocaleString()}</strong><small>Available loyalty points</small></section>
      <section className="panel"><h2>Available rewards</h2>{rewards.length ? rewards.map(r=><article className="reward" key={r.id}><div><b>{r.name}</b><p>{r.description}</p><small>{r.points_cost} points</small></div><button disabled={profile.balance < r.points_cost} onClick={()=>redeem(r.id)}>Redeem</button></article>) : <p>Rewards will appear here soon.</p>}</section>
      <section className="panel"><h2>Points history</h2>{profile.history.map(x=><article className="history" key={x.id}><span>{x.description}</span><b className={x.points < 0 ? 'negative' : ''}>{x.points > 0 ? '+' : ''}{x.points}</b></article>)}</section>
      <button className="secondary" onClick={()=>{localStorage.removeItem('access');setToken('');setProfile(null)}}>Sign out</button>
    </>}
    <footer>Independent loyalty platform · Customer support at the clinic</footer>
  </main>;
}
