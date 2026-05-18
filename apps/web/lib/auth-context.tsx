'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, getToken, setToken, clearToken } from './api-client';
import { ROUTES } from './routes';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'volunteer';
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Verify stored token is still valid; fetch current user profile
    apiClient
      .get<AuthUser>(ROUTES.auth.me)
      .then((data) => setUser(data))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const logout = () => {
    clearToken();
    setUser(null);
  };

  // Called after a Google OAuth redirect — stores the token then fetches the user
  const loginWithToken = async (token: string): Promise<void> => {
    setToken(token);
    const data = await apiClient.get<AuthUser>(ROUTES.auth.me);
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
