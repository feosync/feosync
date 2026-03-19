'use client';

import { createContext, useCallback, useState, useEffect } from 'react';
import { apiClient, isUsingMockApi } from '@/lib/api';
import { authService } from '@/lib/services';
import type { User } from '@/lib/api/types';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const useMockApi = isUsingMockApi();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        setError(null);
        if (useMockApi) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser as any);
        } else {
          const currentUser = await apiClient.getCurrentUser();
          setUser(currentUser);
        }
      } catch (err) {
        console.error('[v0] Auth check failed:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [useMockApi]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (useMockApi) {
        const response = await authService.login({ email, password });
        authService.setAuthToken(response.token);
        setUser(response.user as any);
      } else {
        const response = await apiClient.login({ email, password });
        setUser(response.user);
      }
    } catch (err: any) {
      const message = err.message || 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [useMockApi]);

  const googleLogin = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (useMockApi) {
        const response = await authService.googleLogin(token);
        authService.setAuthToken(response.token);
        setUser(response.user as any);
      } else {
        const response = await apiClient.googleLogin(token);
        setUser(response.user);
      }
    } catch (err: any) {
      const message = err.message || 'Google login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [useMockApi]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (useMockApi) {
        await authService.logout();
        authService.clearAuthToken();
      } else {
        await apiClient.logout();
      }
      setUser(null);
    } catch (err: any) {
      const message = err.message || 'Logout failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [useMockApi]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        googleLogin,
        logout,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
