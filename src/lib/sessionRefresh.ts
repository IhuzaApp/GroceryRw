/**
 * Utility functions for handling session refreshing when switching roles
 */

/**
 * Sets the flag to indicate a role switch is in progress
 */
export const setRoleSwitchFlag = (): void => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("switchingRole", "true");
  }
};

/**
 * Checks if a role switch is in progress
 */
export const isRoleSwitchInProgress = (): boolean => {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("switchingRole") === "true";
  }
  return false;
};

/**
 * Clears the role switch flag
 */
export const clearRoleSwitchFlag = (): void => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("switchingRole");
  }
};

/**
 * Refreshes the session by calling the refresh-session API
 * This can be used to update the session with the latest user data
 */
export const refreshSession = async (): Promise<any> => {
  try {
    const response = await fetch("/api/auth/refresh-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to refresh session");
    }

    return await response.json();
  } catch (error) {
    console.error("Error refreshing session:", error);
    throw error;
  }
};

/**
 * Initiates a role switch by calling the updateRole API
 * The server will handle session updates via cookies and redirects
 * @param nextRole The role to switch to
 */
export const initiateRoleSwitch = async (
  nextRole: "user" | "shopper"
): Promise<void> => {
  try {
    // Set flag to indicate role switch is in progress
    setRoleSwitchFlag();

    // Call the API to update the role
    const response = await fetch("/api/user/updateRole", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: nextRole }),
    });

    if (!response.ok) {
      throw new Error("Failed to update role");
    }

    // Get the response data
    const data = await response.json();
    
    if (data.success) {
      // Refresh the session to get the new role
      await refreshSession();
      
      // Clear the role switch flag
      clearRoleSwitchFlag();
      
      // Redirect to the appropriate dashboard
      const redirectPath = nextRole === "shopper" ? "/ShopperDashboard" : "/";
      window.location.href = redirectPath;
    } else {
      throw new Error(data.error || "Failed to update role");
    }
  } catch (error) {
    console.error("Error switching role:", error);
    clearRoleSwitchFlag();
    throw error;
  }
};
