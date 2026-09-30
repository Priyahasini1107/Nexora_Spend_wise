import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  ArrowDownCircle,
  BarChart3,
  Sparkles,
  PieChart,
  User,
  LogOut,
  Wallet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';

export const Sidebar = () => {
  const { user, profile, signOut, isLiveSupabase } = useAuth();
  const { activeTab, setActiveTab, savingsAnalysis } = useExpenses();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'income', label: 'Income', icon: ArrowDownCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    {
      id: 'savings',
      label: 'Where Can I Save?',
      icon: Sparkles,
      badge: savingsAnalysis.opportunities.length > 0 ? `${savingsAnalysis.opportunities.length}` : null,
      highlight: true
    },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'profile', label: 'Profile & Settings', icon: User }
  ];

  const displayName =
    (user?.id && user.id !== 'usr_demo_8829')
      ? (profile?.full_name && profile.full_name !== 'Arjun Sharma' ? profile.full_name : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'My Account'))
      : (profile?.full_name || 'Arjun Sharma');

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Wallet size={22} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="brand-text">KuberPulse</span>
            <span className="brand-badge">SaaS</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Expense & Savings AI
          </p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--accent-lime)' : 'var(--text-primary)',
                    color: isActive ? 'var(--text-primary)' : 'var(--accent-lime)'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile Summary & Logout */}
      <div className="sidebar-footer">
        <div
          className="user-profile-summary"
          onClick={() => setActiveTab('profile')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="avatar-circle">
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {profile?.currency || 'INR'} • {isLiveSupabase ? 'Supabase' : 'Demo Sandbox'}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              signOut();
            }}
            title="Log out"
            aria-label="Log out"
            style={{ color: 'var(--text-muted)', padding: '6px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
