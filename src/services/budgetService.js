import { supabase } from '../lib/supabase';
import { MOCK_BUDGETS } from '../lib/mockData';

const LOCAL_STORAGE_KEY = 'kuberpulse_budgets_cache';

const getLocalBudgets = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : MOCK_BUDGETS;
  } catch {
    return MOCK_BUDGETS;
  }
};

const setLocalBudgets = (budgets) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(budgets));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

export const budgetService = {
  async getAll(userId, isLive = false) {
    if (isLive && supabase && userId) {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    }

    return getLocalBudgets();
  },

  async upsert(budgetData, userId, isLive = false) {
    if (isLive && supabase && userId && userId !== 'usr_demo_8829') {
      try {
        const { data, error } = await supabase
          .from('budgets')
          .upsert([{
            ...budgetData,
            user_id: userId,
            amount: Number(budgetData.amount),
            updated_at: new Date().toISOString()
          }], { onConflict: 'user_id, category_id, month, year' })
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

    const localList = getLocalBudgets();
    const existingIndex = localList.findIndex(b =>
      (b.category_id || null) === (budgetData.category_id || null) &&
      b.month === budgetData.month &&
      b.year === budgetData.year
    );

    let updated;
    if (existingIndex >= 0) {
      updated = [...localList];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...budgetData,
        amount: Number(budgetData.amount)
      };
    } else {
      const newBudget = {
        ...budgetData,
        id: `bud-${Date.now()}`,
        user_id: userId || 'usr_demo_8829',
        amount: Number(budgetData.amount)
      };
      updated = [...localList, newBudget];
    }

    setLocalBudgets(updated);
    return budgetData;
  },

  async delete(id, userId, isLive = false) {
    if (isLive && supabase && userId) {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    }

    const localList = getLocalBudgets();
    const filtered = localList.filter(item => item.id !== id);
    setLocalBudgets(filtered);
    return true;
  }
};
