# Development instructions

## Prerequisites

- docker / docker compose
- Node.js 18.x or later
- pnpm 10.x or later (install with `npm install -g pnpm`)
- SQLite3

# Steps

1. Clone the repository:
```bash
git clone https://github.com/wsj-br/duplistatus.git
cd duplistatus
```

2. Install dependencies (debian/ubuntu):
```bash
sudo apt update
sudo apt install nodejs npm sqlite3 -y
sudo npm install -g pnpm
pnpm install
```


3. Start the development server:

For the default tcp port (9666)
```bash
pnpm run dev
```

For an alternative TCP port (8666)
```bash
pnpm run dev-alt
```


### Development Mode Features

When running in development mode (`pnpm run dev`), the application includes additional features to help with debugging and development:

- **JSON File Storage**: All received backup data is stored as JSON files in the `data` directory. These files are named using the timestamp of when they were received, in the format `YYYY-MM-DDTHH-mm-ss-sssZ.json` (UTC time). This feature is only active in development mode and helps with debugging by preserving the raw data received from Duplicati.

-  **Verbose Logging**: The application logs more detailed information about database operations and API requests when running in development mode.

4. Build the application for production
```bash
pnpm build
```


5. Start the production server:
```bash
pnpm start
```

6. Start a docker stack (docker compose)

```bash
docker compose up --build -d
```
<br><br>

## Test Scripts

The project includes several test scripts to help with development and testing:

### Generate Test Data
```bash
pnpm run generate-test-data
```
This script generates and uploads test backup data for multiple machines. 

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

### Generate the logo/favicon and banner from SVG images
```bash
scripts/convert_svg_logo.sh
```

> The svg files are located in the `docs` folder.

<br><br>

## Release Management

### Versioning (Semantic Versioning)

The project follows Semantic Versioning (SemVer) with the format `MAJOR.MINOR.PATCH`:

- **MAJOR** version (x.0.0): When you make incompatible API changes
- **MINOR** version (0.x.0): When you add functionality in a backward-compatible manner
- **PATCH** version (0.0.x): When you make backward-compatible bug fixes

### Release Commands

The project includes several release commands to manage versioning:

```bash
# For bug fixes and minor changes (0.0.x)
pnpm run release:patch

# For new features that don't break existing functionality (0.x.0)
pnpm run release:minor

# For major changes that may break compatibility (x.0.0)
pnpm run release:major
```

These commands will:
1. Update the version in package.json
2. Create a git commit with the version change
3. Create a git tag for the new version
4. Push the changes and tag to the remote repository

### Creating a GitHub Release

After running a release command, follow these steps to create a GitHub release:

1. Go to the GitHub repository
2. Click on "Releases" in the right sidebar
3. Click "Create a new release"
4. Select the tag that was just created (e.g., v1.2.3)
5. Add release notes describing the changes
6. Click "Publish release"

This will automatically:
- Create a new Docker images (AMD64 and arm64 architectures)
- Push the images to Docker Hub 
- Push the images to GitHub Container Registry (ghcr.io/wsj-br/duplistatus:latest)

### Manual Docker Image Build

To manually trigger the Docker image build workflow:

1. Go to the GitHub repository
2. Click on "Actions" tab
3. Select the "Build and Push Docker Image" workflow
4. Click "Run workflow"
5. Select the branch to build from
6. Click "Run workflow"

## Additional Scripts

### Clear Docker Environment
```bash
scripts/clear-docker.sh
```
This script cleans up Docker resources:
- Removes all Docker builder cache
- Prunes unused Docker system resources (images, networks, volumes)
- Useful when you need to free up disk space or resolve Docker-related issues

<br><br>

# Copyright Notice

**Copyright © 2025 Waldemar Scudeller Jr.**

```
SPDX-License-Identifier: Apache-2.0
```

## License Summary

Licensed under the Apache License, Version 2.0 (the "License");  
you may not use this work except in compliance with the License.  
You may obtain a copy of the License at:

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software  
distributed under the License is distributed on an **"AS IS" BASIS**,  
**WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND**, either express or implied.  
See the License for the specific language governing permissions and  
limitations under the License.


