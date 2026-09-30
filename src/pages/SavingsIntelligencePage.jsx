import React, { useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Sliders,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { formatCurrency } from '../utils/formatters';

export const SavingsIntelligencePage = () => {
  const {
    savingsAnalysis,
    currency,
    setSelectedSavingsCategory,
    openAddExpense
  } = useExpenses();

  const {
    opportunities,
    totalPotentialSavingsMin,
    totalPotentialSavingsMax,
    hasData
  } = savingsAnalysis;

  // Simulator State: reductions percentage for discretionary categories
  const [globalTrimPct, setGlobalTrimPct] = useState(15);

  const discretionaryOpportunities = opportunities.filter(o => o.isDiscretionary);
  const essentialNotices = opportunities.filter(o => !o.isDiscretionary);

  const simulatedMonthlyTotal = discretionaryOpportunities.reduce((sum, opp) => {
    return sum + Math.round(opp.currentSpent * (globalTrimPct / 100));
  }, 0);

  const simulatedYearlyTotal = simulatedMonthlyTotal * 12;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-dark">
              <Sparkles size={13} />
              Proprietary Engine
            </span>
          </div>
          <h1 className="page-title">Where Can I Save?</h1>
          <p className="page-subtitle">
            Tailored, explainable opportunities to optimize discretionary spending based on your recorded transactions
          </p>
        </div>
      </div>

      {/* Hero Intelligence Summary Banner */}
      <div
        className="card"
        style={{
          background: 'var(--text-primary)',
          color: '#FFFFFF',
          padding: '28px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212, 249, 56, 0.15)', color: 'var(--accent-lime)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: '14px' }}>
            <Sparkles size={14} />
            Data-Driven Savings Potential
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: '10px' }}>
            You could potentially retain{' '}
            <span style={{ color: 'var(--accent-lime)' }}>
              {formatCurrency(totalPotentialSavingsMin, currency)} – {formatCurrency(totalPotentialSavingsMax, currency)}
            </span>{' '}
            this month.
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, marginBottom: '20px' }}>
            Our deterministic engine analyzed your spending anomalies, category proportions, and month-over-month shifts. These opportunities prioritize discretionary comfort while preserving essential lifestyle needs.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-lime)' }} />
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
                {discretionaryOpportunities.length} Discretionary Optimizations
              </span>
            </div>
            {essentialNotices.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#45B7D1' }} />
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>
                  {essentialNotices.length} Essential Notice
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discretionary Opportunities List */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Identified Opportunities</span>
          <span className="badge badge-subtle">{opportunities.length} Total</span>
        </h3>

        {!hasData || opportunities.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <ShieldCheck size={36} color="var(--accent-lime)" style={{ margin: '0 auto 12px auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Your Spending is Currently Balanced
            </h4>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 18px auto' }}>
              No categories have exceeded baseline benchmarks or spiked significantly. Record more everyday expenses to monitor changes.
            </p>
            <button onClick={openAddExpense} className="btn btn-primary btn-sm">
              + Add Expense
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  border: opp.isDiscretionary ? '1.5px solid rgba(18, 20, 23, 0.08)' : '1px solid rgba(18, 20, 23, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <CategoryIcon icon={opp.categoryIcon} color={opp.color} size={22} containerSize={46} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {opp.categoryName}
                        </h4>
                        <span className={`badge ${opp.isDiscretionary ? 'badge-lime' : 'badge-subtle'}`}>
                          {opp.isDiscretionary ? 'Discretionary' : 'Essential'}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Current Outflow: <strong>{formatCurrency(opp.currentSpent, currency)}</strong>
                        {opp.prevSpent > 0 && ` (vs ${formatCurrency(opp.prevSpent, currency)} last month)`}
                      </p>
                    </div>
                  </div>

                  {opp.potentialMax > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                        Potential Reduction:
                      </span>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', background: 'var(--accent-lime)', padding: '2px 10px', borderRadius: 'var(--radius-sm)' }}>
                        {formatCurrency(opp.potentialMin, currency)} – {formatCurrency(opp.potentialMax, currency)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Explainable Why Container */}
                <div style={{ background: 'var(--bg-card-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: 'var(--border-light)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Why this was identified:
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    {opp.why}
                  </p>
                </div>

                {/* Practical Suggestion */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ color: 'var(--color-warning)', marginTop: '2px' }}>
                    <Info size={16} />
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    <strong>Actionable tip:</strong> {opp.suggestion}
                  </p>
                </div>

                {/* Interactive Drilldown CTA */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: 'var(--border-light)' }}>
                  <button
                    onClick={() => setSelectedSavingsCategory(opp)}
                    className="btn btn-outline btn-sm"
                  >
                    <span>View Deep Analysis & Calculator</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Savings Simulator */}
      {discretionaryOpportunities.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <div>
              <h3 className="card-title">
                <Sliders size={20} />
                Interactive Savings Simulator
              </h3>
              <p className="card-subtitle">
                Test the compounding effect of trimming discretionary spending
              </p>
            </div>
            <span className="badge badge-dark">
              Simulation
            </span>
          </div>

          <div style={{ maxWidth: '540px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                Target Discretionary Trim:
              </label>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {globalTrimPct}%
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={globalTrimPct}
              onChange={(e) => setGlobalTrimPct(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>5% (Gentle)</span>
              <span>15% (Balanced)</span>
              <span>25% (Ambitious)</span>
              <span>40% (Aggressive)</span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card-subtle)',
              border: 'var(--border-light)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Projected Monthly Savings
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
                +{formatCurrency(simulatedMonthlyTotal, currency)}
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Extra cash retained per month
              </p>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Annualized Wealth Addition
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                +{formatCurrency(simulatedYearlyTotal, currency)}
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Compounded over 12 months
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Explanatory Policy Note */}
      <div style={{ padding: '16px 20px', borderRadius: 'var(--radius-lg)', background: 'rgba(18, 20, 23, 0.04)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <HelpCircle size={18} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong>Transparency Notice:</strong> All savings recommendations are generated through deterministic statistical heuristics comparing your current month outflows with previous month baselines and category caps. Suggestions are non-binding ideas designed to empower your financial decisions.
        </p>
      </div>
    </div>
  );
};
