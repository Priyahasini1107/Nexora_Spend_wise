import React from 'react';
import { PieChart } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency } from '../../utils/formatters';

export const CategoryBreakdown = () => {
  const { categoryBreakdown, currency, financialSummary, setActiveTab } = useExpenses();
  const { totalExpense } = financialSummary;

  if (categoryBreakdown.length === 0) {
    return (
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="card-header">
          <h3 className="card-title">
            <PieChart size={20} />
            Category Breakdown
          </h3>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            No category expenses recorded for this month yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <PieChart size={20} />
            Category Breakdown
          </h3>
          <p className="card-subtitle">
            {categoryBreakdown.length} active categories this month
          </p>
        </div>
        <button
          onClick={() => setActiveTab('expenses')}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          View all
        </button>
      </div>

      {/* Multi-segmented color bar preview */}
      <div
        style={{
          display: 'flex',
          height: '10px',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          marginBottom: '20px',
          background: 'rgba(18, 20, 23, 0.06)'
        }}
      >
        {categoryBreakdown.map(cat => (
          <div
            key={cat.id}
            title={`${cat.name}: ${cat.percentage.toFixed(1)}%`}
            style={{
              width: `${cat.percentage}%`,
              backgroundColor: cat.color,
              transition: 'width 0.4s ease'
            }}
          />
        ))}
      </div>

      {/* Itemized Categories List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {categoryBreakdown.slice(0, 5).map(cat => (
          <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CategoryIcon icon={cat.icon} color={cat.color} size={16} containerSize={32} />
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {cat.name}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    ({cat.count} txns)
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatCurrency(cat.amount, currency)}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '6px' }}>
                  {cat.percentage.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Individual Progress Track */}
            <div className="progress-bar-track" style={{ height: '6px' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
