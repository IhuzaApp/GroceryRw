import React, { createContext, useState, useContext, useEffect } from "react";
import { useSession, signOut, getSession } from "next-auth/react";
import { refreshSession } from "../lib/sessionRefresh";
import apolloClient from "../lib/apolloClient";
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
      // First, clear Apollo Client cache
      try {
        await apolloClient.clearStore();
        await apolloClient.resetStore();
      } catch (apolloError) {
        console.error("Error clearing Apollo cache:", apolloError);
      }

      // Clear all localStorage data
      const localStorageKeys = Object.keys(localStorage);
      localStorage.clear();
      // logAuth("AuthContext", "localStorage_cleared", {
      //   keys: localStorageKeys,
      // });

      // Clear all sessionStorage data
      const sessionStorageKeys = Object.keys(sessionStorage);
      sessionStorage.clear();
      // logAuth("AuthContext", "sessionStorage_cleared", {
      //   keys: sessionStorageKeys,
      // });

      // Clear NextAuth cookies manually - comprehensive approach
      const cookiesBefore = document.cookie.split(";").map((c) => c.trim());
      const cookieNames = [
        "next-auth.session-token",
        "next-auth.callback-url",
        "next-auth.csrf-token",
        "__Secure-next-auth.session-token",
        "__Host-next-auth.csrf-token",
        "__Host-next-auth.callback-url",
      ];

      // Clear known NextAuth cookies
      cookieNames.forEach((name) => {
        // Clear for current path
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        // Clear for domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        // Clear for subdomain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        // Clear with Secure flag
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;Secure;SameSite=Lax`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;Secure;SameSite=None`;
      });

      // Clear all other cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
        }
      });
      // logAuth("AuthContext", "cookies_cleared", {
      //   cookiesBefore,
      //   cookiesAfter: document.cookie.split(";").map((c) => c.trim()),
      // });

      // Clear local state FIRST
      setIsLoggedIn(false);
      setUser(null);
      setRole("user");

      // logAuth("AuthContext", "state_cleared_for_logout", {
      //   isLoggedIn: false,
      //   role: "user",
      //   hasUser: false,
      //   timestamp: Date.now(),
      // });

      // Call the logout API to clear server-side session
      try {
        const logoutResponse = await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!logoutResponse.ok) {
          console.error("Logout API returned error:", logoutResponse.status);
        }
      } catch (apiError) {
        console.error("Error calling logout API:", apiError);
      }

      // Sign out from NextAuth - this is critical for clearing the session
      try {
        // First, clear the session from NextAuth
        await signOut({
          redirect: false,
          callbackUrl: "/",
        });

        // Verify session is cleared by checking it
        const clearedSession = await getSession();
        if (clearedSession) {
          console.warn("Session still exists after signOut, forcing clear...");
          // If session still exists, try signing out again
          await signOut({ redirect: false });
        }
      } catch (signOutError) {
        console.error("Error signing out from NextAuth:", signOutError);
      }

      // Wait a bit to ensure all async operations complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Force a hard reload to ensure everything is cleared and redirect
      // Use window.location.replace to prevent back button issues
      if (typeof window !== "undefined") {
        // Clear any remaining cookies one more time - be more aggressive
        const allCookies = document.cookie.split(";");
        allCookies.forEach((c) => {
          const eqPos = c.indexOf("=");
          const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
          if (name) {
            // Clear with all possible variations
            const basePath = `expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
            document.cookie = `${name}=;${basePath}`;
            document.cookie = `${name}=;${basePath};domain=${window.location.hostname}`;
            document.cookie = `${name}=;${basePath};domain=.${window.location.hostname}`;
            document.cookie = `${name}=;${basePath};Secure;SameSite=Lax`;
            document.cookie = `${name}=;${basePath};Secure;SameSite=None`;
            document.cookie = `${name}=;${basePath};Secure;SameSite=Strict`;
          }
        });

        // Clear IndexedDB if used by NextAuth
        if ("indexedDB" in window) {
          try {
            const deleteReq = indexedDB.deleteDatabase("next-auth");
            deleteReq.onsuccess = () => {
              console.log("NextAuth IndexedDB cleared");
            };
          } catch (e) {
            // Ignore IndexedDB errors
          }
        }

        // Use replace instead of href to prevent back button from going to logged-in state
        // Add a timestamp to prevent caching
        window.location.replace(`/?_=${Date.now()}`);
      }

      // logAuth("AuthContext", "logout_completed", {
      //   signOutCalled: true,
      //   timestamp: Date.now(),
      // });
    } catch (error) {
      // logAuth("AuthContext", "logout_error", {
      //   error: error instanceof Error ? error.message : String(error),
      //   stack: error instanceof Error ? error.stack : undefined,
      //   timestamp: Date.now(),
      // });
      console.error("Logout error:", error);
      // Even if there's an error, try to redirect
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  const toggleRole = () => {
    const next = role === "user" ? "shopper" : "user";
    localStorage.setItem("role", next);
    setRole(next);
  };

  // Function to refresh the role from the server
  const refreshRole = async () => {
    // logAuth("AuthContext", "refresh_role_started", {
    //   currentRole: role,
    //   hasSession: !!session,
    //   timestamp: Date.now(),
    // });

    try {
      const result = await refreshSession();

      // logSessionRefresh(1, result.success, result.error);

      if (result.success && result.user) {
        // logAuth("AuthContext", "refresh_role_success", {
        //   oldRole: role,
        //   newRole: result.user.role,
        //   userData: result.user,
        //   timestamp: Date.now(),
        // });

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

        // logRoleSwitch(role, result.user.role, true);
      } else {
        // logAuth("AuthContext", "refresh_role_failed", {
        //   result,
        //   currentRole: role,
        //   timestamp: Date.now(),
        // });
        console.error("Refresh role failed:", result);
      }
    } catch (error) {
      // logAuth("AuthContext", "refresh_role_error", {
      //   error: error instanceof Error ? error.message : String(error),
      //   stack: error instanceof Error ? error.stack : undefined,
      //   currentRole: role,
      //   timestamp: Date.now(),
      // });

      // logSessionRefresh(
      //   1,
      //   false,
      //   error instanceof Error ? error.message : String(error)
      // );
      console.error("Refresh role error:", error);
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
