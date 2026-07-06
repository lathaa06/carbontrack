import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authService.register(formData);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const loginWithToken = useCallback((token, userProfile) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userProfile));
    setUser(userProfile);
  }, []);

  const updateUser = useCallback((updatedProfile) => {
    localStorage.setItem('user', JSON.stringify(updatedProfile));
    setUser(updatedProfile);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isOrgAdmin = user?.role === 'ORG_ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isAdmin, isOrgAdmin, loginWithToken, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
