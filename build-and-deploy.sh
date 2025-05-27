#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Building Property App ===${NC}"

# Step 1: Build the frontend locally
echo -e "${GREEN}Step 1: Building frontend locally...${NC}"
cd front-end
npm install
npm run build
if [ ! -d "dist" ]; then
  echo -e "${RED}Frontend build failed! Check for errors above.${NC}"
  exit 1
fi
cd ..

# Step 2: Pull latest changes (if in a git repo)
echo -e "${GREEN}Step 2: Pulling latest changes...${NC}"
if [ -d ".git" ]; then
  git pull
else
  echo "Not a git repository, skipping git pull"
fi

# Step 3: Build and start Docker containers
echo -e "${GREEN}Step 3: Building and starting containers...${NC}"
docker compose down
docker compose build
docker compose up -d

# Step 4: Wait for services to become healthy
echo -e "${GREEN}Step 4: Waiting for services to become healthy...${NC}"
echo "Waiting 20 seconds for services to start..."
sleep 20

# Step 5: Show status
echo -e "${GREEN}Step 5: Checking container status...${NC}"
docker compose ps

echo -e "${GREEN}=== Deployment completed ===${NC}"
echo -e "Frontend: http://134.199.160.11:3001"
echo -e "Backend API: http://134.199.160.11:8080" 