import React, { useState } from 'react';
import { Wallet, Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage = () => {
  const { signIn, signUp, resetPassword, enterDemoMode, isLiveSupabase, authError } = useAuth();

  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setMessage('');

    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    if (mode !== 'forgot' && (!password || password.length < 6)) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setLocalError('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn({ email: email.trim(), password });
      } else if (mode === 'signup') {
        await signUp({ email: email.trim(), password, fullName: fullName.trim() });
        setMessage('Account created successfully! Check your inbox if confirmation is required.');
      } else if (mode === 'forgot') {
        await resetPassword(email.trim());
        setMessage('Password reset instructions sent to your email.');
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        backgroundColor: 'var(--bg-app)'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 28px',
          boxShadow: 'var(--shadow-modal)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--text-primary)',
              color: 'var(--accent-lime)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 8px 20px rgba(18, 20, 23, 0.2)'
            }}
          >
            <Wallet size={26} strokeWidth={2.4} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              KuberPulse
            </h1>
            <span className="brand-badge">SaaS</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Personal Expense & Savings Intelligence
          </p>
        </div>

        {/* Tab Toggle */}
        <div
          className="tabs-pill-container"
          style={{ width: '100%', display: 'flex', marginBottom: '24px', padding: '4px' }}
        >
          <button
            onClick={() => { setMode('login'); setLocalError(''); setMessage(''); }}
            className={`tab-pill ${mode === 'login' ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('signup'); setLocalError(''); setMessage(''); }}
            className={`tab-pill ${mode === 'signup' ? 'active' : ''}`}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Sign Up
          </button>
        </div>

        {/* Error Feedback */}
        {(localError || authError) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', fontSize: '0.82rem', marginBottom: '18px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{localError || authError}</span>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--color-success-bg)', color: 'var(--color-success)', fontSize: '0.82rem', marginBottom: '18px' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-name">
                Full Name
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Arjun Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email">
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
              <input
                id="auth-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="auth-password" style={{ marginBottom: 0 }}>
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setLocalError(''); setMessage(''); }}
                    style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginTop: '6px' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
                <input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? (
              'Authenticating...'
            ) : mode === 'login' ? (
              'Sign In to Dashboard'
            ) : mode === 'signup' ? (
              'Create My Account'
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        {/* Back to Login if on forgot password */}
        {mode === 'forgot' && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => { setMode('login'); setLocalError(''); setMessage(''); }}
              style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 600 }}
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* Quick Demo Mode Access Button */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: 'var(--border-light)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Want to test without creating an account right now?
          </p>
          <button
            onClick={enterDemoMode}
            className="btn btn-accent btn-sm btn-full"
            style={{ fontWeight: 700 }}
          >
            <Sparkles size={15} />
            <span>⚡ Launch Demo Mode with Sample ₹ Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
