import { supabase } from '../lib/supabase';
import { MOCK_INCOME } from '../lib/mockData';

const LOCAL_STORAGE_KEY = 'kuberpulse_income_cache';

const getLocalIncome = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : MOCK_INCOME;
  } catch {
    return MOCK_INCOME;
  }
};

const setLocalIncome = (income) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(income));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

export const incomeService = {
  async getAll(userId, isLive = false) {
    if (isLive && supabase && userId) {
      const { data, error } = await supabase
        .from('income')
        .select('*')
        .eq('user_id', userId)
        .order('income_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }

    return getLocalIncome();
  },

  async create(incomeData, userId, isLive = false) {
    if (isLive && supabase && userId && userId !== 'usr_demo_8829') {
      try {
        const { data, error } = await supabase
          .from('income')
          .insert([{
            ...incomeData,
            user_id: userId,
            amount: Number(incomeData.amount)
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
    const localList = getLocalIncome();
    const newIncome = {
      ...incomeData,
      id: `inc-${Date.now()}`,
      user_id: userId || 'usr_demo_8829',
      amount: Number(incomeData.amount),
      created_at: new Date().toISOString()
    };
    const updated = [newIncome, ...localList];
    setLocalIncome(updated);
    return newIncome;
  },

  async update(id, updates, userId, isLive = false) {
    if (isLive && supabase && userId) {
      const { data, error } = await supabase
        .from('income')
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

    const localList = getLocalIncome();
    const updated = localList.map(item =>
      item.id === id ? { ...item, ...updates, amount: Number(updates.amount) } : item
    );
    setLocalIncome(updated);
    return updated.find(item => item.id === id);
  },

  async delete(id, userId, isLive = false) {
    if (isLive && supabase && userId) {
      const { error } = await supabase
        .from('income')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    }

    const localList = getLocalIncome();
    const filtered = localList.filter(item => item.id !== id);
    setLocalIncome(filtered);
    return true;
  }
};
