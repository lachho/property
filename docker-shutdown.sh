#!/bin/bash

# Stop all containers gracefully
echo "Stopping all containers..."
docker-compose down --remove-orphans

# Check if postgres is still running on port 5432
if lsof -i :5432 | grep LISTEN; then
  echo "PostgreSQL is still running on port 5432. Attempting to stop it..."
  
  # Find the process ID of what's using port 5432
  PID=$(lsof -t -i:5432)
  
  if [ ! -z "$PID" ]; then
    echo "Found process with PID $PID using port 5432. Sending SIGTERM..."
    kill -15 $PID
    
    # Wait a moment and check if it's still running
    sleep 3
    if lsof -i :5432 | grep LISTEN; then
      echo "Process still running. Sending SIGKILL..."
      kill -9 $PID
    fi
  fi
fi

# Final check
if lsof -i :5432 | grep LISTEN; then
  echo "Warning: Unable to free port 5432. You may need to manually kill the process."
else
  echo "Port 5432 is now free."
fi

echo "Docker environment has been shut down." 