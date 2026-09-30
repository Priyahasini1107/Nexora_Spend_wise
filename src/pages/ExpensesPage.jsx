import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, ArrowUpDown, Calendar, Trash2, Edit2, Download } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryIcon } from '../components/common/CategoryIcon';
import { formatCurrency, formatDate } from '../utils/formatters';

export const ExpensesPage = () => {
  const {
    expenses,
    categories,
    currency,
    selectedMonth,
    selectedYear,
    openAddExpense,
    openEditExpense,
    deleteExpense
  } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc'

  // Filter expenses for current selected month/year
  const monthlyExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.expense_date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  // Apply search, filters, and sorting
  const filteredExpenses = useMemo(() => {
    return monthlyExpenses
      .filter(item => {
        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const descMatch = item.description.toLowerCase().includes(query);
          const notesMatch = item.notes?.toLowerCase().includes(query);
          if (!descMatch && !notesMatch) return false;
        }

        // Category filter
        if (selectedCategoryFilter !== 'all' && item.category_id !== selectedCategoryFilter) {
          return false;
        }

        // Payment method filter
        if (selectedPaymentFilter !== 'all' && item.payment_method !== selectedPaymentFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.expense_date) - new Date(a.expense_date);
        if (sortBy === 'date-asc') return new Date(a.expense_date) - new Date(b.expense_date);
        if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
        if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
        return 0;
      });
  }, [monthlyExpenses, searchQuery, selectedCategoryFilter, selectedPaymentFilter, sortBy]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const getCategoryDetails = (catId) => {
    return categories.find(c => c.id === catId) || {
      name: 'General',
      icon: 'Tag',
      color: '#6C757D'
    };
  };

  const handleExportCSV = () => {
    if (filteredExpenses.length === 0) return;
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method', 'Notes'];
    const rows = filteredExpenses.map(e => {
      const cat = getCategoryDetails(e.category_id);
      return [
        e.expense_date,
        `"${e.description.replace(/"/g, '""')}"`,
        `"${cat.name}"`,
        e.amount,
        e.payment_method || 'UPI',
        `"${(e.notes || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kuberpulse_expenses_${selectedYear}_${selectedMonth + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Title & Add CTA */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-subtitle">
            Manage, filter, and audit your personal expenses
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" title="Export CSV">
            <Download size={15} />
            <span style={{ display: 'none' }} className="hide-on-mobile">Export</span>
          </button>
          <button onClick={openAddExpense} className="btn btn-primary btn-sm">
            <Plus size={16} strokeWidth={2.6} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card card-compact" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ flex: '1 1 240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
            <input
              type="text"
              placeholder="Search by description or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>

          {/* Payment Method Filter */}
          <select
            value={selectedPaymentFilter}
            onChange={(e) => setSelectedPaymentFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '130px' }}
          >
            <option value="all">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
            <option value="NetBanking">Net Banking</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="date-desc">Date (Newest first)</option>
            <option value="date-asc">Date (Oldest first)</option>
            <option value="amount-desc">Amount (Highest first)</option>
            <option value="amount-asc">Amount (Lowest first)</option>
          </select>
        </div>

        {/* Category Filter Chips Horizontal Scroll */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none'
          }}
        >
          <button
            onClick={() => setSelectedCategoryFilter('all')}
            className={`chip-filter ${selectedCategoryFilter === 'all' ? 'active' : ''}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryFilter(cat.id)}
              className={`chip-filter ${selectedCategoryFilter === cat.id ? 'active' : ''}`}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{filteredExpenses.length}</strong> {filteredExpenses.length === 1 ? 'transaction' : 'transactions'}
        </span>
        <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Total: {formatCurrency(totalFilteredAmount, currency)}
        </span>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No expenses found
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Try adjusting your search query, changing filters, or record a new expense.
          </p>
          <button onClick={openAddExpense} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Add Expense</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredExpenses.map(expense => {
            const cat = getCategoryDetails(expense.category_id);

            return (
              <div
                key={expense.id}
                className="card card-compact"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                  <CategoryIcon icon={cat.icon} color={cat.color} size={20} containerSize={42} />

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p
                        style={{
                          fontSize: '0.96rem',
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {expense.description}
                      </p>
                      {cat.is_discretionary && (
                        <span className="badge badge-subtle" style={{ fontSize: '0.64rem', padding: '1px 6px' }}>
                          Discretionary
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {formatDate(expense.expense_date, 'full')}
                      </span>
                      <span className="badge badge-subtle" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {expense.payment_method || 'UPI'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        • {cat.name}
                      </span>
                      {expense.notes && (
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          "{expense.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatCurrency(expense.amount, currency)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => openEditExpense(expense)}
                      className="btn btn-secondary btn-icon"
                      style={{ width: '34px', height: '34px' }}
                      title="Edit expense"
                      aria-label="Edit expense"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${expense.description}"?`)) {
                          deleteExpense(expense.id);
                        }
                      }}
                      className="btn btn-danger btn-icon"
                      style={{ width: '34px', height: '34px' }}
                      title="Delete expense"
                      aria-label="Delete expense"
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
