import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, PieChart, ShieldCheck, CreditCard } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { formatCurrency, formatPercentage } from '../utils/formatters';

export const AnalyticsPage = () => {
  const {
    expenses,
    income,
    categories,
    financialSummary,
    categoryBreakdown,
    selectedMonth,
    selectedYear,
    currency
  } = useExpenses();

  const {
    totalIncome,
    totalExpense,
    balance,
    savingsRate
  } = financialSummary;

  // Discretionary vs Essential ratio calculation
  const { discretionaryTotal, essentialTotal, discretionaryPct, essentialPct } = useMemo(() => {
    let disc = 0;
    let ess = 0;

    categoryBreakdown.forEach(cat => {
      if (cat.is_discretionary) {
        disc += cat.amount;
      } else {
        ess += cat.amount;
      }
    });

    const total = disc + ess;
    return {
      discretionaryTotal: disc,
      essentialTotal: ess,
      discretionaryPct: total > 0 ? (disc / total) * 100 : 0,
      essentialPct: total > 0 ? (ess / total) * 100 : 0
    };
  }, [categoryBreakdown]);

  // Payment method distribution
  const paymentMethodsBreakdown = useMemo(() => {
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.expense_date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const map = {};
    monthExpenses.forEach(e => {
      const method = e.payment_method || 'UPI';
      map[method] = (map[method] || 0) + Number(e.amount);
    });

    const total = Object.values(map).reduce((sum, v) => sum + v, 0);
    return Object.entries(map).map(([method, amount]) => ({
      method,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }, [expenses, selectedMonth, selectedYear]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Spending Analytics</h1>
          <p className="page-subtitle">
            Visual breakdown of cash flow, category distribution, and behavioral trends
          </p>
        </div>
      </div>

      {/* Cash Flow Comparison: Inflow vs Outflow */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <TrendingUp size={20} />
              Income vs Expenses (Cash Flow)
            </h3>
            <p className="card-subtitle">
              Net balance surplus: <strong style={{ color: balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{formatCurrency(balance, currency)}</strong>
            </p>
          </div>
          <span className="badge badge-lime">
            {savingsRate.toFixed(1)}% Saved
          </span>
        </div>

        {/* Visual Dual Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--color-success)' }}>Total Inflow</span>
              <span>{formatCurrency(totalIncome, currency)}</span>
            </div>
            <div className="progress-bar-track" style={{ height: '14px' }}>
              <div
                className="progress-bar-fill"
                style={{ width: '100%', background: 'var(--color-success)' }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--color-danger)' }}>Total Outflow</span>
              <span>{formatCurrency(totalExpense, currency)}</span>
            </div>
            <div className="progress-bar-track" style={{ height: '14px' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: totalIncome > 0 ? `${Math.min((totalExpense / totalIncome) * 100, 100)}%` : '100%',
                  background: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Essential vs Discretionary & Payment Methods */}
      <div className="dashboard-grid">
        {/* Discretionary vs Essential Breakdown */}
        <div className="col-6">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <ShieldCheck size={20} />
                  Essential vs Discretionary
                </h3>
                <p className="card-subtitle">
                  Key driver for savings recommendations
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', height: '16px', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '18px' }}>
              <div
                style={{
                  width: `${essentialPct}%`,
                  background: '#2EC4B6',
                  transition: 'width 0.4s ease'
                }}
                title={`Essential: ${essentialPct.toFixed(0)}%`}
              />
              <div
                style={{
                  width: `${discretionaryPct}%`,
                  background: 'var(--accent-lime)',
                  transition: 'width 0.4s ease'
                }}
                title={`Discretionary: ${discretionaryPct.toFixed(0)}%`}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2EC4B6' }} />
                  Essential (Needs)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                  {formatCurrency(essentialTotal, currency)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {essentialPct.toFixed(0)}% of expenses
                </div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-lime-border)' }} />
                  Discretionary (Wants)
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                  {formatCurrency(discretionaryTotal, currency)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {discretionaryPct.toFixed(0)}% of expenses
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: 1.4 }}>
              💡 Rule of thumb: Keeping discretionary wants below 30% allows comfortable monthly wealth accumulation.
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="col-6">
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <CreditCard size={20} />
                  Payment Channels
                </h3>
                <p className="card-subtitle">
                  Where your payments originated
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paymentMethodsBreakdown.map(item => (
                <div key={item.method} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
                    <span style={{ fontWeight: 600 }}>{item.method}</span>
                    <span style={{ fontWeight: 700 }}>
                      {formatCurrency(item.amount, currency)} ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="progress-bar-track" style={{ height: '6px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${item.percentage}%`, background: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Category Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <PieChart size={20} />
            Full Category Matrix
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categoryBreakdown.map(cat => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card-subtle)',
                border: 'var(--border-light)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CategoryIcon icon={cat.icon} color={cat.color} size={18} containerSize={36} />
                <div>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cat.name}
                  </span>
                  <span className="badge badge-subtle" style={{ marginLeft: '8px', fontSize: '0.66rem' }}>
                    {cat.is_discretionary ? 'Discretionary' : 'Essential'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.96rem', fontWeight: 800 }}>
                  {formatCurrency(cat.amount, currency)}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {cat.percentage.toFixed(1)}% of total • {cat.count} txns
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
