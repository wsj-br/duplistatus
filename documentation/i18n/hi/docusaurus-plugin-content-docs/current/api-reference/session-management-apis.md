# Session Management {#session-management}

## Create Session - `/api/session` {#create-session---apisession}
- **Endpoint**: `/api/session`
- **Method**: POST
- **Description**: Upyogkarta ke liye ek naya session banata hai.
- **Response**:

  ```json
  {
    "sessionId": "session-id-string",
    "message": "Session created successfully"
  }
  ```

- **Error Responses**:
  - `500`: Session banane mein Asafal
- **Notes**:
  - 24-ghante ki expiry ke saath ek naya session banata hai
  - HTTP-only session cookie set karta hai
  - Protected endpoints ko access karne ke liye aavashyak hai

## Validate Session - `/api/session` {#validate-session---apisession}
- **Endpoint**: `/api/session`
- **Method**: GET
- **Description**: Ek maujooda session ko validate karta hai.
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
  - `401`: Koi session cookie ya session ID nahi mili
  - `500`: Session validate karne mein Asafal
- **Notes**:
  - Check karta hai ki kya session cookie maujood hai aur valid hai
  - Agar valid hai to session ID return karta hai

## Delete Session - `/api/session` {#delete-session---apisession}
- **Endpoint**: `/api/session`
- **Method**: DELETE
- **Description**: Vartaman session ko delete karta hai (pravesh se baahar niklein).
- **Response**:

  ```json
  {
    "message": "Session deleted successfully"
  }
  ```

- **Error Responses**:
  - `500`: Session delete karne mein Asafal
- **Notes**:
  - Server aur client se session ko clear karta hai
  - Session cookie ko hata deta hai

## Get CSRF Token - `/api/csrf` {#get-csrf-token---apicsrf}
- **Endpoint**: `/api/csrf`
- **Method**: GET
- **Description**: Vartaman session ke liye CSRF token generate karta hai.
- **Response**:

  ```json
  {
    "csrfToken": "csrf-token-string",
    "message": "CSRF token generated successfully"
  }
  ```

- **Error Responses**:
  - `401`: Koi session nahi mila ya invalid/expired session
  - `500`: CSRF token generate karne mein Asafal
- **Notes**:
  - Ek valid session ki aavashyakta hai
  - Sabhi state-changing operations ke liye CSRF token aavashyak hai
  - Token vartaman session se juda hota hai
