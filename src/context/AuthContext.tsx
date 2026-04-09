import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../data/mock';
import { toast } from 'sonner';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setIsLoading(false);
        return false;
      }

      const userData = querySnapshot.docs[0].data() as User;
      
      // Special password for admin, 123456 for others
      const isValidPassword = (email === 'waulex2014@gmail.com' && password === '1234') || password === '123456';
      
      if (isValidPassword) {
        setUser(userData);
        localStorage.setItem('multiplica_user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Erro ao realizar login.");
    }

    setIsLoading(false);
    return false;
  };

  const loginAsGuest = async (role: 'pastor' | 'lider' | 'multiplicador' = 'pastor') => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const guestUser = querySnapshot.docs[0].data() as User;
        setUser(guestUser);
        localStorage.setItem('multiplica_user', JSON.stringify(guestUser));
      } else {
        toast.error("Usuário convidado não encontrado.");
      }
    } catch (error) {
      console.error("Guest login error:", error);
    }
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
