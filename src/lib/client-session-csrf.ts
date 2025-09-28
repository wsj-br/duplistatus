// Client-side session and CSRF management
// This file handles session and CSRF token management for frontend requests

let cachedSessionId: string | null = null;
let cachedCSRFToken: string | null = null;

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
  if (cachedCSRFToken) {
    return cachedCSRFToken;
  }

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
    cachedCSRFToken = data.csrfToken;
    return cachedCSRFToken || '';
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
    cachedCSRFToken = null;
  }
};

// Function to refresh CSRF token
export const refreshCSRFToken = async (): Promise<string> => {
  cachedCSRFToken = null;
  return await getCSRFToken();
};

// Helper function to make authenticated requests with CSRF protection
export const authenticatedRequest = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const csrfToken = await getCSRFToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });
};
