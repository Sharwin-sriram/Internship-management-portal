'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/ui/Button';
import { putJson, postJson } from '../../../lib/api';

export default function SettingsPage(){
  const { user } = useAuth();
  const [active, setActive] = useState('profile');

  useEffect(() => {
    // default to profile
    setActive('profile');
  }, []);

  return (
    <div style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-start' }}>
        <Sidebar active={active} onSelect={setActive} />

        <main style={{ flex: 1 }}>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>Account settings</h2>
            <p style={{ color: 'var(--color-muted)', marginTop: 6 }}>Manage your profile, account and security settings.</p>
          </div>

          <div>
            {active === 'profile' && <ProfileSection user={user} />}
            {active === 'account' && <AccountSection user={user} />}
            {active === 'security' && <SecuritySection />}
            {active === 'notifications' && <div>Notification preferences coming soon.</div>}
          </div>
        </main>
      </div>
    </div>
  );
}

function ProfileSection({ user }:{ user:any }){
  const initial = {
    fullName: user?.name ?? '',
    phone: '',
    bio: '',
    skills: '' as string,
    college: '',
    picture: null as File | null,
  };

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function onChange(k:string, v:any){
    setForm(prev=> ({ ...prev, [k]: v }));
  }

  async function save(){
    setSaving(true);
    setMessage(null);
    try{
      const patch: Record<string, any> = {};
      if(form.fullName !== initial.fullName) patch.fullName = form.fullName;
      if(form.phone) patch.phone = form.phone;
      if(form.bio) patch.bio = form.bio;
      if(form.skills) patch.skills = form.skills.split(',').map(s=>s.trim()).filter(Boolean);
      if(form.college) patch.college = form.college;

      // picture upload placeholder — replace with real endpoint
      if(form.picture){
        const fd = new FormData();
        fd.append('file', form.picture);
        // this project backend may expect /uploads endpoint — using /upload as example
        const res = await fetch('/api/uploads/profile-picture', { method: 'POST', body: fd });
        if (res.ok) {
          const body = await res.json().catch(()=>null);
          patch.profilePicture = body?.url ?? null;
        }
      }

      if(Object.keys(patch).length === 0){
        setMessage('No changes to save');
        setSaving(false);
        return;
      }

      const result = await putJson('/user', patch);
      if(result.ok){
        setMessage('Profile updated successfully');
      }else{
        setMessage('Failed to update profile');
      }
    }catch(err){
      setMessage('An error occurred');
    }finally{ setSaving(false); }
  }

  return (
    <section style={{ background: 'white', borderRadius: 12, padding: 18, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ marginTop: 0 }}>Profile</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Full Name</label>
          <input value={form.fullName} onChange={e=>onChange('fullName', e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />

          <label style={{ display: 'block', fontWeight: 600, margin: '12px 0 6px' }}>Phone Number</label>
          <input value={form.phone} onChange={e=>onChange('phone', e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />

          <label style={{ display: 'block', fontWeight: 600, margin: '12px 0 6px' }}>Bio</label>
          <textarea value={form.bio} onChange={e=>onChange('bio', e.target.value)} rows={4} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />

          <label style={{ display: 'block', fontWeight: 600, margin: '12px 0 6px' }}>Skills (comma separated)</label>
          <input value={form.skills} onChange={e=>onChange('skills', e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />

          <label style={{ display: 'block', fontWeight: 600, margin: '12px 0 6px' }}>College Name</label>
          <input value={form.college} onChange={e=>onChange('college', e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--color-border)' }} />

          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={()=>{ setForm(initial); setMessage(null); }}>Reset</Button>
            <Button variant="primary" onClick={save} loading={saving}>Save Changes</Button>
          </div>

          {message && <div style={{ marginTop: 12, color: message.includes('success') ? 'var(--color-success)' : 'var(--color-error)' }}>{message}</div>}
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Profile Picture</label>
          <div style={{ border: '1px dashed var(--color-border)', padding: 12, borderRadius: 8 }}>
            <input type="file" accept="image/*" onChange={e=> onChange('picture', e.target.files ? e.target.files[0] : null)} />
            <p style={{ color: 'var(--color-muted)', marginTop: 8 }}>Recommended: 400x400px. JPG or PNG.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AccountSection({ user }:{ user:any }){
  const [changing, setChanging] = useState(false);
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function requestEmailChange(){
    setChanging(true); setMsg(null);
    try{
      // re-auth flow
      const re = await postJson('/auth/reauth', { password });
      if(!re.ok){ setMsg('Re-authentication failed'); setChanging(false); return; }

      const res = await putJson('/user/email', { email });
      if(res.ok) setMsg('Email updated'); else setMsg('Failed to update email');
    }catch(e){ setMsg('Error'); }finally{ setChanging(false); }
  }

  return (
    <section style={{ background: 'white', borderRadius: 12, padding: 18, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ marginTop: 0 }}>Account</h3>
      <p style={{ color: 'var(--color-muted)' }}>Primary email</p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
        <div style={{ fontWeight: 700 }}>{user?.email}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>New Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', width: 360 }} />

        <label style={{ display: 'block', fontWeight: 600, margin: '12px 0 6px' }}>Current Password (required)</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', width: 360 }} />

        <div style={{ marginTop: 12 }}>
          <Button variant="primary" onClick={requestEmailChange} loading={changing}>Change Email</Button>
        </div>

        {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
      </div>
    </section>
  );
}

function SecuritySection(){
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(){
    if(newPassword.length < 8) return 'Password must be at least 8 characters';
    if(newPassword !== confirm) return 'Passwords do not match';
    return null;
  }

  async function changePassword(){
    const v = validate(); if(v){ setMsg(v); return; }
    setLoading(true); setMsg(null);
    try{
      const res = await postJson('/auth/change-password', { currentPassword, newPassword });
      if(res.ok) setMsg('Password changed'); else setMsg('Failed to change password');
    }catch(e){ setMsg('Error'); }
    setLoading(false);
  }

  return (
    <section style={{ background: 'white', borderRadius: 12, padding: 18, border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
      <h3 style={{ marginTop: 0 }}>Security</h3>
      <label style={{ display: 'block', fontWeight: 600, marginTop: 8 }}>Current Password</label>
      <input type="password" value={currentPassword} onChange={e=>setCurrent(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', width: 360 }} />

      <label style={{ display: 'block', fontWeight: 600, marginTop: 12 }}>New Password</label>
      <input type="password" value={newPassword} onChange={e=>setNew(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', width: 360 }} />

      <label style={{ display: 'block', fontWeight: 600, marginTop: 12 }}>Confirm Password</label>
      <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--color-border)', width: 360 }} />

      <div style={{ marginTop: 12 }}>
        <Button variant="primary" onClick={changePassword} loading={loading}>Change Password</Button>
      </div>

      {msg && <div style={{ marginTop: 10 }}>{msg}</div>}
    </section>
  );
}
