import express from 'express'
import { TravelAgent } from './agent/TravelAgent'
import path from 'path'
import { HealthController, MessageController, ConnectionController } from './controllers'
import { getAppConfig } from './config'

const app = express()
const config = getAppConfig()
const port = config.port
const agent = new TravelAgent()

// Initialize controllers
const messageController = new MessageController(agent)
const connectionController = new ConnectionController(agent)

// Define the root path explicitly based on where the code is running
// src/bot.ts is in src/, so we go up two levels to get to the root
const projectRoot = path.join(__dirname, '../..')
console.log(`📂 Serving static files from: ${projectRoot}`)

// Serve static files from the project root
app.use(express.static(projectRoot))

// Serve assets folder
app.use('/assets', express.static(path.join(projectRoot, 'assets')))

// Add explicit route for logo.png for debugging
app.get('/logo.png', (req, res) => {
  const logoPath = path.join(projectRoot, 'assets', 'logo.png')
  res.sendFile(logoPath, err => {
    if (err) {
      console.error('❌ Error sending logo.png:', err)
      res.status(404).send('Logo not found')
    } else {
      console.log('✅ Served logo.png')
    }
  })
})

app.use(express.json())

// Routes
app.get('/health', HealthController.getHealth)
app.get('/welcome', (req, res) => connectionController.getWelcome(req, res))
app.post('/message-received', (req, res) => messageController.handleMessageReceived(req, res))
app.post('/connection-established', (req, res) => connectionController.handleConnectionEstablished(req, res))

app.listen(port, () => {
  console.log(`🤖 Concieragent server listening at http://localhost:${port}`)
  console.log(`📡 VS Agent URL: ${config.vsAgentUrl}`)

  // Initialize Travel Agent asynchronously (don't block server startup)
  console.log('🔄 Initializing Travel Agent (connecting to MCP servers)...')
  agent
    .initialize()
    .then(() => {
      console.log('✅ Travel Agent ready!')
    })
    .catch(error => {
      console.error('❌ Failed to initialize Travel Agent:', error)
      console.log('⚠️ Bot will continue but MCP features may not work')
    })
})

// Keep process alive
process.stdin.resume()

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down...')
  await agent.cleanup()
  process.exit(0)
})
