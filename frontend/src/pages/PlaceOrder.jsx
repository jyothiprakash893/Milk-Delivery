import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosInstance from '../api/axiosInstance';

const PlaceOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    milkType: 'Cow',
    quantity: '',
    deliveryDate: '',
    deliveryTime: 'Morning 6-8AM',
    deliveryAddress: '',
    specialInstructions: '',
  });

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
    if (!form.quantity || !form.deliveryDate || !form.deliveryAddress.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate({
      customerId: user?.customerId,
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

      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="glass-card p-4 animate-fade-in-up"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(139,92,246,0.02))',
              border: '1px solid rgba(139,92,246,0.12)'
            }}>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  Milk Type <span className="text-danger">*</span>
                </label>
                <select className="form-control form-control-modern" name="milkType"
                  value={form.milkType} onChange={handleChange}>
                  <option value="Cow">Cow Milk</option>
                  <option value="Buffalo">Buffalo Milk</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>
                  Quantity (Litres) <span className="text-danger">*</span>
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
    </div>
  );
};
export default PlaceOrder;
