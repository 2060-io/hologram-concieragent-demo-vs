import { Request, Response } from 'express'
import { TravelAgent } from '../agent/TravelAgent'
import { ConnectionEstablishedDto, WelcomeResponseDto } from '../dto'
import { getAppConfig } from '../config'

/**
 * Connection controller for handling new connections
 */
export class ConnectionController {
  constructor(private agent: TravelAgent) {}

  /**
   * POST /connection-established - Handle new connections with welcome message
   */
  async handleConnectionEstablished(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as ConnectionEstablishedDto
      const connectionId = body.connectionId
      const preferredLanguage = (body.language || 'en') as 'en' | 'es' | 'fr'

      console.log(`🤝 New connection established: ${connectionId}`)

      // Get localized welcome message
      const welcomeMessage = this.agent.getWelcomeMessage(preferredLanguage)

      // Send welcome message to the user via VS Agent Admin API
      const responseMessage = {
        type: 'text',
        connectionId: connectionId,
        content: welcomeMessage,
      }

      const vsAgentUrl = getAppConfig().vsAgentUrl
      const response = await fetch(`${vsAgentUrl}/v1/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responseMessage),
      })

      if (!response.ok) {
        console.error(`❌ Failed to send welcome message: ${response.statusText}`)
      } else {
        console.log(`✅ Sent welcome message to connection ${connectionId} (${preferredLanguage})`)
      }

      res.status(200).json({ success: true, language: preferredLanguage })
    } catch (error) {
      console.error('❌ Error sending welcome message:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  /**
   * GET /welcome - Get welcome message (can be used by frontend)
   */
  getWelcome(req: Request, res: Response): void {
    const lang = req.query.lang as string | undefined
    const validLangs = ['en', 'es', 'fr']
    const language = validLangs.includes(lang || '') ? (lang as 'en' | 'es' | 'fr') : 'en'

    const response: WelcomeResponseDto = {
      message: this.agent.getWelcomeMessage(language),
      language,
      supportedLanguages: this.agent.getSupportedLanguages(),
    }

    res.json(response)
  }
}
