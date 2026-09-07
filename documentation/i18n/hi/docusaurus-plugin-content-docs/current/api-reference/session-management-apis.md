# सत्र प्रबंधन {/* #session-management */}

## सत्र बनाएँ - `/api/session` {/* #create-session---apisession */}
- **एंडपॉइंट**: `/api/session`
- **विधि**: POST
- **विवरण**: उपयोगकर्ता के लिए एक नया सत्र बनाता है।
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

## सत्र सत्यापित करें - `/api/session` {/* #validate-session---apisession */}
- **एंडपॉइंट**: `/api/session`
- **विधि**: GET
- **विवरण**: मौजूदा सत्र को सत्यापित करता है।
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

## सत्र डिलीट करें - `/api/session` {/* #delete-session---apisession */}
- **एंडपॉइंट**: `/api/session`
- **विधि**: DELETE
- **विवरण**: वर्तमान सत्र को डिलीट करें (प्रवेश से बाहर निकलें)।
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

## CSRF टोकन प्राप्त करें - `/api/csrf` {/* #get-csrf-token---apicsrf */}
- **एंडपॉइंट**: `/api/csrf`
- **विधि**: GET
- **विवरण**: वर्तमान सत्र के लिए एक CSRF टोकन उत्पन्न करता है।
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
