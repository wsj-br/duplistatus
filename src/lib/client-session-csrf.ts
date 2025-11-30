// Client-side session and CSRF management
// This file handles session and CSRF token management for frontend requests

let cachedSessionId: string | null = null;
let isRecoveringSession = false; // Prevent multiple simultaneous recovery attempts

// Function to get or create a session
export const getSession = async (): Promise<string> => {
  if (cachedSessionId) {
    return cachedSessionId;
  }

  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    const data = await response.json();
    cachedSessionId = data.sessionId;
    return cachedSessionId || '';
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Unable to create session');
  }
};

// Function to validate existing session
export const validateSession = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    if (data.valid) {
      cachedSessionId = data.sessionId;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
};

// Function to get CSRF token
export const getCSRFToken = async (): Promise<string> => {
  try {
    // Ensure we have a valid session first
    const sessionValid = await validateSession();
    if (!sessionValid) {
      await getSession(); // Create new session if needed
    }

    const response = await fetch('/api/csrf', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error('Failed to retrieve CSRF token');
    }

    const data = await response.json();
    return data.token || data.csrfToken || '';
  } catch (error) {
    console.error('Error retrieving CSRF token:', error);
    throw new Error('Unable to retrieve CSRF token');
  }
};

// Function to clear cached session and CSRF token
export const clearSession = async (): Promise<void> => {
  try {
    await fetch('/api/session', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    });
  } catch (error) {
    console.error('Error clearing session:', error);
  } finally {
    cachedSessionId = null;
    isRecoveringSession = false;
  }
};

// Function to force session recreation (clears cache and creates new session)
export const recreateSession = async (): Promise<string> => {
  console.log('Recreating session due to authentication failure...');
  cachedSessionId = null;
  isRecoveringSession = true;
  
  try {
    const sessionId = await getSession();
    isRecoveringSession = false;
    return sessionId;
  } catch (error) {
    isRecoveringSession = false;
    throw error;
  }
};

// Check if a response indicates session/CSRF authentication failure
export const isAuthenticationError = (response: Response): boolean => {
  return response.status === 401 || response.status === 403;
};

// Enhanced authenticated request with automatic session recovery
export const authenticatedRequestWithRecovery = async (
  url: string, 
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> => {
  const maxRetries = 1; // Only retry once to avoid infinite loops
  
  try {
    // Always get a fresh CSRF token for each request to avoid race conditions
    const csrfToken = await getCSRFToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies
    });

    // Check for authentication errors and attempt recovery
    if (isAuthenticationError(response) && retryCount < maxRetries && !isRecoveringSession) {
      console.log(`Authentication error detected (${response.status}), attempting session recovery...`);
      
      try {
        // Recreate session and retry the request
        await recreateSession();
        return await authenticatedRequestWithRecovery(url, options, retryCount + 1);
      } catch (recoveryError) {
        console.error('Session recovery failed:', recoveryError);
        // Return the original response if recovery fails
        return response;
      }
    }

    return response;
  } catch (error) {
    // If it's a network error and we haven't retried yet, try session recovery
    if (retryCount < maxRetries && !isRecoveringSession) {
      console.log('Network error detected, attempting session recovery...');
      
      try {
        await recreateSession();
        return await authenticatedRequestWithRecovery(url, options, retryCount + 1);
      } catch (recoveryError) {
        console.error('Session recovery failed:', recoveryError);
        throw error;
      }
    }
    
    throw error;
  }
};

// Function to refresh CSRF token
export const refreshCSRFToken = async (): Promise<string> => {
  return await getCSRFToken();
};

// Helper function to make authenticated requests with CSRF protection
// This is now a wrapper around the enhanced version with automatic recovery
export const authenticatedRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  return await authenticatedRequestWithRecovery(url, options);
};
