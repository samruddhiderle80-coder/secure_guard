import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchApi, TOKEN_STORAGE_KEY } from '../lib/api';

export interface LocalUser {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: LocalUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  signup: (email: string, pass: string, fullName: string, role?: 'user' | 'admin') => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
}

const USER_STORAGE_KEY = 'socialguard_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(() => {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyDatabaseSession() {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        setLoading(false);
        return;
      }

      try {
        const res = await fetchApi<{ user: LocalUser }>('/api/auth/me');
        if (res.user) {
          setUser(res.user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        } else {
          setUser(null);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch (e) {
        console.warn('Session verification error against database:', e);
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    }

    verifyDatabaseSession();
  }, []);

  const login = async (email: string, pass: string): Promise<{ error?: string }> => {
    try {
      const res = await fetchApi<{ user: LocalUser; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass }),
      });

      if (res.token && res.user) {
        localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        setUser(res.user);
        return {};
      }

      return { error: 'Authentication failed.' };
    } catch (err: any) {
      return { error: err?.message || 'Login failed. Please check your credentials.' };
    }
  };

  const signup = async (
    email: string,
    pass: string,
    fullName: string,
    role: 'user' | 'admin' = 'user'
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetchApi<{ user: LocalUser; token: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password: pass, fullName, role }),
      });

      if (res.token && res.user) {
        localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        setUser(res.user);
        return {};
      }

      return { error: 'Registration failed.' };
    } catch (err: any) {
      return { error: err?.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    // In our direct database setup, password reset can be managed or confirmed
    return { error: 'For security in this instance, password resets are handled via database administration.' };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
