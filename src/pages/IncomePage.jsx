import React, { useMemo } from 'react';
import { Plus, ArrowDownLeft, Trash2, Edit2, Wallet, Briefcase, TrendingUp } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const IncomePage = () => {
  const {
    income,
    currency,
    selectedMonth,
    selectedYear,
    openAddIncome,
    openEditIncome,
    deleteIncome
  } = useExpenses();

  const monthlyIncome = useMemo(() => {
    return income.filter(i => {
      const d = new Date(i.income_date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [income, selectedMonth, selectedYear]);

  const totalMonthlyIncome = monthlyIncome.reduce((sum, i) => sum + Number(i.amount), 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Income Management</h1>
          <p className="page-subtitle">
            Track salaries, client retainers, dividends, and allowances
          </p>
        </div>

        <button onClick={openAddIncome} className="btn btn-primary btn-sm">
          <Plus size={16} strokeWidth={2.6} />
          <span>Record Inflow</span>
        </button>
      </div>

      {/* Overview Stat Card */}
      <div className="card" style={{ background: 'var(--text-primary)', color: '#FFFFFF', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            Total Inflows for Current Month
          </span>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(212, 249, 56, 0.2)',
              color: 'var(--accent-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowDownLeft size={20} strokeWidth={2.5} />
          </div>
        </div>

        <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-lime)' }}>
          {formatCurrency(totalMonthlyIncome, currency)}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
          {monthlyIncome.length} stream{monthlyIncome.length === 1 ? '' : 's'} contributing to your active balance
        </p>
      </div>

      {/* Income Streams List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {monthlyIncome.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No income recorded for this month
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Record your salary or inflows to calculate your savings rate and net surplus.
            </p>
            <button onClick={openAddIncome} className="btn btn-primary btn-sm">
              <Plus size={16} />
              <span>Record Inflow</span>
            </button>
          </div>
        ) : (
          monthlyIncome.map(item => (
            <div
              key={item.id}
              className="card card-compact"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Briefcase size={20} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.source}
                    </p>
                    <span className="badge badge-success" style={{ fontSize: '0.66rem' }}>
                      Inflow
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.income_date, 'full')}
                    </span>
                    {item.description && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        • {item.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-success)' }}>
                  +{formatCurrency(item.amount, currency)}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => openEditIncome(item)}
                    className="btn btn-secondary btn-icon"
                    style={{ width: '34px', height: '34px' }}
                    title="Edit income"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove this income entry?`)) {
                        deleteIncome(item.id);
                      }
                    }}
                    className="btn btn-danger btn-icon"
                    style={{ width: '34px', height: '34px' }}
                    title="Delete income"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
