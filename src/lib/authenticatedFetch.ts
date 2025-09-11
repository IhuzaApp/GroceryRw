/**
 * Utility function for making authenticated fetch requests
 * Ensures that session cookies are included in requests
 */

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Ensure credentials are included for session-based authentication
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include', // This ensures cookies are sent with the request
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  return fetch(url, fetchOptions);
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
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  
  return response.json();
};
