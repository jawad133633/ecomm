'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link, useNavigate, useSearchParams } from '../lib/navigation';
import api from '../api/axios';

export default function AdminAuth() {
  const pathname = usePathname();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(pathname.endsWith('/forgot-password') ? 'forgot' : 'login');
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMode(pathname.endsWith('/forgot-password') ? 'forgot' : 'login');
    setError('');
    setMessage('');
  }, [pathname]);

  const change = (event) => setForm((old) => ({ ...old, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (mode === 'reset' && newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setBusy(true);
    try {
      if (mode === 'login') {
        const { data } = await api.post('/auth/admin/login', {
          identifier: form.identifier,
          email: form.identifier,
          phone: form.identifier,
          password: form.password,
        });

        if (!data.token || data.user?.role !== 'admin') {
          throw new Error('This account is not authorized for the admin panel.');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate(params.get('next')?.startsWith('/admin') ? params.get('next') : '/admin', { replace: true });
      } else if (mode === 'forgot') {
        const { data } = await api.post('/auth/admin/forgot-password', {
          identifier: form.identifier,
          email: form.identifier,
          phone: form.identifier,
        });

        setMessage(data.message || 'WhatsApp recovery OTP has been dispatched to your confidential administrator number.');
        if (data.devOtp) {
          setDevOtp(data.devOtp);
          setOtp(data.devOtp);
          setMessage(`${data.message || 'WhatsApp OTP dispatched.'} (Recovery Code: ${data.devOtp})`);
        }
        setMode('otp');
      } else if (mode === 'otp') {
        const { data } = await api.post('/auth/admin/verify-otp', {
          identifier: form.identifier,
          email: form.identifier,
          phone: form.identifier,
          otp,
        });

        setResetToken(data.resetToken);
        setMode('reset');
        setMessage(data.message || 'WhatsApp code verified. Set your new password to regain direct access.');
      } else {
        const { data } = await api.post('/auth/admin/reset-password', {
          identifier: form.identifier,
          email: form.identifier,
          phone: form.identifier,
          resetToken,
          password: newPassword,
          confirmPassword,
        });

        setMessage(data.message || 'Password changed successfully! Sign in with your new password.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setMode('login');
        setResetToken('');
        setOtp('');
        setDevOtp('');
        setNewPassword('');
        setConfirmPassword('');
        navigate('/admin/login?passwordReset=success', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not process request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-card">
        <div className="admin-auth-brand">
          <Link href="/">
            market<span>hub</span><i>®</i>
          </Link>
          <span className="admin-auth-badge">ADMINISTRATOR WORKSPACE</span>
        </div>

        <div className="admin-auth-heading">
          <h2>
            {mode === 'login'
              ? 'Admin Direct Access'
              : mode === 'forgot'
              ? 'WhatsApp OTP Recovery'
              : mode === 'otp'
              ? 'Verify WhatsApp Code'
              : 'Create New Password'}
          </h2>
          <p>
            {mode === 'login'
              ? 'Sign in with your confidential admin phone number and password.'
              : mode === 'forgot'
              ? 'Enter your confidential administrator phone number to receive a secure WhatsApp OTP.'
              : mode === 'otp'
              ? 'Enter the 6-digit WhatsApp verification code.'
              : 'Choose a strong new password to regain direct access.'}
          </p>
        </div>

        {params.get('passwordReset') === 'success' && mode === 'login' && (
          <div className="admin-auth-alert success" role="status">
            ✓ Password updated successfully! Sign in with your new password to access the admin panel.
          </div>
        )}

        {error && <div className="admin-auth-alert error" role="alert">{error}</div>}
        {message && <div className="admin-auth-alert info" role="status">{message}</div>}

        <form onSubmit={submit} className="admin-auth-form">
          {mode !== 'otp' && mode !== 'reset' && (
            <label htmlFor="admin-identifier">
              Admin Phone Number or Email
              <input
                id="admin-identifier"
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={change}
                placeholder="e.g. +923340686111 or 03340686111"
                autoComplete="username"
                required
              />
              <small style={{ color: '#64748b', fontSize: '11px', marginTop: '3px', display: 'block' }}>
                🔒 Protected with confidential admin number embedded in server .env
              </small>
            </label>
          )}

          {mode === 'login' && (
            <label htmlFor="admin-password">
              Admin Password
              <input
                id="admin-password"
                name="password"
                type="password"
                value={form.password}
                onChange={change}
                placeholder="Enter your admin password"
                autoComplete="current-password"
                required
              />
            </label>
          )}

          {mode === 'otp' && (
            <>
              {devOtp && (
                <div
                  className="dev-otp-banner"
                  style={{ cursor: 'pointer', marginBottom: '16px' }}
                  onClick={() => setOtp(devOtp)}
                  title="Click to auto-fill code"
                >
                  <span className="dev-pill">WHATSAPP OTP CODE</span>
                  <span className="dev-code">{devOtp}</span>
                  <small>👉 Click code to auto-fill into input</small>
                </div>
              )}
              <label htmlFor="admin-otp">
                6-Digit WhatsApp OTP Code
                <input
                  id="admin-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 8))}
                  minLength={6}
                  maxLength={8}
                  className="otp-digit-input"
                  required
                />
              </label>
            </>
          )}

          {mode === 'reset' && (
            <>
              <label htmlFor="admin-new-password">
                New Admin Password
                <input
                  id="admin-new-password"
                  type="password"
                  placeholder="New password (minimum 12 characters)"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                />
              </label>
              <label htmlFor="admin-confirm-password">
                Confirm New Password
                <input
                  id="admin-confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={128}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
            </>
          )}

          <button type="submit" disabled={busy} className="account-submit" style={{ marginTop: '12px' }}>
            {busy
              ? 'Processing…'
              : mode === 'login'
              ? 'Direct Access to Admin Panel →'
              : mode === 'forgot'
              ? 'Send WhatsApp OTP →'
              : mode === 'otp'
              ? 'Verify WhatsApp Code →'
              : 'Save Password & Enable Direct Access →'}
          </button>
        </form>

        <div className="admin-auth-footer">
          {mode === 'login' ? (
            <>
              <button
                type="button"
                className="admin-link-button"
                onClick={() => {
                  setMode('forgot');
                  setError('');
                  setMessage('');
                }}
              >
                Forgot password? Recover with WhatsApp OTP ↗
              </button>
              <Link href="/" className="admin-auth-back">
                ← Return to marketplace
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="admin-link-button"
              onClick={() => {
                setMode('login');
                setError('');
                setMessage('');
                setOtp('');
                setDevOtp('');
              }}
            >
              ← Back to admin direct sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
