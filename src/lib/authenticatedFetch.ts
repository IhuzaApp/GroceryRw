/**
 * Utility function for making authenticated fetch requests
 * Ensures that session cookies are included in requests
 */

// import { logApiCall, logAuth } from "./debugAuth";

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const method = options.method || "GET";
  const startTime = Date.now();

  // logAuth('AuthenticatedFetch', 'request_started', {
  //   url,
  //   method,
  //   hasCredentials: true,
  //   headers: options.headers,
  //   body: options.body ? 'present' : 'none',
  //   timestamp: Date.now(),
  // });

  try {
    // Ensure credentials are included for session-based authentication
    const fetchOptions: RequestInit = {
      ...options,
      credentials: "include", // This ensures cookies are sent with the request
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;

    // logApiCall(url, method, response.status, true);

    // logAuth('AuthenticatedFetch', 'request_completed', {
    //   url,
    //   method,
    //   status: response.status,
    //   statusText: response.statusText,
    //   duration,
    //   success: response.ok,
    //   timestamp: Date.now(),
    // });

    // Log additional details for failed requests
    if (!response.ok) {
      // logAuth('AuthenticatedFetch', 'request_failed', {
      //   url,
      //   method,
      //   status: response.status,
      //   statusText: response.statusText,
      //   duration,
      //   timestamp: Date.now(),
      // });
    }

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    // logAuth('AuthenticatedFetch', 'request_error', {
    //   url,
    //   method,
    //   error: error instanceof Error ? error.message : String(error),
    //   stack: error instanceof Error ? error.stack : undefined,
    //   duration,
    //   timestamp: Date.now(),
    // });

    throw error;
  }
};

/**
 * Helper function to handle common fetch patterns with authentication
 */
export const fetchWithAuth = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await authenticatedFetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  return response.json();
};
