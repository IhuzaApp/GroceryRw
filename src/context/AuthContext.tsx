import React, { createContext, useState, useContext, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { refreshSession } from "../lib/sessionRefresh";
// import { logAuthState, logAuth, logSessionRefresh, logRoleSwitch } from "../lib/debugAuth";

interface User {
  id: string | null;
  name: string | null;
  profilePicture: string | null;
  email?: string | null;
  phone?: string | null;
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
  session: any;
  isLoading: boolean;
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
  session: null,
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status, update } = useSession();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<"user" | "shopper">("user");
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // logAuthState(session, status, 'AuthContext');
    
    if (status === "loading") {
      // logAuth('AuthContext', 'loading_state', { 
      //   previousState: { isLoggedIn, authReady, isLoading },
      //   timestamp: Date.now() 
      // });
      setIsLoading(true);
      setAuthReady(false);
      return;
    }

    if (status === "authenticated" && session && session.user) {
      const userData = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as any)?.role,
        phone: (session.user as any)?.phone,
        image: session.user.image,
      };
      
      // logAuth('AuthContext', 'user_authenticated', {
      //   userData,
      //   sessionExpires: session.expires,
      //   timestamp: Date.now(),
      // });
      
      setIsLoggedIn(true);
      setUser({
        id: session.user.id || null,
        name: session.user.name || null,
        email: session.user.email || null,
        profilePicture: session.user.image || null,
        phone: (session.user as any)?.phone || null,
      });
      // Safely set role with a fallback
      const userRole = (session.user as any)?.role || "user";
      setRole(userRole);
      
      // logAuth('AuthContext', 'state_updated', {
      //   isLoggedIn: true,
      //   role: userRole,
      //   hasUser: true,
      //   timestamp: Date.now(),
      // });
    } else {
      // logAuth('AuthContext', 'user_not_authenticated', {
      //   status,
      //   hasSession: !!session,
      //   hasUser: !!(session?.user),
      //   timestamp: Date.now(),
      // });
      
      setIsLoggedIn(false);
      setUser(null);
      setRole("user");
      
      // logAuth('AuthContext', 'state_cleared', {
      //   isLoggedIn: false,
      //   role: "user",
      //   hasUser: false,
      //   timestamp: Date.now(),
      // });
    }
    
    setIsLoading(false);
    setAuthReady(true);
    
    // logAuth('AuthContext', 'auth_ready', {
    //   isLoggedIn: status === "authenticated",
    //   authReady: true,
    //   isLoading: false,
    //   timestamp: Date.now(),
    // });
  }, [session, status]);

  const login = () => {
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  const logout = async () => {
    // logAuth('AuthContext', 'logout_started', {
    //   currentState: { isLoggedIn, role, hasUser: !!user },
    //   timestamp: Date.now(),
    // });

    try {
      // Clear all localStorage data
      const localStorageKeys = Object.keys(localStorage);
      localStorage.clear();
      logAuth('AuthContext', 'localStorage_cleared', { keys: localStorageKeys });

      // Clear all sessionStorage data
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorage.clear();
      logAuth('AuthContext', 'sessionStorage_cleared', { keys: sessionStorageKeys });

      // Clear NextAuth cookies manually
      const cookiesBefore = document.cookie.split(";").map(c => c.trim());
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${
          window.location.hostname
        }`;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${
          window.location.hostname
        }`;
      });
      logAuth('AuthContext', 'cookies_cleared', { 
        cookiesBefore,
        cookiesAfter: document.cookie.split(";").map(c => c.trim()),
      });

      setIsLoggedIn(false);
      setUser(null);
      setRole("user");
      
      logAuth('AuthContext', 'state_cleared_for_logout', {
        isLoggedIn: false,
        role: "user",
        hasUser: false,
        timestamp: Date.now(),
      });

      await signOut({ redirect: true });
      
      logAuth('AuthContext', 'logout_completed', {
        signOutCalled: true,
        timestamp: Date.now(),
      });
    } catch (error) {
      logAuth('AuthContext', 'logout_error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: Date.now(),
      });
    }
  };

  const toggleRole = () => {
    const next = role === "user" ? "shopper" : "user";
    localStorage.setItem("role", next);
    setRole(next);
  };

  // Function to refresh the role from the server
  const refreshRole = async () => {
    logAuth('AuthContext', 'refresh_role_started', {
      currentRole: role,
      hasSession: !!session,
      timestamp: Date.now(),
    });

    try {
      const result = await refreshSession();
      
      logSessionRefresh(1, result.success, result.error);
      
      if (result.success && result.user) {
        logAuth('AuthContext', 'refresh_role_success', {
          oldRole: role,
          newRole: result.user.role,
          userData: result.user,
          timestamp: Date.now(),
        });

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
        
        logRoleSwitch(role, result.user.role, true);
      } else {
        logAuth('AuthContext', 'refresh_role_failed', {
          result,
          currentRole: role,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      logAuth('AuthContext', 'refresh_role_error', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        currentRole: role,
        timestamp: Date.now(),
      });
      
      logSessionRefresh(1, false, error instanceof Error ? error.message : String(error));
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
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
