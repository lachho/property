#!/bin/bash

# Exit on error
set -e

echo "====================================================="
echo "Deploying to server: ubuntu-s-1vcpu-1gb-syd1-01"
echo "Server IP: 134.199.160.11"
echo "Region: SYD1"
echo "====================================================="
echo "Starting deployment process..."
echo "Note: Supabase dependencies have been removed. Frontend now uses direct API calls to the backend service."

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

echo "====================================================="
echo "Deployment complete! Use the following commands to monitor the application:"
echo "- View logs: docker-compose logs -f"
echo "- Check status: docker-compose ps"
echo ""
echo "Your application is available at:"
echo "- Frontend: http://134.199.160.11:3001"
echo "- Backend: http://134.199.160.11:8080"
echo "- Database: postgresql://property_user:property_pass@134.199.160.11:5432/property_db"
echo "=====================================================" 