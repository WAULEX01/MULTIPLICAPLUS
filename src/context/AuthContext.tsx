import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../data/mock';
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
    const token = localStorage.getItem('multiplica_token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Erro ao realizar login.");
        setIsLoading(false);
        return false;
      }

      const { token, user: userData } = await response.json();
      setUser(userData);
      localStorage.setItem('multiplica_user', JSON.stringify(userData));
      localStorage.setItem('multiplica_token', token);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro de conexão com o servidor.");
    }

    setIsLoading(false);
    return false;
  };

  const loginAsGuest = async (role: 'pastor' | 'lider' | 'multiplicador' = 'pastor') => {
    // For guest login in a real SQL app, we'd still need a backend route or a special token
    // For now, we'll try to login with a default password if it exists
    const emailMap = {
      pastor: 'waulex2014@gmail.com',
      lider: 'lider@igreja.com',
      multiplicador: 'fernanda@igreja.com'
    };
    const passwordMap = {
      pastor: '1234',
      lider: '123456',
      multiplicador: '123456'
    };
    
    await login(emailMap[role], passwordMap[role]);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('multiplica_user');
    localStorage.removeItem('multiplica_token');
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
