
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '@/lib/storage';

interface AuthContextType {
  user: any | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = storage.getAuth();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // Mock login
    const mockUser = { id: '1', email, name: email.split('@')[0] };
    setUser(mockUser);
    storage.saveAuth(mockUser);
  };

  const signup = async (email: string, pass: string, name: string) => {
    // Mock signup
    const mockUser = { id: '1', email, name };
    setUser(mockUser);
    storage.saveAuth(mockUser);
  };

  const logout = () => {
    setUser(null);
    storage.clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
