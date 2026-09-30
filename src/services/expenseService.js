import { supabase } from '../lib/supabase';
import { MOCK_EXPENSES } from '../lib/mockData';

const LOCAL_STORAGE_KEY = 'kuberpulse_expenses_cache';

const getLocalExpenses = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : MOCK_EXPENSES;
  } catch {
    return MOCK_EXPENSES;
  }
};

const setLocalExpenses = (expenses) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

export const expenseService = {
  async getAll(userId, isLive = false) {
    if (isLive && supabase && userId) {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    return getLocalExpenses();
  },

  async create(expenseData, userId, isLive = false) {
    if (isLive && supabase && userId && userId !== 'usr_demo_8829') {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .insert([{
            ...expenseData,
            user_id: userId,
            amount: Number(expenseData.amount)
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        if (err.message && err.message.toLowerCase().includes('row-level security')) {
          throw new Error('Please sign in to your Supabase account to save to the cloud, or use Demo Mode.');
        }
        throw err;
      }
    }

    // Local / Sandbox mode
    const localList = getLocalExpenses();
    const newExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      user_id: userId || 'usr_demo_8829',
      amount: Number(expenseData.amount),
      created_at: new Date().toISOString()
    };
    const updated = [newExpense, ...localList];
    setLocalExpenses(updated);
    return newExpense;
  },

  async update(id, updates, userId, isLive = false) {
    if (isLive && supabase && userId) {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          ...updates,
          amount: Number(updates.amount),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // Local / Sandbox mode
    const localList = getLocalExpenses();
    const updated = localList.map(item =>
      item.id === id ? { ...item, ...updates, amount: Number(updates.amount) } : item
    );
    setLocalExpenses(updated);
    return updated.find(item => item.id === id);
  },

  async delete(id, userId, isLive = false) {
    if (isLive && supabase && userId) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    }

    // Local / Sandbox mode
    const localList = getLocalExpenses();
    const filtered = localList.filter(item => item.id !== id);
    setLocalExpenses(filtered);
    return true;
  }
};
