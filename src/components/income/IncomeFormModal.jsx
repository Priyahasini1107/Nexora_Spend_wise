import React, { useState, useEffect } from 'react';
import { X, Check, ArrowDownLeft } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { INCOME_SOURCES } from '../../lib/constants';

export const IncomeFormModal = () => {
  const {
    isIncomeModalOpen,
    editingIncome,
    closeIncomeModal,
    currency,
    addIncome,
    updateIncome
  } = useExpenses();

  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('Salary');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingIncome) {
      setAmount(editingIncome.amount.toString());
      setSource(editingIncome.source || 'Salary');
      setIncomeDate(editingIncome.income_date || new Date().toISOString().split('T')[0]);
      setDescription(editingIncome.description || '');
    } else {
      setAmount('');
      setSource('Salary');
      setIncomeDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setErrors({});
  }, [editingIncome, isIncomeModalOpen]);

  if (!isIncomeModalOpen) return null;

  const validate = () => {
    const errs = {};
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid positive income amount';
    }
    if (!source) {
      errs.source = 'Please select an income source';
    }
    if (!incomeDate) {
      errs.incomeDate = 'Please select a date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        source,
        income_date: incomeDate,
        description: description.trim() || `${source} Inflow`
      };

      if (editingIncome) {
        await updateIncome(editingIncome.id, payload);
      } else {
        await addIncome(payload);
      }

      closeIncomeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div
      className="modal-overlay as-bottom-sheet"
      onClick={closeIncomeModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="income-modal-title"
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '24px 20px' }}
      >
        <div className="sheet-handle-bar" />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 id="income-modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {editingIncome ? 'Edit Income' : 'Record Inflow'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Track cash inflows to balance your monthly budget
            </p>
          </div>

          <button
            onClick={closeIncomeModal}
            className="btn btn-secondary btn-icon"
            style={{ width: '36px', height: '36px' }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="income-amount">
              Income Amount
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
                id="income-amount"
                type="number"
                step="any"
                inputMode="decimal"
                placeholder="0"
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
            {errors.amount && <span className="form-error">{errors.amount}</span>}
          </div>

          {/* Source */}
          <div className="form-group">
            <label className="form-label" htmlFor="income-source">
              Income Stream / Source
            </label>
            <select
              id="income-source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="form-select"
            >
              {INCOME_SOURCES.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="income-desc">
              Description / Notes
            </label>
            <input
              id="income-desc"
              type="text"
              placeholder="e.g. October Salary, UI Design Milestone 1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Date */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="income-date">
              Credit Date
            </label>
            <input
              id="income-date"
              type="date"
              value={incomeDate}
              onChange={(e) => setIncomeDate(e.target.value)}
              className="form-input"
            />
            {errors.incomeDate && <span className="form-error">{errors.incomeDate}</span>}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={closeIncomeModal}
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
              {submitting ? 'Saving...' : editingIncome ? 'Update Inflow' : 'Save Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
