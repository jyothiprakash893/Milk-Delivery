import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/authApi';
import { toast } from 'react-toastify';

const Register = () => {
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    name: '', phone: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.name || !form.phone || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await registerApi({
        username: form.username,
        password: form.password,
        role: 'CUSTOMER',
        customerId: null,
        name: form.name,
        phone: form.phone,
        address: form.address,
      });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center animated-bg p-4">
      <div className="animate-fade-in-up" style={{ width: '460px', maxWidth: '100%' }}>
        <div className="glass-card p-4">
          <div className="text-center mb-4">
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 32px rgba(16,185,129,0.3)'
            }}>
              <i className="bi bi-person-plus text-white" style={{ fontSize: '1.6rem' }}></i>
            </div>
            <h4 className="fw-bold mb-1" style={{ color: 'var(--dark)' }}>Create Account</h4>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Register to track your deliveries</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569' }}>Username *</label>
                <input type="text" className="form-control form-control-modern" placeholder="Choose username"
                  value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569' }}>Full Name *</label>
                <input type="text" className="form-control form-control-modern" placeholder="Your name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569' }}>Phone *</label>
                <input type="tel" className="form-control form-control-modern" placeholder="10-digit mobile"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569' }}>Password *</label>
                <input type="password" className="form-control form-control-modern" placeholder="Min 6 chars"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569' }}>Address *</label>
                <textarea className="form-control form-control-modern" rows="2" placeholder="Delivery address"
                  value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569' }}>Confirm Password *</label>
                <input type="password" className="form-control form-control-modern" placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-modern w-100 mt-4 py-2.5" disabled={loading}
              style={{
                padding: '0.7rem 1rem', fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
                border: 'none', borderRadius: '10px', fontWeight: 600
              }}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Creating account...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Already have an account? </span>
            <Link to="/login" className="fw-semibold" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
