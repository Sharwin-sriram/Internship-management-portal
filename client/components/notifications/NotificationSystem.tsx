'use client';

import React, { useState, useEffect } from 'react';
import { FiBell, FiX, FiCalendar, FiClock, FiVideo, FiPhone, FiMapPin, FiCheck, FiAlertCircle } from 'react-icons/fi';

export interface Notification {
  id: string;
  type: 'interview' | 'reminder' | 'update' | 'alert';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
  interviewDetails?: {
    date: string;
    time: string;
    type: 'video' | 'phone' | 'in-person';
    meetingLink?: string;
    location?: string;
  };
}

interface NotificationSystemProps {
  userId?: string;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<Notification | null>(null);

  useEffect(() => {
    // Mock notifications - in production, fetch from API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'interview',
        title: 'Interview Invitation',
        message: 'You have a new interview invitation from TechGlobal',
        time: '5 minutes ago',
        read: false,
        actionUrl: '/dashboard/student/interviews',
        interviewDetails: {
          date: '2026-05-24',
          time: '02:00 PM',
          type: 'video',
          meetingLink: 'https://meet.google.com/abc-defg-hij',
        },
      },
      {
        id: '2',
        type: 'reminder',
        title: 'Interview Reminder',
        message: 'Your interview with Acme Corp is in 24 hours',
        time: '1 hour ago',
        read: false,
        actionUrl: '/dashboard/student/interviews',
        interviewDetails: {
          date: '2026-05-23',
          time: '10:00 AM',
          type: 'in-person',
          location: '123 Tech Street',
        },
      },
      {
        id: '3',
        type: 'update',
        title: 'Application Status Update',
        message: 'Your application for Data Analyst Intern has been shortlisted',
        time: '2 hours ago',
        read: true,
        actionUrl: '/dashboard/applications',
      },
      {
        id: '4',
        type: 'alert',
        title: 'Reschedule Request',
        message: 'A candidate has requested to reschedule their interview',
        time: '3 hours ago',
        read: false,
        actionUrl: '/dashboard/company/interviews',
      },
    ];

    setNotifications(mockNotifications);

    // Simulate popup notification
    const timer = setTimeout(() => {
      if (mockNotifications[0] && !mockNotifications[0].read) {
        setCurrentPopup(mockNotifications[0]);
        setShowPopup(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const dismissPopup = () => {
    setShowPopup(false);
    if (currentPopup) {
      markAsRead(currentPopup.id);
    }
    setCurrentPopup(null);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'interview':
        return <FiCalendar size={20} />;
      case 'reminder':
        return <FiClock size={20} />;
      case 'update':
        return <FiCheck size={20} />;
      case 'alert':
        return <FiAlertCircle size={20} />;
      default:
        return <FiBell size={20} />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'interview':
        return { bg: 'rgba(34,151,250,0.1)', text: '#2297FA', border: '#2297FA' };
      case 'reminder':
        return { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', border: '#f59e0b' };
      case 'update':
        return { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', border: '#22c55e' };
      case 'alert':
        return { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: '#ef4444' };
      default:
        return { bg: 'var(--color-background)', text: 'var(--color-muted)', border: 'var(--color-border)' };
    }
  };

  const getInterviewIcon = (type: 'video' | 'phone' | 'in-person') => {
    switch (type) {
      case 'video':
        return <FiVideo size={14} />;
      case 'phone':
        return <FiPhone size={14} />;
      case 'in-person':
        return <FiMapPin size={14} />;
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-foreground)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <FiBell size={20} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#ef4444',
                color: 'white',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--color-surface)',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notification Dropdown */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 380,
              maxHeight: 500,
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: 'var(--space-md)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--color-background)',
              }}
            >
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius)',
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-muted)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-border)';
                    e.currentTarget.style.color = 'var(--color-foreground)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-muted)';
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div style={{ overflowY: 'auto', maxHeight: 400 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-muted)' }}>
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => {
                  const colorStyle = getNotificationColor(notification.type);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                      style={{
                        padding: 'var(--space-md)',
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        background: notification.read ? 'transparent' : 'rgba(34,151,250,0.02)',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-background)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = notification.read ? 'transparent' : 'rgba(34,151,250,0.02)'; }}
                    >
                      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: colorStyle.bg,
                            color: colorStyle.text,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
                            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: notification.read ? 'var(--color-muted)' : 'var(--color-foreground)' }}>
                              {notification.title}
                            </h4>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                              {notification.time}
                            </span>
                          </div>
                          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 8 }}>
                            {notification.message}
                          </p>
                          {notification.interviewDetails && (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                padding: '4px 8px',
                                borderRadius: 'var(--radius)',
                                background: 'var(--color-background)',
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-muted)',
                              }}
                            >
                              {getInterviewIcon(notification.interviewDetails.type)}
                              <span>{notification.interviewDetails.date} at {notification.interviewDetails.time}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: 'var(--space-md)',
                borderTop: '1px solid var(--color-border)',
                background: 'var(--color-background)',
              }}
            >
              <button
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: 'var(--radius)',
                  background: 'transparent',
                  border: 'none',
                  color: '#2297FA',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(34,151,250,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Popup Notification */}
      {showPopup && currentPopup && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            width: 380,
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 2000,
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div style={{ padding: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'rgba(34,151,250,0.1)',
                  color: '#2297FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {getNotificationIcon(currentPopup.type)}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginBottom: 4 }}>
                  {currentPopup.title}
                </h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
                  {currentPopup.message}
                </p>
              </div>
              <button
                onClick={dismissPopup}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-background)'; e.currentTarget.style.color = 'var(--color-foreground)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-muted)'; }}
              >
                <FiX size={16} />
              </button>
            </div>
            {currentPopup.interviewDetails && (
              <div
                style={{
                  padding: 'var(--space-sm)',
                  borderRadius: 'var(--radius)',
                  background: 'var(--color-background)',
                  marginBottom: 'var(--space-md)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', marginBottom: 4 }}>
                  {getInterviewIcon(currentPopup.interviewDetails.type)}
                  <span>{currentPopup.interviewDetails.date} at {currentPopup.interviewDetails.time}</span>
                </div>
                {currentPopup.interviewDetails.meetingLink && (
                  <a
                    href={currentPopup.interviewDetails.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 'var(--font-size-sm', color: '#2297FA', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                onClick={dismissPopup}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: 'var(--radius)',
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-foreground)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; }}
              >
                Dismiss
              </button>
              {currentPopup.actionUrl && (
                <button
                  onClick={() => {
                    dismissPopup();
                    window.location.href = currentPopup.actionUrl!;
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: 'var(--radius)',
                    background: '#2297FA',
                    border: 'none',
                    color: 'white',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1e7acc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#2297FA'; }}
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default NotificationSystem;
