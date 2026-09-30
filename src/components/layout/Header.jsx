import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Cloud, Database, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { getGreeting, getMonthName } from '../../utils/formatters';

export const Header = () => {
  const { user, profile, isLiveSupabase } = useAuth();
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    openAddExpense,
    setActiveTab
  } = useExpenses();

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const displayName =
    (user?.id && user.id !== 'usr_demo_8829')
      ? (profile?.full_name && profile.full_name !== 'Arjun Sharma' ? profile.full_name : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend'))
      : (profile?.full_name || 'Arjun Sharma');
  const greeting = getGreeting();

  return (
    <header className="app-header">
      <div className="header-left">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {greeting}, {displayName}
            </h2>
            <span style={{ fontSize: '1.1rem' }}>👋</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Here is your spending & savings intelligence for {getMonthName(selectedMonth, 'long')}
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Month Selector Pill */}
        <div className="tabs-pill-container" style={{ background: '#FFFFFF', border: 'var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <button
            onClick={handlePrevMonth}
            style={{ padding: '6px 8px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center' }}
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.86rem', fontWeight: 700, padding: '0 8px', display: 'flex', alignItems: 'center' }}>
            {getMonthName(selectedMonth, 'short')} {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            style={{ padding: '6px 8px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center' }}
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Live Supabase vs Demo Sandbox Tag */}
        <div
          onClick={() => setActiveTab('profile')}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
          title={isLiveSupabase ? 'Connected to live Supabase DB' : 'Demo Sandbox Mode (Click to configure Supabase)'}
        >
          {isLiveSupabase ? (
            <span className="badge badge-success" style={{ display: 'inline-flex', padding: '6px 12px', gap: '6px' }}>
              <Cloud size={13} />
              <span style={{ display: 'none' }} className="hide-on-mobile">Supabase</span> Live
            </span>
          ) : (
            <span className="badge badge-lime" style={{ display: 'inline-flex', padding: '6px 12px', gap: '6px' }}>
              <Sparkles size={13} />
              Demo Mode
            </span>
          )}
        </div>

        {/* Desktop Quick Add Button */}
        <button
          onClick={openAddExpense}
          className="btn btn-primary btn-sm"
          style={{ display: 'none' }}
          id="desktop-header-add-btn"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Expense</span>
        </button>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .app-header {
            padding: 0 14px;
            height: 60px;
          }
          .header-left h2 {
            font-size: 0.96rem !important;
          }
          .header-left p {
            display: none !important;
          }
          .header-right {
            gap: 6px !important;
          }
          .header-right .tabs-pill-container {
            padding: 2px !important;
          }
          .header-right .tabs-pill-container span {
            font-size: 0.78rem !important;
            padding: 0 4px !important;
          }
        }
        @media (min-width: 768px) {
          #desktop-header-add-btn {
            display: inline-flex !important;
          }
          .hide-on-mobile {
            display: inline !important;
          }
        }
      `}</style>
    </header>
  );
};
