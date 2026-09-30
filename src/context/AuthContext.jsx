```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabase,
  getSupabaseConfig,
  saveSupabaseCredentials,
  clearSupabaseCredentials
} from '../lib/supabase';
import { MOCK_USER, MOCK_PROFILE } from '../lib/mockData';
import { profileService } from '../services/profileService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiveSupabase, setIsLiveSupabase] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const config = getSupabaseConfig();

    if (config.isConfigured && supabase) {
      setIsLiveSupabase(true);

      // Check current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          fetchUserProfile(
            session.user.id,
            session.user.user_metadata,
            session.user.email
          );
        } else {
          setLoading(false);
        }
      });

      // Listen for auth changes
      const {
        data: { subscription }
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(
            session.user.id,
            session.user.user_metadata,
            session.user.email
          );
        } else {
          setProfile(null);
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Demo / Sandbox mode: start with Demo User
      setIsLiveSupabase(false);
      setUser(MOCK_USER);
      setProfile(MOCK_PROFILE);
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (
    userId,
    metadata = null,
    email = null
  ) => {
    try {
      const p = await profileService.get(userId, true, metadata);

      if (p && p.full_name) {
        setProfile(p);
      } else {
        const realName =
          metadata?.full_name ||
          email?.split('@')[0] ||
          'User';

        const fallbackProf = {
          id: userId,
          full_name: realName,
          email: email || '',
          currency: 'INR',
          monthly_savings_goal: 25000
        };

        setProfile(fallbackProf);

        // Auto-create in Supabase profiles table
        if (supabase) {
          await supabase
            .from('profiles')
            .upsert([fallbackProf])
            .catch(() => {});
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, fullName }) => {
    setAuthError(null);

    if (!isLiveSupabase || !supabase) {
      // Demo Mode signup
      const newUser = {
        id: `usr_${Date.now()}`,
        email,
        user_metadata: {
          full_name: fullName
        }
      };

      setUser(newUser);

      setProfile({
        id: newUser.id,
        full_name: fullName,
        email,
        currency: 'INR',
        monthly_savings_goal: 25000
      });

      return { user: newUser };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    if (data?.user) {
      setUser(data.user);

      const newProf = {
        id: data.user.id,
        full_name: fullName,
        email: data.user.email || email,
        currency: 'INR',
        monthly_savings_goal: 25000
      };

      setProfile(newProf);

      // Upsert profile in Supabase profiles table immediately
      try {
        await supabase
          .from('profiles')
          .upsert([newProf]);
      } catch (e) {
        console.warn('Profile sync notice:', e);
      }
    }

    return data;
  };

  const signIn = async ({ email, password }) => {
    setAuthError(null);

    if (!isLiveSupabase || !supabase) {
      // Demo Mode signin
      const demoUser = {
        id: 'usr_demo_8829',
        email,
        user_metadata: {
          full_name: email.split('@')[0]
        }
      };

      setUser(demoUser);

      setProfile({
        ...MOCK_PROFILE,
        email,
        full_name: email.split('@')[0]
      });

      return { user: demoUser };
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    if (isLiveSupabase && supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setProfile(null);
    setSession(null);
  };

  // PASSWORD RESET
  const resetPassword = async (email) => {
    setAuthError(null);

    if (!isLiveSupabase || !supabase) {
      return {
        message: 'Demo mode: Password reset email simulated.'
      };
    }

    const { data, error } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    return data;
  };

  const updateProfile = async (updates) => {
    if (!user) return;

    const updated = await profileService.update(
      user.id,
      updates,
      isLiveSupabase
    );

    setProfile(updated);

    return updated;
  };

  const enterDemoMode = () => {
    setUser(MOCK_USER);
    setProfile(MOCK_PROFILE);
    setAuthError(null);
  };

  const isLiveSession = Boolean(
    isLiveSupabase &&
      session?.user &&
      user &&
      user.id === session.user.id
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isLiveSupabase,
        isLiveSession,
        authError,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        enterDemoMode,
        saveSupabaseCredentials,
        clearSupabaseCredentials
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
```
