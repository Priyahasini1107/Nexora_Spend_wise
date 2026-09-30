import React from 'react';
import { Target, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency, getMonthName } from '../../utils/formatters';

export const BudgetProgress = () => {
  const {
    financialSummary,
    currency,
    selectedMonth,
    selectedYear,
    setIsBudgetModalOpen,
    setActiveTab
  } = useExpenses();

  const {
    totalExpense,
    overallBudget,
    budgetUsedPct,
    budgetStatus,
    daysRemaining,
    safeDailySpend
  } = financialSummary;

  const monthName = getMonthName(selectedMonth, 'long');

  if (!overallBudget) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="card-header" style={{ marginBottom: '12px' }}>
          <h3 className="card-title">
            <Target size={20} />
            {monthName} Budget
          </h3>
          <span className="badge badge-subtle">Not Set</span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Set a monthly spending ceiling to track consumption speed and prevent end-of-month deficits.
        </p>
        <button
          onClick={() => setIsBudgetModalOpen(true)}
          className="btn btn-primary btn-sm"
          style={{ alignSelf: 'flex-start' }}
        >
          Set Monthly Budget
        </button>
      </div>
    );
  }

  const remainingBudget = Math.max(0, overallBudget - totalExpense);
  const isExceeded = totalExpense > overallBudget;
  const isApproaching = budgetUsedPct >= 80 && !isExceeded;

  let statusBadgeClass = 'badge-success';
  let StatusIcon = CheckCircle;

  if (isExceeded) {
    statusBadgeClass = 'badge-danger';
    StatusIcon = Flame;
  } else if (isApproaching) {
    statusBadgeClass = 'badge-warning';
    StatusIcon = AlertTriangle;
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div className="card-header" style={{ marginBottom: '14px' }}>
          <div>
            <h3 className="card-title">
              <Target size={20} />
              {monthName} Budget
            </h3>
            <p className="card-subtitle">
              Total monthly allocation
            </p>
          </div>
          <span className={`badge ${statusBadgeClass}`}>
            <StatusIcon size={12} />
            {budgetStatus}
          </span>
        </div>

        {/* Spend Ratio Figures */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
          <span style={{ fontSize: '1.6rem', fontWeight: 800, color: isExceeded ? 'var(--color-danger)' : 'var(--text-primary)' }}>
            {formatCurrency(totalExpense, currency)}
          </span>
          <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            / {formatCurrency(overallBudget, currency)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-track" style={{ height: '10px', marginBottom: '14px' }}>
          <div
            className={`progress-bar-fill ${isExceeded ? 'danger' : isApproaching ? 'warning' : 'accent'}`}
            style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
          />
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card-subtle)',
            marginBottom: '14px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Remaining Budget
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: isExceeded ? 'var(--color-danger)' : 'var(--text-primary)' }}>
              {isExceeded ? `Over by ${formatCurrency(totalExpense - overallBudget, currency)}` : formatCurrency(remainingBudget, currency)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Safe Daily Spend ({daysRemaining} days)
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isExceeded ? '₹0/day' : `${formatCurrency(safeDailySpend, currency)}/day`}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: 'var(--border-light)' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          {budgetUsedPct.toFixed(0)}% consumed
        </span>
        <button
          onClick={() => setActiveTab('budgets')}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          Manage Limits
        </button>
      </div>
    </div>
  );
};
