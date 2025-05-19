import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: string | null; // user name
  role: 'admin' | 'user' | null;
  login: (token: string, role: 'admin' | 'user', name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<string | null>(null);
    const [role, setRole] = useState<'admin' | 'user' | null>(null);

    useEffect(() => {
    const token = sessionStorage.getItem('token');
    const savedRole = sessionStorage.getItem('role') as 'admin' | 'user' | null;
    const name = sessionStorage.getItem('name');

    if (token && name && savedRole) {
        setUser(name);
        setRole(savedRole);
    }
    }, []);


  const login = (token: string, userRole: 'admin' | 'user', name: string) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('role', userRole);
    sessionStorage.setItem('name', name);
    setUser(name);
    setRole(userRole);
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('name');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
