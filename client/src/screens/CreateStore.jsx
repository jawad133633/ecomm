'use client';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from '../lib/navigation';
import api from '../api/axios';

export default function CreateStore() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', description: '', logoUrl: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(Boolean(token));
    if (!token) navigate('/signup?next=/create-store', { replace: true });
  }, [navigate]);

  const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await api.post('/stores', formData, { headers: { Authorization: `Bearer ${token}` } });
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('MarketHub backend se connection nahi ho saka. Server chalaein aur server/.env mein MONGO_URI database connection check karein.');
      } else if (err.response.status >= 500) {
        setError('Store save nahi ho saka. Database connection aur backend logs check karke dobara try karein.');
      } else {
        setError(err.response.data?.message || 'Unable to create your store. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!hasToken) return <div className="loading-page">Taking you to account setup…</div>;

  const slugPreview = formData.name ? formData.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : 'your-shop';

  return (
    <div className="create-page">
      <header className="auth-topbar">
        <Link className="brand" to="/">
          market<span>hub</span><i>®</i>
        </Link>
        <Link className="auth-back" to="/dashboard">
          ← Back to seller space
        </Link>
      </header>

      <main className="create-layout">
        <aside className="create-intro">
          <span className="eyebrow">A LITTLE CORNER TO CALL YOUR OWN</span>
          <h1>Let's make room for your good idea.</h1>
          <p>
            Give your shop a name and a little introduction. You can add your products, customize your storefront, and share your store link with customers worldwide.
          </p>

          <div className="create-perks">
            <div className="create-perk">
              <span className="create-perk-icon">🏪</span>
              <div>
                <strong>Custom storefront URL</strong>
                <p>Share your shop directly via link or WhatsApp.</p>
              </div>
            </div>
            <div className="create-perk">
              <span className="create-perk-icon">📦</span>
              <div>
                <strong>Unlimited products & stock</strong>
                <p>Easily upload products with photos and descriptions.</p>
              </div>
            </div>
            <div className="create-perk">
              <span className="create-perk-icon">⚡</span>
              <div>
                <strong>Instant orders & tracking</strong>
                <p>Receive orders with Cash on Delivery and fulfillment tracking.</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="create-card">
          <div className="create-card-header">
            <h2>Shop Details</h2>
            <p>Tell the marketplace about your shop.</p>
          </div>

          <form className="create-form" onSubmit={handleSubmit}>
            {error && <div role="alert" className="form-alert">{error}</div>}

            <label htmlFor="store-name">
              <span>What should we call your shop? <strong className="required">*</strong></span>
              <input
                id="store-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sunday Studio, Morrow Objects"
                maxLength={80}
                required
              />
              <small className="field-hint">
                Store link: <code>/store/{slugPreview}</code>
              </small>
            </label>

            <label htmlFor="store-description">
              <span>Tell us a little about it <span className="optional">(optional)</span></span>
              <textarea
                id="store-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What do you make, curate, or sell? Share your story with shoppers."
                maxLength={500}
                rows={4}
              />
              <small className="field-hint">
                {formData.description.length}/500 characters
              </small>
            </label>

            <label htmlFor="store-logo">
              <span>Shop logo or image URL <span className="optional">(optional)</span></span>
              <input
                id="store-logo"
                name="logoUrl"
                type="url"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
              />
            </label>

            {formData.logoUrl && (
              <div className="store-logo-preview">
                <span>Preview:</span>
                <img src={formData.logoUrl} alt="Store logo preview" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )}

            <button className="create-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Opening your shop…
                </>
              ) : (
                <>
                  Open my shop <span>→</span>
                </>
              )}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
