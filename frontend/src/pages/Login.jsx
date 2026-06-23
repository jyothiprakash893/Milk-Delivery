import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const validatePassword = (pwd) => {
  const errors = [];
  if (pwd.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(pwd)) errors.push('One number');
  if (!/[!@#$%^&*(),.?":{}|<>_]/.test(pwd)) errors.push('One special character');
  return errors;
};

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Special char', pass: /[!@#$%^&*(),.?":{}|<>_]/.test(password) },
  ];
  const passed = checks.filter(c => c.pass).length;
  const strength = passed <= 2 ? '#ef4444' : passed <= 3 ? '#f59e0b' : passed <= 4 ? '#06b6d4' : '#10b981';
  const label = passed <= 2 ? 'Weak' : passed <= 3 ? 'Fair' : passed <= 4 ? 'Good' : 'Strong';

  return (
    <div className="mt-2 mb-1">
      <div style={{ height: 4, borderRadius: 4, background: '#e2e8f0', overflow: 'hidden' }}>
        <div style={{ width: `${(passed / 5) * 100}%`, height: '100%', background: strength, borderRadius: 4, transition: 'all 0.3s' }} />
      </div>
      <div className="d-flex justify-content-between align-items-center mt-1">
        <div style={{ fontSize: '0.7rem', color: strength, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{passed}/5</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: 4 }}>
        {checks.map((c, i) => (
          <div key={i} style={{ fontSize: '0.65rem', color: c.pass ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 3 }}>
            <i className={`bi bi-${c.pass ? 'check-circle-fill' : 'circle'}`} style={{ fontSize: '0.5rem' }}></i>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center animated-bg p-4" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative floating shapes */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%', width: 300, height: 300,
        borderRadius: '50%', background: 'rgba(99,102,241,0.08)',
        filter: 'blur(60px)', animation: 'float 15s ease infinite'
      }}></div>
      <div style={{
        position: 'absolute', bottom: '10%', right: '5%', width: 250, height: 250,
        borderRadius: '50%', background: 'rgba(236,72,153,0.08)',
        filter: 'blur(60px)', animation: 'float 20s ease infinite reverse'
      }}></div>

      <div className="animate-fade-in-up" style={{ width: '420px', maxWidth: '100%', position: 'relative', zIndex: 1 }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem', borderRadius: '24px' }}>
          {/* Logo */}
          <div className="text-center mb-4">
            <div style={{
              width: 72, height: 72, borderRadius: 20,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 12px 40px rgba(99,102,241,0.35)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', inset: -3, borderRadius: 23,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.3), transparent, rgba(236,72,153,0.3))',
                zIndex: -1
              }}></div>
              <i className="bi bi-droplet text-white" style={{ fontSize: '2rem' }}></i>
            </div>
            <h4 className="fw-bold mb-1" style={{ color: 'var(--dark)', fontSize: '1.4rem' }}>Welcome Back</h4>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>USERNAME</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#94a3b8', fontSize: '1rem', zIndex: 1
                }}></i>
                <input
                  type="text"
                  className="form-control form-control-modern"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Enter your username"
                  required
                  style={{ paddingLeft: '2.5rem', height: 48 }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#94a3b8', fontSize: '1rem', zIndex: 1
                }}></i>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="form-control form-control-modern"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: 48 }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4
                }}>
                  <i className={`bi bi-${showPwd ? 'eye-slash' : 'eye'}`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn w-100 py-2.5" disabled={loading}
              style={{
                padding: '0.75rem 1rem', fontSize: '0.95rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', border: 'none', borderRadius: '12px',
                boxShadow: '0 6px 24px rgba(99,102,241,0.35)',
                letterSpacing: '0.02em',
                transition: 'all 0.3s',
                opacity: loading ? 0.8 : 1
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 32px rgba(99,102,241,0.45)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 24px rgba(99,102,241,0.35)'; }}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>New customer? </span>
            <Link to="/register" style={{
              color: '#6366f1', fontSize: '0.85rem', fontWeight: 600,
              textDecoration: 'none', borderBottom: '2px solid rgba(99,102,241,0.2)'
            }}>
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
