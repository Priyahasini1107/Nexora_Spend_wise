import React from 'react';
import { ArrowUpDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export const MonthComparison = () => {
  const { monthComparison, currency } = useExpenses();
  const { totalChangePct, totalDiff, categoryChanges } = monthComparison;

  const isLower = totalDiff < 0;

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <ArrowUpDown size={20} />
            Month Comparison
          </h3>
          <p className="card-subtitle">
            Current spending vs previous month
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span
            className={`badge ${isLower ? 'badge-success' : totalDiff > 0 ? 'badge-danger' : 'badge-subtle'}`}
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
          >
            {isLower ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            Total: {formatPercentage(totalChangePct)}
          </span>
        </div>
      </div>

      {categoryChanges.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Need expenses across at least two months to display comparative shifts.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {categoryChanges.slice(0, 4).map(item => {
            const hasIncreased = item.diff > 0;
            const isZero = item.diff === 0;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  border: 'var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CategoryIcon icon={item.icon} color={item.color} size={15} containerSize={30} />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {formatCurrency(item.current, currency)} (vs {formatCurrency(item.previous, currency)})
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      color: hasIncreased
                        ? item.is_discretionary ? 'var(--color-danger)' : 'var(--text-primary)'
                        : 'var(--color-success)'
                    }}
                  >
                    {isZero ? (
                      <Minus size={13} />
                    ) : hasIncreased ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    {formatPercentage(item.changePct)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {hasIncreased ? '+' : ''}{formatCurrency(item.diff, currency)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
