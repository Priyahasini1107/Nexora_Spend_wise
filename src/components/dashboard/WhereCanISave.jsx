import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, ChevronRight, HelpCircle } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/formatters';

export const WhereCanISave = () => {
  const { savingsAnalysis, currency, setSelectedSavingsCategory, setActiveTab } = useExpenses();
  const {
    opportunities,
    totalPotentialSavingsMin,
    totalPotentialSavingsMax,
    hasData
  } = savingsAnalysis;

  if (!hasData || opportunities.length === 0) {
    return (
      <div className="card" style={{ border: '1px dashed rgba(18, 20, 23, 0.15)', background: 'var(--bg-card-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'var(--accent-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Spending Disciplined
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              No anomalous discretionary spikes detected this cycle. Add more expenses to refresh recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Display top 2 opportunities in the dashboard widget
  const topOpportunities = opportunities.slice(0, 2);

  return (
    <div
      className="card"
      style={{
        border: '1.5px solid rgba(18, 20, 23, 0.08)',
        background: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative accent top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, var(--accent-lime) 0%, #121417 100%)'
        }}
      />

      {/* Header */}
      <div className="card-header" style={{ marginBottom: '16px', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-dark" style={{ background: 'var(--text-primary)', color: 'var(--accent-lime)' }}>
              <Sparkles size={12} />
              Where Can I Save?
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Data-Driven Suggestions
            </span>
          </div>
          <h3 className="card-title" style={{ fontSize: '1.2rem' }}>
            Saving Opportunities
          </h3>
        </div>

        {/* Total Estimated Savings Pill */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Potential Monthly Retention
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(totalPotentialSavingsMin, currency)} – {formatCurrency(totalPotentialSavingsMax, currency)}
          </div>
        </div>
      </div>

      {/* Opportunity Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {topOpportunities.map((opp, idx) => (
          <div
            key={idx}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-card-subtle)',
              border: 'var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'all var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CategoryIcon
                  icon={opp.categoryIcon}
                  color={opp.color}
                  size={20}
                  containerSize={42}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {opp.categoryName}
                    </span>
                    <span className="badge badge-subtle" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                      {opp.isDiscretionary ? 'Discretionary' : 'Essential'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <strong>{formatCurrency(opp.currentSpent, currency)}</strong> this month
                  </div>
                </div>
              </div>

              {opp.potentialMax > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Potential reduction:
                  </div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)', background: 'var(--accent-lime)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
                    {formatCurrency(opp.potentialMin, currency)} – {formatCurrency(opp.potentialMax, currency)}
                  </div>
                </div>
              )}
            </div>

            {/* Why was this identified? */}
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {opp.why}
            </p>

            {/* Action Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(18, 20, 23, 0.05)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Based on your actual trends
              </span>
              <button
                onClick={() => setSelectedSavingsCategory(opp)}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
              >
                View analysis
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer link to full intelligence page */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HelpCircle size={13} />
          Suggestions are mathematical calculations, not guaranteed financial advice.
        </p>

        <button
          onClick={() => setActiveTab('savings')}
          className="btn btn-primary btn-sm"
          style={{ fontSize: '0.82rem', padding: '6px 14px' }}
        >
          <span>All Savings Insights</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
