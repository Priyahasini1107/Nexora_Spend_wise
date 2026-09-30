import React, { useState } from 'react';
import {
  User,
  Settings,
  Database,
  Cloud,
  LogOut,
  Save,
  Download,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { CURRENCIES } from '../lib/constants';
import { formatCurrency } from '../utils/formatters';

export const ProfilePage = () => {
  const {
    user,
    profile,
    updateProfile,
    signOut,
    isLiveSupabase,
    saveSupabaseCredentials,
    clearSupabaseCredentials
  } = useAuth();

  const { expenses, income, budgets, categories, currency, showToast } = useExpenses();

  const initialName = (user?.id && user.id !== 'usr_demo_8829')
    ? (profile?.full_name && profile.full_name !== 'Arjun Sharma' ? profile.full_name : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''))
    : (profile?.full_name || 'Arjun Sharma');

  const [fullName, setFullName] = useState(initialName);
  const [selectedCurrency, setSelectedCurrency] = useState(profile?.currency || 'INR');
  const [savingsGoal, setSavingsGoal] = useState((profile?.monthly_savings_goal || 25000).toString());

  // Keep state in sync if profile loads asynchronously
  React.useEffect(() => {
    if (user?.id && user.id !== 'usr_demo_8829') {
      const bestName = (profile?.full_name && profile.full_name !== 'Arjun Sharma')
        ? profile.full_name
        : (user?.user_metadata?.full_name || user?.email?.split('@')[0] || '');
      if (bestName) setFullName(bestName);
    } else if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile, user]);

  // Supabase Runtime Config State
  const [supabaseUrl, setSupabaseUrl] = useState('https://wndadtpiukiapijginbh.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        currency: selectedCurrency,
        monthly_savings_goal: parseFloat(savingsGoal) || 25000
      });
      showToast('Profile and preferences updated');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConnectSupabase = (e) => {
    e.preventDefault();
    if (!supabaseKey.trim()) {
      showToast('Please paste your Supabase publishable/anon key', 'error');
      return;
    }
    saveSupabaseCredentials(supabaseUrl.trim(), supabaseKey.trim());
  };

  const handleExportJSON = () => {
    const fullData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user?.id,
        email: user?.email,
        profile
      },
      expenses,
      income,
      budgets,
      categories
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `kuberpulse_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Financial records exported as JSON');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile & Settings</h1>
          <p className="page-subtitle">
            Configure currency, savings targets, and cloud database connections
          </p>
        </div>
      </div>

      {/* Profile Info & Preferences */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <User size={20} />
            User Preferences
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="profile-fullname">
              Full Name
            </label>
            <input
              id="profile-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="form-input"
              placeholder="e.g. Arjun Sharma"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-currency">
                Default Currency
              </label>
              <select
                id="profile-currency"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="form-select"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="profile-goal">
                Monthly Savings Goal
              </label>
              <input
                id="profile-goal"
                type="number"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                className="form-input"
                placeholder="25000"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            style={{ alignSelf: 'flex-start' }}
            disabled={isUpdating}
          >
            <Save size={15} />
            <span>{isUpdating ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </form>
      </div>

      {/* Supabase Cloud Connection Panel */}
      <div className="card" style={{ border: isLiveSupabase ? '1.5px solid var(--color-success)' : '1.5px solid rgba(18, 20, 23, 0.1)' }}>
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 className="card-title">
                <Database size={20} />
                Supabase Database Integration
              </h3>
              <span className={`badge ${isLiveSupabase ? 'badge-success' : 'badge-lime'}`}>
                {isLiveSupabase ? 'Live Cloud Connected' : 'Sandbox / Demo Active'}
              </span>
            </div>
            <p className="card-subtitle">
              PostgreSQL persistence with Row Level Security (RLS)
            </p>
          </div>
        </div>

        {isLiveSupabase ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--color-success-bg)', padding: '14px', borderRadius: 'var(--radius-md)', marginBottom: '16px', color: 'var(--color-success)' }}>
              <CheckCircle2 size={20} />
              <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>
                Successfully linked to Supabase cloud. All expenses, income, and budgets are persisting with PostgreSQL RLS.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={clearSupabaseCredentials}
                className="btn btn-secondary btn-sm"
              >
                Disconnect & Return to Demo Mode
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnectSupabase} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '14px', borderRadius: 'var(--radius-md)', border: 'var(--border-light)' }}>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                You are currently in <strong>Demo Sandbox Mode</strong> with interactive Indian Rupee sample records. To connect directly to your live Supabase cloud database, paste your publishable anon key below:
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Supabase Base URL
              </label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Supabase Publishable / Anon Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="form-input"
              />
              <span className="form-hint">
                Found in your Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public key.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary btn-sm">
                <Cloud size={15} />
                <span>Connect Live Supabase</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Export & Data Backup */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Download size={20} />
            Data Backup & Export
          </h3>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Download a full backup of all your recorded expenses, incomes, budgets, and categorized items in JSON format.
        </p>
        <button onClick={handleExportJSON} className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
          <Download size={15} />
          <span>Export Full JSON Archive</span>
        </button>
      </div>

      {/* Sign Out */}
      <div className="card" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Sign Out
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              End your current session on this device
            </p>
          </div>
          <button onClick={signOut} className="btn btn-danger btn-sm">
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
