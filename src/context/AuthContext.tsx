import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signOut, getSession } from "next-auth/react";
import { refreshSession } from "../lib/sessionRefresh";
import apolloClient from "../lib/apolloClient";
import Image from "next/image";
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.pathname.startsWith("/Auth/")) {
      setIsLoggingOut(false);
    }
  }, [router.pathname]);

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
    setIsLoggingOut(true);
    // logAuth('AuthContext', 'logout_started', {
    //   currentState: { isLoggedIn, role, hasUser: !!user },
    //   timestamp: Date.now(),
    // });

    try {
      // 1. Clear local state IMMEDIATELY for responsive UI
      setIsLoggedIn(false);
      setUser(null);
      setRole("user");

      // 2. Clear Client Caches
      try {
        apolloClient.clearStore().catch(() => {});
      } catch (e) {
        /* ignore */
      }
      localStorage.clear();
      sessionStorage.clear();

      // 3. Trigger server-side logout to clear cookies
      await fetch("/api/logout", { method: "POST" }).catch(() => {});

      // 4. Redirect to login page
      if (typeof window !== "undefined") {
        window.location.replace("/Auth/Login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      if (typeof window !== "undefined") {
        window.location.replace("/Auth/Login");
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
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden">
          {/* Full Screen Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/assets/images/auth/login_bg.png"
              alt="Logging out..."
              fill
              className="object-cover"
              quality={100}
              priority
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-black/40 to-blue-900/40"></div>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <img
              src="/assets/logos/PlasLogoPNG.png"
              alt="Plas Logo"
              className="mb-8 h-24 w-auto animate-pulse object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] sm:h-28"
            />
            <h2 className="mb-2 text-3xl font-bold text-white drop-shadow-md">
              Logging Out...
            </h2>
            <p className="text-gray-200">See you soon!</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
