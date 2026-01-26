import logger from './utils/logger'
import express from 'express'
import { TravelAgent } from './agent/TravelAgent'
import path from 'path'
import { HealthController, MessageController, ConnectionController } from './controllers'
import { getAppConfig } from './config'
import { createStorageProvider, type StorageProvider } from './storage'

const app = express()
const config = getAppConfig()
const port = config.port

// Storage provider (initialized async)
let storage: StorageProvider | null = null

// Create agent (storage will be set after initialization)
const agent = new TravelAgent()

// Initialize controllers
const messageController = new MessageController(agent)
const connectionController = new ConnectionController(agent)

// Define the root path explicitly based on where the code is running
// src/bot.ts is in src/, so we go up two levels to get to the root
const projectRoot = path.join(__dirname, '../..')
logger.info(`📂 Serving static files from: ${projectRoot}`)

// Serve static files from the project root
app.use(express.static(projectRoot))

// Serve assets folder
app.use('/assets', express.static(path.join(projectRoot, 'assets')))

// Add explicit route for logo.png for debugging
app.get('/logo.png', (req, res) => {
  const logoPath = path.join(projectRoot, 'assets', 'logo.png')
  res.sendFile(logoPath, err => {
    if (err) {
      logger.error({ err }, '❌ Error sending logo.png')
      res.status(404).send('Logo not found')
    } else {
      logger.info('✅ Served logo.png')
    }
  })
})

app.use(express.json({ limit: '10mb' }))

// Routes
app.get('/health', HealthController.getHealth)
app.get('/welcome', (req, res) => connectionController.getWelcome(req, res))
app.post('/message-received', (req, res) => messageController.handleMessageReceived(req, res))
app.post('/connection-established', (req, res) => connectionController.handleConnectionEstablished(req, res))

/**
 * Initialize all services (storage + MCP tools)
 */
async function initializeServices(): Promise<void> {
  // Initialize storage provider (optional - falls back to memory if it fails)
  try {
    storage = createStorageProvider()
    await storage.initialize()
    agent.setStorage(storage)
    logger.info('✅ Storage provider initialized')
  } catch (error) {
    console.warn('⚠️ Failed to initialize storage provider, using in-memory fallback:', error)
    storage = null
  }

  // Initialize Travel Agent (MCP servers)
  logger.info('🔄 Initializing Travel Agent (connecting to MCP servers)...')
  await agent.initialize()
  logger.info('✅ Travel Agent ready!')
}

app.listen(port, () => {
  logger.info(`🤖 Concieragent server listening at http://localhost:${port}`)
  logger.info(`📡 VS Agent URL: ${config.vsAgentUrl}`)

  // Initialize services asynchronously (don't block server startup)
  initializeServices().catch(error => {
    logger.error({ err: error }, '❌ Failed to initialize services')
    logger.info('⚠️ Bot will continue but some features may not work')
  })
})

// Keep process alive
process.stdin.resume()

// Handle cleanup on exit
process.on('SIGINT', async () => {
  logger.info('🛑 Shutting down...')
  // Note: agent.cleanup() already closes storage, no need to call storage.close() separately
  await agent.cleanup()
  process.exit(0)
})
