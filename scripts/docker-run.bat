@echo off
REM Hologram VS Agent Docker Run Script (Windows Batch)
REM This script helps you run VS Agent with the correct configuration

echo 🚀 Starting Hologram VS Agent...

REM Check if ngrok URL is provided
if "%~1"=="" (
  echo ⚠️  No public URL provided!
  echo Usage: scripts\docker-run.bat ^<your-ngrok-url^>
  echo Example: scripts\docker-run.bat abc123.ngrok-free.app
  echo.
  echo 💡 Tip: Run 'ngrok http 3001' in another terminal to get a public URL
  exit /b 1
)

set NGROK_URL=%~1

REM Get local IP address (Windows method)
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4"') do (
  set IP_LINE=%%a
  set IP_LINE=!IP_LINE: =!
  for /f "tokens=1" %%b in ("!IP_LINE!") do (
    set LOCAL_IP=%%b
    goto :found_ip
  )
)
:found_ip

if "%LOCAL_IP%"=="" (
  echo ❌ Could not detect local IP address
  echo Please set EVENTS_BASE_URL manually in the docker command
  echo You can find your IP with: ipconfig ^| findstr IPv4
  exit /b 1
)

echo 📋 Configuration:
echo   Public URL: %NGROK_URL%
echo   Local IP: %LOCAL_IP%
echo   Events URL: http://%LOCAL_IP%:4001
echo.

REM Stop and remove existing container if it exists
echo 🛑 Stopping existing VS Agent container (if any)...
docker stop vs-agent 2>nul
docker rm vs-agent 2>nul

REM Run VS Agent
echo 🐳 Starting VS Agent container...
docker run -d ^
  -p 3001:3001 ^
  -p 3000:3000 ^
  -e AGENT_PUBLIC_DID=did:web:%NGROK_URL% ^
  -e AGENT_LABEL=Concieragent ^
  -e AGENT_INVITATION_IMAGE_URL=https://raw.githubusercontent.com/AirKyzzZ/concieragent-hologram-demo/refs/heads/feat-mcp-travel-assistant/logo.png ^
  -e EVENTS_BASE_URL=http://%LOCAL_IP%:4001 ^
  --name vs-agent ^
  io2060/vs-agent:dev

if %ERRORLEVEL% equ 0 (
  echo ✅ VS Agent started successfully!
  echo.
  echo 📱 Next steps:
  echo   1. Make sure your bot server is running: pnpm run dev
  echo   2. Open invitation URL: http://localhost:3001/invitation
  echo   3. Scan QR code with Hologram app on your iPhone
  echo   4. Send a message and see the test response!
  echo.
  echo 🔍 View logs: docker logs -f vs-agent
  echo 🛑 Stop agent: docker stop vs-agent
) else (
  echo ❌ Failed to start VS Agent
  exit /b 1
)
