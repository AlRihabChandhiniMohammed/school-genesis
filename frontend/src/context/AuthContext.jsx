import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.me().then(r => setUser(r.data.user)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await authAPI.login({ email, password });
    setUser(r.data.user);
    return r.data;
  };

  const register = async (data) => {
    const r = await authAPI.register(data);
    setUser(r.data.user);
    return r.data;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, register, logout, loading, setUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
