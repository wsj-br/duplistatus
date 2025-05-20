![duplidash](docs/duplidash_banner.png)

# Duplidash - Another [Duplicati](https://github.com/duplicati/duplicati) Dashboard

A web application for monitoring and visualizing backup operations from [Duplicati](https://github.com/duplicati/duplicati). Duplidash provides a comprehensive dashboard to track backup statuses, metrics, and performance across multiple machines, also prividing an API endpoint to be integrated with 3rd party tools like [Homepage](https://gethomepage.dev/)

## Features 

- **Overview**: Real-time display of backup status for all machines
- **Machine Details**: Detailed view of backup history for each machine
- **Data Visualization**: Interactive charts showing backup metrics over time
- **Dark/Light Theme**: Toggle between dark and light themes for comfortable viewing
- **Responsive Design**: Grid-based layout that works on all device sizes

## Installation

### Prerequisites

- Node.js 18.x or later
- pnpm 10.x or later (install with `npm install -g pnpm`)
- SQLite3 / better-sqlite3

### Setup

1. Clone the repository:
```bash
git clone https://github.com/wsj-br/duplidash.git
cd duplidash
```

2. Install dependencies:
```bash
sudo apt update
sudo apt install nodejs npm sqlite3 -y
sudo npm install -g pnpm
pnpm install
```


3. Start the development server:
```bash
pnpm run dev
```

The application will be available at `http://localhost:9666`

4. Start the production server:
```bash
pnpm start
```

The application will be available at `http://localhost:9666`


## Test Scripts

The project includes several test scripts to help with development and testing:

### Generate Test Data
```bash
pnpm run generate-test-data
```
This script generates and uploads test backup data for multiple machines. It creates 10 backup entries for each test machine.

### Test Last Backup Endpoint
```bash
pnpm run test-lastbackup [machineName]
```
Tests the `/api/lastbackup` endpoint. If no machine name is provided, it defaults to "Test Machine 1".

### Clear Database
```bash
pnpm run clear-db
```
Clears all data from the database and recreates the schema. Use with caution as this will delete all existing data.

### Clean build artifacts and dependencies
```bash
scripts/clear-workspace.sh
```
Removes all build artifacts, node_modules directory, and other generated files to ensure a clean state. This is useful when you need to perform a fresh installation or resolve dependency issues. The command will delete:
- `node_modules/` directory
- `.next/` build directory
- `dist/` directory
- All docker build cache and perform a docker system prune
- Any other build cache files

### Generate the logo/favicon and banner from svn
```bash
scripts/convert_svg_logo.sh
```

> The svg files are located in the `docs` folder.

<br>

## Duplicati Configuration

In your Duplicati's [UI](https://docs.duplicati.com/getting-started/set-up-a-backup-in-the-ui), configure it to send the backup results to the duplidash server using the `/upload` API endpoint. In the Duplicati configuration page, select Settings and in the Default Options section, include these two options:

```bash
--send-http-url=http://my.local.server:9666/upload
--send-http-result-output-format=Json
```

<br>

> **Tip:** click in `Edit as text` and copy the two lines above, adjusting the server name/IP.

<br>

![Duplicati configuration](docs/duplicati-options.png)

<br>


## Homepage integration (optional)

To integrate duplidash with [Homepage](https://gethomepage.dev/), you can add a widget to your `services.yaml` configuration file using the [Custom API widget](https://gethomepage.dev/widgets/services/customapi/) to fetch backup status information from duplidash.

### Summary 

Show the overall summary of the backup data stored in the Duplidash's database. Below is a example showing how to configure this integration.

```yaml
    - Dashboard:
        icon: mdi-cloud-upload
        href: http://my.local.server:9666/
        widget:
          type: customapi
          url: http://my.local.server:9666/api/summary
          display: list
          refreshInterval: 60000
          mappings:
            - field: totalMachines
              label: Machines
            - field: totalBackups
              label: Backups received
            - field: secondsSinceLastBackup
              label: Last backup
              format: duration
            - field: totalBackupedSize
              label: Backuped size
              format: number
              scale: 0.000000001
              suffix: GB     
            - field: totalStorageUsed
              label: Storage used
              format: number
              scale: 0.000000001
              suffix: GB     
            - field: totalUploadedSize
              label: Uploaded size
              format: number
              scale: 0.000000001
              suffix: GB     
```
will show:

<div style="padding-left: 60px;">

  ![Homepage Card](docs/homepage-summary.png)

</div>

### Last backup information

Show the latest backup information for a given machine/server. Below is a example showing how to configure this integration.

```yaml
   - Test Machine 1:
        icon: mdi-test-tube
        widget:
          type: customapi
          url: http://my.local.server:9666/api/lastbackup/Test%20Machine%201
          display: list
          refreshInterval: 60000
          mappings:
            - field: latest_backup.name
              label: Backup name
            - field: latest_backup.status
              label: Result
            - field: latest_backup.date
              label: Date
              format: date
              locale: en-GB 
              dateStyle: short
              timeStyle: short
            - field: latest_backup.duration
              label: Duration
              format: duration
            - field: latest_backup.uploadedSize
              label: Bytes Uploaded
              format: number
              scale: 0.000001
              suffix: MB        
```
will show:

<div style="padding-left: 60px;">

  ![Homepage Card](docs/homepage-lastbackup.png)

</div>

> [!TIP] 
> For a complete list of available fields, see the [Get Latest Backup](#get-latest-backup) section.


## API Endpoints

### Upload Backup Data
- **Endpoint**: `/api/upload`
- **Method**: POST
- **Description**: Uploads backup operation data for a machine
- **Request Body**: Json sent by Duplicati with the options:

  ```bash
  --send-http-url=http://my.local.server:9666/api/upload
  --send-http-result-output-format=Json
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
  > The machine name has to be URL Encoded.
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

### Get Overall Summary
- **Endpoint**: `/api/summary`
- **Method**: GET
- **Description**: Retrieves a summary of all backup operations across all machines
- **Response**:
  ```json
  {
    totalMachines: 3,
    totalBackups: 9,
    totalUploadedSize: 2397229507,
    totalStorageUsed: 43346796938,
    totalBackupedSize: 126089687807,
    secondsSinceLastBackup: 264
  }
  ```

## Docker Deployment

The application can be deployed using Docker and Portainer. There are two ways to deploy:

### Option 1: Using Docker Compose (Recommended)

1. Ensure Docker and Docker Compose are installed on your system
2. Clone the repository:
```bash
git clone https://github.com/wsj-br/duplidash.git
cd duplidash
```

3. Start the application:
```bash
docker compose up --build -d
```

The application will be available at `http://localhost:9666` or `http://<IP_or_NAME>:9666`

### Option 2: Using Portainer

1. In Portainer, go to "Stacks" and click "Add stack"
2. Name your stack (e.g., "duplidash")
3. Choose "Build method" as "Repository"
4. Enter the repository URL: `https://github.com/wsj-br/duplidash.git`
5. In the "Compose path" field, enter: `docker-compose.yml`
6. Click "Deploy the stack"



#### Environment Variables

The following environment variables can be configured in Portainer:

- `NODE_ENV`: Set to `production` (default)
- `PORT`: Application port (default: 9666)
- `NEXT_TELEMETRY_DISABLED`: disable next telemetry (default: 1)

#### Data Persistence

The application data is stored in the `./data` directory, which is mounted as the volume `duplidash_data` in the container. This ensures that your data persists even if the container is removed or updated.


## License

Copyright © 2025 Waldemar Scudeller Jr. 

>Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
>
>[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)
>
>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.


