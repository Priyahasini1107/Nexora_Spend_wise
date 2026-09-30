import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, CreditCard, Tag } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { PAYMENT_METHODS } from '../../lib/constants';
import { CategoryIcon } from '../common/CategoryIcon';

export const ExpenseFormModal = () => {
  const {
    isExpenseModalOpen,
    editingExpense,
    closeExpenseModal,
    categories,
    currency,
    addExpense,
    updateExpense
  } = useExpenses();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount.toString());
      setDescription(editingExpense.description || '');
      setCategoryId(editingExpense.category_id || (categories[0]?.id || ''));
      setExpenseDate(editingExpense.expense_date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(editingExpense.payment_method || 'UPI');
      setNotes(editingExpense.notes || '');
    } else {
      setAmount('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setNotes('');
    }
    setErrors({});
  }, [editingExpense, categories, isExpenseModalOpen]);

  if (!isExpenseModalOpen) return null;

  const validate = () => {
    const errs = {};
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid positive expense amount';
    }
    if (!description.trim()) {
      errs.description = 'Please enter a description (e.g. Swiggy, Zara, Metro)';
    }
    if (!categoryId) {
      errs.categoryId = 'Please select a spending category';
    }
    if (!expenseDate) {
      errs.expenseDate = 'Please select a valid date';
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
        description: description.trim(),
        category_id: categoryId,
        expense_date: expenseDate,
        payment_method: paymentMethod,
        notes: notes.trim()
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
      } else {
        await addExpense(payload);
      }

      closeExpenseModal();
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
      onClick={closeExpenseModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '24px 20px' }}
      >
        <div className="sheet-handle-bar" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 id="modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Track personal expenditure & feed savings insights
            </p>
          </div>

          <button
            onClick={closeExpenseModal}
            className="btn btn-secondary btn-icon"
            style={{ width: '36px', height: '36px' }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Field with Big Currency Prefix */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-amount">
              Amount Spent
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
                id="expense-amount"
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

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-description">
              What was this for?
            </label>
            <input
              id="expense-description"
              type="text"
              placeholder="e.g. Swiggy dinner, Metro ticket, Zara shirt"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Category Picker Grid */}
          <div className="form-group">
            <label className="form-label">
              Category
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '8px',
                maxHeight: '160px',
                overflowY: 'auto',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                border: 'var(--border-light)',
                background: 'var(--bg-card-subtle)'
              }}
            >
              {categories.map((cat) => {
                const isSelected = categoryId === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--text-primary)' : '#FFFFFF',
                      color: isSelected ? 'var(--accent-lime)' : 'var(--text-primary)',
                      border: isSelected ? '2px solid var(--text-primary)' : 'var(--border-light)',
                      transition: 'all var(--transition-fast)',
                      cursor: 'pointer'
                    }}
                  >
                    <CategoryIcon
                      icon={cat.icon}
                      color={isSelected ? 'var(--accent-lime)' : cat.color}
                      size={16}
                      containerSize={28}
                    />
                    <span style={{ fontSize: '0.74rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
          </div>

          {/* Date and Payment Method Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="expense-date">
                Date
              </label>
              <input
                id="expense-date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="form-input"
              />
              {errors.expenseDate && <span className="form-error">{errors.expenseDate}</span>}
            </div>

            {/* Payment Method */}
            <div className="form-group">
              <label className="form-label" htmlFor="payment-method">
                Payment Method
              </label>
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="form-select"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="expense-notes">
              Notes (Optional)
            </label>
            <input
              id="expense-notes"
              type="text"
              placeholder="e.g. Split with Priya"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={closeExpenseModal}
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
              {submitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
