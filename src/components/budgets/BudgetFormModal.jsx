import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { getMonthName } from '../../utils/formatters';

export const BudgetFormModal = () => {
  const {
    isBudgetModalOpen,
    setIsBudgetModalOpen,
    budgets,
    categories,
    selectedMonth,
    selectedYear,
    currency,
    saveBudget
  } = useExpenses();

  const [categoryId, setCategoryId] = useState(''); // '' means overall total budget
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Find if budget already exists for this selection
  useEffect(() => {
    const existing = budgets.find(b =>
      (b.category_id || '') === categoryId &&
      b.month === (selectedMonth + 1) &&
      b.year === selectedYear
    );

    if (existing) {
      setAmount(existing.amount.toString());
    } else {
      setAmount('');
    }
    setError('');
  }, [categoryId, budgets, selectedMonth, selectedYear, isBudgetModalOpen]);

  if (!isBudgetModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError('Please enter a valid positive budget ceiling');
      return;
    }

    setSubmitting(true);
    try {
      await saveBudget({
        category_id: categoryId || null,
        amount: num,
        month: selectedMonth + 1,
        year: selectedYear
      });
      setIsBudgetModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setSubmitting(false);
    }
  };

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div
      className="modal-overlay as-bottom-sheet"
      onClick={() => setIsBudgetModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '24px 20px' }}
      >
        <div className="sheet-handle-bar" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Set Monthly Budget
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Target for {getMonthName(selectedMonth, 'long')} {selectedYear}
            </p>
          </div>

          <button
            onClick={() => setIsBudgetModalOpen(false)}
            className="btn btn-secondary btn-icon"
            style={{ width: '36px', height: '36px' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Budget Scope: Overall or Category */}
          <div className="form-group">
            <label className="form-label">
              Budget Target Type
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="form-select"
            >
              <option value="">🎯 Overall Total Monthly Budget</option>
              <optgroup label="Or Specific Category Limit">
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Amount */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">
              Budget Limit Amount
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '16px',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)'
                }}
              >
                {currencySymbol}
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="25000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="form-input"
                style={{
                  paddingLeft: '38px',
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  height: '56px'
                }}
              />
            </div>
            {error && <span className="form-error">{error}</span>}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(false)}
              className="btn btn-secondary btn-full"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Set Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
