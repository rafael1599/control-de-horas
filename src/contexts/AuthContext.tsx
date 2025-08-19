import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/api'; // Import apiService

const SESSION_STORAGE_KEY = 'admin_session';

interface AuthContextType {
  isAdmin: boolean;
  loginError: string;
  login: (password: string) => Promise<void>; // login is now async
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  isAdmin: false,
  loginError: '',
  login: async () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const session = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.loggedIn) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Failed to parse admin session:", error);
      }
    }
  }, []);

  const login = async (password: string) => {
    setLoginError(''); // Clear previous errors
    try {
      const { success } = await apiService.verifyPassword(password);
      if (success) {
        setIsAdmin(true);
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ loggedIn: true }));
      } else {
        setLoginError('Contraseña incorrecta');
      }
    } catch (error) {
      console.error("Login API call failed:", error);
      setLoginError('Error al conectar con el servidor. Inténtalo de nuevo.');
    }
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        login,
        logout,
        loginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};