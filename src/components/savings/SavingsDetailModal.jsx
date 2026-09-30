import React, { useState } from 'react';
import { X, Sparkles, TrendingDown, Lightbulb, Calculator, HelpCircle } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/formatters';

export const SavingsDetailModal = () => {
  const {
    selectedSavingsCategory,
    setSelectedSavingsCategory,
    currency
  } = useExpenses();

  const [trimPercent, setTrimPercent] = useState(20);

  if (!selectedSavingsCategory) return null;

  const opp = selectedSavingsCategory;
  const simulatedMonthlySavings = Math.round(opp.currentSpent * (trimPercent / 100));
  const simulatedYearlySavings = simulatedMonthlySavings * 12;

  return (
    <div
      className="modal-overlay as-bottom-sheet"
      onClick={() => setSelectedSavingsCategory(null)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '24px 20px', maxWidth: '580px' }}
      >
        <div className="sheet-handle-bar" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CategoryIcon icon={opp.categoryIcon} color={opp.color} size={22} containerSize={44} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {opp.categoryName}
                </h2>
                <span className="badge badge-lime">
                  {opp.isDiscretionary ? 'Discretionary' : 'Essential'}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Detailed savings breakdown & potential retention
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedSavingsCategory(null)}
            className="btn btn-secondary btn-icon"
            style={{ width: '36px', height: '36px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Overview Numbers Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-card-subtle)',
            border: 'var(--border-light)',
            marginBottom: '18px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Current Spend
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatCurrency(opp.currentSpent, currency)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Previous Month
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
              {formatCurrency(opp.prevSpent, currency)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Target Savings
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-success)' }}>
              {formatCurrency(opp.potentialMin, currency)} – {formatCurrency(opp.potentialMax, currency)}
            </div>
          </div>
        </div>

        {/* Why was this identified? */}
        <div style={{ marginBottom: '18px' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="var(--text-primary)" />
            Why was this category flagged?
          </h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(18, 20, 23, 0.03)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            {opp.why}
          </p>
        </div>

        {/* Actionable Suggestions */}
        <div style={{ marginBottom: '22px' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={16} color="var(--color-warning)" />
            Actionable Optimization Suggestion
          </h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--color-warning-bg)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '12px 14px', borderRadius: 'var(--radius-md)' }}>
            {opp.suggestion}
          </p>
        </div>

        {/* Interactive "What-If" Savings Calculator */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--text-primary)',
            color: '#FFFFFF',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.86rem', fontWeight: 700 }}>
              <Calculator size={16} color="var(--accent-lime)" />
              What-If Savings Simulator
            </div>
            <span className="badge badge-lime">
              Trim {trimPercent}%
            </span>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={trimPercent}
              onChange={(e) => setTrimPercent(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent-lime)',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
              <span>5% Light trim</span>
              <span>25% Moderate</span>
              <span>50% Aggressive</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)' }}>
                Monthly Saved
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-lime)' }}>
                +{formatCurrency(simulatedMonthlySavings, currency)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)' }}>
                Annualized Wealth
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
                +{formatCurrency(simulatedYearlySavings, currency)}/yr
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4, marginBottom: '18px' }}>
          * Suggestions are algorithmic projections based on your tracked expense habits. You retain complete control over your spending choices.
        </p>

        <button
          onClick={() => setSelectedSavingsCategory(null)}
          className="btn btn-secondary btn-full"
        >
          Done
        </button>
      </div>
    </div>
  );
};
