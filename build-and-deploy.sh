#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Deploying Property App ===${NC}"

# Step 1: Pull latest changes from git
echo -e "${GREEN}Step 1: Pulling latest changes...${NC}"
git pull

# Step 2: Verify dist directory exists
echo -e "${GREEN}Step 2: Verifying frontend build exists...${NC}"
if [ ! -d "front-end/dist" ]; then
  echo -e "${RED}Error: front-end/dist directory not found!${NC}"
  echo -e "${RED}Make sure to build the frontend locally and commit the dist folder before deploying.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Frontend build found in dist directory${NC}"

# Step 3: Start Docker containers
echo -e "${GREEN}Step 3: Starting containers...${NC}"
docker compose down
# We only need to build the backend container
docker compose build backend
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