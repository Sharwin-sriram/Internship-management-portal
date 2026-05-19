'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { getJson, putJson } from '../../lib/api';
import Button from '../../components/ui/Button';
import { FiUser, FiMail, FiBookOpen, FiAward, FiStar, FiMapPin, FiBriefcase, FiLink, FiEdit3, FiSave, FiX, FiChevronRight, FiCamera } from 'react-icons/fi';

type UserProfile = {
  name: string;
  email: string;
  role: string;
  avatar: string;
};

type StudentProfile = {
  college: string;
  branch: string;
  cgpa: number;
  graduation_year: number;
  skills: string[];
  placement_eligible: boolean;
};

type CompanyProfile = {
  name: string;
  description: string;
  website: string;
  location: string;
  industry: string;
  logo: string;
};

export default function ProfilePage() {
  const { user, isLoading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form State
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  
  // Student State
  const [studentDetails, setStudentDetails] = useState<StudentProfile>({
    college: '',
    branch: '',
    cgpa: 0,
    graduation_year: new Date().getFullYear(),
    skills: [],
    placement_eligible: true
  });
  const [skillsInput, setSkillsInput] = useState('');

  // Company State
  const [companyDetails, setCompanyDetails] = useState<CompanyProfile>({
    name: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    logo: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getJson<{ success: boolean; data: { user: UserProfile, student?: StudentProfile, company?: CompanyProfile } }>('/profile');
      if (res.ok && res.body?.success) {
        setUserName(res.body.data.user.name || '');
        setUserAvatar(res.body.data.user.avatar || '');
        if (res.body.data.student) {
          setStudentDetails(res.body.data.student);
          setSkillsInput(res.body.data.student.skills.join(', '));
        }
        if (res.body.data.company) {
          setCompanyDetails(res.body.data.company);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      const payload: any = {
        name: userName,
        avatar: userAvatar,
      };

      if (user?.role === 'student') {
        payload.studentDetails = {
          ...studentDetails,
          skills: skillsInput.split(',').map(s => s.trim()).filter(s => s)
        };
      } else if (user?.role === 'company') {
        payload.companyDetails = companyDetails;
      }

      const res = await putJson<{ success: boolean; data: any }>('/profile', payload);
      
      if (res.ok && res.body?.success) {
        setEditing(false);
        await refreshUser();
        await fetchProfile(); // Refresh
      } else {
        alert('Failed to save profile');
      }
    } catch (error) {
      console.error('Save error', error);
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (authLoading || loading || !user || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const roleColors: Record<string, { bg: string, text: string }> = {
    student: { bg: 'var(--color-primary-10)', text: 'var(--color-primary)' },
    company: { bg: 'rgba(128,130,214,0.1)', text: '#8082D6' },
    admin: { bg: 'rgba(80,182,254,0.1)', text: '#50B6FE' },
    coordinator: { bg: 'rgba(148,174,254,0.1)', text: '#94AEFE' }
  };
  const roleTheme = roleColors[user.role] || roleColors.student;

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      {/* Navigation */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-muted)' }}>
          <FiChevronRight style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
        </Button>
      </div>

      {/* Header Banner */}
      <div style={{ position: 'relative', width: '100%', height: 160, borderRadius: 'var(--radius-xl)', background: 'var(--gradient-brand)', marginBottom: 80 }}>
        {/* Avatar */}
        <div style={{ position: 'absolute', bottom: -50, left: 40, width: 120, height: 120, borderRadius: '50%', background: 'var(--color-surface)', border: '4px solid var(--color-surface)', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)', overflow: 'hidden' }}>
          {userAvatar ? (
             <img src={userAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
             userName.charAt(0).toUpperCase()
          )}
          {editing && (
            <label style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
              <FiCamera size={24} />
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
            </label>
          )}
        </div>
        
        {/* Edit Toggle */}
        <div style={{ position: 'absolute', bottom: -50, right: 40, display: 'flex', gap: 'var(--space-sm)' }}>
          {!editing ? (
            <Button variant="primary" onClick={() => setEditing(true)}>
              <FiEdit3 /> Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { setEditing(false); fetchProfile(); }}>
                <FiX /> Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>
                <FiSave /> Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xl)' }}>
        
        {/* Core Info */}
        <section style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>{editing ? 'Edit Profile' : userName}</h2>
            {!editing && (
              <span style={{ padding: '4px 12px', borderRadius: 999, background: roleTheme.bg, color: roleTheme.text, fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user.role}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', color: 'var(--color-muted)', marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}><FiMail /> {user.email}</div>
          </div>

          {editing && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)', fontSize: 'var(--font-size-base)', outline: 'none', transition: 'border-color var(--transition-fast)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              />
            </div>
          )}
        </section>

        {/* Role Specific Details */}
        {user.role === 'student' && (
          <section style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiBookOpen /> Academic Details
            </h3>

            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-md)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>College / University</label>
                  <input type="text" value={studentDetails.college} onChange={e => setStudentDetails({...studentDetails, college: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>Branch / Major</label>
                  <input type="text" value={studentDetails.branch} onChange={e => setStudentDetails({...studentDetails, branch: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>CGPA</label>
                  <input type="number" step="0.01" value={studentDetails.cgpa} onChange={e => setStudentDetails({...studentDetails, cgpa: parseFloat(e.target.value)})} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>Graduation Year</label>
                  <input type="number" value={studentDetails.graduation_year} onChange={e => setStudentDetails({...studentDetails, graduation_year: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>Skills (comma separated)</label>
                  <input type="text" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="React, Node.js, Python..." style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 4 }}>College</div>
                  <div style={{ fontWeight: 600 }}>{studentDetails.college || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 4 }}>Branch</div>
                  <div style={{ fontWeight: 600 }}>{studentDetails.branch || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 4 }}>CGPA</div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><FiAward color="var(--color-primary)" /> {studentDetails.cgpa || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 4 }}>Graduation Year</div>
                  <div style={{ fontWeight: 600 }}>{studentDetails.graduation_year || '-'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 8 }}>Skills</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                    {studentDetails.skills?.length > 0 ? studentDetails.skills.map(s => (
                      <span key={s} style={{ padding: '6px 12px', background: 'var(--color-primary-10)', color: 'var(--color-primary)', borderRadius: 999, fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                        {s}
                      </span>
                    )) : <span style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>No skills added</span>}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {user.role === 'company' && (
          <section style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiBriefcase /> Company Details
            </h3>

            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>Company Name</label>
                  <input type="text" value={companyDetails.name} onChange={e => setCompanyDetails({...companyDetails, name: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>Description</label>
                  <textarea rows={4} value={companyDetails.description} onChange={e => setCompanyDetails({...companyDetails, description: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>Industry</label>
                  <input type="text" value={companyDetails.industry} onChange={e => setCompanyDetails({...companyDetails, industry: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>Location</label>
                  <input type="text" value={companyDetails.location} onChange={e => setCompanyDetails({...companyDetails, location: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>Website</label>
                  <input type="url" value={companyDetails.website} onChange={e => setCompanyDetails({...companyDetails, website: e.target.value})} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 4 }}>About</div>
                  <div style={{ fontWeight: 500, lineHeight: 1.6 }}>{companyDetails.description || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 4 }}>Industry</div>
                  <div style={{ fontWeight: 600 }}>{companyDetails.industry || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 4 }}>Location</div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><FiMapPin color="var(--color-error)" /> {companyDetails.location || '-'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 4 }}>Website</div>
                  <a href={companyDetails.website} target="_blank" rel="noreferrer" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)' }}><FiLink /> {companyDetails.website || 'No website added'}</a>
                </div>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}
