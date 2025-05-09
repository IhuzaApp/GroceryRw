/**
 * API utilities to make port-independent API calls
 */

/**
 * Create an API URL that works regardless of which port the app is running on
 * @param path - The API path (should start with "/api")
 * @returns The full API URL
 */
export function getApiUrl(path: string): string {
  // Ensure the path starts with /api
  if (!path.startsWith('/api')) {
    path = `/api${path}`;
  }
  
  // Always use a relative path to avoid port issues
  return path;
}

/**
 * Fetch API with resilience to port changes
 * @param path API path (should start with "/api")
 * @param options Fetch options
 * @returns Fetch promise
 */
export async function fetchApi(path: string, options?: RequestInit) {
  const url = getApiUrl(path);
  
  // Use standard fetch with relative URL
  return fetch(url, {
    ...options,
    credentials: 'same-origin', // Include cookies
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Get session data without relying on a specific port
 * @returns Promise with session data
 */
export async function getSessionData() {
  const response = await fetchApi('/api/auth/session');
  if (!response.ok) {
    return null;
  }
  return response.json();
} 