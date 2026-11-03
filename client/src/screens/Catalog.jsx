'use client';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from '../lib/navigation';
import api from '../api/axios';
import { demoProducts } from './Home';
import MarketHeader from '../components/MarketHeader';
import ProductGrid from '../components/ProductGrid';

const categories = ["Everything","Woody & Fresh","Luxury Oud","Floral & Sweet","Warm & Spicy","Aquatic & Fresh","Amber Floral"];

export default function Catalog() {
  const { category: routeCategory } = useParams();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState(demoProducts);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(5000);
  const [hasMore, setHasMore] = useState(true);
  const [sort, setSort] = useState(params.get('sort') || 'newest');
  const [search, setSearch] = useState(params.get('q') || '');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const selected = routeCategory ? decodeURIComponent(routeCategory).replaceAll('-', ' ') : 'Everything';

  useEffect(() => {
    setSearch(params.get('q') || '');
    setSort(params.get('sort') || 'newest');
  }, [params]);

  // Fetch page 1 whenever category, search, or sort changes
  useEffect(() => {
    setLoading(true);
    setPage(1);

    const query = new URLSearchParams();
    query.set('page', '1');
    query.set('limit', '36');
    if (selected !== 'Everything') query.set('category', selected);
    if (search.trim()) query.set('search', search.trim());
    if (sort && sort !== 'newest') query.set('sort', sort);

    api.get(`/products?${query.toString()}`)
      .then(({ data }) => {
        if (data.products) {
          setProducts(data.products);
          setTotal(data.total || data.products.length);
          setHasMore(data.page < data.pages);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selected, search, sort]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    const query = new URLSearchParams();
    query.set('page', String(nextPage));
    query.set('limit', '36');
    if (selected !== 'Everything') query.set('category', selected);
    if (search.trim()) query.set('search', search.trim());
    if (sort && sort !== 'newest') query.set('sort', sort);

    try {
      const { data } = await api.get(`/products?${query.toString()}`);
      if (data.products?.length) {
        setProducts((prev) => [...prev, ...data.products]);
        setPage(nextPage);
        setTotal(data.total || total);
        setHasMore(data.page < data.pages);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Failed to load more perfumes:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };

  return (
    <div className="marketplace">
      <MarketHeader />
      <main className="catalog-page">
        <div className="detail-breadcrumb">
          <Link to="/">Home</Link>
          <span> / </span>
          Discover
        </div>

        <section className="catalog-intro">
          <span className="eyebrow">HAUTE PARFUMERIE & LUXURY SCENTS</span>
          <h1>Discover your <em>signature scent.</em></h1>
          <p>Over 5,000 authentic designer perfumes, rare extraits, and iconic fragrance flacons.</p>
          <label className="catalog-search">
            <span aria-hidden="true">🔍</span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                update('q', e.target.value);
              }}
              placeholder="Search perfumes, brands, notes (e.g. Dior, Oud, Chanel)…"
              aria-label="Search marketplace"
            />
            {search && (
              <button
                type="button"
                className="catalog-search-clear"
                onClick={() => {
                  setSearch('');
                  update('q', '');
                }}
                aria-label="Clear search input"
              >
                ✕
              </button>
            )}
          </label>
        </section>

        <div className="catalog-layout">
          <aside className="catalog-sidebar">
            <span className="eyebrow">FRAGRANCE FAMILIES</span>
            <nav className="catalog-categories" aria-label="Shop categories">
              {categories.map((c) => {
                const isSelected = selected.toLowerCase() === c.toLowerCase();
                return (
                  <Link
                    key={c}
                    className={isSelected ? 'selected' : ''}
                    to={c === 'Everything' ? '/discover' : `/category/${encodeURIComponent(c.toLowerCase().replaceAll(' ', '-'))}`}
                  >
                    <span>{c}</span>
                    <span className="category-arrow" aria-hidden="true">→</span>
                  </Link>
                );
              })}
            </nav>
            <div className="catalog-note">
              <span>💎</span>
              <strong>100% Authentic Scents.</strong>
              <p>Direct from luxury boutiques and master perfumers.</p>
            </div>
          </aside>

          <section className="catalog-results">
            <div className="catalog-toolbar">
              <span className="catalog-count">
                {loading
                  ? 'Finding luxury perfumes…'
                  : `Showing ${products.length} of ${total.toLocaleString('en-PK')} perfumes${selected !== 'Everything' ? ` in ${selected}` : ''}`}
              </span>
              <label className="catalog-sort-label">
                <span>Sort by</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    update('sort', e.target.value === 'newest' ? '' : e.target.value);
                  }}
                  aria-label="Sort products"
                >
                  <option value="newest">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
              </label>
            </div>

            <ProductGrid products={products} />

            {hasMore && (
              <div style={{ textAlign: 'center', margin: '3rem 0 2rem' }}>
                <button
                  type="button"
                  className="button button-dark"
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    padding: '0.95rem 2.6rem',
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  {loadingMore ? 'Loading more perfumes…' : <>Load More Perfumes ✦ ({products.length} of {total.toLocaleString('en-PK')})</>}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
