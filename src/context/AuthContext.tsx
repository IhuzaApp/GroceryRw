import React, { createContext, useState, useContext, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  authReady: boolean;
  login: () => void;
  logout: () => void;
  // Role of the current session: 'user' or 'shopper'
  role: 'user' | 'shopper';
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  authReady: false,
  login: () => {},
  logout: () => {},
  role: 'user',
  toggleRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Manage user vs shopper role and readiness
  const [role, setRole] = useState<'user' | 'shopper'>('user');
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    const storedRole = localStorage.getItem('role');
    if (storedRole === 'shopper') {
      setRole('shopper');
    }
    // Mark auth check complete
    setAuthReady(true);
  }, []);

  const login = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };
  // Toggle between 'user' and 'shopper'
  const toggleRole = () => {
    const next = role === 'user' ? 'shopper' : 'user';
    localStorage.setItem('role', next);
    setRole(next);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, authReady, login, logout, role, toggleRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
