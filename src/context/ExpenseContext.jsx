import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { expenseService } from '../services/expenseService';
import { incomeService } from '../services/incomeService';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { calculateFinancialSummary, calculateCategoryBreakdown, calculateMonthComparison, generateSmartInsights } from '../utils/analyticsEngine';
import { analyzeSavingsOpportunities } from '../utils/recommendationEngine';
import { DEFAULT_CATEGORIES } from '../lib/constants';

const ExpenseContext = createContext(null);

export const ExpenseProvider = ({ children }) => {
  const { user, profile, isLiveSupabase, isLiveSession } = useAuth();
  const isLive = Boolean(isLiveSession && user?.id && user.id !== 'usr_demo_8829');

  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // Time navigation
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedSavingsCategory, setSelectedSavingsCategory] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch all user records
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [expData, incData, budData, catData] = await Promise.all([
        expenseService.getAll(user?.id, isLive),
        incomeService.getAll(user?.id, isLive),
        budgetService.getAll(user?.id, isLive),
        categoryService.getAll(user?.id, isLive)
      ]);

      setExpenses(expData || []);
      setIncome(incData || []);
      setBudgets(budData || []);
      setCategories(catData || DEFAULT_CATEGORIES);
    } catch (err) {
      console.error('Failed to load expense data:', err);
      showToast('Error syncing latest financial data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id, isLive, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currency = profile?.currency || 'INR';

  // Computed Financial Metrics
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary({
      expenses,
      income,
      budgets,
      month: selectedMonth,
      year: selectedYear
    });
  }, [expenses, income, budgets, selectedMonth, selectedYear]);

  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown({
      expenses,
      categories,
      month: selectedMonth,
      year: selectedYear
    });
  }, [expenses, categories, selectedMonth, selectedYear]);

  const monthComparison = useMemo(() => {
    return calculateMonthComparison({
      expenses,
      categories,
      month: selectedMonth,
      year: selectedYear
    });
  }, [expenses, categories, selectedMonth, selectedYear]);

  // "WHERE CAN I SAVE?" Intelligence
  const savingsAnalysis = useMemo(() => {
    return analyzeSavingsOpportunities({
      expenses,
      categories,
      budgets,
      currentMonth: selectedMonth,
      currentYear: selectedYear,
      currency
    });
  }, [expenses, categories, budgets, selectedMonth, selectedYear, currency]);

  const smartInsights = useMemo(() => {
    return generateSmartInsights({
      expenses,
      income,
      categories,
      month: selectedMonth,
      year: selectedYear
    });
  }, [expenses, income, categories, selectedMonth, selectedYear]);

  // CRUD Actions - Expenses
  const addExpense = async (data) => {
    try {
      const newExp = await expenseService.create(data, user?.id, isLive);
      setExpenses(prev => [newExp, ...prev]);
      showToast('Expense added successfully');
      return newExp;
    } catch (err) {
      showToast(err.message || 'Failed to add expense', 'error');
      throw err;
    }
  };

  const updateExpense = async (id, updates) => {
    try {
      const updated = await expenseService.update(id, updates, user?.id, isLive);
      setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updated } : e)));
      showToast('Expense updated');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update expense', 'error');
      throw err;
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expenseService.delete(id, user?.id, isLive);
      setExpenses(prev => prev.filter(e => e.id !== id));
      showToast('Expense removed');
    } catch (err) {
      showToast('Failed to delete expense', 'error');
      throw err;
    }
  };

  // CRUD Actions - Income
  const addIncome = async (data) => {
    try {
      const newInc = await incomeService.create(data, user?.id, isLive);
      setIncome(prev => [newInc, ...prev]);
      showToast('Income added successfully');
      return newInc;
    } catch (err) {
      showToast(err.message || 'Failed to add income', 'error');
      throw err;
    }
  };

  const updateIncome = async (id, updates) => {
    try {
      const updated = await incomeService.update(id, updates, user?.id, isLive);
      setIncome(prev => prev.map(i => (i.id === id ? { ...i, ...updated } : i)));
      showToast('Income updated');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update income', 'error');
      throw err;
    }
  };

  const deleteIncome = async (id) => {
    try {
      await incomeService.delete(id, user?.id, isLive);
      setIncome(prev => prev.filter(i => i.id !== id));
      showToast('Income removed');
    } catch (err) {
      showToast('Failed to delete income', 'error');
      throw err;
    }
  };

  // CRUD Actions - Budgets
  const saveBudget = async (budgetData) => {
    try {
      await budgetService.upsert(budgetData, user?.id, isLive);
      // Reload budgets to get accurate list
      const updatedBudgets = await budgetService.getAll(user?.id, isLive);
      setBudgets(updatedBudgets);
      showToast('Budget saved successfully');
    } catch (err) {
      showToast(err.message || 'Failed to save budget', 'error');
      throw err;
    }
  };

  // Modal open helpers
  const openAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const openEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const openAddIncome = () => {
    setEditingIncome(null);
    setIsIncomeModalOpen(true);
  };

  const openEditIncome = (incomeRecord) => {
    setEditingIncome(incomeRecord);
    setIsIncomeModalOpen(true);
  };

  const closeIncomeModal = () => {
    setIsIncomeModalOpen(false);
    setEditingIncome(null);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        income,
        budgets,
        categories,
        loading,
        currency,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        activeTab,
        setActiveTab,
        // Modals
        isExpenseModalOpen,
        editingExpense,
        openAddExpense,
        openEditExpense,
        closeExpenseModal,
        isIncomeModalOpen,
        editingIncome,
        openAddIncome,
        openEditIncome,
        closeIncomeModal,
        isBudgetModalOpen,
        setIsBudgetModalOpen,
        selectedSavingsCategory,
        setSelectedSavingsCategory,
        // Toasts
        toasts,
        showToast,
        removeToast,
        // Computed metrics
        financialSummary,
        categoryBreakdown,
        monthComparison,
        savingsAnalysis,
        smartInsights,
        // Handlers
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        saveBudget,
        refreshData: loadData
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};
