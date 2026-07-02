import { createContext, useContext, useState, useCallback } from 'react';
import * as adminAuthService from '../services/adminAuthService';
import { setAdminToken, clearAdminToken } from '../services/adminTokenStore';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading] = useState(false); // sem sessão persistida nesta etapa (sem refresh token)

  const login = useCallback(async (email, password) => {
    const data = await adminAuthService.login({ email, password });
    setAdminToken(data.accessToken);
    setAdmin(data.admin);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearAdminToken();
    setAdmin(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider');
  return ctx;
}
