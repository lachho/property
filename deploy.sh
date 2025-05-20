#!/bin/bash
set -e

echo "====================================================="
echo "Deploying to server: ubuntu-s-1vcpu-1gb-syd1-01"
echo "Server IP: 134.199.160.11"
echo "Region: SYD1"
echo "====================================================="

# Pull latest changes
echo "📥 Pulling latest changes from repository..."
git pull

# Build and start the containers
echo "🚀 Building and starting containers..."
docker-compose down
docker-compose build
docker-compose up -d

# Wait for health checks to pass
echo "⏳ Waiting for services to become healthy..."
sleep 20

# Show status
echo "📊 Container status:"
docker-compose ps

echo "====================================================="
echo "✅ Deployment completed successfully!"
echo "   Frontend: http://134.199.160.11:3001"
echo "   Backend API: http://134.199.160.11:8080" 
echo "   Database: postgresql://property_user:property_pass@134.199.160.11:5432/property_db"
echo "=====================================================" 