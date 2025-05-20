#!/bin/bash
set -e

# Pull latest changes
echo "📥 Pulling latest changes from repository..."
git pull

# Build and start the containers
echo "🚀 Building and starting containers..."
docker compose down
docker compose build
docker compose up -d

# Wait for health checks to pass
echo "⏳ Waiting for services to become healthy..."
sleep 20

# Show status
echo "📊 Container status:"
docker compose ps

echo "✅ Deployment completed successfully!"
echo "   Frontend: http://134.199.160.11:3001"
echo "   Backend API: http://134.199.160.11:8080" 