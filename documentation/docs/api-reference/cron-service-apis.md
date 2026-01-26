

# Cron Service Management {#cron-service-management}

## Get Cron Configuration - `/api/cron-config` {#get-cron-configuration-apicron-config}
- **Endpoint**: `/api/cron-config`
- **Method**: GET
- **Description**: Retrieves the current cron service configuration.
- **Response**:
  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```
- **Error Responses**:
  - `500`: Failed to get cron configuration
- **Notes**:
  - Returns current cron service configuration
  - Includes cron expression and enabled status
  - Used for cron service management

## Update Cron Configuration - `/api/cron-config` {#update-cron-configuration-apicron-config}
- **Endpoint**: `/api/cron-config`
- **Method**: POST
- **Description**: Updates the cron service configuration.
- **Authentication**: Requires valid session and CSRF token
- **Request Body**:
  ```json
  {
    "interval": "20min"
  }
  ```
- **Response**:
  ```json
  {
    "success": true
  }
  ```
- **Available Intervals**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Error Responses**:
  - `401`: Unauthorized - Invalid session or CSRF token
  - `400`: Interval is required
  - `500`: Failed to update cron configuration
- **Notes**:
  - Updates cron service configuration
  - Validates interval against allowed options
  - Affects overdue backup check frequency

## Cron Service Proxy - `/api/cron/*` {#cron-service-proxy-apicron}
- **Endpoint**: `/api/cron/*`
- **Method**: GET, POST
- **Description**: Proxies requests to the cron service. This endpoint forwards all requests to the cron service running on a separate port.
- **Parameters**:
  - `*`: Any path that will be forwarded to the cron service
- **Response**: Depends on the cron service endpoint being accessed
- **Error Response** (503):
  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```
- **Notes**:
  - Proxies requests to the cron service
  - Returns 503 if cron service is not available
  - Supports both GET and POST methods
