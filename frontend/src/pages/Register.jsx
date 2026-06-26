import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
  });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpType, setOtpType] = useState('');
  const [otpContact, setOtpContact] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSentAt, setOtpSentAt] = useState(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  // Validate password strength
  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('One number');
    if (!/[!@#$%^&*(),.?":{}|<>_]/.test(pwd)) errors.push('One special character');
    return errors;
  };

  // Password strength visual
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
              <i className={`bi ${c.pass ? 'check-circle-fill' : 'circle'}`} style={{ fontSize: '0.5rem' }}></i>
              {c.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Send OTP (phone or email)
  const sendOTP = async (type, contact) => {
    try {
      const response = await axios.post(
        `/api/auth/otp/send`,
        { username: contact, type },
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success(`OTP sent via ${type}`);
      setOtpType(type);
      setOtpContact(contact);
      const now = Date.now();
      setOtpSentAt(now);
      setOtpTimer(5 * 60); // 5 min countdown in seconds
      setResendDisabled(true);
      const interval = setInterval(() => {
        setOtpTimer(prev => Math.max(prev - 1, 0));
        if (prev <= 1) {
          clearInterval(interval);
          setResendDisabled(false);
        }
      }, 1000);
      // Store interval reference if you need to clear on unmount
      // Example: useRef(interval)...
      setShowOtpModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!otpCode) return;
    try {
      const response = await axios.post(
        `/api/auth/otp/verify`,
        { username: otpContact, type: otpType, code: otpCode }
      );
      if (response.data.success) {
        toast.success('OTP verified');
        setShowOtpModal(false);
        if (otpType === 'phone') {
          setPhoneOtpVerified(true);
        } else if (otpType === 'email') {
          setEmailOtpVerified(true);
        }
        // Reset timer & modal state
        setOtpSentAt(null);
        setOtpTimer(0);
        setResendDisabled(false);
        setOtpCode('');
      } else {
        toast.error(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP verification failed');
    }
  };

  // Format seconds for countdown timer
  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Check if both OTP verifications are done before proceeding
  const canProceedToNext = () => {
    // When step < 2 we haven't started OTP flow yet, so allow proceeding
    // After OTP flow we need both phone and email verified
    return (step < 2 || (phoneOtpVerified && emailOtpVerified));
  };

  // Handlers for form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Proceed to next step (or trigger OTP flow)
  const handleNext = async () => {
    if (step === 1) {
      // After personal details, send phone OTP
      if (!form.name || !form.phone || !form.address) {
        toast.error('Please fill all required fields');
        return;
      }
      if (form.phone.length < 10) {
        toast.error('Enter a valid 10-digit phone number');
        return;
      }
      await sendOTP('phone', form.phone);
      // Phone OTP flow will be completed later before moving forward
    } else if (step === 2) {
      // Normal next button behavior (used in Account Setup section)
      // It will be overridden by submit handler for final registration
    }
  };

  // Submit registration (final step)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canProceedToNext()) {
      toast.error('Both phone and email OTP must be verified before registration');
      return;
    }
    if (!form.username || !form.password) {
      toast.error('Please fill all fields');
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
      toast.success('Registration submitted for approval! Admin will activate your account.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer display
  const TimerDisplay = () => {
    if (!otpTimer) return null;
    return (
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        Expires in: <strong>{formatSeconds(otpTimer)}</strong>
      </div>
    );
  };

  // Modal UI for OTP entry
  const OTPModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Enter OTP</h2>
          {TimerDisplay()}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">{otpType === 'phone' ? 'Phone' : 'Email'}:</label>
              <p className="mt-1 text-sm text-gray-600">{otpContact}</p>
            </div>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter OTP"
            />
            {!resendDisabled && (
              <button
                onClick={() => sendOTP(otpType, otpContact)}
                className="w-full py-2.5 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                disabled={resendDisabled}
              >
                Resend OTP
              </button>
            )}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={verifyOTP}
              className="px-6 py-2.5 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              disabled={!otpCode}
            >
              Verify OTP
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Personal details section (step 1)
  const PersonalDetailsSection = () => (
    <div className="animate-fade-in mb-4">
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>FULL NAME *</label>
        <div style={{ position: 'relative' }}>
          <i className="bi bi-person" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}></i>
          <input type="text" className="form-control form-control-modern" placeholder="Your full name"
                 value={form.name} onChange={handleChange} required
                 style={{ paddingLeft: '2.5rem', height: 48 }} />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>PHONE *</label>
        <div style={{ position: 'relative' }}>
          <i className="bi bi-telephone" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}></i>
          <input type="tel" className="form-control form-control-modern" placeholder="10-digit mobile number"
                 value={form.phone} onChange={handleChange} required
                 style={{ paddingLeft: '2.5rem', height: 48 }} />
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>ADDRESS *</label>
        <div style={{ position: 'relative' }}>
          <i className="bi bi-geo-alt" style={{ position: 'absolute', left: 14, top: 14, color: '#94a3b8', zIndex: 1 }}></i>
          <textarea className="form-control form-control-modern" rows="3" placeholder="Delivery address"
                    value={form.address} onChange={handleChange} required
                    style={{ paddingLeft: '2.5rem' }} />
        </div>
      </div>
      <button type="button" className="btn w-100 py-2.5" onClick={handleNext}
              style={{
                padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', border: 'none', borderRadius: '12px',
                boxShadow: '0 6px 24px rgba(16,185,129,0.35)',
                transition: 'all 0.3s'
              })}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 32px rgba(16,185,129,0.45)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 6px 24px rgba(16,185,129,0.35)'; }}>
        Next Step <i className="bi bi-arrow-right ms-1"></i>
      </button>
    </div>
  );

  // Account setup section (step 2 - username/password)
  const AccountSetupSection = () => (
    <div className="animate-fade-in">
      <div className="mb-3">
        <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>USERNAME *</label>
        <div style={{ position: 'relative' }}>
          <i className="bi bi-at" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}></i>
          <input type="text" className="form-control form-control-modern" placeholder="Choose a username"
                 value={form.username} onChange={handleChange} required
                 style={{ paddingLeft: '2.5rem', height: 48 }} />
        </div>
      </div>
      <div className="mb-2">
        <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>PASSWORD *</label>
        <div style={{ position: 'relative' }}>
          <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}></i>
          <input type={showPwd ? 'text' : 'password'} className="form-control form-control-modern" placeholder="Create a strong password"
                 value={form.password} onChange={handleChange} required
                 style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: 48 }} />
          <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4
          }}>
            <i className={`bi ${showPwd ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        {/* Password strength feedback */}
        {form.password && (
          <PasswordStrength password={form.password} />
        )}
        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ fontSize: '0.8rem', color: '#475569', letterSpacing: '0.02em' }}>CONFIRM PASSWORD *</label>
          <div style={{ position: 'relative' }}>
            <i className="bi bi-shield-check" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 1 }}></i>
            <input type={showConfirm ? 'text' : 'password'} className="form-control form-control-modern" placeholder="Re-enter password"
                   value={form.confirmPassword} onChange={handleChange} required
                   style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', height: 48,
                    borderColor: form.confirmPassword && !pwdMatch ? '#ef4444' : form.confirmPassword && pwdMatch ? '#10b981' : '' }} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4
            }}>
              <i className={`bi ${showConfirm ? 'eye-slash' : 'eye'}`}></i>
            </button>
          </div>
          {form.confirmPassword && (
            <div style={{ fontSize: '0.75rem', color: pwdMatch ? '#10b981' : '#ef4444', marginTop: 4 }}>
              <i className={`bi ${pwdMatch ? 'check-circle' : 'x-circle'} me-1'></i>
              {pwdMatch ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}
        </div>
      </div>

      <div className="d-flex gap-2">
        <button type="button" className="btn px-4" onClick={() => setStep(1)}
                style={{
                  padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 600,
                  background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px',
                  flex: 1
                }}>
          Back <i className="bi bi-arrow-left ms-1"></i>
        </button>
        <button type="submit" className="btn px-4" disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, flex: 1,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  boxShadow: '0 6px 24px rgba(99,102,241,0.35)',
                  transition: 'all 0.3s', opacity: loading ? 0.8 : 1
                })}
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </div>
    </div>
  });

  // Password strength validation outputs
  const pwdErrors = validatePassword(form.password);
  const pwdMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;

  // Render logic
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
            }>{step === 1 ? '1' : '2'}</div>
            <div style={{ width: 40, height: 2, background: step === 2 ? '#10b981' : '#e2e8f0', borderRadius: 2, transition: 'all 0.3s' }}></div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: step === 2 ? 'linear-gradient(135deg, #10b981, #059669)' : '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step === 2 ? '#fff' : '#94a3b8', fontSize: '0.85rem', fontWeight: 700,
              transition: 'all 0.3s'
            }>{step === 2 ? '2' : '1'}</div>
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
            <h4 className="fw-bold mb-0" style={{ color: 'var(--dark)', fontSize: '1.3rem' }}>
              ENK's MILK
            </h4>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 2 }}>
              {step === 1 ? 'Tell us about yourself' : 'Create your login credentials'}
            </p>
            <div style={{ height: 1, background: '#e2e8f0', margin: '0.75rem 0' }}></div>
            <h4 className="fw-bold mb-1" style={{ color: '#475569', fontSize: '1.1rem' }}>
              {step === 1 ? 'Personal Details' : 'Account Setup'}
            </h4>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              {step === 1 ? 'Tell us about yourself' : 'Create your login credentials'}
            </p>
          </div>

          {step === 1 ? (
            <PersonalDetailsSection />
          ) : (
            <AccountSetupSection />
          )}

          {/* OTP Modal */}
          {showOtpModal && (
            <OTPModal />
          )}

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