#!/bin/bash

# Exit on error
set -e

echo "Starting deployment process..."

# Stop and remove existing containers
echo "Stopping existing containers..."
docker-compose down

# Rebuild containers
echo "Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Check container statuses
echo "Checking container statuses..."
docker-compose ps

echo "Deployment complete! Use the following commands to monitor the application:"
echo "- View logs: docker-compose logs -f"
echo "- Check status: docker-compose ps"
echo ""
echo "Your application is available at:"
echo "- Frontend: http://134.199.160.11:3001"
echo "- Backend: http://134.199.160.11:8080" 