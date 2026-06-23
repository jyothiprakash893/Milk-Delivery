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
      toast.success('Login successful');
      navigate(role === 'ADMIN' ? '/dashboard' : '/my-deliveries', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ width: '400px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-droplet text-primary" style={{ fontSize: '3rem' }}></i>
            <h4 className="mt-2">Milk Delivery System</h4>
            <p className="text-muted small">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter username"
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          <div className="text-center mt-3">
            <span className="text-muted small">New customer? </span>
            <Link to="/register" className="small">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
