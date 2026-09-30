import { supabase } from '../lib/supabase';
import { MOCK_PROFILE } from '../lib/mockData';

const LOCAL_STORAGE_KEY = 'kuberpulse_profile_cache';

const getLocalProfile = () => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : MOCK_PROFILE;
  } catch {
    return MOCK_PROFILE;
  }
};

const setLocalProfile = (profile) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile:', err);
  }
};

export const profileService = {
  async get(userId, isLive = false, fallbackMetadata = null) {
    if (isLive && supabase && userId && userId !== 'usr_demo_8829') {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data && data.full_name) return data;
      } catch (err) {
        console.warn('Error fetching profile from Supabase:', err);
      }

      // If live user has metadata, use their real name
      if (fallbackMetadata?.full_name) {
        return {
          id: userId,
          full_name: fallbackMetadata.full_name,
          currency: 'INR',
          monthly_savings_goal: 25000
        };
      }
      return null;
    }

    // Demo Mode user only
    return getLocalProfile();
  },

  async update(userId, updates, isLive = false) {
    if (isLive && supabase && userId && userId !== 'usr_demo_8829') {
      const { data, error } = await supabase
        .from('profiles')
        .upsert([{
          id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const current = getLocalProfile();
    const updated = { ...current, ...updates };
    setLocalProfile(updated);
    return updated;
  }
};
