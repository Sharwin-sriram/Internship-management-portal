'use client';

import React from 'react';
import { FiCheckCircle, FiCircle, FiClock, FiXCircle, FiStar } from 'react-icons/fi';

export interface TimelineEvent {
  id: number | string;
  title: string;
  date?: string;
  status: 'completed' | 'current' | 'upcoming' | 'selected' | 'rejected' | 'hold';
  description?: string;
  interviewer?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  showConnector?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ events, showConnector = true }) => {
  const getStatusIcon = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle size={20} />;
      case 'current':
        return <FiClock size={20} />;
      case 'selected':
        return <FiStar size={20} />;
      case 'rejected':
        return <FiXCircle size={20} />;
      case 'hold':
        return <FiCircle size={20} />;
      default:
        return <FiCircle size={20} />;
    }
  };

  const getStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', border: '#22c55e' };
      case 'current':
        return { bg: 'rgba(34,151,250,0.1)', text: '#2297FA', border: '#2297FA' };
      case 'selected':
        return { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', border: '#22c55e' };
      case 'rejected':
        return { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: '#ef4444' };
      case 'hold':
        return { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: '#f59e0b' };
      default:
        return { bg: 'var(--color-background)', text: 'var(--color-muted)', border: 'var(--color-border)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {events.map((event, index) => {
        const statusStyle = getStatusColor(event.status);
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} style={{ display: 'flex', gap: 'var(--space-md)', position: 'relative' }}>
            {/* Timeline Line */}
            {showConnector && !isLast && (
              <div
                style={{
                  position: 'absolute',
                  left: 14,
                  top: 32,
                  bottom: -16,
                  width: 2,
                  background: event.status === 'completed' || event.status === 'selected' 
                    ? '#22c55e' 
                    : 'var(--color-border)',
                  zIndex: 0,
                }}
              />
            )}

            {/* Icon */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: statusStyle.bg,
                color: statusStyle.text,
                border: `2px solid ${statusStyle.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 1,
                transition: 'all var(--transition-fast)',
              }}
            >
              {getStatusIcon(event.status)}
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: event.status === 'upcoming' ? 'var(--color-muted)' : 'var(--color-foreground)' }}>
                  {event.title}
                </h4>
                {event.date && (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 500 }}>
                    {event.date}
                  </span>
                )}
              </div>
              
              {event.description && (
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 4 }}>
                  {event.description}
                </p>
              )}
              
              {event.interviewer && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                  Interviewer: {event.interviewer}
                </p>
              )}

              {/* Status Badge */}
              {event.status === 'selected' && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: 'rgba(34,197,94,0.1)',
                    color: '#22c55e',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: 8,
                  }}
                >
                  <FiStar size={12} /> Selected
                </div>
              )}
              
              {event.status === 'rejected' && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: 8,
                  }}
                >
                  <FiXCircle size={12} /> Rejected
                </div>
              )}
              
              {event.status === 'hold' && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: 'rgba(245,158,11,0.1)',
                    color: '#f59e0b',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: 8,
                  }}
                >
                  <FiClock size={12} /> On Hold
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
