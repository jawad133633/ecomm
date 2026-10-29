'use client';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from '../lib/navigation';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const adminLogin = location.state?.next === '/admin' || searchParams.get('next') === '/admin';
  const resetSuccess = searchParams.get('reset') === 'success' || searchParams.get('passwordReset') === 'success';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: formData.email,
        phone: formData.email,
        identifier: formData.email,
        password: formData.password,
      });
      if (!data.token || !data.user) throw new Error('Invalid login response from server');
      const next = location.state?.next || searchParams.get('next');
      if (next === '/admin' && data.user.role !== 'admin') {
        throw new Error('This account does not have administrator access. Sign in with the store administrator account.');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(next || (data.user.role === 'admin' ? '/admin' : '/'));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const forgotHref = `/forgot-password${formData.email ? `?email=${encodeURIComponent(formData.email)}` : ''}`;

  return (
    <div className="account-page login-page">
      <header className="account-header">
        <Link className="brand" to="/">
          market<span>hub</span><i>®</i>
        </Link>
        <Link className="account-back" to="/">
          ← <span>Back to marketplace</span>
        </Link>
      </header>

      <main className="login-layout">
        <aside className="login-art" aria-label="MarketHub community">
          <span className="login-art-kicker">A MARKET THAT FEELS LIKE YOURS</span>
          <div className="login-art-copy">
            <span className="login-art-mark" aria-hidden="true">m.</span>
            <h1>Good to<br />see you <em>again.</em></h1>
            <p>Your favorite independent shops and thoughtful finds are right where you left them.</p>
          </div>
          <div className="login-art-bottom">
            <span>INDEPENDENT FINDS, EVERY DAY</span>
            <span aria-hidden="true">✳</span>
          </div>
          <div className="login-orbit login-orbit-one" aria-hidden="true" />
          <div className="login-orbit login-orbit-two" aria-hidden="true" />
        </aside>

        <section className="login-panel">
          <div className="login-card">
            <span className="account-eyebrow">YOUR MARKETPLACE, YOUR WAY</span>
            <h2>Welcome back</h2>
            <p className="account-intro">Sign in to pick up where you left off.</p>

            {resetSuccess && (
              <div role="status" className="form-success">
                ✓ Password changed successfully! Sign in with your new password to regain direct access.
              </div>
            )}
            {error && <div role="alert" className="form-alert">{error}</div>}

            <form onSubmit={handleSubmit} className="account-form">
              <label htmlFor="email">
                Email address or phone number
                <input
                  id="email"
                  name="email"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  placeholder="you@example.com or phone number"
                  required
                />
              </label>

              <div className="form-field-group">
                <div className="form-label-row">
                  <label htmlFor="password">Password</label>
                  <Link to={forgotHref} className="form-forgot-inline">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="account-submit">
                {loading ? 'Logging in...' : <>Log in to your account <span aria-hidden="true">→</span></>}
              </button>
            </form>

            <div className="account-switches">
              <p className="account-switch">
                New around here? <Link to="/signup" state={{ next: location.state?.next || searchParams.get('next') }}>Create an account <span aria-hidden="true">↗</span></Link>
              </p>
              <p className="account-switch">
                Forgot password? <Link to={forgotHref}>Reset via Email OTP <span aria-hidden="true">🔑</span></Link>
              </p>
              {adminLogin && (
                <p className="account-switch admin-switch">
                  <Link to="/admin/forgot-password">Admin WhatsApp Recovery ↗</Link>
                </p>
              )}
            </div>
          </div>
          <p className="account-note"><span aria-hidden="true">✳</span> A little more meaning in every find.</p>
        </section>
      </main>
    </div>
  );
}
