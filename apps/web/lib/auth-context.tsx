'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, getToken, setToken, clearToken } from './api-client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'call_operator' | 'volunteer';
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
      .get<AuthUser>('/auth/me')
      .then((data) => setUser(data))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  // Throws with the backend error message on failure so the login UI can display it
  const login = async (email: string, password: string): Promise<void> => {
    const data = await apiClient.post<{ token: string; user: AuthUser }>('/auth/login', {
      email,
      password,
    });
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  // Called after a Google OAuth redirect — stores the token then fetches the user
  const loginWithToken = async (token: string): Promise<void> => {
    setToken(token);
    const data = await apiClient.get<AuthUser>('/auth/me');
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginWithToken, logout }}>
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
