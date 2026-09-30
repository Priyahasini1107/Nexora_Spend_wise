import React from 'react';
import { Home, BarChart3, Plus, Sparkles, User } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';

export const MobileBottomNav = () => {
  const { activeTab, setActiveTab, openAddExpense, savingsAnalysis } = useExpenses();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {/* 1. Home / Dashboard */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        aria-label="Dashboard"
      >
        <Home size={22} strokeWidth={activeTab === 'dashboard' ? 2.6 : 2} />
        <span>Home</span>
      </button>

      {/* 2. Analytics */}
      <button
        onClick={() => setActiveTab('analytics')}
        className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
        aria-label="Analytics"
      >
        <BarChart3 size={22} strokeWidth={activeTab === 'analytics' ? 2.6 : 2} />
        <span>Analytics</span>
      </button>

      {/* 3. Center Floating Add Expense Button */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          onClick={openAddExpense}
          className="mobile-nav-add-btn"
          aria-label="Add Expense"
          title="Add Expense"
        >
          <Plus size={26} strokeWidth={3} />
        </button>
      </div>

      {/* 4. Insights / "Where Can I Save?" */}
      <button
        onClick={() => setActiveTab('savings')}
        className={`mobile-nav-item ${activeTab === 'savings' ? 'active' : ''}`}
        aria-label="Savings Opportunities"
        style={{ position: 'relative' }}
      >
        <Sparkles size={22} strokeWidth={activeTab === 'savings' ? 2.6 : 2} />
        <span>Save</span>
        {savingsAnalysis.opportunities.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '25%',
              width: '8px',
              height: '8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent-lime-border)'
            }}
          />
        )}
      </button>

      {/* 5. Profile */}
      <button
        onClick={() => setActiveTab('profile')}
        className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        aria-label="Profile and Settings"
      >
        <User size={22} strokeWidth={activeTab === 'profile' ? 2.6 : 2} />
        <span>Profile</span>
      </button>
    </nav>
  );
};
