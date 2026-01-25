# Session Management

## Create Session - `/api/session`

- **Endpoint**: `/api/session`
- **Method**: POST
- **Description**: Creates a new session for the user.
- **Response**:
  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```
- **Error Responses**:
  - `500`: Failed to create session
- **Notes**:
  - Creates a new session with 24-hour expiration
  - Sets HTTP-only session cookie
  - Required for accessing protected endpoints

## Validate Session - `/api/session`

- **Endpoint**: `/api/session`
- **Method**: GET
- **Description**: Validates an existing session.
- **Response** (valid):
  ```json
  {
    "valid": true,
    "sessionId": "session-id-string"
  }
  ```
- **Response** (invalid):
  ```json
  {
    "valid": false,
    "error": "No session cookie"
  }
  ```
- **Error Responses**:
  - `401`: No session cookie or session ID
  - `500`: Failed to validate session
- **Notes**:
  - Checks if the session cookie exists and is valid
  - Returns session ID if valid

## Delete Session - `/api/session`

- **Endpoint**: `/api/session`
- **Method**: DELETE
- **Description**: Deletes the current session (logout).
- **Response**:
  ```json
  {
    "message": "Session deleted successfully"
  }
  ```
- **Error Responses**:
  - `500`: Failed to delete session
- **Notes**:
  - Clears the session from server and client
  - Removes session cookie

## Get CSRF Token - `/api/csrf`

- **Endpoint**: `/api/csrf`
- **Method**: GET
- **Description**: Generates a CSRF token for the current session.
- **Response**:
  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```
- **Error Responses**:
  - `401`: No session found or invalid/expired session
  - `500`: Failed to generate CSRF token
- **Notes**:
  - Requires a valid session
  - CSRF token is required for all state-changing operations
  - Token is tied to the current session
