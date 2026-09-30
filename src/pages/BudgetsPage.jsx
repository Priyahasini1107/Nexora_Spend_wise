import React from 'react';
import { Target, Plus, AlertTriangle, CheckCircle, Flame, Edit2 } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { formatCurrency, getMonthName } from '../utils/formatters';

export const BudgetsPage = () => {
  const {
    budgets,
    categories,
    expenses,
    currency,
    selectedMonth,
    selectedYear,
    setIsBudgetModalOpen
  } = useExpenses();

  const monthName = getMonthName(selectedMonth, 'long');

  // Overall budget
  const overallBudgetObj = budgets.find(b =>
    !b.category_id && b.month === (selectedMonth + 1) && b.year === selectedYear
  );

  // Category specific budgets
  const categoryBudgets = budgets.filter(b =>
    b.category_id && b.month === (selectedMonth + 1) && b.year === selectedYear
  );

  // Calculate current month expenses
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.expense_date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const totalSpent = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const getCategoryDetails = (catId) => {
    return categories.find(c => c.id === catId) || {
      name: 'Category',
      icon: 'Tag',
      color: '#6C757D'
    };
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets & Limits</h1>
          <p className="page-subtitle">
            Set and monitor monthly spending ceilings for {monthName} {selectedYear}
          </p>
        </div>

        <button onClick={() => setIsBudgetModalOpen(true)} className="btn btn-primary btn-sm">
          <Plus size={16} strokeWidth={2.6} />
          <span>Set / Edit Budget</span>
        </button>
      </div>

      {/* Main Overall Monthly Budget Card */}
      <div className="card" style={{ padding: '24px' }}>
        <div className="card-header" style={{ marginBottom: '14px' }}>
          <div>
            <span className="badge badge-dark" style={{ marginBottom: '6px' }}>
              Master Limit
            </span>
            <h3 className="card-title" style={{ fontSize: '1.3rem' }}>
              Overall Monthly Ceiling
            </h3>
          </div>

          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="btn btn-secondary btn-sm"
          >
            <Edit2 size={14} />
            <span>Configure</span>
          </button>
        </div>

        {overallBudgetObj ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: totalSpent > overallBudgetObj.amount ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                {formatCurrency(totalSpent, currency)}
              </span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                / {formatCurrency(overallBudgetObj.amount, currency)}
              </span>
            </div>

            {/* Progress bar */}
            {(() => {
              const pct = (totalSpent / overallBudgetObj.amount) * 100;
              const isOver = pct >= 100;
              const isClose = pct >= 80 && !isOver;

              return (
                <div style={{ marginBottom: '14px' }}>
                  <div className="progress-bar-track" style={{ height: '12px' }}>
                    <div
                      className={`progress-bar-fill ${isOver ? 'danger' : isClose ? 'warning' : 'accent'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                    <span>{pct.toFixed(0)}% consumed</span>
                    <span>
                      {isOver ? `Over budget by ${formatCurrency(totalSpent - overallBudgetObj.amount, currency)}` : `${formatCurrency(overallBudgetObj.amount - totalSpent, currency)} remaining`}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div style={{ padding: '20px 0' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              No master budget assigned for {monthName}. Setting one helps unlock daily safe spend recommendations.
            </p>
            <button onClick={() => setIsBudgetModalOpen(true)} className="btn btn-outline btn-sm">
              + Set {monthName} Budget
            </button>
          </div>
        )}
      </div>

      {/* Category Level Budgets */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Category-Specific Budgets
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {categoryBudgets.length} configured
          </span>
        </div>

        {categoryBudgets.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              You haven't added category-specific budget limits yet (e.g. Food & Dining limit: ₹5,000).
            </p>
            <button onClick={() => setIsBudgetModalOpen(true)} className="btn btn-primary btn-sm">
              + Add Category Budget
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {categoryBudgets.map(b => {
              const cat = getCategoryDetails(b.category_id);
              const spentInCat = monthExpenses
                .filter(e => e.category_id === b.category_id)
                .reduce((sum, e) => sum + Number(e.amount), 0);

              const pct = (spentInCat / b.amount) * 100;
              const isOver = pct >= 100;
              const isClose = pct >= 80 && !isOver;

              return (
                <div key={b.id} className="card card-compact" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CategoryIcon icon={cat.icon} color={cat.color} size={18} containerSize={36} />
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {cat.name}
                      </span>
                    </div>

                    <span className={`badge ${isOver ? 'badge-danger' : isClose ? 'badge-warning' : 'badge-success'}`}>
                      {isOver ? 'Over' : `${pct.toFixed(0)}%`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: isOver ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                      {formatCurrency(spentInCat, currency)}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      / {formatCurrency(b.amount, currency)}
                    </span>
                  </div>

                  <div className="progress-bar-track" style={{ height: '8px' }}>
                    <div
                      className={`progress-bar-fill ${isOver ? 'danger' : isClose ? 'warning' : 'accent'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    {isOver
                      ? `Exceeded by ${formatCurrency(spentInCat - b.amount, currency)}`
                      : `${formatCurrency(b.amount - spentInCat, currency)} left`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
