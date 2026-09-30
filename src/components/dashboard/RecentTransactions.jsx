import React from 'react';
import { Clock, ArrowRight, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { CategoryIcon } from '../common/CategoryIcon';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const RecentTransactions = () => {
  const {
    expenses,
    categories,
    currency,
    openEditExpense,
    deleteExpense,
    setActiveTab,
    openAddExpense
  } = useExpenses();

  // Get latest 5 expenses sorted by date
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date))
    .slice(0, 5);

  const getCategoryDetails = (catId) => {
    return categories.find(c => c.id === catId) || {
      name: 'General',
      icon: 'Tag',
      color: '#6C757D'
    };
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <Clock size={20} />
            Recent Transactions
          </h3>
          <p className="card-subtitle">
            Your latest recorded payments
          </p>
        </div>

        <button
          onClick={() => setActiveTab('expenses')}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.8rem', padding: '5px 12px' }}
        >
          View all
          <ArrowRight size={14} />
        </button>
      </div>

      {recentExpenses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 16px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            No transactions recorded yet.
          </p>
          <button onClick={openAddExpense} className="btn btn-primary btn-sm">
            + Record First Expense
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentExpenses.map(expense => {
            const cat = getCategoryDetails(expense.category_id);

            return (
              <div
                key={expense.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-card-subtle)',
                  border: 'var(--border-light)',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <CategoryIcon icon={cat.icon} color={cat.color} size={18} containerSize={38} />
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={expense.description}
                    >
                      {expense.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {formatDate(expense.expense_date, 'relative')}
                      </span>
                      <span className="badge badge-subtle" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                        {expense.payment_method || 'UPI'}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                        • {cat.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatCurrency(expense.amount, currency)}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => openEditExpense(expense)}
                      title="Edit expense"
                      aria-label="Edit expense"
                      style={{
                        padding: '6px',
                        color: 'var(--text-muted)',
                        borderRadius: 'var(--radius-xs)',
                        transition: 'color var(--transition-fast)'
                      }}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${expense.description}"?`)) {
                          deleteExpense(expense.id);
                        }
                      }}
                      title="Delete expense"
                      aria-label="Delete expense"
                      style={{
                        padding: '6px',
                        color: 'var(--text-muted)',
                        borderRadius: 'var(--radius-xs)',
                        transition: 'color var(--transition-fast)'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
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
