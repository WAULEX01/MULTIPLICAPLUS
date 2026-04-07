import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, mockUsers } from '../data/mock';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginAsGuest: (role?: 'pastor' | 'lider' | 'multiplicador') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('multiplica_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple mock login logic: password is '123456' for everyone, but '1234' for waulex2014@gmail.com
    const foundUser = mockUsers.find(u => u.email === email);
    const isValidPassword = (email === 'waulex2014@gmail.com' && password === '1234') || password === '123456';
    
    if (foundUser && isValidPassword) {
      setUser(foundUser);
      localStorage.setItem('multiplica_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const loginAsGuest = async (role: 'pastor' | 'lider' | 'multiplicador' = 'pastor') => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let guestUser = mockUsers.find(u => u.role === role);
    if (!guestUser) guestUser = mockUsers[0];

    setUser(guestUser);
    localStorage.setItem('multiplica_user', JSON.stringify(guestUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('multiplica_user');
    toast.success('Sessão encerrada com sucesso!');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginAsGuest,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
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
