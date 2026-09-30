import { supabase } from '../lib/supabase';
import { DEFAULT_CATEGORIES } from '../lib/constants';

const LOCAL_STORAGE_KEY = 'kuberpulse_categories_cache';

const getLocalCategories = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
};

const setLocalCategories = (cats) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cats));
  } catch (err) {
    console.error('Failed to save categories:', err);
  }
};

export const categoryService = {
  async getAll(userId, isLive = false) {
    if (isLive && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*');

      if (!error && data && data.length > 0) {
        return data;
      }
    }

    return getLocalCategories();
  },

  async create(catData, userId, isLive = false) {
    if (isLive && supabase && userId) {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          ...catData,
          user_id: userId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const localList = getLocalCategories();
    const newCat = {
      ...catData,
      id: `cat-${Date.now()}`,
      user_id: userId || 'usr_demo_8829',
      created_at: new Date().toISOString()
    };
    const updated = [...localList, newCat];
    setLocalCategories(updated);
    return newCat;
  }
};
