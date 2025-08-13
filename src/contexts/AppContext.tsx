import React, { createContext, useContext, useState, useEffect } from 'react';

const ADMIN_PASSWORD = '1111'; // Consider moving this to an environment variable
const SESSION_STORAGE_KEY = 'admin_session';

interface AppContextType {
  isAdmin: boolean;
  loginError: string;
  login: (password: string) => void;
  logout: () => void;
}

const defaultAppContext: AppContextType = {
  isAdmin: false,
  loginError: '',
  login: () => {},
  logout: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check for an existing session on initial load
    const session = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.loggedIn && sessionData.token) {
          // In a real app, you'd validate the token here
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
      // Create a mock session token
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ loggedIn: true, token: 'mock_token' }));
    } else {
      setLoginError('Contraseña incorrecta');
    }
  };

  const logout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        isAdmin,
        login,
        logout,
        loginError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
