import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { calculateSpendingOverTime } from '../../utils/analyticsEngine';
import { formatCurrency } from '../../utils/formatters';

export const SpendingChart = () => {
  const { expenses, selectedMonth, selectedYear, currency } = useExpenses();
  const [period, setPeriod] = useState('month'); // 'week', 'month', '6months', 'year'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const points = useMemo(() => {
    return calculateSpendingOverTime({
      expenses,
      period,
      month: selectedMonth,
      year: selectedYear
    });
  }, [expenses, period, selectedMonth, selectedYear]);

  const totalPeriodSpend = points.reduce((sum, p) => sum + p.amount, 0);
  const highestSpend = Math.max(...points.map(p => p.amount), 0);

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with Title and Time Switcher */}
      <div className="card-header" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 className="card-title">
            <BarChart2 size={20} color="var(--text-primary)" />
            Spending Overview
          </h3>
          <p className="card-subtitle">
            Total {period === 'week' ? 'this week' : period === 'month' ? 'this month' : period === '6months' ? 'last 6 months' : 'this year'}:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalPeriodSpend, currency)}</strong>
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="tabs-pill-container" role="tablist" aria-label="Chart time period">
          {[
            { id: 'week', label: 'Week' },
            { id: 'month', label: 'Month' },
            { id: '6months', label: '6 Mo' },
            { id: 'year', label: 'Year' }
          ].map(tab => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={period === tab.id}
              onClick={() => setPeriod(tab.id)}
              className={`tab-pill ${period === tab.id ? 'active' : ''}`}
              style={{ fontSize: '0.78rem', padding: '5px 11px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Bar Chart Visualization */}
      <div style={{ flex: 1, minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '20px' }}>
        {/* Tooltip display */}
        <div style={{ height: '24px', textAlign: 'center', marginBottom: '8px' }}>
          {hoveredPoint ? (
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', background: 'var(--accent-lime)', padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>
              {hoveredPoint.label}: {formatCurrency(hoveredPoint.amount, currency)}
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Hover or tap any bar for detailed amounts
            </span>
          )}
        </div>

        {/* Bars Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '8px',
            height: '160px',
            borderBottom: '1px solid rgba(18, 20, 23, 0.08)',
            paddingBottom: '2px'
          }}
        >
          {points.map((point, index) => {
            const heightPercent = point.pctOfMax > 0 ? Math.max(point.pctOfMax, 4) : 2;
            const isHovered = hoveredPoint?.label === point.label;
            const isHighest = point.amount === highestSpend && point.amount > 0;

            return (
              <div
                key={index}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => setHoveredPoint(point)}
              >
                {/* Bar */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${heightPercent}%`,
                    background: isHighest
                      ? 'var(--accent-lime)'
                      : isHovered
                      ? 'var(--text-primary)'
                      : 'rgba(18, 20, 23, 0.12)',
                    borderRadius: '8px 8px 3px 3px',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    position: 'relative',
                    boxShadow: isHighest ? '0 4px 12px rgba(212, 249, 56, 0.35)' : 'none'
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', gap: '8px' }}>
          {points.map((point, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: hoveredPoint?.label === point.label ? 'var(--text-primary)' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {point.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
