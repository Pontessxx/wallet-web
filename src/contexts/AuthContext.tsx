import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedAccessToken = sessionStorage.getItem('accessToken');

    if (storedUser && storedAccessToken) {
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = (userData: User, accessToken: string, expiresIn?: number) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('accessToken', accessToken);

    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      sessionStorage.setItem('tokenExpiresAt', String(expiresAt));
    }

    setUser(userData);
  };

  const logout = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('tokenExpiresAt');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook customizado pra facilitar o uso nas páginas
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthProvider;