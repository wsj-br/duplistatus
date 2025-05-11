# duplidash - Another Duplicati Dashboard

A modern web application for monitoring and visualizing backup operations from Duplicati Servers. Duplidash provides a comprehensive dashboard to track backup statuses, metrics, and performance across multiple machines.

## Features

- **Dashboard Overview**: Real-time display of backup status for all machines
- **Machine Details**: Detailed view of backup history for each machine
- **Data Visualization**: Interactive charts showing backup metrics over time
- **Dark/Light Theme**: Toggle between dark and light themes for comfortable viewing
- **Responsive Design**: Grid-based layout that works on all device sizes

## Installation

### Prerequisites

- Node.js 18.x or later
- pnpm package manager
- SQLite3 (included as a dependency)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/wsj-br/duplidash-fb.git
cd duplidash-fb
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory (optional):
```env
NODE_ENV=development
PORT=9002
```

4. Start the development server:
```bash
pnpm run dev
```

The application will be available at `http://localhost:9002`

## API Endpoints

### Upload Backup Data
- **Endpoint**: `/api/upload`
- **Method**: POST
- **Description**: Uploads backup operation data for a machine
- **Request Body**:
  ```json
  {
    "Data": {
      "MainOperation": "Backup",
      "ParsedResult": "Success",
      "BeginTime": "2024-03-20T10:00:00Z",
      "Duration": "1h30m",
      "SizeOfExaminedFiles": 1000000,
      "BackendStatistics": {
        "BytesUploaded": 500000
      },
      "ExaminedFiles": 1000,
      "WarningsActualLength": 0,
      "ErrorsActualLength": 0
    },
    "Extra": {
      "machine-id": "unique-machine-id",
      "machine-name": "Machine Name",
      "backup-name": "Backup Name",
      "backup-id": "unique-backup-id"
    }
  }
  ```
- **Response**: 
  ```json
  {
    "success": true
  }
  ```

### Get Latest Backup
- **Endpoint**: `/api/lastbackup/:machineId`
- **Method**: GET
- **Description**: Retrieves the latest backup information for a specific machine
- **Parameters**:
  - `machineId`: Machine identifier (ID or name)
- **Response**:
  ```json
  {
    "machine": {
      "id": "unique-machine-id",
      "name": "Machine Name",
      "backup_name": "Backup Name",
      "backup_id": "unique-backup-id",
      "created_at": "2024-03-20T10:00:00Z"
    },
    "latest_backup": {
      "id": "backup-id",
      "name": "Backup Name",
      "date": "2024-03-20T10:00:00Z",
      "status": "Success",
      "warnings": 0,
      "errors": 0,
      "fileCount": 1000,
      "fileSize": 1000000,
      "uploadedSize": 500000,
      "duration": 5400,
      "durationInMinutes": 90,
      "knownFileSize": 1000000
    }
  }
  ```

## Test Scripts

The project includes several test scripts to help with development and testing:

### Generate Test Data
```bash
pnpm run test:generate
```
This script generates and uploads test backup data for multiple machines. It creates 10 backup entries for each test machine.

### Test Last Backup Endpoint
```bash
pnpm run test:lastbackup [machineName]
```
Tests the `/api/lastbackup` endpoint. If no machine name is provided, it defaults to "Test Machine 1".

### Clear Database
```bash
pnpm run test:clear-db
```
Clears all data from the database and recreates the schema. Use with caution as this will delete all existing data.

## Development

### Database
The application uses SQLite3 as its database, with the database file stored in the `data` directory. The schema is automatically created when the application starts.

### Project Structure
- `/src/app`: Next.js application routes and pages
- `/src/components`: React components
- `/src/lib`: Utility functions and database operations
- `/scripts`: Test and utility scripts
- `/public`: Static assets

### Available Scripts
- `pnpm run dev`: Start development server
- `pnpm run build`: Build for production
- `pnpm run start`: Start production server
- `pnpm run lint`: Run ESLint
- `pnpm run test:generate`: Generate test data
- `pnpm run test:lastbackup`: Test last backup endpoint
- `pnpm run test:clear-db`: Clear database

## License

Copyright (c) Waldemar Scudeller Jr. 

MIT License

<sub>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
</sub>

