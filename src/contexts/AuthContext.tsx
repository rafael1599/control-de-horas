import React, { createContext, useState, useContext, useEffect } from 'react';
// import { verifyPassword } from '@/services/api'; // <--- COMENTADO
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  isAdmin: boolean;
  loading: boolean;
  loginError: string | null;
  login: (password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Actualización de la lógica de login
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const adminSession = sessionStorage.getItem('isAdmin');
    if (adminSession === 'true') {
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const login = async (password: string) => {
    setLoginError(null);
    try {
      // --- LÓGICA DE LOGIN MODIFICADA ---
      // TODO: Migrar la verificación de contraseña al nuevo backend.
      // Por ahora, usaremos una contraseña fija en el frontend para pruebas.
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '1111';
      const success = password === adminPassword;

      if (success) {
        setIsAdmin(true);
        sessionStorage.setItem('isAdmin', 'true');
        toast({
          title: 'Éxito',
          description: 'Has iniciado sesión como administrador.',
        });
      } else {
        throw new Error('Contraseña incorrecta');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      setLoginError(errorMessage);
      toast({
        title: 'Error de inicio de sesión',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout, loginError }}>
      {children}
    </AuthContext.Provider>
  );
};