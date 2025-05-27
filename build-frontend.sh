#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Building Frontend for Deployment ===${NC}"

# Change to frontend directory
cd front-end

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Build the frontend
echo -e "${GREEN}Building frontend...${NC}"
npm run build

# Verify the build succeeded
if [ ! -d "dist" ]; then
  echo -e "${RED}Build failed! Check for errors above.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Frontend build successful!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. ${GREEN}Commit the changes:${NC}"
echo -e "   git add front-end/dist"
echo -e "   git commit -m \"Update frontend build\""
echo -e "2. ${GREEN}Push to GitHub:${NC}"
echo -e "   git push"
echo -e "3. ${GREEN}Deploy on server:${NC}"
echo -e "   ./build-and-deploy.sh" 