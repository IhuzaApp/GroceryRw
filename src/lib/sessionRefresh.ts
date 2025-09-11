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
      credentials: "include",
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
    // Call the API to update the role
    const response = await fetch("/api/user/updateRole", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ role: nextRole }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (data.code === "NOT_ACTIVE_SHOPPER") {
        throw new Error(
          "You must be an active shopper to switch to shopper mode"
        );
      }
      throw new Error(data.error || "Failed to update role");
    }

    if (data.success) {
      // Redirect to the appropriate page
      window.location.href =
        data.redirectTo || (nextRole === "shopper" ? "/ShopperDashboard" : "/");
    } else {
      throw new Error(data.error || "Failed to update role");
    }
  } catch (error) {
    console.error("Error switching role:", error);
    throw error;
  }
};
