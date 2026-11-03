const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, '../../client/src/screens/Home.jsx');
let src = fs.readFileSync(homePath, 'utf8');

// Replace state and initial fetch
const target1 = `export default function Home() {
  const [products, setProducts] = useState(demoProducts);`;

const repl1 = `export default function Home() {
  const [products, setProducts] = useState(demoProducts);
  const [visibleCount, setVisibleCount] = useState(12);
  const [totalCount, setTotalCount] = useState(5000);
  const [homePage, setHomePage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);`;

src = src.replace(target1, repl1);

// Replace api.get('/products')
src = src.replace(
  "api.get('/products').then(({ data }) => { if (data.products?.length) setProducts(data.products); }).catch(() => {});",
  "api.get('/products?page=1&limit=48').then(({ data }) => { if (data.products?.length) { setProducts(data.products); if (data.total) setTotalCount(data.total); } }).catch(() => {});"
);

// Add loadMoreHome function
const target2 = `  const featuredProducts = visibleProducts.slice(0, 8);`;

const repl2 = `  const featuredProducts = visibleProducts.slice(0, visibleCount);

  const loadMoreHome = async () => {
    const nextCount = visibleCount + 12;
    setVisibleCount(nextCount);
    if (nextCount >= products.length && products.length < totalCount) {
      setLoadingMore(true);
      try {
        const nextPage = homePage + 1;
        const { data } = await api.get(\`/products?page=\${nextPage}&limit=48\`);
        if (data.products?.length) {
          setProducts((prev) => [...prev, ...data.products]);
          setHomePage(nextPage);
          if (data.total) setTotalCount(data.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMore(false);
      }
    }
  };`;

src = src.replace(target2, repl2);

// Add Load More button after product grid
const target3 = `{featuredProducts.length ? <div className="product-grid" id="product-grid">{featuredProducts.map((product, index) => <article className="product-card" key={product._id}><Link className="product-image" to={String(product._id).startsWith('p') ? '/shops' : \`/product/\${product._id}\`}><img src={product.imageUrl || demoProducts[index % demoProducts.length].imageUrl} alt={product.name} loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = demoProducts[index % demoProducts.length]?.imageUrl || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85"; }} />{product.label && <span className="product-label">{product.label}</span>}<span className="product-heart" aria-hidden="true">♡</span></Link><div className="product-info"><div className="product-meta"><Link to={product.store?.slug ? \`/store/\${product.store.slug}\` : '/shops'}>{product.store?.name || 'Independent shop'}</Link><span>★ 4.9</span></div><h3>{product.name}</h3><div className="product-bottom"><strong>{formatPrice(product.price)}</strong><button onClick={() => addToBag(product)} aria-label={\`Add \${product.name} to bag\`}>Add to bag <span aria-hidden="true">+</span></button></div></div></article>)}</div> : <div className="empty-products"><span>✳</span><p>No finds in that corner yet.</p><button onClick={() => { setCategory('Everything'); setSearch(''); }}>See everything</button></div>}`;

const repl3 = `{featuredProducts.length ? (
          <>
            <div className="product-grid" id="product-grid">
              {featuredProducts.map((product, index) => (
                <article className="product-card" key={product._id}>
                  <Link className="product-image" to={String(product._id).startsWith('p') ? '/shops' : \`/product/\${product._id}\`}>
                    <img
                      src={product.imageUrl || demoProducts[index % demoProducts.length].imageUrl}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = demoProducts[index % demoProducts.length]?.imageUrl || "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85";
                      }}
                    />
                    {product.label && <span className="product-label">{product.label}</span>}
                    <span className="product-heart" aria-hidden="true">♡</span>
                  </Link>
                  <div className="product-info">
                    <div className="product-meta">
                      <Link to={product.store?.slug ? \`/store/\${product.store.slug}\` : '/shops'}>
                        {product.store?.name || 'Luxury Boutique'}
                      </Link>
                      <span>★ 4.9</span>
                    </div>
                    <h3>{product.name}</h3>
                    <div className="product-bottom">
                      <strong>{formatPrice(product.price)}</strong>
                      <button onClick={() => addToBag(product)} aria-label={\`Add \${product.name} to bag\`}>
                        Add to bag <span aria-hidden="true">+</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {visibleProducts.length > visibleCount && (
              <div style={{ textAlign: 'center', margin: '2.5rem 0 1rem' }}>
                <button
                  type="button"
                  className="button button-dark"
                  onClick={loadMoreHome}
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
                  }}
                >
                  {loadingMore ? 'Loading more perfumes…' : <>Load More Perfumes ✦ ({Math.min(visibleCount, visibleProducts.length)} of {totalCount.toLocaleString('en-PK')})</>}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-products">
            <span>✳</span>
            <p>No finds in that corner yet.</p>
            <button onClick={() => { setCategory('Everything'); setSearch(''); }}>See everything</button>
          </div>
        )}`;

src = src.replace(target3, repl3);

fs.writeFileSync(homePath, src);
console.log('✅ Home.jsx updated with Load More functionality!');
