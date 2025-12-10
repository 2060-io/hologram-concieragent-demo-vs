#!/bin/bash

# Hologram VS Agent Docker Run Script
# This script helps you run VS Agent with the correct configuration

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Hologram VS Agent...${NC}"

# Check if ngrok URL is provided
if [ -z "$1" ]; then
  echo -e "${YELLOW}⚠️  No public URL provided!${NC}"
  echo -e "${YELLOW}Usage: ./docker-run.sh <your-ngrok-url>${NC}"
  echo -e "${YELLOW}Example: ./docker-run.sh abc123.ngrok-free.app${NC}"
  echo ""
  echo -e "${YELLOW}💡 Tip: Run 'ngrok http 3001' in another terminal to get a public URL${NC}"
  exit 1
fi

NGROK_URL=$1
# Try multiple methods to get local IP on macOS
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || \
           ipconfig getifaddr en1 2>/dev/null || \
           ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n1 || \
           hostname -I | awk '{print $1}' 2>/dev/null)

if [ -z "$LOCAL_IP" ]; then
  echo -e "${RED}❌ Could not detect local IP address${NC}"
  echo -e "${YELLOW}Please set EVENTS_BASE_URL manually in the docker command${NC}"
  exit 1
fi

echo -e "${GREEN}📋 Configuration:${NC}"
echo -e "  Public URL: ${NGROK_URL}"
echo -e "  Local IP: ${LOCAL_IP}"
echo -e "  Events URL: http://${LOCAL_IP}:4001"
echo ""

# Stop and remove existing container if it exists
docker stop vs-agent 2>/dev/null
docker rm vs-agent 2>/dev/null

# Run VS Agent
docker run -d \
  -p 3001:3001 \
  -p 3000:3000 \
  -e AGENT_PUBLIC_DID=did:web:${NGROK_URL} \
  -e AGENT_LABEL="Concieragent" \
  -e AGENT_INVITATION_IMAGE_URL=https://raw.githubusercontent.com/AirKyzzZ/concieragent-hologram-demo/refs/heads/feat-mcp-travel-assistant/logo.png \
  -e EVENTS_BASE_URL=http://${LOCAL_IP}:4001 \
  --name vs-agent \
  io2060/vs-agent:dev

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ VS Agent started successfully!${NC}"
  echo ""
  echo -e "${GREEN}📱 Next steps:${NC}"
  echo -e "  1. Make sure your bot server is running: ${YELLOW}npm start${NC}"
  echo -e "  2. Open invitation URL: ${YELLOW}http://localhost:3001/invitation${NC}"
  echo -e "  3. Scan QR code with Hologram app on your iPhone"
  echo -e "  4. Send a message and see the test response!"
  echo ""
  echo -e "${GREEN}🔍 View logs:${NC} docker logs -f vs-agent"
  echo -e "${GREEN}🛑 Stop agent:${NC} docker stop vs-agent"
else
  echo -e "${RED}❌ Failed to start VS Agent${NC}"
  exit 1
fi

