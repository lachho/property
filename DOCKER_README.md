# Docker Environment for Property Path

This README provides information about the Docker environment setup for the Property Path application.

## Improved Shutdown Process

The Docker environment has been updated to ensure proper release of ports when shutting down, particularly addressing the PostgreSQL port (5432) issues.

## Scripts

### Starting the Environment

To start the Docker environment:

```bash
./docker-startup.sh
```

This script will:
1. Check if port 5432 is already in use
2. If port is in use, attempt to free it by stopping Docker containers or killing processes
3. Start all containers with `docker-compose up -d`

### Shutting Down the Environment

To properly shut down the Docker environment:

```bash
./docker-shutdown.sh
```

This script will:
1. Stop all containers with `docker-compose down --remove-orphans`
2. Check if PostgreSQL is still running on port 5432
3. If necessary, attempt to stop any process still using port 5432

## Improvements Made

1. Added custom PostgreSQL configuration with faster shutdown settings
2. Created a custom entrypoint script that handles shutdown signals properly
3. Added `stop_grace_period` and `stop_signal` to Docker Compose configuration
4. Created helper scripts for starting and stopping the environment

## Troubleshooting

If you still encounter issues with port 5432 being in use:

1. Manually check what's using the port:
   ```bash
   sudo lsof -i :5432
   ```

2. Kill the process:
   ```bash
   sudo kill -9 <PID>
   ```

3. Then start the environment again:
   ```bash
   ./docker-startup.sh
   ``` 