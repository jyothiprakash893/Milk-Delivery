import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/authApi';
import { toast } from 'react-toastify';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
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
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div className="card shadow" style={{ width: '450px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-droplet text-primary" style={{ fontSize: '3rem' }}></i>
            <h4 className="mt-2">Customer Registration</h4>
            <p className="text-muted small">Create your account to track deliveries</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username *</label>
              <input
                type="text"
                className="form-control"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Choose a username"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                className="form-control"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile number"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Address *</label>
              <textarea
                className="form-control"
                rows="2"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Delivery address"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-control"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Creating account...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-muted small">Already have an account? </span>
            <Link to="/login" className="small">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
