import React, { createContext, useContext, useState, useEffect } from 'react';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '1111';
const SESSION_STORAGE_KEY = 'admin_session';

interface AuthContextType {
  isAdmin: boolean;
  loginError: string;
  login: (password: string) => void;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  isAdmin: false,
  loginError: '',
  login: () => {},
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

  const login = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setLoginError('');
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ loggedIn: true }));
    } else {
      setLoginError('Contraseña incorrecta');
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
