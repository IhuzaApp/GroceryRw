import React, { createContext, useState, useContext, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { refreshSession } from "../lib/sessionRefresh";

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
  refreshRole: () => Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  authReady: false,
  login: () => {},
  logout: () => {},
  role: "user",
  toggleRole: () => {},
  refreshRole: async () => {},
  user: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status, update } = useSession();
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

  const logout = async () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Clear all sessionStorage data
    sessionStorage.clear();
    
    // Clear NextAuth cookies manually
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    });
    
    setIsLoggedIn(false);
    await signOut({ redirect: true });
  };

  const toggleRole = () => {
    const next = role === "user" ? "shopper" : "user";
    localStorage.setItem("role", next);
    setRole(next);
  };

  // Function to refresh the role from the server
  const refreshRole = async () => {
    try {
      const result = await refreshSession();
      if (result.success && result.user) {
        // Update the session with the new user data
        await update({
          ...session,
          user: {
            ...session?.user,
            role: result.user.role,
          },
        });

        // Update local state
        setRole(result.user.role);
      }
    } catch (error) {
      console.error("Failed to refresh role:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        authReady,
        login,
        logout,
        role,
        toggleRole,
        refreshRole,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
