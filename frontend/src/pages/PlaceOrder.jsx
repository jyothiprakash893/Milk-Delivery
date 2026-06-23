import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';
import { getActiveProducts } from '../api/productApi';

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

const PlaceOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceInfo, setPriceInfo] = useState(null);

  const [form, setForm] = useState({
    milkType: '',
    quantity: '',
    deliveryDate: '',
    deliveryTime: 'Morning 6-8AM',
    deliveryAddress: '',
    specialInstructions: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getActiveProducts();
        const list = res.data || [];
        setProducts(list);
        if (location.state?.product) {
          const match = list.find((p) => p.id === location.state.product.id);
          if (match) selectProduct(match);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setPriceInfo({ price: product.price, unit: product.unit || 'Liter' });
    setForm((prev) => ({
      ...prev,
      milkType: product.name,
    }));
  };

  const createMutation = useMutation(
    (data) => axiosInstance.post('/orders', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['myOrders', user?.customerId]);
        toast.success('Order placed successfully!');
        navigate('/my-orders');
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || 'Failed to place order');
      },
    }
  );

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }
    if (!form.quantity || !form.deliveryDate || !form.deliveryAddress.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      customerId: user?.customerId,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      unitPrice: selectedProduct.price,
      milkType: form.milkType,
      quantity: Number(form.quantity),
      deliveryDate: form.deliveryDate,
      deliveryTime: form.deliveryTime,
      deliveryAddress: form.deliveryAddress,
      specialInstructions: form.specialInstructions,
    });
  };

  return (
    <div>
      <div className="page-header animate-fade-in">
        <h4><i className="bi bi-cart-plus text-purple"></i> Place Order</h4>
        <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Order fresh milk for delivery</p>
      </div>

      {loadingProducts ? (
        <div className="text-center py-5">
          <div className="spinner-border text-purple" role="status" />
        </div>
      ) : (
        <>
          {!selectedProduct && (
            <div className="mb-4 animate-fade-in-up">
              <label className="form-label fw-semibold mb-3" style={{ fontSize: '0.85rem' }}>
                Select a Product <span className="text-danger">*</span>
              </label>
              <div className="row g-3">
                {products.length === 0 ? (
                  <div className="col-12">
                    <div className="glass-card p-4 text-center">
                      <p className="text-muted mb-0">No products available</p>
                    </div>
                  </div>
                ) : (
                  products.map((product) => {
                    const isOut = product.quantity <= 0;
                    return (
                      <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                        <div
                          className="glass-card p-3 text-center"
                          style={{
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02))',
                            border: '1px solid rgba(139,92,246,0.12)',
                            cursor: isOut ? 'not-allowed' : 'pointer',
                            opacity: isOut ? 0.5 : 1,
                            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                          }}
                          onMouseEnter={(e) => {
                            if (!isOut) {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 12px 32px rgba(139,92,246,0.15)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '';
                          }}
                          onClick={() => { if (!isOut) selectProduct(product); }}
                        >
                          <div
                            style={{
                              width: 48, height: 48, borderRadius: 12, margin: '0 auto 8px',
                              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.5rem',
                            }}
                          >
                            {getProductEmoji(product.name)}
                          </div>
                          <h6 className="fw-bold mb-1" style={{ fontSize: '0.85rem', color: 'var(--dark)' }}>
                            {product.name}
                          </h6>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#8b5cf6' }}>
                            ₹{product.price}
                          </div>
                          <small className="text-muted">per {product.unit || 'Unit'}</small>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className="mb-4 animate-fade-in-up">
              <div
                className="glass-card p-3 d-flex align-items-center justify-content-between"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.03))',
                  border: '1px solid rgba(139,92,246,0.15)',
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem',
                    }}
                  >
                    {getProductEmoji(selectedProduct.name)}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--dark)' }}>{selectedProduct.name}</strong>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      Unit Price: <span style={{ color: '#8b5cf6', fontWeight: 700 }}>₹{selectedProduct.price}</span> / {selectedProduct.unit || 'Liter'}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-sm"
                  style={{
                    background: 'transparent', border: '1px solid rgba(139,92,246,0.2)',
                    color: '#8b5cf6', borderRadius: '8px', fontSize: '0.78rem',
                  }}
                  onClick={() => { setSelectedProduct(null); setPriceInfo(null); setForm((prev) => ({ ...prev, milkType: '' })); }}
                >
                  <i className="bi bi-arrow-left me-1"></i> Change
                </button>
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className="row justify-content-center animate-fade-in-up">
              <div className="col-md-8 col-lg-6">
                <div className="glass-card p-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02))',
                    border: '1px solid rgba(139,92,246,0.12)'
                  }}>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Product <span className="text-danger">*</span>
                      </label>
                      <input type="text" className="form-control form-control-modern"
                        value={selectedProduct.name} disabled />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Unit Price
                      </label>
                      <div className="form-control form-control-modern d-flex align-items-center"
                        style={{ background: 'rgba(139,92,246,0.04)', color: '#8b5cf6', fontWeight: 700 }}>
                        ₹{selectedProduct.price} / {selectedProduct.unit || 'Liter'}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Quantity ({selectedProduct.unit || 'Litres'}) <span className="text-danger">*</span>
                      </label>
                      <input type="number" className="form-control form-control-modern" name="quantity"
                        value={form.quantity} onChange={handleChange} min="0.5" step="0.5"
                        placeholder="e.g. 1, 2, 3..." />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Delivery Date <span className="text-danger">*</span>
                      </label>
                      <input type="date" className="form-control form-control-modern" name="deliveryDate"
                        value={form.deliveryDate} onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Delivery Time <span className="text-danger">*</span>
                      </label>
                      <select className="form-control form-control-modern" name="deliveryTime"
                        value={form.deliveryTime} onChange={handleChange}>
                        <option value="Morning 6-8AM">Morning 6-8AM</option>
                        <option value="Evening 5-7PM">Evening 5-7PM</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Delivery Address <span className="text-danger">*</span>
                      </label>
                      <textarea className="form-control form-control-modern" name="deliveryAddress" rows="3"
                        value={form.deliveryAddress} onChange={handleChange}
                        placeholder="Enter your full delivery address"></textarea>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                        Special Instructions
                      </label>
                      <textarea className="form-control form-control-modern" name="specialInstructions" rows="2"
                        value={form.specialInstructions} onChange={handleChange}
                        placeholder="Any special requests (optional)"></textarea>
                    </div>

                    <button type="submit" className="btn btn-modern w-100 py-2 fw-semibold"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                        color: '#fff', border: 'none', borderRadius: '12px', fontSize: '0.95rem'
                      }}
                      disabled={createMutation.isLoading}>
                      {createMutation.isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Placing Order...
                        </>
                      ) : (
                        <><i className="bi bi-check2-circle me-2"></i>Place Order</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default PlaceOrder;
