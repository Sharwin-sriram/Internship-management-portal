'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { postForm } from '@/lib/api';
import Button from '@/components/ui/Button';
import { 
  FiArrowLeft, FiUser, FiMail, FiPhone, FiAward, FiBook, FiCpu, 
  FiUploadCloud, FiFile, FiTrash2, FiPlus, FiX, FiCheckCircle, FiAlertCircle, FiBriefcase 
} from 'react-icons/fi';

function ApplyForm() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract from query params
  const jobParam = searchParams.get('job') || '';
  const internshipParam = searchParams.get('internshipId') || '';

  const [mounted, setMounted] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [yearOfStudying, setYearOfStudying] = useState('3rd');
  const [stream, setStream] = useState('B.Tech');
  const [department, setDepartment] = useState('Computer Science');
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  // States
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      // Prefill fields from user details if available
      const names = user.name ? user.name.split(' ') : ['', ''];
      setFirstName(names[0] || '');
      setLastName(names.slice(1).join(' ') || '');
      setEmail(user.email || '');
      // Prefill job title from URL query params
      setJobTitle(jobParam);
    }
  }, [user, authLoading, router, jobParam]);

  // Skill tags logic
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSkill = newSkill.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Drag and drop resume handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError('Only PDF and DOC/DOCX files are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('File size must be under 5MB.');
      return;
    }
    setSubmitError('');
    setResumeFile(file);
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    // Basic Validation
    if (!firstName || !lastName || !email || !phone || !cgpa || !yearOfStudying || !stream || !department || !jobTitle) {
      setSubmitError('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      setSubmitError('CGPA must be a valid number between 0 and 10.');
      setIsSubmitting(false);
      return;
    }

    if (!resumeFile) {
      setSubmitError('Please upload your resume.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('cgpa', cgpa);
      formData.append('yearOfStudying', yearOfStudying);
      formData.append('stream', stream);
      formData.append('department', department);
      formData.append('jobTitle', jobTitle);
      if (internshipParam) {
        formData.append('internship', internshipParam);
      }
      formData.append('skills', JSON.stringify(skills));
      formData.append('resume', resumeFile);

      const res = await postForm<{ success: boolean; message?: string }>('/job-applications', formData);

      if (res.ok && res.body?.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(res.body?.message || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  // Success view
  if (submitSuccess) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 'var(--space-xl) var(--space-lg)' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl) var(--space-xl)',
          maxWidth: 520,
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.12)', 
            color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto var(--space-xl)', animation: 'pulse-ring 2s infinite'
          }}>
            <FiCheckCircle size={44} />
          </div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-md)' }}>
            Application Submitted!
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-base)', lineHeight: 1.6, marginBottom: 'var(--space-2xl)' }}>
            Congratulations, your internship application for <strong>{jobTitle}</strong> has been successfully submitted and is under review.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="primary" onClick={() => router.push('/dashboard/student/applications')}>
              View Applications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }} className="animate-fade-in-up">
      {/* Back button */}
      <button 
        onClick={() => router.push('/dashboard/student/applications')}
        style={{ 
          display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', 
          color: 'var(--color-muted)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 600,
          marginBottom: 'var(--space-lg)', padding: 0 
        }}
      >
        <FiArrowLeft /> Back to Applications
      </button>

      {/* Title */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-xs)' }}>
          Internship Application Form
        </h1>
        <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-base)' }}>
          Please fill in your details to apply for the internship.
        </p>
      </div>

      {/* Error banner */}
      {submitError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-error)',
          padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 'var(--space-xl)',
          fontSize: 'var(--font-size-sm)', fontWeight: 500
        }}>
          <FiAlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Glassmorphic Form Card */}
      <form onSubmit={handleSubmit} style={{
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-xl) var(--space-lg)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xl)'
      }}>

        {/* Section 1: Position Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <FiBriefcase style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Position Details</h3>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Applied Position / Internship Role *</label>
            <input 
              type="text" 
              value={jobTitle} 
              onChange={e => setJobTitle(e.target.value)} 
              required
              disabled={!!jobParam} // Disable input if pre-filled via URL
              placeholder="e.g. Software Engineering Intern"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 'var(--radius)', 
                border: '1px solid var(--color-border)', background: jobParam ? 'var(--color-background)' : 'white', 
                fontSize: 'var(--font-size-sm)', outline: 'none', transition: 'all var(--transition-fast)',
                cursor: jobParam ? 'not-allowed' : 'text'
              }}
              onFocus={e => { if (!jobParam) { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)'; } }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
            />
            {jobParam && (
              <span style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginTop: 4 }}>
                This application is linked to the selected internship listing.
              </span>
            )}
          </div>
        </div>

        {/* Section 2: Personal Information */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <FiUser style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Personal Information</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>First Name *</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={e => setFirstName(e.target.value)} 
                required
                placeholder="John"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius)', 
                  border: '1px solid var(--color-border)', background: 'white', 
                  fontSize: 'var(--font-size-sm)', outline: 'none', transition: 'all var(--transition-fast)'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Last Name *</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={e => setLastName(e.target.value)} 
                required
                placeholder="Doe"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius)', 
                  border: '1px solid var(--color-border)', background: 'white', 
                  fontSize: 'var(--font-size-sm)', outline: 'none', transition: 'all var(--transition-fast)'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Email Address *</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-subtle)' }} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  placeholder="john.doe@example.com"
                  style={{
                    width: '100%', padding: '12px 16px 12px 42px', borderRadius: 'var(--radius)', 
                    border: '1px solid var(--color-border)', background: 'white', 
                    fontSize: 'var(--font-size-sm)', outline: 'none', transition: 'all var(--transition-fast)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Contact Number *</label>
              <div style={{ position: 'relative' }}>
                <FiPhone style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-subtle)' }} />
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  required
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: '100%', padding: '12px 16px 12px 42px', borderRadius: 'var(--radius)', 
                    border: '1px solid var(--color-border)', background: 'white', 
                    fontSize: 'var(--font-size-sm)', outline: 'none', transition: 'all var(--transition-fast)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Academic Qualifications */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <FiBook style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Academic Details</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>CGPA *</label>
              <div style={{ position: 'relative' }}>
                <FiAward style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-subtle)' }} />
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  max="10"
                  value={cgpa} 
                  onChange={e => setCgpa(e.target.value)} 
                  required
                  placeholder="9.45"
                  style={{
                    width: '100%', padding: '12px 16px 12px 42px', borderRadius: 'var(--radius)', 
                    border: '1px solid var(--color-border)', background: 'white', 
                    fontSize: 'var(--font-size-sm)', outline: 'none', transition: 'all var(--transition-fast)'
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Year of Studying *</label>
              <select 
                value={yearOfStudying} 
                onChange={e => setYearOfStudying(e.target.value)} 
                required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius)', 
                  border: '1px solid var(--color-border)', background: 'white', 
                  fontSize: 'var(--font-size-sm)', outline: 'none', transition: 'all var(--transition-fast)',
                  cursor: 'pointer'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Degree / Stream *</label>
              <input 
                type="text" 
                value={stream} 
                onChange={e => setStream(e.target.value)} 
                required
                placeholder="B.Tech, B.E., MCA, etc."
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius)', 
                  border: '1px solid var(--color-border)', background: 'white', 
                  fontSize: 'var(--font-size-sm)', outline: 'none', transition: 'all var(--transition-fast)'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Department *</label>
              <input 
                type="text" 
                value={department} 
                onChange={e => setDepartment(e.target.value)} 
                required
                placeholder="Computer Science, IT, Mechanical, etc."
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius)', 
                  border: '1px solid var(--color-border)', background: 'white', 
                  fontSize: 'var(--font-size-sm)', outline: 'none', transition: 'all var(--transition-fast)'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Skills & Professional */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <FiCpu style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Skills</h3>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Add Skills (Languages, Frameworks, Tools)</label>
            
            <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-md)' }}>
              <input 
                type="text" 
                value={newSkill} 
                onChange={e => setNewSkill(e.target.value)} 
                placeholder="e.g. React, Python, Docker"
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 'var(--radius)', 
                  border: '1px solid var(--color-border)', background: 'white', 
                  fontSize: 'var(--font-size-sm)', outline: 'none', transition: 'all var(--transition-fast)'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-10)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(e); } }}
              />
              <button 
                type="button"
                onClick={handleAddSkill}
                style={{
                  padding: '0 20px', borderRadius: 'var(--radius)', background: 'var(--gradient-brand)',
                  color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4, transition: 'transform var(--transition-fast)'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <FiPlus /> Add
              </button>
            </div>

            {/* Skills Tags Container */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {skills.length > 0 ? skills.map(skill => (
                <span 
                  key={skill}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                    borderRadius: 999, background: 'var(--color-primary-10)', color: 'var(--color-primary)',
                    fontSize: 'var(--font-size-sm)', fontWeight: 600
                  }}
                >
                  {skill}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSkill(skill)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', display: 'inline-flex', cursor: 'pointer', padding: 0 }}
                  >
                    <FiX size={14} />
                  </button>
                </span>
              )) : (
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-subtle)', fontStyle: 'italic' }}>
                  No skills added yet. Type a skill and click Add.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Resume Upload */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
            <FiUploadCloud style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Upload Resume *</h3>
          </div>

          {!resumeFile ? (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: isDragging ? 'rgba(34, 151, 250, 0.04)' : 'rgba(255, 255, 255, 0.4)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-2xl) var(--space-xl)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-base)'
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }} 
              />
              <FiUploadCloud size={44} style={{ color: isDragging ? 'var(--color-primary)' : 'var(--color-subtle)', marginBottom: 'var(--space-md)' }} />
              <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 4 }}>
                Drag & drop your resume file here
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 'var(--space-sm)' }}>
                or click to browse your files
              </p>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-subtle)' }}>
                Supports PDF, DOC, DOCX up to 5MB
              </span>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius)',
              background: 'white', border: '1px solid var(--color-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'rgba(34,151,250,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiFile size={22} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-foreground)', wordBreak: 'break-all' }}>
                    {resumeFile.name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                    {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={handleRemoveFile}
                style={{
                  background: 'none', border: 'none', color: 'var(--color-error)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '8px',
                  borderRadius: '50%', transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div style={{ 
          display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', 
          borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 'var(--space-lg)', marginTop: 'var(--space-md)' 
        }}>
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.push('/dashboard/student/applications')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            loading={isSubmitting}
          >
            Submit Application
          </Button>
        </div>

      </form>
    </div>
  );
}

export default function ApplyInternshipPage() {
  return (
    <div style={{
      minHeight: '90vh',
      padding: 'var(--space-xl) var(--space-lg)',
      background: 'radial-gradient(circle at 10% 20%, rgba(34, 151, 250, 0.04) 0%, rgba(128, 130, 214, 0.04) 90%)',
      position: 'relative'
    }}>
      {/* Decorative blurred backgrounds */}
      <div style={{ position: 'absolute', top: '10%', right: '15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34, 151, 250, 0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(128, 130, 214, 0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
        </div>
      }>
        <ApplyForm />
      </Suspense>
    </div>
  );
}
