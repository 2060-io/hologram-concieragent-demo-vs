# 🔄 Updating Concieragent - Complete Guide

This guide will help you update your Concieragent installation to ensure everything is using the latest configuration, including the new branding and logo.

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ Your current ngrok URL (from the terminal running `ngrok http 3001`)
- ✅ Access to all three terminal windows (ngrok, bot server, VS Agent)
- ✅ Your `.env` file configured with API keys

---

## 🚀 Step-by-Step Update Process

### Step 1: Stop the Old VS Agent Container

The VS Agent container may be running with old configuration. Stop and remove it:

```bash
docker stop vs-agent
docker rm vs-agent
```

**Verify it's stopped:**
```bash
docker ps --filter name=vs-agent
```
(Should return nothing)

---

### Step 2: Restart Your Bot Server

If your bot server is running, stop it (press `Ctrl+C` in that terminal) and restart it to apply any code changes:

```bash
pnpm start
```

**Wait for the success message:**
```
✅ Travel Agent ready!
```

**If you see TypeScript errors**, they need to be fixed first. Check the error messages and fix any compilation issues.

---

### Step 3: Get Your Current ngrok URL

Make sure ngrok is still running in its terminal window. You should see something like:

```
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3001
```

**Copy the URL** (e.g., `abc123.ngrok-free.app`) - you'll need it in the next step.

> ⚠️ **Important**: If you restarted ngrok, the URL will have changed. Always use the current URL!

---

### Step 4: Restart VS Agent with New Configuration

Run the docker script with your current ngrok URL:

```bash
./scripts/docker-run.sh <your-ngrok-url>
```

**Example:**
```bash
./scripts/docker-run.sh abc123.ngrok-free.app
```

**You should see:**
```
✅ VS Agent started successfully!
```

**Verify it's running:**
```bash
docker ps --filter name=vs-agent
```

---

### Step 5: Verify Logo is Accessible

Test that your logo is accessible through the ngrok tunnel:

```bash
# Replace with your actual ngrok URL
curl -I https://<your-ngrok-url>/logo.png
```

**Expected output:**
```
HTTP/1.1 200 OK
Content-Type: image/png
...
```

If you get a `404 Not Found`, check:
1. Bot server is running (`pnpm start`)
2. Logo file exists at project root: `ls -la logo.png`
3. Static file serving is configured in `src/bot.ts`

---

### Step 6: Reconnect in Hologram App

1. **Disconnect old connection** (if needed):
   - Open Hologram app
   - Find the old "My Hologram Chatbot" or old name connection
   - Disconnect/Delete it

2. **Get new invitation**:
   - Open browser: `http://localhost:3001/invitation`
   - You should see a QR code with "Concieragent" label

3. **Scan new QR code**:
   - Open Hologram app on your iPhone
   - Scan the QR code
   - Accept the connection invitation

4. **Verify new branding**:
   - You should see "Concieragent" as the bot name
   - The logo should appear in the invitation and chat

---

## ✅ Verification Checklist

Use this checklist to ensure everything is updated:

- [ ] VS Agent container stopped and restarted
- [ ] Bot server restarted (`pnpm start` shows "✅ Travel Agent ready!")
- [ ] Current ngrok URL used in `./scripts/docker-run.sh`
- [ ] Logo accessible: `https://<ngrok-url>/logo.png` returns 200
- [ ] New QR code scanned in Hologram app
- [ ] Bot name shows as "Concieragent" in Hologram app
- [ ] Logo appears in Hologram app

---

## 🔧 Troubleshooting

### Logo Still Not Showing

**Problem**: Logo shows as broken image or doesn't appear

**Solutions**:
1. **Check bot server is running**:
   ```bash
   lsof -ti:4001
   ```
   (Should return a process ID)

2. **Test logo locally**:
   ```bash
   curl http://localhost:4001/logo.png
   ```
   (Should return image data, not 404)

3. **Check static file configuration** in `src/bot.ts`:
   ```typescript
   app.use(express.static(path.resolve(__dirname, '../..')))
   ```

4. **Verify logo file exists**:
   ```bash
   ls -la logo.png
   ```

### Old Name Still Appearing

**Problem**: Hologram app still shows old bot name

**Solutions**:
1. **Disconnect and reconnect** in Hologram app
2. **Verify VS Agent environment variables**:
   ```bash
   docker exec vs-agent env | grep AGENT_LABEL
   ```
   (Should show `AGENT_LABEL=Concieragent`)

3. **Restart VS Agent** with correct configuration:
   ```bash
   docker stop vs-agent && docker rm vs-agent
   ./scripts/docker-run.sh <your-ngrok-url>
   ```

### ngrok URL Changed

**Problem**: VS Agent configured with old ngrok URL

**Solution**:
1. Get current ngrok URL from ngrok terminal
2. Restart VS Agent:
   ```bash
   docker stop vs-agent && docker rm vs-agent
   ./scripts/docker-run.sh <new-ngrok-url>
   ```

### Bot Not Responding

**Problem**: Bot doesn't respond to messages

**Solutions**:
1. **Check bot server logs** for errors
2. **Verify MCP servers connected**:
   - Look for `✅ Connected to MCP server` messages
   - Check for `⚠️ Failed to connect` warnings

3. **Check VS Agent logs**:
   ```bash
   docker logs -f vs-agent
   ```

4. **Verify webhook URL** in VS Agent:
   ```bash
   docker exec vs-agent env | grep EVENTS_BASE_URL
   ```
   (Should match your local IP and port 4001)

---

## 📝 Quick Reference Commands

```bash
# Stop VS Agent
docker stop vs-agent && docker rm vs-agent

# Start VS Agent (replace with your ngrok URL)
./scripts/docker-run.sh <your-ngrok-url>

# Check VS Agent status
docker ps --filter name=vs-agent

# View VS Agent logs
docker logs -f vs-agent

# Test logo accessibility
curl -I https://<your-ngrok-url>/logo.png

# Check bot server is running
lsof -ti:4001

# Restart bot server
# (Ctrl+C to stop, then:)
pnpm start
```

---

## 🎯 After Update

Once everything is updated, you should see:

1. **In Hologram App**:
   - Bot name: "Concieragent"
   - Logo image visible
   - Bot responds with travel planning capabilities

2. **In Bot Server Terminal**:
   - `✅ Travel Agent ready!`
   - `✅ Connected to MCP server` messages (6 servers)

3. **In VS Agent**:
   - Running container: `docker ps` shows `vs-agent`
   - Logs show successful startup

---

## 💡 Pro Tips

1. **Keep ngrok running**: Don't restart ngrok unless necessary - it changes your URL
2. **Use the same terminal**: Keep each service in its own terminal window for easy monitoring
3. **Check logs first**: When troubleshooting, always check logs before restarting
4. **Test incrementally**: After each step, verify it worked before moving to the next

---

## 🆘 Still Having Issues?

If you're still experiencing problems after following this guide:

1. Check the main [README.md](./README.md) troubleshooting section
2. Review VS Agent logs: `docker logs -f vs-agent`
3. Check bot server console output for errors
4. Verify all environment variables are set correctly
5. Ensure all dependencies are installed (`pnpm install` and `uv sync` in each MCP server)

---

**Last Updated**: November 2024

