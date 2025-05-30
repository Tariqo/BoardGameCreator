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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user' | 'guest' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Always attempt to restore session on page load
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${config.apiUrl}/api/users/me`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setUser(data.data.user);
          setRole('user'); // Customize if backend supports roles
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
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }

    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
