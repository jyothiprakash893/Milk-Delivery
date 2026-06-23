import { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, logout as logoutApi, getProfile } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const id = localStorage.getItem('userId');
    const customerId = localStorage.getItem('customerId');
    const deliveryBoyId = localStorage.getItem('deliveryBoyId');
    const isActive = localStorage.getItem('isActive');
    if (token && role) {
      setUser({ role, username, id: id ? Number(id) : null, customerId: customerId ? Number(customerId) : null, deliveryBoyId: deliveryBoyId ? Number(deliveryBoyId) : null, isActive: isActive === 'true' });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    const { accessToken, refreshToken, role, username, id, customerId, deliveryBoyId, isActive } = res.data;
    if (!isActive) {
      throw { response: { data: { message: 'Your account is pending approval. Please wait for admin to activate your account.' } } };
    }
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
    if (id) localStorage.setItem('userId', id);
    if (customerId) localStorage.setItem('customerId', customerId);
    if (deliveryBoyId) localStorage.setItem('deliveryBoyId', deliveryBoyId);
    localStorage.setItem('isActive', isActive);
    setUser({ role, username, id, customerId, deliveryBoyId, isActive });
    return role;
  };

  const logout = async () => {
    try { await logoutApi(); } catch {}
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    try {
      const res = await getProfile();
      const { role, username, id, customerId, deliveryBoyId, isActive } = res.data;
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);
      if (id) localStorage.setItem('userId', id);
      if (customerId) localStorage.setItem('customerId', customerId);
      if (deliveryBoyId) localStorage.setItem('deliveryBoyId', deliveryBoyId);
      localStorage.setItem('isActive', isActive);
      setUser({ role, username, id, customerId, deliveryBoyId, isActive });
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
