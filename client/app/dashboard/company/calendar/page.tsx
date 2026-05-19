'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { FiCalendar, FiClock, FiFilter, FiRefreshCw, FiPlus, FiChevronLeft, FiChevronRight, FiVideo, FiPhone, FiMapPin } from 'react-icons/fi';
import Button from '../../../../components/ui/Button';
import InterviewCard from '../../../../components/interviews/InterviewCard';
import * as interviewApi from '../../../../services/interviewApi';
import type { InterviewRecord } from '../../../../types/interview';
import { interviewCalendarDayKey, interviewToCardProps } from '../../../../lib/interviewMappers';
import { useProtectedRoute } from '../../../../hooks/useProtectedRoute';
import { useInterviewSocket } from '../../../../context/InterviewSocketContext';
import { useToast } from '../../../../context/ToastContext';

export default function CalendarDashboardPage() {
  useProtectedRoute(['company']);
  const { subscribe } = useInterviewSocket();
  const { showToast } = useToast();

  const [view, setView] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'video' | 'phone' | 'in-person'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'completed' | 'pending'>('all');
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [loadingCal, setLoadingCal] = useState(true);

  const loadInterviews = useCallback(async () => {
    setLoadingCal(true);
    try {
      const list = await interviewApi.listInterviewsLegacy();
      setRecords(list);
    } catch {
      showToast('Could not load interview schedule', 'error');
      setRecords([]);
    } finally {
      setLoadingCal(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  useEffect(() => {
    const off = subscribe('interview:scheduled', () => loadInterviews());
    return () => off();
  }, [subscribe, loadInterviews]);

  const filteredRecords = useMemo(() => {
    return records.filter((doc) => {
      if (filterType !== 'all' && doc.interview_type !== filterType) return false;
      if (filterStatus === 'all') return true;
      if (filterStatus === 'scheduled') return doc.status === 'scheduled' || doc.status === 'accepted';
      if (filterStatus === 'pending') return doc.status === 'pending' || doc.status === 'reschedule_requested';
      if (filterStatus === 'completed') return doc.status === 'completed';
      return true;
    });
  }, [records, filterType, filterStatus]);

  const filteredCards = useMemo(() => filteredRecords.map(interviewToCardProps), [filteredRecords]);

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getInterviewsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredRecords
      .filter((doc) => interviewCalendarDayKey(doc) === dateStr)
      .map(interviewToCardProps);
  };

  const [syncBusy, setSyncBusy] = useState(false);

  const syncFirstInterview = async () => {
    const first = records[0];
    if (!first?._id) {
      showToast("No interviews to sync yet", "info");
      return;
    }
    setSyncBusy(true);
    try {
      await interviewApi.syncGoogleCalendar(first._id);
      showToast("Calendar sync requested (check server Google credentials)", "success");
    } catch (e) {
      showToast("Calendar sync failed — configure Google env on server", "error");
    } finally {
      setSyncBusy(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 1400, margin: '0 auto', padding: 'var(--space-2xl) var(--space-lg)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-2xl)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(34,151,250,0.1)', color: '#2297FA', fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-sm)' }}>
          <FiCalendar size={14} /> Interview Calendar
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 'var(--space-xs)' }}>
              Interview Calendar
            </h1>
            <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-base)', fontWeight: 500 }}>
              Manage and track all scheduled interviews
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <Button variant="ghost" onClick={() => setShowFilters(!showFilters)} style={{ border: '1px solid var(--color-border)' }}>
              <FiFilter style={{ marginRight: 8 }} /> Filters
            </Button>
            <Button variant="ghost" onClick={() => setCurrentDate(new Date())} style={{ border: '1px solid var(--color-border)' }}>
              <FiRefreshCw style={{ marginRight: 8 }} /> Today
            </Button>
            <Link href="/dashboard/company/interviews/schedule" style={{ textDecoration: 'none' }}>
            <Button variant="primary" style={{ background: '#2297FA' }}>
              <FiPlus style={{ marginRight: 8 }} /> Schedule Interview
            </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', border: '1px solid var(--color-border)', marginBottom: 'var(--space-xl)', animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>
                Interview Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)', fontSize: 'var(--font-size-sm)' }}
              >
                <option value="all">All Types</option>
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
                <option value="in-person">In-person</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 8 }}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', background: 'var(--color-background)', fontSize: 'var(--font-size-sm)' }}
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-xl)' }}>
        <button
          onClick={() => setView('month')}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius)',
            background: view === 'month' ? '#2297FA' : 'var(--color-surface)',
            color: view === 'month' ? 'white' : 'var(--color-foreground)',
            border: view === 'month' ? 'none' : '1px solid var(--color-border)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          Month View
        </button>
        <button
          onClick={() => setView('week')}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius)',
            background: view === 'week' ? '#2297FA' : 'var(--color-surface)',
            color: view === 'week' ? 'white' : 'var(--color-foreground)',
            border: view === 'week' ? 'none' : '1px solid var(--color-border)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
        >
          Week View
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
        {/* Calendar Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-background)' }}>
          <button
            onClick={() => navigateMonth('prev')}
            style={{ padding: '8px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-border)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; }}
          >
            <FiChevronLeft />
          </button>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            style={{ padding: '8px', borderRadius: '50%', background: 'var(--color-surface)', border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-border)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-surface)'; }}
          >
            <FiChevronRight />
          </button>
        </div>

        {/* Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--color-border)' }}>
          {days.map((day) => (
            <div key={day} style={{ padding: '12px', textAlign: 'center', fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-muted)', background: 'var(--color-background)' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {getMonthDays(currentDate).map((day, index) => {
            const dayInterviews = getInterviewsForDay(day);
            const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
            
            return (
              <div
                key={index}
                style={{
                  minHeight: 120,
                  padding: 8,
                  borderBottom: index < 35 ? '1px solid var(--color-border)' : 'none',
                  borderRight: index % 7 !== 6 ? '1px solid var(--color-border)' : 'none',
                  background: isToday ? 'rgba(34,151,250,0.05)' : 'transparent',
                  transition: 'background var(--transition-fast)',
                }}
                className="hover:bg-gray-50"
                onMouseEnter={(e) => { if (!isToday) e.currentTarget.style.background = 'var(--color-background)'; }}
                onMouseLeave={(e) => { if (!isToday) e.currentTarget.style.background = 'transparent'; }}
              >
                {day && (
                  <>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 700,
                        marginBottom: 4,
                        background: isToday ? '#2297FA' : 'transparent',
                        color: isToday ? 'white' : 'var(--color-foreground)',
                      }}
                    >
                      {day}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {dayInterviews.slice(0, 2).map((interview) => (
                        <div
                          key={interview.id}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 500,
                            background: interview.interviewType === 'video' ? 'rgba(34,151,250,0.1)' : interview.interviewType === 'phone' ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)',
                            color: interview.interviewType === 'video' ? '#2297FA' : interview.interviewType === 'phone' ? '#f59e0b' : '#22c55e',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                          }}
                          title={`${interview.jobTitle} - ${interview.time}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {interview.interviewType === 'video' && <FiVideo size={10} />}
                            {interview.interviewType === 'phone' && <FiPhone size={10} />}
                            {interview.interviewType === 'in-person' && <FiMapPin size={10} />}
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {interview.time} - {interview.companyName}
                            </span>
                          </div>
                        </div>
                      ))}
                      {dayInterviews.length > 2 && (
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', fontWeight: 500 }}>
                          +{dayInterviews.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Interviews Section */}
      <div style={{ marginTop: 'var(--space-2xl)' }}>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiClock /> Upcoming Interviews
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--space-lg)' }}>
          {loadingCal && <p style={{ color: 'var(--color-muted)' }}>Loading schedule…</p>}
          {!loadingCal && filteredCards.slice(0, 4).map((interview) => {
            const { id, ...card } = interview;
            return <InterviewCard key={id} {...card} showActions={false} />;
          })}
        </div>
      </div>

      {/* Sync with Google Calendar */}
      <div style={{ marginTop: 'var(--space-2xl)', background: 'linear-gradient(135deg, #2297FA 0%, #8082D6 100%)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-2xl)', color: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 8 }}>
              Sync with Google Calendar
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
              Automatically sync your interview schedule with Google Calendar for seamless integration
            </p>
          </div>
          <Button variant="secondary" style={{ background: 'white', color: '#2297FA' }} onClick={syncFirstInterview} loading={syncBusy}>
            Sync next interview to Google
          </Button>
        </div>
      </div>
    </div>
  );
}
