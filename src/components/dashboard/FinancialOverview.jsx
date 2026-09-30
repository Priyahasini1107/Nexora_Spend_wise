import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, PiggyBank, Percent } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { AnimatedCounter } from '../common/AnimatedCounter';

export const FinancialOverview = () => {
  const { financialSummary, currency, openAddIncome, openAddExpense } = useExpenses();
  const {
    totalIncome,
    totalExpense,
    balance,
    savings,
    savingsRate,
    expenseChangePct
  } = financialSummary;

  const isSavingsPositive = balance >= 0;

  return (
    <section aria-label="Financial Summary Cards" style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Card 1: Monthly Income */}
        <div className="card card-compact" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Total Income
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-success)'
                }}
              >
                <ArrowDownLeft size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              <AnimatedCounter value={totalIncome} currency={currency} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: 'var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Recorded inflows
            </span>
            <button
              onClick={openAddIncome}
              className="btn btn-outline btn-sm"
              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            >
              + Add
            </button>
          </div>
        </div>

        {/* Card 2: Total Expenses */}
        <div className="card card-compact" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Total Expenses
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-danger)'
                }}
              >
                <ArrowUpRight size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              <AnimatedCounter value={totalExpense} currency={currency} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: 'var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: expenseChangePct > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>
              {expenseChangePct !== 0 ? `${expenseChangePct > 0 ? '↑' : '↓'} ${Math.abs(expenseChangePct).toFixed(1)}% vs prev mo` : 'Current month'}
            </span>
            <button
              onClick={openAddExpense}
              className="btn btn-outline btn-sm"
              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            >
              + Expense
            </button>
          </div>
        </div>

        {/* Card 3: Remaining Balance */}
        <div className="card card-compact" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Net Balance
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-info)'
                }}
              >
                <Wallet size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: isSavingsPositive ? 'var(--text-primary)' : 'var(--color-danger)'
              }}
            >
              <AnimatedCounter value={balance} currency={currency} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: 'var(--border-light)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Status
            </span>
            <span className={`badge ${isSavingsPositive ? 'badge-success' : 'badge-danger'}`}>
              {isSavingsPositive ? 'Surplus' : 'Deficit'}
            </span>
          </div>
        </div>

        {/* Card 4: Savings Amount & Rate (Highlighted in Lime) */}
        <div
          className="card card-compact"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--text-primary)',
            color: '#FFFFFF'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.7)' }}>
                Savings & Retention
              </span>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(212, 249, 56, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-lime)'
                }}
              >
                <PiggyBank size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--accent-lime)' }}>
              <AnimatedCounter value={savings} currency={currency} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Savings Rate
            </span>
            <span className="badge badge-lime">
              {savingsRate.toFixed(1)}% Saved
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
