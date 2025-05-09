#!/bin/bash

# Check if postgres is running on port 5432
if lsof -i :5432 | grep LISTEN; then
  echo "Port 5432 is already in use. Attempting to free it..."
  
  # First try to stop it gracefully if it's a Docker container
  CONTAINER_ID=$(docker ps | grep postgres | awk '{print $1}')
  if [ ! -z "$CONTAINER_ID" ]; then
    echo "Found PostgreSQL running in Docker container. Stopping it..."
    docker stop $CONTAINER_ID
    sleep 2
  fi
  
  # If port is still in use, try to find and kill the process
  if lsof -i :5432 | grep LISTEN; then
    echo "Port 5432 is still in use. Attempting to kill the process..."
    PID=$(lsof -t -i:5432)
    
    if [ ! -z "$PID" ]; then
      echo "Found process with PID $PID using port 5432. Sending SIGTERM..."
      kill -15 $PID
      
      # Wait a moment and check if it's still running
      sleep 3
      if lsof -i :5432 | grep LISTEN; then
        echo "Process still running. Sending SIGKILL..."
        kill -9 $PID
        sleep 2
      fi
    fi
  fi
  
  # Final check
  if lsof -i :5432 | grep LISTEN; then
    echo "Error: Unable to free port 5432. Please manually stop the PostgreSQL service and try again."
    exit 1
  else
    echo "Port 5432 is now free."
  fi
fi

# Start Docker Compose environment
echo "Starting Docker Compose environment..."
docker-compose up -d

echo "Docker environment is now running."
echo "- Frontend: http://localhost:3001"
echo "- Backend: http://localhost:8080" 