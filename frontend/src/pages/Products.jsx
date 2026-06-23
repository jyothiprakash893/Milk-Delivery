import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveProducts } from '../api/productApi';
import LoadingSpinner from '../components/common/LoadingSpinner';

const productIcons = {
  'milk': 'bi-cup-straw',
  'curd': 'bi-bucket',
  'paneer': 'bi-box-seam',
  'ghee': 'bi-droplet',
  'butter': 'bi-cup-hot',
  'cheese': 'bi-box',
  'cream': 'bi-droplet-half',
};

const defaultIcon = 'bi-box';

const getProductIcon = (name) => {
  const key = Object.keys(productIcons).find((k) => name?.toLowerCase().includes(k));
  return key ? productIcons[key] : defaultIcon;
};

const getProductEmoji = (name) => {
  const lower = name?.toLowerCase() || '';
  if (lower.includes('milk')) return '🥛';
  if (lower.includes('curd')) return '🫙';
  if (lower.includes('paneer')) return '🧀';
  if (lower.includes('ghee')) return '🧈';
  if (lower.includes('butter')) return '🧈';
  if (lower.includes('cheese')) return '🧀';
  if (lower.includes('cream')) return '🥛';
  if (lower.includes('lassi')) return '🥤';
  return '📦';
};

const stockStatus = (qty) => {
  if (qty == null || qty <= 0) return { label: 'Out of Stock', class: 'badge-danger-custom' };
  if (qty <= 10) return { label: 'Low Stock', class: 'badge-warning-custom' };
  return { label: 'In Stock', class: 'badge-success-custom' };
};

const categories = ['All', 'Milk', 'Curd', 'Paneer', 'Ghee'];

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getActiveProducts();
        setProducts(res.data || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products.filter((p) => {
    const name = (p.name || '').toLowerCase();
    const matchesSearch = name.includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' || name.includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-shop text-success"></i> Our Products</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
          Fresh milk products delivered daily
        </p>
      </div>

      <div className="glass-card p-3 mb-4 animate-fade-in-up">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="search-bar">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="form-control form-control-modern"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-7">
            <div className="d-flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-modern btn-sm ${
                    activeCategory === cat
                      ? 'btn-modern-primary'
                      : ''} px-3`}
                  style={
                    activeCategory !== cat
                      ? {
                          background: 'transparent',
                          border: '2px solid #e2e8f0',
                          color: '#64748b',
                        }
                      : {}
                  }
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'All' ? (
                    <><i className="bi bi-grid-3x3-gap-fill me-1"></i>All</>
                  ) : (
                    <>{getProductEmoji(cat)} {cat}</>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-5 text-center animate-fade-in-up">
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p>No products found</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filtered.map((product, i) => {
            const stock = stockStatus(product.quantity);
            return (
              <div
                key={product.id || i}
                className="col-xl-3 col-lg-4 col-md-6 animate-fade-in-up"
                style={{ animationDelay: `${(i % 8) * 0.07}s` }}
              >
                <div
                  className="glass-card p-4 h-100 d-flex flex-column"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(16,185,129,0.01))',
                    border: '1px solid rgba(16,185,129,0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <div className="text-center mb-3">
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        margin: '0 auto',
                      }}
                    >
                      {getProductEmoji(product.name)}
                    </div>
                  </div>

                  <h6
                    className="fw-bold text-center mb-1"
                    style={{ color: 'var(--dark)', fontSize: '1rem' }}
                  >
                    {product.name}
                  </h6>

                  {product.description && (
                    <p
                      className="text-muted text-center mb-3"
                      style={{
                        fontSize: '0.78rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={product.description}
                    >
                      {product.description}
                    </p>
                  )}

                  <div className="text-center mb-3">
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'var(--dark)',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      ₹{product.price}
                    </span>
                    <span
                      className="text-muted d-block"
                      style={{ fontSize: '0.75rem', marginTop: 2 }}
                    >
                      per {product.unit || 'Unit'}
                    </span>
                  </div>

                  <div className="text-center mb-3">
                    <span
                      className={`badge-modern ${stock.class}`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      <i
                        className={`bi ${
                          stock.label === 'In Stock'
                            ? 'bi-check-circle'
                            : stock.label === 'Low Stock'
                            ? 'bi-exclamation-circle'
                            : 'bi-x-circle'
                        } me-1`}
                      ></i>
                      {stock.label}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <button
                      className="btn btn-modern w-100 py-2 fw-semibold"
                      style={{
                        background:
                          stock.label === 'Out of Stock'
                            ? '#e2e8f0'
                            : 'linear-gradient(135deg, #10b981, #059669)',
                        color: stock.label === 'Out of Stock' ? '#94a3b8' : '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        cursor: stock.label === 'Out of Stock' ? 'not-allowed' : 'pointer',
                      }}
                      disabled={stock.label === 'Out of Stock'}
                      onClick={() =>
                        navigate('/place-order', {
                          state: {
                            product: {
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              unit: product.unit,
                            },
                          },
                        })
                      }
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      {stock.label === 'Out of Stock' ? 'Unavailable' : 'Add to Order'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Products;
