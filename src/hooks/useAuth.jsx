import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as authService from '../services/authService';
import { setToken, clearToken } from '../services/tokenStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService
      .refresh()
      .then((data) => {
        setToken(data.accessToken);
        setUser(data.user);
      })
      .catch(() => {
        // sessão inexistente ou expirada — estado inicial correto
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    setToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authService.register(formData);
    setToken(data.accessToken);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
