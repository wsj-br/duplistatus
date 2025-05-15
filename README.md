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
- pnpm 8.x or later (install with `npm install -g pnpm`)
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
PORT=9666
```

4. Start the development server:
```bash
pnpm run dev
```

The application will be available at `http://localhost:9666`

### Package Management

This project uses pnpm as its package manager. Here are some common commands:

- `pnpm install` - Install all dependencies
- `pnpm add <package>` - Add a new dependency
- `pnpm add -D <package>` - Add a new dev dependency
- `pnpm remove <package>` - Remove a dependency
- `pnpm update` - Update all dependencies
- `pnpm run <script>` - Run a script defined in package.json

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
- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run start` - Start production server
- `pnpm run lint` - Run ESLint
- `pnpm run test:generate` - Generate test data
- `pnpm run test:lastbackup` - Test last backup endpoint
- `pnpm run test:clear-db` - Clear database
- `pnpm run clean` - Clean build artifacts and dependencies
- `pnpm run type-check` - Run TypeScript type checking

## Docker Deployment

The application can be deployed using Docker and Portainer. There are two ways to deploy:

### Option 1: Using Docker Compose (Recommended)

1. Ensure Docker and Docker Compose are installed on your system
2. Clone the repository:
```bash
git clone https://github.com/wsj-br/duplidash-fb.git
cd duplidash-fb
```

3. Start the application:
```bash
docker compose up -d
```

The application will be available at `http://localhost:9666`

### Option 2: Using Portainer

1. In Portainer, go to "Stacks" and click "Add stack"
2. Name your stack (e.g., "duplidash")
3. Choose "Build method" as "Repository"
4. Enter the repository URL: `https://github.com/wsj-br/duplidash-fb.git`
5. In the "Compose path" field, enter: `docker-compose.yml`
6. Click "Deploy the stack"

### Docker Configuration

The Docker setup includes:

- Multi-stage build for smaller production image
- Volume mounting for persistent data storage
- Health checks for container monitoring
- Automatic container restart
- Environment variable configuration

#### Environment Variables

The following environment variables can be configured in Portainer:

- `NODE_ENV`: Set to `production` (default)
- `PORT`: Application port (default: 9666)

#### Data Persistence

The application data is stored in the `./data` directory, which is mounted as a volume in the container. This ensures that your data persists even if the container is removed or updated.

#### Health Monitoring

The container includes a health check that monitors the application's availability. You can view the health status in Portainer's container details.

## License

Copyright © 2025 Waldemar Scudeller Jr. 

>Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
>
>[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)
>
>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.


