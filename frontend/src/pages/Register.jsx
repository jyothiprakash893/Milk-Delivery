import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/authApi';
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
    <div className="mt-2">
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

const Register = () => {
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    name: '', phone: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const pwdErrors = validatePassword(form.password);
  const pwdMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;

  const handleNext = () => {
    if (!form.name || !form.phone || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.phone.length < 10) {
      toast.error('Enter a valid 10-digit phone number');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Please fill all fields');
      return;
    }
    if (pwdErrors.length > 0) {
      toast.error('Fix password requirements');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center animated-bg p-4" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative shapes */}
      <div style={{
        position: 'absolute', top: '5%', right: '8%', width: 280, height: 280,
        borderRadius: '50%', background: 'rgba(16,185,129,0.06)',
        filter: 'blur(60px)', animation: 'float 18s ease infinite'
      }}></div>
      <div style={{
        position: 'absolute', bottom: '8%', left: '5%', width: 220, height: 220,
        borderRadius: '50%', background: 'rgba(99,102,241,0.06)',
        filter: 'blur(50px)', animation: 'float 22s ease infinite reverse'
      }}></div>

      <div className="animate-fade-in-up" style={{ width: '500px', maxWidth: '100%', position: 'relative', zIndex: 1 }}>
        <div className="glass-card" style={{ padding: '2.5rem 2rem', borderRadius: '24px' }}>
          {/* Progress steps */}
          <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: step === 1 ? 'linear-gradient(135deg, #10b981, #059669)' : '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.85rem', fontWeight: 700
            }}>1</div>
            <div style={{ width: 40, height: 2, background: step === 2 ? '#10b981' : '#e2e8f0', borderRadius: 2, transition: 'all 0.3s' }}></div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: step === 2 ? 'linear-gradient(135deg, #10b981, #059669)' : '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step === 2 ? '#fff' : '#94a3b8', fontSize: '0.85rem', fontWeight: 700,
              transition: 'all 0.3s'
            }}>2</div>
          </div>

          <div className="text-center mb-4">
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: step === 1
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: step === 1
                ? '0 8px 32px rgba(16,185,129,0.3)'
                : '0 8px 32px rgba(99,102,241,0.3)',
              transition: 'all 0.3s'
            }}>
              <i className={`bi ${step === 1 ? 'bi-person-plus' : 'bi-shield-lock'} text-white`} style={{ fontSize: '1.6rem' }}></i>
            </div>
            <h4 className="fw-bold mb-1" style={{ color: 'var(--dark)', fontSize: '1.3rem' }}>
              {step === 1 ? 'Personal Details' : 'Account Setup'}
            </h4>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              {step === 1 ? 'Tell us about yourself' : 'Create your login credentials'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="animate-fade-in">
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>FULL NAME *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-person" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}></i>
                    <input type="text" className="form-control form-control-modern" placeholder="Your full name"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                      style={{ paddingLeft: '2.5rem', height: 48 }} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>PHONE *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-telephone" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}></i>
                    <input type="tel" className="form-control form-control-modern" placeholder="10-digit mobile number"
                      value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required
                      style={{ paddingLeft: '2.5rem', height: 48 }} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>ADDRESS *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-geo-alt" style={{ position: 'absolute', left: 14, top: 14, color: '#94a3b8', zIndex: 1 }}></i>
                    <textarea className="form-control form-control-modern" rows="3" placeholder="Delivery address"
                      value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required
                      style={{ paddingLeft: '2.5rem' }} />
                  </div>
                </div>
                <button type="button" className="btn w-100 py-2.5" onClick={handleNext}
                  style={{
                    padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    boxShadow: '0 6px 24px rgba(16,185,129,0.35)',
                    letterSpacing: '0.02em',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 32px rgba(16,185,129,0.45)'; }}
                  onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 24px rgba(16,185,129,0.35)'; }}>
                  Next Step <i className="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="mb-3">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>USERNAME *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-at" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}></i>
                    <input type="text" className="form-control form-control-modern" placeholder="Choose a username"
                      value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required
                      style={{ paddingLeft: '2.5rem', height: 48 }} />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>PASSWORD *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}></i>
                    <input type={showPwd ? 'text' : 'password'} className="form-control form-control-modern" placeholder="Create a strong password"
                      value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: 48 }} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4
                    }}>
                      <i className={`bi bi-${showPwd ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                  {form.password && <PasswordStrength password={form.password} />}
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>CONFIRM PASSWORD *</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-shield-check" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}></i>
                    <input type={showConfirm ? 'text' : 'password'} className="form-control form-control-modern" placeholder="Re-enter password"
                      value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: 48,
                        borderColor: form.confirmPassword && !pwdMatch ? '#ef4444' : form.confirmPassword && pwdMatch ? '#10b981' : '' }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4
                    }}>
                      <i className={`bi bi-${showConfirm ? 'eye-slash' : 'eye'}`}></i>
                    </button>
                  </div>
                  {form.confirmPassword && (
                    <div style={{ fontSize: '0.75rem', color: pwdMatch ? '#10b981' : '#ef4444', marginTop: 4 }}>
                      <i className={`bi bi-${pwdMatch ? 'check-circle' : 'x-circle'} me-1`}></i>
                      {pwdMatch ? 'Passwords match' : 'Passwords do not match'}
                    </div>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn px-4" onClick={() => setStep(1)}
                    style={{
                      padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 600,
                      background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px',
                      flex: 1
                    }}>
                    <i className="bi bi-arrow-left me-1"></i> Back
                  </button>
                  <button type="submit" className="btn px-4" disabled={loading}
                    style={{
                      padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, flex: 1,
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: '#fff', border: 'none', borderRadius: '12px',
                      boxShadow: '0 6px 24px rgba(99,102,241,0.35)',
                      transition: 'all 0.3s', opacity: loading ? 0.8 : 1
                    }}
                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 32px rgba(99,102,241,0.45)'; }}
                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 24px rgba(99,102,241,0.35)'; }}>
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Already have an account? </span>
            <Link to="/login" style={{
              color: '#6366f1', fontSize: '0.85rem', fontWeight: 600,
              textDecoration: 'none', borderBottom: '2px solid rgba(99,102,241,0.2)'
            }}>
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Register;
