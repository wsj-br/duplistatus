# Cron Seva Prabandhan {#cron-service-management}

## Cron Configuration Prapt Karein - `/api/cron-config` {#get-cron-configuration---apicron-config}
- **Endpoint**: `/api/cron-config`
- **Method**: GET
- **Description**: Vartaman cron seva configuration prapt karta hai.
- **Authentication**: Vaidh session aur CSRF token ki avashyakta hai
- **Response**:

  ```json
  {
    "cronExpression": "*/20 * * * *",
    "enabled": true
  }
  ```

- **Truti Utar**: 
  - `500`: Cron configuration prapt karne mein asafal
- **Notes**:
  - Vartaman cron seva configuration lautata hai
  - Cron expression aur saksham stithi shamil hai
  - Cron seva prabandhan ke liye upyog kiya jata hai

## Cron Configuration Adyatan Karein - `/api/cron-config` {#update-cron-configuration---apicron-config}
- **Endpoint**: `/api/cron-config`
- **Method**: POST
- **Description**: Cron seva configuration ko adyatan karta hai.
- **Authentication**: Vaidh session aur CSRF token avashyak hai
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

- **Upalabdh Antaral**: `"disabled"`, `"1min"`, `"5min"`, `"10min"`, `"15min"`, `"20min"`, `"30min"`, `"1hour"`, `"2hours"`
- **Truti Utar**: 
  - `400`: Antaral avashyak hai
  - `500`: Cron configuration adyatan karne mein asafal
- **Notes**:
  - Cron seva configuration ko adyatan karta hai
  - Anumati prapt vikalpon ke viruddh antaral ko manya karta hai
  - Vilambit Backup jaanch aavritti ko prabhavit karta hai

## Cron Seva Proxy - `/api/cron/*` {#cron-service-proxy---apicron}
- **Endpoint**: `/api/cron/*`
- **Method**: GET, POST
- **Description**: Cron seva mein anurodhon ko proxy karta hai. Yah endpoint alag port par chal rahe cron seva mein sabhi anurodhon ko forward karta hai.
- **Pramanikaran**: Many paryaapt session aur CSRF token ki avashyakta hai
- **Parametar**: 
  - `*`: Koi bhi path jo cron seva mein forward kiya jayega
- **Utar**: Access kiye ja rahe cron seva endpoint par nirbhar karta hai
- **Truti Utar** (503):

  ```json
  {
    "error": "Cron service is not running",
    "message": "The cron service is not available. Please start it with: npm run cron:start"
  }
  ```

- **Notes**:
  - Cron seva mein anurodhon ko proxy karta hai
  - Yadi cron seva uplabdh nahin hai to 503 lautata hai
  - GET aur POST donon methods ka samarthan karta hai
  - Web interface se cron seva prabandhan ke liye upyog kiya jata hai
