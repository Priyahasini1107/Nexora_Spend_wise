import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Bot,
  Flame,
  Check,
  MessageSquare
} from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import {
  BUDGET_STRATEGIES,
  generateAIBudgetPlan
} from '../../utils/aiBudgetPlannerEngine';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/formatters';

export const AIBudgetPlanner = ({ onOpenAssistant }) => {
  const {
    income,
    expenses,
    categories,
    selectedMonth,
    selectedYear,
    currency,
    saveBudget,
    showToast,
    setActiveTab
  } = useExpenses();

  const { profile } = useAuth();

  const [selectedStrategyId, setSelectedStrategyId] = useState('habit-optimizer');
  const [applying, setApplying] = useState(false);

  // Compute the AI Budget Plan
  const plan = useMemo(() => {
    return generateAIBudgetPlan({
      income,
      expenses,
      categories,
      profile,
      strategyId: selectedStrategyId,
      month: selectedMonth,
      year: selectedYear,
      currency
    });
  }, [income, expenses, categories, profile, selectedStrategyId, selectedMonth, selectedYear, currency]);

  // Apply plan to user's active budgets in database
  const handleApplyPlan = async () => {
    setApplying(true);
    try {
      // 1. Save master overall budget
      await saveBudget({
        category_id: null,
        amount: plan.totalAllocatedBudget,
        month: selectedMonth + 1,
        year: selectedYear
      });

      // 2. Save top category specific budgets
      for (const alloc of plan.allocations) {
        await saveBudget({
          category_id: alloc.categoryId,
          amount: alloc.allocatedAmount,
          month: selectedMonth + 1,
          year: selectedYear
        });
      }

      showToast(`✨ AI Plan (${plan.strategy.name}) applied to your budgets!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to apply AI budget plan', 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div
      className="card"
      style={{
        border: '1.5px solid rgba(18, 20, 23, 0.1)',
        background: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top AI Gradient Accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #121417 0%, var(--accent-lime) 50%, #3A86FF 100%)'
        }}
      />

      {/* Header */}
      <div className="card-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              className="badge badge-dark"
              style={{
                background: 'var(--text-primary)',
                color: 'var(--accent-lime)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Bot size={13} />
              AI Budget Planner
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Deterministic & Adaptive
            </span>
          </div>

          <h3 className="card-title" style={{ fontSize: '1.25rem' }}>
            Smart Monthly Allocation
          </h3>
          <p className="card-subtitle">
            AI-calculated spending ceilings based on your real income and habits
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={onOpenAssistant}
            className="btn btn-secondary btn-sm"
            title="Ask AI Budget Advisor"
          >
            <MessageSquare size={14} />
            <span>Ask Advisor</span>
          </button>

          <button
            onClick={handleApplyPlan}
            className="btn btn-accent btn-sm"
            disabled={applying}
            style={{ fontWeight: 700 }}
          >
            <Sparkles size={14} />
            <span>{applying ? 'Applying Plan...' : 'Apply Plan to Budgets'}</span>
          </button>
        </div>
      </div>

      {/* Strategy Selector Pills */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '16px',
          scrollbarWidth: 'none'
        }}
      >
        {BUDGET_STRATEGIES.map(strat => {
          const isSelected = selectedStrategyId === strat.id;

          return (
            <button
              key={strat.id}
              onClick={() => setSelectedStrategyId(strat.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-full)',
                background: isSelected ? 'var(--text-primary)' : 'var(--bg-card-subtle)',
                color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                border: isSelected ? '1px solid var(--text-primary)' : 'var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)',
                cursor: 'pointer'
              }}
            >
              <span>{strat.name}</span>
              <span
                style={{
                  fontSize: '0.66rem',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'var(--accent-lime)' : 'rgba(18, 20, 23, 0.08)',
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 700
                }}
              >
                {strat.savingsPct}% Save
              </span>
            </button>
          );
        })}
      </div>

      {/* Plan High-Level Overview Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card-subtle)',
          border: 'var(--border-light)',
          marginBottom: '16px'
        }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Income Baseline
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {formatCurrency(plan.totalIncome, currency)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Suggested Budget Cap
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {formatCurrency(plan.totalAllocatedBudget, currency)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Projected Monthly Savings
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '2px' }}>
            +{formatCurrency(plan.targetSavings, currency)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Allocation Formula
          </div>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '4px' }}>
            {plan.strategy.needsPct}% Needs / {plan.strategy.wantsPct}% Wants
          </div>
        </div>
      </div>

      {/* AI Explanation Callout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(212, 249, 56, 0.15)',
          border: '1px solid rgba(186, 227, 37, 0.3)',
          marginBottom: '18px'
        }}
      >
        <Sparkles size={16} color="var(--text-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
          {plan.aiExplanation}
        </p>
      </div>

      {/* Suggested Category Targets Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recommended Category Ceilings</span>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Comparing against current month outflow
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {plan.allocations.slice(0, 6).map(alloc => {
            const hasOverspent = alloc.currentSpent > alloc.allocatedAmount;

            return (
              <div
                key={alloc.categoryId}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: '#FFFFFF',
                  border: 'var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CategoryIcon icon={alloc.categoryIcon} color={alloc.color} size={15} containerSize={28} />
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {alloc.categoryName}
                    </span>
                  </div>

                  <span
                    className={`badge ${hasOverspent ? 'badge-danger' : 'badge-subtle'}`}
                    style={{ fontSize: '0.68rem', padding: '2px 7px' }}
                  >
                    {hasOverspent ? 'Over Target' : 'On Track'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Spent: {formatCurrency(alloc.currentSpent, currency)}
                  </span>
                  <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Target: {formatCurrency(alloc.allocatedAmount, currency)}
                  </span>
                </div>

                <div className="progress-bar-track" style={{ height: '5px' }}>
                  <div
                    className={`progress-bar-fill ${hasOverspent ? 'danger' : 'accent'}`}
                    style={{
                      width: `${Math.min((alloc.currentSpent / Math.max(alloc.allocatedAmount, 1)) * 100, 100)}%`
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {alloc.recommendation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
