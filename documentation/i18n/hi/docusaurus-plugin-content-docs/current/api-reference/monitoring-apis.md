# निगरानी और स्वास्थ्य {#monitoring-health}

## स्वास्थ्य जाँच - `/api/health` {#health-check---apihealth}
- **एंडपॉइंट**: `/api/health`
- **विधि**: GET
- **विवरण**: एप्लिकेशन और डेटाबेस की स्वास्थ्य स्थिति की जाँच करता है।
- **प्रतिक्रिया** (स्वस्थ):

  ```json
  {
    "status": "healthy",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": true,
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": true,
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **प्रतिक्रिया** (ह्रासपत्र):

  ```json
  {
    "status": "degraded",
    "database": "connected",
    "basicConnection": true,
    "tablesFound": 2,
    "tables": [
      "servers",
      "backups"
    ],
    "preparedStatements": false,
    "preparedStatementsError": "Prepared statement error details",
    "initializationStatus": "complete",
    "initializationComplete": true,
    "connectionHealth": false,
    "connectionHealthError": "Connection health check failed",
    "connectionDetails": {
      "additional": "diagnostic information"
    },
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **त्रुटि प्रतिक्रिया** (503):

  ```json
  {
    "status": "unhealthy",
    "error": "Database connection failed",
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n    at...",
    "timestamp": "2024-03-20T10:00:00Z"
  }
  ```

- **नोट्स**: 
  - स्वस्थ प्रणालियों के लिए 200 स्थिति लौटाता है
  - अस्वस्थ प्रणालियों या तैयार कथन विफलताओं के लिए 503 स्थिति लौटाता है
  - तैयार कथन विफल होने पर `preparedStatementsError` फ़ील्ड शामिल करता है
  - डेटाबेस प्रारंभ विफल होने पर `initializationError` फ़ील्ड शामिल करता है
  - कनेक्शन स्वास्थ्य जाँच विफल होने पर `connectionHealthError` और `connectionDetails` शामिल करता है
  - स्टैक ट्रेस केवल विकास मोड में शामिल होता है
  - बुनियादी डेटाबेस कनेक्शन, तैयार कथन, प्रारंभ स्थिति और कनेक्शन स्वास्थ्य की जाँच करता है
  - समस्याओं के निदान के लिए व्यापक स्वास्थ्य निदान प्रदान करता है
