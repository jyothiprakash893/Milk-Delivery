import { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, logout as logoutApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const customerId = localStorage.getItem('customerId');
    if (token && role) {
      setUser({ role, username, customerId });
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    const { accessToken, refreshToken, role, username, customerId } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
    if (customerId) localStorage.setItem('customerId', customerId);
    setUser({ role, username, customerId });
    return role;
  };

  const logout = async () => {
    try { await logoutApi(); } catch {}
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
