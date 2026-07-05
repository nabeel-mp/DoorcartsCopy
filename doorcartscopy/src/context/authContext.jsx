import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, ask the backend who (if anyone) the current session belongs to.
  // This works whether the browser is authenticated via the httpOnly cookie
  // or via the Bearer token fallback (see api/axiosConfig.js).
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      try {
        const me = await authService.getMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Called after a successful verify-otp on the Login page.
  const login = useCallback((loggedInUser) => {
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await authService.getMe();
    setUser(me);
    return me;
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}