import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate(user.role === 'ADMIN' ? '/dashboard' : '/my-deliveries', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const role = await login(form);
      toast.success('Welcome back!');
      navigate(role === 'ADMIN' ? '/dashboard' : '/my-deliveries', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center animated-bg p-4">
      <div className="animate-fade-in-up" style={{ width: '420px', maxWidth: '100%' }}>
        <div className="glass-card p-4">
          {/* Logo */}
          <div className="text-center mb-4">
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 32px rgba(99,102,241,0.3)'
            }}>
              <i className="bi bi-droplet text-white" style={{ fontSize: '2rem' }}></i>
            </div>
            <h4 className="fw-bold mb-1" style={{ color: 'var(--dark)' }}>Welcome Back</h4>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Username</label>
              <input
                type="text"
                className="form-control form-control-modern"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: '#475569' }}>Password</label>
              <input
                type="password"
                className="form-control form-control-modern"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </div>
            <button type="submit" className="btn btn-modern btn-modern-primary w-100 py-2.5" disabled={loading}
              style={{ padding: '0.7rem 1rem', fontSize: '0.95rem' }}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>New customer? </span>
            <Link to="/register" className="fw-semibold" style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
