import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextType } from '@/types/auth';
import { authService } from '@/services/authService'; // ajuste o path conforme seu projeto

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    const storedAccessToken = sessionStorage.getItem('accessToken');

    if (storedUser && storedAccessToken) {
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = (userId: string, username: string, accessToken: string) => {
    const userData: User = { id: userId, username };

    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('accessToken', accessToken);
    setUser(userData);

  };
 

  const logout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao invalidar sessão no backend:', error);
    } finally {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      setUser(null);
      setIsLoggingOut(false);
    }
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthProvider;