import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config/config';

interface User {
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'user' | 'guest' | null;
  isLoading: boolean;
  login: (role: 'admin' | 'user' | 'guest', userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | 'guest' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/api/users/me`, {
          ...config.defaultFetchOptions,
          method: 'GET',
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setUser(data.data.user);
          setRole('user');
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        setUser(null);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = (userRole: 'admin' | 'user' | 'guest', userData: User) => {
    setUser(userData);
    setRole(userRole);
  };

  const logout = async () => {
    try {
      await fetch(`${config.apiUrl}/api/auth/logout`, {
        ...config.defaultFetchOptions,
        method: 'POST',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setUser(null);
      setRole(null);
    }
  };

  const value = {
    user,
    role,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
