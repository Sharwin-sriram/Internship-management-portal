'use client';

import React from 'react';
import { FiCalendar, FiClock, FiMapPin, FiVideo, FiPhone, FiUser } from 'react-icons/fi';

interface InterviewCardProps {
  companyLogo?: string;
  companyName: string;
  jobTitle: string;
  date: string;
  time: string;
  interviewType: 'phone' | 'video' | 'in-person';
  interviewerName?: string;
  meetingLink?: string;
  location?: string;
  status?: 'pending' | 'accepted' | 'declined' | 'completed' | 'rescheduled';
  onAccept?: () => void;
  onDecline?: () => void;
  onReschedule?: () => void;
  showActions?: boolean;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  companyLogo,
  companyName,
  jobTitle,
  date,
  time,
  interviewType,
  interviewerName,
  meetingLink,
  location,
  status = 'pending',
  onAccept,
  onDecline,
  onReschedule,
  showActions = true,
}) => {
  const getInterviewTypeIcon = () => {
    switch (interviewType) {
      case 'video':
        return <FiVideo />;
      case 'phone':
        return <FiPhone />;
      case 'in-person':
        return <FiMapPin />;
      default:
        return <FiVideo />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'accepted':
        return { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', label: 'Accepted' };
      case 'declined':
        return { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', label: 'Declined' };
      case 'completed':
        return { bg: 'rgba(34,151,250,0.1)', text: '#2297FA', label: 'Completed' };
      case 'rescheduled':
        return { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', label: 'Rescheduled' };
      default:
        return { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', label: 'Pending' };
    }
  };

  const statusStyle = getStatusColor();

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-lg)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--transition-base)',
      }}
      className="hover:shadow-md"
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
        {companyLogo ? (
          <img
            src={companyLogo}
            alt={companyName}
            style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: 'white',
            }}
          >
            {companyName.charAt(0)}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 4 }}>{jobTitle}</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontWeight: 500 }}>
            {companyName}
          </p>
        </div>
        <div
          style={{
            padding: '4px 12px',
            borderRadius: 999,
            background: statusStyle.bg,
            color: statusStyle.text,
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {statusStyle.label}
        </div>
      </div>

      {/* Interview Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
          <FiCalendar />
          <span>{date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
          <FiClock />
          <span>{time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
          {getInterviewTypeIcon()}
          <span style={{ textTransform: 'capitalize' }}>{interviewType.replace('-', ' ')}</span>
        </div>
        {interviewerName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
            <FiUser />
            <span>{interviewerName}</span>
          </div>
        )}
      </div>

      {/* Meeting Link or Location */}
      {meetingLink && (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 'var(--font-size-sm)',
              color: '#2297FA',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <FiVideo />
            Join Meeting
          </a>
        </div>
      )}
      {location && interviewType === 'in-person' && (
        <div style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
          <FiMapPin style={{ marginRight: 6 }} />
          {location}
        </div>
      )}

      {/* Action Buttons */}
      {showActions && status === 'pending' && (
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          {onAccept && (
            <button
              onClick={onAccept}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius)',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Accept
            </button>
          )}
          {onDecline && (
            <button
              onClick={onDecline}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius)',
                background: 'var(--color-surface)',
                color: '#ef4444',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              Decline
            </button>
          )}
          {onReschedule && (
            <button
              onClick={onReschedule}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius)',
                background: 'var(--color-surface)',
                color: 'var(--color-foreground)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
            >
              Request Reschedule
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewCard;
