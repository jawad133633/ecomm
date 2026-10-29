'use client';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from '../lib/navigation';
import api from '../api/axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';

  // step: 'email' | 'otp' | 'reset' | 'done'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(prefillEmail);
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSuccessMsg(data.message || 'Verification code sent to your email.');
      setOtp('');
      setDevOtp('');
      setResendCooldown(60);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send verification code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length < 6) {
      setError('Please enter the complete 6-digit code sent to your email.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
      });
      setResetToken(data.resetToken);
      setSuccessMsg(data.message || 'Code verified successfully! You can now choose a new password.');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        resetToken,
        password: newPassword,
        confirmPassword,
      });
      setSuccessMsg(data.message || 'Password updated successfully! Directing you to login...');
      setStep('done');
      setTimeout(() => {
        navigate('/login?reset=success');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-page login-page recovery-page">
      <header className="account-header">
        <Link className="brand" to="/">
          market<span>hub</span><i>®</i>
        </Link>
        <Link className="account-back" to="/login">
          ← <span>Back to sign in</span>
        </Link>
      </header>

      <main className="login-layout">
        {/* Left Art Panel */}
        <aside className="login-art" aria-label="MarketHub Account Security">
          <span className="login-art-kicker">CONFIDENTIAL & SECURE RECOVERY</span>
          <div className="login-art-copy">
            <span className="login-art-mark" aria-hidden="true">🔑</span>
            <h1>
              Direct access<br />
              <em>restored.</em>
            </h1>
            <p>
              Forgot your credentials? Verify your registered email with a 6-digit code to securely set a new password and regain direct access.
            </p>
          </div>

          <div className="recovery-trust-badges">
            <div className="recovery-trust-item">
              <span className="trust-icon">🛡️</span>
              <div>
                <strong>HMAC-256 Protected</strong>
                <p>One-time codes with time-bound cryptographic expiry</p>
              </div>
            </div>
            <div className="recovery-trust-item">
              <span className="trust-icon">✉️</span>
              <div>
                <strong>Email Verification</strong>
                <p>Code dispatched directly to your private inbox</p>
              </div>
            </div>
          </div>

          <div className="login-art-bottom">
            <span>MARKETHUB SECURITY · PROTECTING YOUR ACCOUNT</span>
            <span aria-hidden="true">✳</span>
          </div>
          <div className="login-orbit login-orbit-one" aria-hidden="true" />
          <div className="login-orbit login-orbit-two" aria-hidden="true" />
        </aside>

        {/* Right Form Panel */}
        <section className="login-panel">
          <div className="login-card recovery-card">
            <span className="account-eyebrow">ACCOUNT RECOVERY</span>
            
            {/* Step Indicators */}
            <div className="recovery-stepper" aria-label="Recovery Progress">
              <div className={`step-node ${step === 'email' ? 'active' : 'completed'}`}>
                <span className="step-num">1</span>
                <span className="step-label">Email</span>
              </div>
              <div className="step-line" />
              <div className={`step-node ${step === 'otp' ? 'active' : (step === 'reset' || step === 'done') ? 'completed' : ''}`}>
                <span className="step-num">2</span>
                <span className="step-label">OTP Code</span>
              </div>
              <div className="step-line" />
              <div className={`step-node ${step === 'reset' || step === 'done' ? 'active' : ''}`}>
                <span className="step-num">3</span>
                <span className="step-label">New Password</span>
              </div>
            </div>

            {/* Headers per Step */}
            {step === 'email' && (
              <>
                <h2>Reset password</h2>
                <p className="account-intro">
                  Enter your registered email address. We will generate and send a 6-digit verification code to your inbox.
                </p>
              </>
            )}

            {step === 'otp' && (
              <>
                <h2>Enter verification code</h2>
                <p className="account-intro">
                  We sent a 6-digit code to <strong>{email}</strong>. Enter it below to verify your identity.
                </p>
              </>
            )}

            {step === 'reset' && (
              <>
                <h2>Create new password</h2>
                <p className="account-intro">
                  Your identity is verified. Choose a strong, new password to access your account directly.
                </p>
              </>
            )}

            {step === 'done' && (
              <>
                <h2>Password updated!</h2>
                <p className="account-intro">
                  Your account is secured. Redirecting you to the login screen now...
                </p>
              </>
            )}

            {/* Alerts */}
            {error && <div role="alert" className="form-alert">{error}</div>}
            {successMsg && <div role="status" className="form-success">{successMsg}</div>}

            {step === 'otp' && (
              <div className="whatsapp-action-box" style={{ background: '#eff6ff', borderColor: '#bfdbfe', marginBottom: '18px' }}>
                <p className="whatsapp-action-desc" style={{ color: '#1e40af', marginBottom: '8px' }}>
                  ✉️ Verification code has been sent directly to <strong>{email}</strong>. Please check your Gmail inbox (or Spam folder).
                </p>
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: '#2563eb' }}
                >
                  Open Gmail Inbox ↗
                </a>
              </div>
            )}

            {/* STEP 1: Enter Email Form */}
            {step === 'email' && (
              <form onSubmit={handleRequestOtp} className="account-form">
                <label htmlFor="recovery-email">
                  Your email address
                  <input
                    id="recovery-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />
                </label>
                <button type="submit" disabled={loading} className="account-submit">
                  {loading ? 'Sending code...' : <>Generate & send code <span aria-hidden="true">→</span></>}
                </button>
              </form>
            )}

            {/* STEP 2: Enter OTP Form */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="account-form">
                <label htmlFor="recovery-otp">
                  6-digit verification code
                  <input
                    id="recovery-otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="otp-digit-input"
                    required
                    autoFocus
                  />
                </label>

                <div className="recovery-actions-row">
                  <button
                    type="button"
                    className="btn-link"
                    disabled={resendCooldown > 0 || loading}
                    onClick={() => handleRequestOtp()}
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                  </button>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => { setStep('email'); setError(''); setSuccessMsg(''); }}
                  >
                    Change email
                  </button>
                </div>

                <button type="submit" disabled={loading || otp.length < 6} className="account-submit">
                  {loading ? 'Verifying code...' : <>Verify code & continue <span aria-hidden="true">→</span></>}
                </button>
              </form>
            )}

            {/* STEP 3: Enter New Password Form */}
            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="account-form">
                <label htmlFor="new-password">
                  New password
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    required
                    autoFocus
                  />
                </label>

                <label htmlFor="confirm-password">
                  Confirm new password
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    required
                  />
                </label>

                {newPassword && confirmPassword && (
                  <div className={`password-match-hint ${newPassword === confirmPassword ? 'match' : 'mismatch'}`}>
                    {newPassword === confirmPassword ? '✓ Passwords match' : '✕ Passwords do not match yet'}
                  </div>
                )}

                <button type="submit" disabled={loading} className="account-submit">
                  {loading ? 'Updating password...' : <>Update password & sign in <span aria-hidden="true">→</span></>}
                </button>
              </form>
            )}

            {step === 'done' && (
              <div className="recovery-success-box">
                <span className="success-icon">✓</span>
                <p>You can now sign in directly with your new password.</p>
                <Link to="/login" className="account-submit" style={{ display: 'block', textAlign: 'center', marginTop: '16px', textDecoration: 'none' }}>
                  Go to Sign In →
                </Link>
              </div>
            )}

            <div className="recovery-footer-links">
              <p className="account-switch">
                Remember your password? <Link to="/login">Sign in <span aria-hidden="true">↗</span></Link>
              </p>
              <p className="account-switch">
                Need an account? <Link to="/signup">Create account <span aria-hidden="true">↗</span></Link>
              </p>
            </div>
          </div>
          <p className="account-note">
            <span aria-hidden="true">✳</span> MarketHub security · Confidential password recovery via verified email.
          </p>
        </section>
      </main>
    </div>
  );
}
