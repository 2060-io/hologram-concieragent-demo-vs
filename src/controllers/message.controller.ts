import { Request, Response } from 'express'
import { TravelAgent } from '../agent/TravelAgent'
import { MessageReceivedDto } from '../dto'
import { getAppConfig } from '../config'

/**
 * Message controller for handling incoming messages
 */
export class MessageController {
  constructor(private agent: TravelAgent) {}

  /**
   * POST /message-received - Webhook endpoint for VS Agent
   */
  async handleMessageReceived(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as MessageReceivedDto
      const message = body.message
      const connectionId = message.connectionId
      const content = message.content

      console.log(`📨 Message received from connection ${connectionId}: ${content}`)

      // Use TravelAgent to generate response
      const agentResponse = await this.agent.processMessage(content, connectionId)

      // Send response back to the user via VS Agent Admin API
      const responseMessage = {
        type: 'text',
        connectionId: connectionId,
        content: agentResponse,
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
        console.error(`❌ Failed to send message: ${response.statusText}`)
      } else {
        console.log(`✅ Sent response to connection ${connectionId}`)
      }

      res.status(200).end()
    } catch (error) {
      console.error('❌ Error processing message:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}
