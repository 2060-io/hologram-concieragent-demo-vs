/**
 * Storage Provider Types
 * Abstract interface for multiple storage backends (Memory, PostgreSQL)
 */

import type { LLMMessage } from '../providers/types'

// Supported languages (matches TravelAgent)
export type SupportedLanguage = 'en' | 'es' | 'fr'

// Information extracted from the conversation
export interface ExtractedUserInfo {
  name?: string
  currentLocation?: string
  destinations?: string[]
  travelDates?: { start?: string; end?: string }
  budget?: { amount?: number; currency?: string }
  preferences?: string[]
  partySize?: number
  interests?: string[]
  recentSearches?: string[]
  language?: SupportedLanguage
}

// Conversation context (used by TravelAgent)
export interface ConversationContext {
  messages: LLMMessage[]
  extractedInfo: ExtractedUserInfo
  lastUpdated: number
}

// Storage provider configuration
export interface StorageProviderConfig {
  // PostgreSQL configuration
  postgresHost?: string
  postgresPort?: number
  postgresDatabase?: string
  postgresUser?: string
  postgresPassword?: string

  // Redis configuration
  redisHost?: string
  redisPort?: number
  redisPassword?: string

  // Session configuration
  sessionExpirationDays?: number
  maxHistoryMessages?: number
}

// Supported storage providers
export type StorageProviderType = 'memory' | 'postgres'

// Storage provider interface - all providers must implement this
export interface StorageProvider {
  readonly name: StorageProviderType

  /**
   * Initialize the storage provider (connect to database, etc.)
   */
  initialize(): Promise<void>

  /**
   * Get or create a conversation context for a connection
   */
  getOrCreateContext(connectionId: string): Promise<ConversationContext>

  /**
   * Save a conversation context
   */
  saveContext(connectionId: string, context: ConversationContext): Promise<void>

  /**
   * Clear a conversation context
   */
  clearContext(connectionId: string): Promise<void>

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): Promise<number>

  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean

  /**
   * Graceful shutdown
   */
  close(): Promise<void>
}
