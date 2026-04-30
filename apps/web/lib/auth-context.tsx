'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users for authentication
const dummyUsers: (AuthUser & { password: string })[] = [
  {
    id: 'U001',
    name: 'Admin User',
    email: 'admin@hamrolife.org',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'U002',
    name: 'Volunteer User',
    email: 'volunteer@hamrolife.org',
    password: 'volunteer123',
    role: 'volunteer',
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session on mount
    const savedUser = localStorage.getItem('hamro_life_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('hamro_life_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const foundUser = dummyUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('hamro_life_user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    // Simulate Google OAuth flow with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // For demo purposes, automatically sign in as admin with Google
    const googleUser: AuthUser = {
      id: 'GOOGLE_' + Date.now(),
      name: 'Google User',
      email: 'user@gmail.com',
      role: 'admin',
      avatar: undefined,
    };
    
    setUser(googleUser);
    localStorage.setItem('hamro_life_user', JSON.stringify(googleUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hamro_life_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithGoogle,
        logout,
      }}
    >
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
