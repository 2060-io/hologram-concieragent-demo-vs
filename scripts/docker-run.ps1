# Hologram VS Agent Docker Run Script (Windows PowerShell)
# This script helps you run VS Agent with the correct configuration

Write-Host "Starting Hologram VS Agent..." -ForegroundColor Green

# Check if ngrok URL is provided
if ($args.Count -eq 0) {
  Write-Host "WARNING: No public URL provided!" -ForegroundColor Yellow
  Write-Host "Usage: .\scripts\docker-run.ps1 <your-ngrok-url>" -ForegroundColor Yellow
  Write-Host "Example: .\scripts\docker-run.ps1 abc123.ngrok-free.app" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Tip: Run 'ngrok http 3001' in another terminal to get a public URL" -ForegroundColor Yellow
  exit 1
}

$NGROK_URL = $args[0]

# Get local IP address (Windows method)
$LOCAL_IP = $null
try {
  # Try to get IPv4 address from network adapters
  $networkAdapters = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" }
  if ($networkAdapters) {
    $LOCAL_IP = ($networkAdapters | Select-Object -First 1).IPAddress
  }
} catch {
  # Fallback: try ipconfig
  $ipconfig = ipconfig | Select-String -Pattern "IPv4" | Select-Object -First 1
  if ($ipconfig) {
    $LOCAL_IP = ($ipconfig -split ":")[1].Trim()
  }
}

if (-not $LOCAL_IP) {
  Write-Host "ERROR: Could not detect local IP address" -ForegroundColor Red
  Write-Host "Please set EVENTS_BASE_URL manually in the docker command" -ForegroundColor Yellow
  Write-Host "You can find your IP with: ipconfig | findstr IPv4" -ForegroundColor Yellow
  exit 1
}

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Public URL: $NGROK_URL"
Write-Host "  Local IP: $LOCAL_IP"
Write-Host "  Events URL: http://${LOCAL_IP}:4001"
Write-Host ""

# Stop and remove existing container if it exists
Write-Host "Stopping existing VS Agent container (if any)..."
docker stop vs-agent 2>$null
docker rm vs-agent 2>$null

# Run VS Agent
Write-Host "Starting VS Agent container..."
docker run -d `
  -p 3001:3001 `
  -p 3000:3000 `
  -e AGENT_PUBLIC_DID="did:web:${NGROK_URL}" `
  -e AGENT_LABEL="Concieragent" `
  -e AGENT_INVITATION_IMAGE_URL="https://raw.githubusercontent.com/AirKyzzZ/concieragent-hologram-demo/refs/heads/feat-mcp-travel-assistant/logo.png" `
  -e EVENTS_BASE_URL="http://${LOCAL_IP}:4001" `
  --name vs-agent `
  io2060/vs-agent:dev

if ($LASTEXITCODE -eq 0) {
  Write-Host "SUCCESS: VS Agent started successfully!" -ForegroundColor Green
  Write-Host ""
  Write-Host "Next steps:" -ForegroundColor Green
  Write-Host "  1. Make sure your bot server is running: " -NoNewline
  Write-Host "pnpm run dev" -ForegroundColor Yellow
  Write-Host "  2. Open invitation URL: " -NoNewline
  Write-Host "http://localhost:3001/invitation" -ForegroundColor Yellow
  Write-Host "  3. Scan QR code with Hologram app on your iPhone"
  Write-Host "  4. Send a message and see the test response!"
  Write-Host ""
  Write-Host "View logs: " -NoNewline -ForegroundColor Green
  Write-Host "docker logs -f vs-agent"
  Write-Host "Stop agent: " -NoNewline -ForegroundColor Green
  Write-Host "docker stop vs-agent"
} else {
  Write-Host "ERROR: Failed to start VS Agent" -ForegroundColor Red
  exit 1
}
