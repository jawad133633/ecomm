'use client';
import { useEffect, useState } from 'react';
import { Link, useParams } from '../lib/navigation';
import api from '../api/axios';

export default function Storefront() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    try {
      setCartCount(Number(localStorage.getItem('markethub-cart') || '0'));
    } catch {
      setCartCount(0);
    }
    api.get(`/stores/${slug}`)
      .then(({ data: result }) => setData(result))
      .catch((err) => setError(err.response?.data?.message || 'This shop is having a little rest.'));
  }, [slug]);

  const add = (product) => {
    try {
      const items = JSON.parse(localStorage.getItem('markethub-cart-items') || '[]');
      items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        storeName: data?.store?.name || 'Independent shop',
      });
      localStorage.setItem('markethub-cart-items', JSON.stringify(items));
      localStorage.setItem('markethub-cart', String(items.length));
      setCartCount(items.length);
      window.dispatchEvent(new Event('market-cart-updated'));
      setNotice(`${product.name} added to your bag.`);
      window.setTimeout(() => setNotice(''), 3000);
    } catch {
      setNotice('Could not add to bag. Please try again.');
    }
  };

  if (error) {
    return (
      <main className="store-page">
        <header className="site-header">
          <Link className="brand" to="/">
            market<span>hub</span><i>®</i>
          </Link>
          <Link className="header-login" to="/">
            ← Back to marketplace
          </Link>
        </header>
        <div className="store-empty-card" style={{ marginTop: '80px' }}>
          <div className="store-empty-icon">🏪</div>
          <h3>Shop Not Found</h3>
          <p>{error}</p>
          <div className="store-empty-actions">
            <Link className="button button-dark" to="/">
              Back to Marketplace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!data) return <div className="loading-page">Finding this little shop…</div>;

  const initial = data.store?.name ? data.store.name.slice(0, 1).toUpperCase() : 'S';

  return (
    <div className="store-page">
      <div className="announcement">
        A good find is always worth sharing. <span>Independent shops, right here.</span>
      </div>

      <header className="site-header">
        <Link className="brand" to="/" aria-label="MarketHub home">
          market<span>hub</span><i>®</i>
        </Link>
        <nav className="main-nav">
          <Link to="/">Discover</Link>
          <a href="#shop-products">Shop products</a>
          <Link to="/shops">All shops</Link>
        </nav>
        <div className="header-actions">
          <Link className="header-login" to="/">
            ← Back to marketplace
          </Link>
          <Link className="bag-button" to="/cart" aria-label={`Shopping bag, ${cartCount} items`}>
            Bag <span>{cartCount}</span>
          </Link>
        </div>
      </header>

      <main>
        <section className="public-store-hero">
          <div className="store-hero-avatar">
            {data.store.logoUrl && !logoFailed ? (
              <img
                src={data.store.logoUrl}
                alt={`${data.store.name} logo`}
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>

          <div className="store-hero-info">
            <span className="eyebrow">🏪 INDEPENDENT SHOP · MARKETPLACE SELLER</span>
            <h1>{data.store.name}</h1>
            <p>{data.store.description || 'Welcome to our little corner of MarketHub. Browse our collection below.'}</p>

            <div className="store-badges">
              <span className="store-badge verified">✓ Verified Store</span>
              <span className="store-badge">📦 Cash on Delivery</span>
              <span className="store-badge">✨ Independent Maker</span>
            </div>
          </div>
        </section>

        <section className="public-store-products" id="shop-products">
          <div className="store-products-heading">
            <div>
              <span className="eyebrow">CURATED COLLECTION</span>
              <h2>Products from {data.store.name}</h2>
            </div>
            <span className="store-products-count">
              {data.products?.length || 0} {data.products?.length === 1 ? 'product' : 'products'}
            </span>
          </div>

          {data.products?.length ? (
            <div className="product-grid">
              {data.products.map((product) => (
                <article className="product-card" key={product._id}>
                  <div className="product-image">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85'}
                      alt={product.name}
                      loading="lazy"
                    />
                  </div>
                  <div className="product-info">
                    <div className="product-meta">
                      <span>{product.category}</span>
                      <span>★ 4.9</span>
                    </div>
                    <h3>{product.name}</h3>
                    <div className="product-bottom">
                      <strong>Rs. {Number(product.price).toLocaleString('en-PK')}</strong>
                      <button disabled={!product.stock} onClick={() => add(product)}>
                        {product.stock > 0 ? (
                          <>
                            Add to bag <span>+</span>
                          </>
                        ) : (
                          'Sold out'
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="store-empty-card">
              <div className="store-empty-icon">✨</div>
              <h3>This shop is getting its shelves ready.</h3>
              <p>
                {data.store.name} is currently preparing new finds and curating products. Check back soon or explore trending items from other shops!
              </p>
              <div className="store-empty-actions">
                <Link className="button button-dark" to="/">
                  Explore the marketplace →
                </Link>
                <Link className="button button-light" to="/shops">
                  Discover other shops ↗
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      {notice && (
        <div className="toast" role="status">
          {notice}
          <button onClick={() => setNotice('')} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
