'use client';
import { useEffect, useMemo, useState } from 'react';
import { Link } from '../lib/navigation';
import api from '../api/axios';
import MarketHeader from '../components/MarketHeader';

const fallbackStoreImages = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1556742049-0a67e5572243?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
];

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/stores')
      .then(({ data }) => setShops(data.stores || []))
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            'Shops are unavailable. Start the MarketHub server and try again.'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  const visibleShops = useMemo(
    () =>
      shops.filter((s) =>
        `${s.name} ${s.description || ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [shops, search]
  );

  return (
    <div className="marketplace">
      <MarketHeader />
      <main className="shops-page">
        <div className="detail-breadcrumb">
          <Link to="/">Home</Link>
          <span> / </span>
          Shops
        </div>

        <section className="shops-hero">
          <span className="eyebrow">INDEPENDENT BY NATURE</span>
          <h1>
            Meet the <em>makers.</em>
          </h1>
          <p>Little shops with big ideas, good people, and things worth finding.</p>
          <label className="catalog-search">
            <span aria-hidden="true">🔍</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find a shop by name or description…"
              aria-label="Search shops"
            />
            {search && (
              <button
                type="button"
                className="catalog-search-clear"
                onClick={() => setSearch('')}
                aria-label="Clear shop search"
              >
                ✕
              </button>
            )}
          </label>
        </section>

        <div className="shops-heading">
          <div>
            <span className="eyebrow">A GOOD PLACE TO BEGIN</span>
            <h2>People behind the good stuff.</h2>
          </div>
          <span className="shops-counter">
            {loading ? 'Loading shops…' : `${visibleShops.length} ${visibleShops.length === 1 ? 'shop' : 'shops'}`}
          </span>
        </div>

        {error && (
          <p className="shops-error" role="alert">
            {error}
          </p>
        )}

        <div className="shops-grid">
          {visibleShops.map((shop, index) => {
            const fallbackImg = fallbackStoreImages[index % fallbackStoreImages.length];
            const imgSrc = shop.logoUrl || shop.preview || fallbackImg;

            return (
              <Link className="shop-card" to={`/store/${shop.slug}`} key={shop._id}>
                <div className="shop-card-media">
                  <img
                    src={imgSrc}
                    alt={shop.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImg;
                    }}
                  />
                  <span className="shop-card-badge">Shop</span>
                </div>
                <div className="shop-card-copy">
                  <span className="eyebrow">INDEPENDENT SHOP</span>
                  <h3>{shop.name}</h3>
                  <p>
                    {shop.description ||
                      'A little corner for thoughtful finds, made and chosen with care.'}
                  </p>
                  <span className="shop-card-link">
                    <span>Explore the shop</span>
                    <span>
                      {shop.productCount || 0} {(shop.productCount || 0) === 1 ? 'find' : 'finds'}{' '}
                      <b>→</b>
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {!loading && !error && !visibleShops.length && (
          <div className="empty-products">
            <span>✳</span>
            <p>
              {search
                ? 'No shops match that search yet.'
                : 'No shops yet. Be the first to open one.'}
            </p>
            {search && (
              <button
                type="button"
                className="button button-dark"
                onClick={() => setSearch('')}
              >
                Show all shops
              </button>
            )}
          </div>
        )}

        <section className="shops-cta">
          <span className="eyebrow">YOUR IDEA DESERVES A WINDOW</span>
          <h2>Have something good to share?</h2>
          <p>Open your own corner of the marketplace.</p>
          <Link className="button button-dark" to="/create-store">
            Open your shop <span>→</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
