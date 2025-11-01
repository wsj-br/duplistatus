

# Podman Testing

Copy and execute the scripts located at "scripts/podman_testing" in the Podman test server

## Initial Setup and Management

1. `initialise.duplistatus`: to create the pod
2. `copy.docker.duplistatus`: to copy the Docker image created in the development server to the Podman test server.
   - Create the image using the command `docker build . -t wsj-br/duplistatus:devel-MAJOR.MINOR.PATCH`
3. `start.duplistatus`: to start the container
4. `stop.duplistatus`: to stop the pod and remove the container

## Monitoring and Health Checks

5. `check.duplistatus`: to check the logs, connectivity and application health.

## Debugging Commands

- `logs.duplistatus`: to show the logs of the pod
- `exec.shell.duplistatus`: open a shell in the container
- `restart.duplistatus`: stop the pod, remove the container, copy the image, create the container and start the pod.

## Usage Workflow

1. First run `initialise.duplistatus` to set up the pod
2. Use `copy.docker.duplistatus` to transfer the Docker image
3. Start the container with `start.duplistatus`
4. Monitor with `check.duplistatus` and `logs.duplistatus`
5. Stop with `stop.duplistatus` when done
6. Use `restart.duplistatus` for a complete restart cycle
