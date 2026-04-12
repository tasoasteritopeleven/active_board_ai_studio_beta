import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'player' | 'venue' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem('tf_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, _password: string) => {
    console.log('Attempting login for:', email);
    // Mock login
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      role: email.includes('venue') ? 'venue' : 'player',
    };
    setUser(mockUser);
    localStorage.setItem('tf_user', JSON.stringify(mockUser));
  };

  const register = async (name: string, email: string, _password: string) => {
    console.log('Attempting registration for:', email);
    // Mock registration
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role: 'player',
    };
    setUser(mockUser);
    localStorage.setItem('tf_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tf_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
