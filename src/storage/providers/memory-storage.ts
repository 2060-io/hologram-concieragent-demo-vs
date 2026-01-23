/**
 * Memory Storage Provider
 * In-memory storage for development and local testing.
 * Replicates the original TravelAgent behavior.
 */

import type { StorageProvider, StorageProviderConfig, ConversationContext } from '../types'

export class MemoryStorageProvider implements StorageProvider {
  readonly name = 'memory' as const

  private contexts: Map<string, ConversationContext> = new Map()
  private readonly contextExpirationMs: number
  private readonly maxHistoryMessages: number
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(config?: StorageProviderConfig) {
    // Default: 1 hour expiration for memory storage (matches original behavior)
    this.contextExpirationMs = (config?.sessionExpirationDays ?? 1 / 24) * 24 * 60 * 60 * 1000
    this.maxHistoryMessages = config?.maxHistoryMessages ?? 20
  }

  async initialize(): Promise<void> {
    console.log('💾 Memory storage initialized')

    // Start cleanup interval (every 5 minutes) - clear any existing interval first
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredSessions().catch(console.error)
      },
      5 * 60 * 1000,
    )
  }

  async getOrCreateContext(connectionId: string): Promise<ConversationContext> {
    const existing = this.contexts.get(connectionId)
    const now = Date.now()

    // Return existing context if valid
    if (existing && now - existing.lastUpdated < this.contextExpirationMs) {
      return existing
    }

    // Create new context
    const newContext: ConversationContext = {
      messages: [],
      extractedInfo: {},
      lastUpdated: now,
    }
    this.contexts.set(connectionId, newContext)
    return newContext
  }

  async saveContext(connectionId: string, context: ConversationContext): Promise<void> {
    // Prune old messages if needed
    if (context.messages.length > this.maxHistoryMessages * 2) {
      context.messages = context.messages.slice(-this.maxHistoryMessages)
    }

    context.lastUpdated = Date.now()
    this.contexts.set(connectionId, context)
  }

  async clearContext(connectionId: string): Promise<void> {
    this.contexts.delete(connectionId)
    console.log(`🧹 Cleared context for connection ${connectionId}`)
  }

  async cleanupExpiredSessions(): Promise<number> {
    const now = Date.now()
    let cleaned = 0

    for (const [connectionId, context] of this.contexts) {
      if (now - context.lastUpdated > this.contextExpirationMs) {
        this.contexts.delete(connectionId)
        cleaned++
        console.log(`🧹 Expired context removed for ${connectionId}`)
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired sessions`)
    }

    return cleaned
  }

  isConfigured(): boolean {
    return true // Memory storage is always available
  }

  async close(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.contexts.clear()
    console.log('💾 Memory storage closed')
  }
}
