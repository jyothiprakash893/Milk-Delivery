import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserFromOAuth } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Google sign-in failed. Please try again.');
      return;
    }

    if (accessToken) {
      const refreshToken = searchParams.get('refreshToken');
      const role = searchParams.get('role');
      const username = searchParams.get('username');
      const id = searchParams.get('id');
      const customerId = searchParams.get('customerId');
      const deliveryBoyId = searchParams.get('deliveryBoyId');

      setUserFromOAuth({ accessToken, refreshToken, role, username, id, customerId, deliveryBoyId });

      const redirects = {
        ADMIN: '/dashboard',
        CUSTOMER: '/my-dashboard',
        DELIVERY_BOY: '/boy-dashboard',
      };
      navigate(redirects[role] || '/my-dashboard', { replace: true });
    } else {
      setError('No authentication data received.');
    }
  }, []);

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center animated-bg p-4">
        <div className="glass-card text-center" style={{ padding: '3rem', borderRadius: '24px', maxWidth: 420 }}>
          <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
          <h5 className="mt-3 fw-bold">{error}</h5>
          <button className="btn mt-3 px-4 py-2" style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
            border: 'none', borderRadius: '12px', fontWeight: 600
          }} onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center animated-bg p-4">
      <div className="glass-card text-center" style={{ padding: '3rem', borderRadius: '24px', maxWidth: 420 }}>
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
        <h5 className="fw-bold">Signing you in...</h5>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>Please wait</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
