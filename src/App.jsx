import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ExpenseProvider, useExpenses } from './context/ExpenseContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { IncomePage } from './pages/IncomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SavingsIntelligencePage } from './pages/SavingsIntelligencePage';
import { BudgetsPage } from './pages/BudgetsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';

import { ExpenseFormModal } from './components/expenses/ExpenseFormModal';
import { IncomeFormModal } from './components/income/IncomeFormModal';
import { BudgetFormModal } from './components/budgets/BudgetFormModal';
import { SavingsDetailModal } from './components/savings/SavingsDetailModal';

const AppContent = () => {
  const { user, loading } = useAuth();
  const { activeTab } = useExpenses();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          background: 'var(--bg-app)'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '4px solid rgba(18, 20, 23, 0.1)',
            borderTopColor: 'var(--text-primary)',
            animation: 'spin 0.8s linear infinite'
          }}
        />
        <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Loading your financial intelligence...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If user is not authenticated, show modern Auth page
  if (!user) {
    return <AuthPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'income':
        return <IncomePage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'savings':
        return <SavingsIntelligencePage />;
      case 'budgets':
        return <BudgetsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout>
      {renderActivePage()}

      {/* Global Modals & Bottom Sheets */}
      <ExpenseFormModal />
      <IncomeFormModal />
      <BudgetFormModal />
      <SavingsDetailModal />
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <AppContent />
      </ExpenseProvider>
    </AuthProvider>
  );
}
