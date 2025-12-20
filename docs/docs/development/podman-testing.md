

# Podman Testing

Copy and execute the scripts located at "scripts/podman_testing" in the Podman test server

## Initial Setup and Management

1. `copy.docker.duplistatus`: to copy the Docker image created in the development server to the Podman test server.
   - Create the image using this command in the devel server `docker build . -t wsj-br/duplistatus:devel`
2. `start.duplistatus`: to start the container
3. `stop.duplistatus`: to stop the pod and remove the container

## Monitoring and Health Checks

5. `check.duplistatus`: to check the logs, connectivity and application health.

## Debugging Commands

- `logs.duplistatus`: to show the logs of the pod
- `exec.shell.duplistatus`: open a shell in the container
- `restart.duplistatus`: stop the pod, remove the container, copy the image, create the container and start the pod.

## Usage Workflow

### Development server

Create the docker image in the development server with <br />
 ```bash
docker build . -t wsj-br/duplistatus:devel
 ```


### Podman server

1. Use `./copy.docker.duplistatus` to transfer the Docker image
2. Start the container with `./start.duplistatus`
3. Monitor with `./check.duplistatus` and `./logs.duplistatus`
4. Stop with `./stop.duplistatus` when done
5. Use `./restart.duplistatus` for a complete restart cycle (stop, copy image, start)


# Testing the application

If you are running the podman server at the same machine use `http://localhost:9666`.
If you are in another server get the URL with 
```bash
echo "http://$(hostname -I | awk '{print $1}'):9666" 
```
