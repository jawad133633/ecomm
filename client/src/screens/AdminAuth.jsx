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
  const [whatsAppUrl, setWhatsAppUrl] = useState('');
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

        setMessage(data.message || 'WhatsApp recovery code generated! Click the button below to open your WhatsApp chat.');
        if (data.whatsAppUrl) {
          setWhatsAppUrl(data.whatsAppUrl);
        }
        setOtp('');
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
        setWhatsAppUrl('');
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
            <div className="whatsapp-otp-step">
              {whatsAppUrl && (
                <div className="whatsapp-action-box">
                  <p className="whatsapp-action-desc">
                    Click below to open WhatsApp chat with your confidential verification code pre-filled:
                  </p>
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-chat"
                  >
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.62C9.36 7.62 9.09 7.69 8.86 7.93C8.63 8.18 8 8.77 8 9.97C8 11.17 8.88 12.33 9 12.5C9.13 12.67 10.73 15.14 13.19 16.2C13.78 16.45 14.23 16.6 14.59 16.72C15.18 16.9 15.72 16.88 16.14 16.81C16.62 16.74 17.6 16.22 17.81 15.63C18.01 15.05 18.01 14.55 17.95 14.45C17.89 14.35 17.75 14.29 17.52 14.18C17.29 14.06 16.18 13.52 15.98 13.44C15.77 13.37 15.62 13.33 15.48 13.56C15.33 13.79 14.91 14.29 14.78 14.44C14.65 14.59 14.52 14.61 14.29 14.5C14.06 14.38 13.32 14.14 12.44 13.36C11.76 12.75 11.3 12 11.16 11.77C11.03 11.54 11.15 11.42 11.26 11.31C11.37 11.2 11.5 11.03 11.62 10.89C11.73 10.74 11.77 10.64 11.85 10.48C11.93 10.31 11.89 10.17 11.83 10.05C11.77 9.94 11.3 8.78 11.11 8.31C10.92 7.86 10.73 7.92 10.59 7.91C10.45 7.91 10.3 7.9 10.16 7.9C10.03 7.9 9.81 7.94 9.63 8.14C9.53 7.62 9.53 7.62 9.53 7.62Z"/>
                    </svg>
                    <span>Open in WhatsApp Chat 💬</span>
                  </a>
                </div>
              )}
              <label htmlFor="admin-otp">
                Enter 6-Digit WhatsApp OTP Code
                <input
                  id="admin-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="e.g. 123456"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 8))}
                  minLength={6}
                  maxLength={8}
                  className="otp-digit-input"
                  required
                />
              </label>
              <div className="resend-otp-row" style={{ marginTop: '10px', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => {
                    setMode('forgot');
                    setOtp('');
                    setMessage('');
                    setError('');
                  }}
                >
                  ← Request another code or change number
                </button>
              </div>
            </div>
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
