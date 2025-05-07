import React, { createContext, useState, useContext, useEffect } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  // Role of the current session: 'user' or 'shopper'
  role: 'user' | 'shopper';
  toggleRole: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  role: 'user',
  toggleRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Manage user vs shopper role
  const [role, setRole] = useState<'user' | 'shopper'>('user');

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    const storedRole = localStorage.getItem("role");
    if (storedRole === 'shopper') {
      setRole('shopper');
    }
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
    <AuthContext.Provider value={{ isLoggedIn, login, logout, role, toggleRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
