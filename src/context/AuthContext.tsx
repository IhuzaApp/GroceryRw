import React, { createContext, useState, useContext, useEffect } from "react";
import { useSession } from "next-auth/react";

interface User {
  id: string | null;
  name: string | null;
  profilePicture: string | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  authReady: boolean;
  login: () => void;
  logout: () => void;
  // Role of the current session: 'user' or 'shopper'
  role: "user" | "shopper";
  toggleRole: () => void;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  authReady: false,
  login: () => {},
  logout: () => {},
  role: "user",
  toggleRole: () => {},
  user: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<"user" | "shopper">("user");
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session && session.user) {
      setIsLoggedIn(true);
      setUser({
        id: session.user.id || null,
        name: session.user.name || null,
        // Use image property from default session
        profilePicture: session.user.image || null,
      });
      // Safely set role with a fallback
      setRole((session.user as any)?.role || "user");
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
    setAuthReady(true);
  }, [session]);

  const login = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  const toggleRole = () => {
    const next = role === "user" ? "shopper" : "user";
    localStorage.setItem("role", next);
    setRole(next);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, authReady, login, logout, role, toggleRole, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
