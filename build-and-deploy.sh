#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Property App Deployment Tool ===${NC}"

# Parse command line arguments
BUILD_FRONTEND=false
DEPLOY=true

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --build-frontend) BUILD_FRONTEND=true ;;
        --no-deploy) DEPLOY=false ;;
        --help) 
            echo "Usage: ./build-and-deploy.sh [options]"
            echo "Options:"
            echo "  --build-frontend   Build the frontend before deployment"
            echo "  --no-deploy        Only build frontend, don't deploy"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Step 1: Pull latest changes from git
echo -e "${GREEN}Step 1: Pulling latest changes...${NC}"
git pull

# Step 2: Build frontend if requested
if [ "$BUILD_FRONTEND" = true ]; then
    echo -e "${GREEN}Step 2: Building frontend...${NC}"
    cd front-end
    npm install
    npm run build
    
    # Verify the build succeeded
    if [ ! -d "dist" ]; then
        echo -e "${RED}Build failed! Check for errors above.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Frontend build successful!${NC}"
    cd ..
    
    echo -e "${YELLOW}Remember to commit the updated build:${NC}"
    echo -e "  git add front-end/dist"
    echo -e "  git commit -m \"Update frontend build\""
    echo -e "  git push"
fi

# Exit if no deployment requested
if [ "$DEPLOY" = false ]; then
    echo -e "${GREEN}=== Build completed (no deployment requested) ===${NC}"
    exit 0
fi

# Step 3: Verify dist directory exists
echo -e "${GREEN}Step 3: Verifying frontend build exists...${NC}"
if [ ! -d "front-end/dist" ]; then
  echo -e "${RED}Error: front-end/dist directory not found!${NC}"
  echo -e "${RED}Build the frontend with: ./build-and-deploy.sh --build-frontend${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Frontend build found in dist directory${NC}"

# Step 4: Start Docker containers
echo -e "${GREEN}Step 4: Starting containers...${NC}"
docker-compose down
# We only need to build the backend container
docker-compose build backend
docker-compose up -d

# Step 5: Wait for services to become healthy
echo -e "${GREEN}Step 5: Waiting for services to become healthy...${NC}"
echo "Waiting 20 seconds for services to start..."
sleep 20

# Step 6: Show status
echo -e "${GREEN}Step 6: Checking container status...${NC}"
docker-compose ps

echo -e "${GREEN}=== Deployment completed ===${NC}"
echo -e "Frontend: http://134.199.160.11:3001"
echo -e "Backend API: http://134.199.160.11:8080" 