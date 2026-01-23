/**
 * PostgreSQL Storage Provider
 * Persistent storage with TypeORM and optional Redis caching.
 */

import 'reflect-metadata'
import { DataSource, Repository, LessThan } from 'typeorm'
import { createClient, RedisClientType } from 'redis'
import type { StorageProvider, StorageProviderConfig, ConversationContext } from '../types'
import { SessionEntity, MessageEntity } from '../entities'
import type { LLMMessage } from '../../providers/types'

export class PostgresStorageProvider implements StorageProvider {
  readonly name = 'postgres' as const

  private dataSource: DataSource | null = null
  private sessionRepository: Repository<SessionEntity> | null = null
  private messageRepository: Repository<MessageEntity> | null = null
  private redis: RedisClientType | null = null

  private readonly config: Required<
    Pick<
      StorageProviderConfig,
      'postgresHost' | 'postgresPort' | 'postgresDatabase' | 'postgresUser' | 'postgresPassword'
    >
  > &
    Pick<StorageProviderConfig, 'redisHost' | 'redisPort' | 'redisPassword'> & {
      sessionExpirationDays: number
      maxHistoryMessages: number
    }

  private cleanupInterval: NodeJS.Timeout | null = null
  private consecutiveCleanupFailures = 0
  private readonly MAX_CLEANUP_FAILURES = 3
  private readonly CACHE_TTL_SECONDS = 300 // 5 minutes cache

  /**
   * Ensure repositories are initialized before use
   * @throws Error if not initialized
   */
  private ensureInitialized(): { sessions: Repository<SessionEntity>; messages: Repository<MessageEntity> } {
    if (!this.sessionRepository || !this.messageRepository) {
      throw new Error('PostgresStorageProvider not initialized. Call initialize() first.')
    }
    return { sessions: this.sessionRepository, messages: this.messageRepository }
  }

  constructor(config?: StorageProviderConfig) {
    this.config = {
      postgresHost: config?.postgresHost ?? process.env.POSTGRES_HOST ?? 'localhost',
      postgresPort: config?.postgresPort ?? parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
      postgresDatabase: config?.postgresDatabase ?? process.env.POSTGRES_DATABASE ?? 'concieragent',
      postgresUser: config?.postgresUser ?? process.env.POSTGRES_USER ?? 'concieragent',
      postgresPassword: config?.postgresPassword ?? process.env.POSTGRES_PASSWORD ?? '',
      redisHost: config?.redisHost ?? process.env.REDIS_HOST,
      redisPort: config?.redisPort ?? parseInt(process.env.REDIS_PORT ?? '6379', 10),
      redisPassword: config?.redisPassword ?? process.env.REDIS_PASSWORD,
      sessionExpirationDays:
        config?.sessionExpirationDays ?? parseInt(process.env.SESSION_EXPIRATION_DAYS ?? '7', 10),
      maxHistoryMessages: config?.maxHistoryMessages ?? 20,
    }
  }

  async initialize(): Promise<void> {
    console.log('🗄️ Initializing PostgreSQL storage...')

    // Initialize TypeORM DataSource
    this.dataSource = new DataSource({
      type: 'postgres',
      host: this.config.postgresHost,
      port: this.config.postgresPort,
      database: this.config.postgresDatabase,
      username: this.config.postgresUser,
      password: this.config.postgresPassword,
      entities: [SessionEntity, MessageEntity],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables in dev only
      logging: process.env.NODE_ENV === 'development',
    })

    await this.dataSource.initialize()
    console.log(
      `✅ PostgreSQL connected to ${this.config.postgresHost}:${this.config.postgresPort}/${this.config.postgresDatabase}`,
    )

    this.sessionRepository = this.dataSource.getRepository(SessionEntity)
    this.messageRepository = this.dataSource.getRepository(MessageEntity)

    // Initialize Redis if configured
    if (this.config.redisHost) {
      await this.initializeRedis()
    }

    // Start cleanup interval (every hour) - clear any existing interval first
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cleanupInterval = setInterval(
      async () => {
        try {
          await this.cleanupExpiredSessions()
          this.consecutiveCleanupFailures = 0
        } catch (error) {
          this.consecutiveCleanupFailures++
          console.error(
            `❌ Cleanup failed (attempt ${this.consecutiveCleanupFailures}/${this.MAX_CLEANUP_FAILURES}):`,
            error,
          )
          if (this.consecutiveCleanupFailures >= this.MAX_CLEANUP_FAILURES) {
            console.error(
              '💀 CRITICAL: Session cleanup has failed repeatedly. Manual intervention may be required.',
            )
          }
        }
      },
      60 * 60 * 1000,
    )

    console.log('🗄️ PostgreSQL storage initialized')
  }

  private async initializeRedis(): Promise<void> {
    try {
      const redisUrl = this.config.redisPassword
        ? `redis://:${this.config.redisPassword}@${this.config.redisHost}:${this.config.redisPort}`
        : `redis://${this.config.redisHost}:${this.config.redisPort}`

      this.redis = createClient({ url: redisUrl })

      this.redis.on('error', err => {
        console.error('❌ Redis error, disabling cache:', err)
        this.redis = null
      })

      await this.redis.connect()
      console.log(`✅ Redis connected to ${this.config.redisHost}:${this.config.redisPort}`)
    } catch (error) {
      console.warn('⚠️ Redis connection failed, continuing without cache:', error)
      this.redis = null
    }
  }

  async getOrCreateContext(connectionId: string): Promise<ConversationContext> {
    const { sessions } = this.ensureInitialized()

    // Try cache first
    const cached = await this.getCachedContext(connectionId)
    if (cached) {
      return cached
    }

    // Load from database
    const session = await sessions.findOne({
      where: { connectionId },
      relations: ['messages'],
      order: { messages: { sequenceNumber: 'ASC' } },
    })

    if (session && session.expiresAt > new Date()) {
      // Renew session expiration on read (touch the session)
      session.expiresAt = new Date(Date.now() + this.config.sessionExpirationDays * 24 * 60 * 60 * 1000)
      await sessions.save(session)

      const context = this.sessionToContext(session)
      await this.cacheContext(connectionId, context)
      return context
    }

    // Delete expired session if it exists (to avoid unique constraint violation)
    if (session) {
      await sessions.delete({ id: session.id })
    }

    // Create new session
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.config.sessionExpirationDays * 24 * 60 * 60 * 1000)

    const newSession = sessions.create({
      connectionId,
      extractedInfo: {},
      expiresAt,
    })

    await sessions.save(newSession)

    const context: ConversationContext = {
      messages: [],
      extractedInfo: {},
      lastUpdated: now.getTime(),
    }

    await this.cacheContext(connectionId, context)
    return context
  }

  async saveContext(connectionId: string, context: ConversationContext): Promise<void> {
    this.ensureInitialized()

    if (!this.dataSource) {
      throw new Error('DataSource not initialized')
    }

    // Use a transaction to ensure atomicity and prevent race conditions
    await this.dataSource.transaction(async manager => {
      const sessions = manager.getRepository(SessionEntity)
      const messages = manager.getRepository(MessageEntity)

      const session = await sessions.findOne({
        where: { connectionId },
      })

      if (!session) {
        throw new Error(
          `Session not found for connection ${connectionId}. Context save failed - potential data loss.`,
        )
      }

      // Update session metadata
      session.extractedInfo = context.extractedInfo
      session.expiresAt = new Date(Date.now() + this.config.sessionExpirationDays * 24 * 60 * 60 * 1000)
      await sessions.save(session)

      // Get the highest sequence number in DB for this session (with row lock to prevent race conditions)
      const maxSeqResult = await messages
        .createQueryBuilder('msg')
        .select('MAX(msg.sequenceNumber)', 'maxSeq')
        .where('msg.sessionId = :sessionId', { sessionId: session.id })
        .setLock('pessimistic_write')
        .getRawOne<{ maxSeq: number | null }>()

      const existingMaxSeq = maxSeqResult?.maxSeq ?? -1
      const existingCount = existingMaxSeq + 1

      // Only save new messages (those beyond existing count)
      const newMessages = context.messages.slice(existingCount)

      if (newMessages.length > 0) {
        const messageEntities: MessageEntity[] = newMessages.map((msg, index) => {
          const entity = new MessageEntity()
          entity.role = msg.role
          entity.content = msg.content ?? ''
          entity.toolCallId = msg.toolCallId
          entity.toolCalls = msg.toolCalls
          entity.sequenceNumber = existingCount + index
          entity.sessionId = session.id
          return entity
        })

        await messages.save(messageEntities)
      }

      // Prune old messages if exceeding limit (2x threshold triggers pruning to 1x)
      const totalMessages = existingCount + newMessages.length
      if (totalMessages > this.config.maxHistoryMessages * 2) {
        const deleteCount = totalMessages - this.config.maxHistoryMessages
        // Find oldest messages to delete
        const messagesToDelete = await messages.find({
          where: { sessionId: session.id },
          order: { sequenceNumber: 'ASC' },
          take: deleteCount,
          select: ['id'],
        })

        if (messagesToDelete.length > 0) {
          const idsToDelete = messagesToDelete.map(m => m.id)
          await messages.delete(idsToDelete)
        }
      }
    })

    // Update cache only after successful transaction
    context.lastUpdated = Date.now()
    await this.cacheContext(connectionId, context)
  }

  async clearContext(connectionId: string): Promise<void> {
    const { sessions } = this.ensureInitialized()
    await sessions.delete({ connectionId })
    await this.invalidateCache(connectionId)
    console.log(`🧹 Cleared context for connection ${connectionId}`)
  }

  async cleanupExpiredSessions(): Promise<number> {
    const { sessions } = this.ensureInitialized()
    const result = await sessions.delete({
      expiresAt: LessThan(new Date()),
    })

    const deleted = result.affected ?? 0
    if (deleted > 0) {
      console.log(`🧹 Cleaned up ${deleted} expired sessions`)
    }

    return deleted
  }

  isConfigured(): boolean {
    return !!(this.config.postgresHost && this.config.postgresDatabase && this.config.postgresUser)
  }

  async close(): Promise<void> {
    const errors: Error[] = []

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    if (this.redis) {
      try {
        await this.redis.quit()
      } catch (error) {
        errors.push(new Error(`Redis close failed: ${error}`))
      }
      this.redis = null
    }

    if (this.dataSource) {
      try {
        await this.dataSource.destroy()
      } catch (error) {
        errors.push(new Error(`PostgreSQL close failed: ${error}`))
      }
      this.dataSource = null
    }

    // Reset repositories
    this.sessionRepository = null
    this.messageRepository = null

    if (errors.length > 0) {
      console.error(
        '⚠️ Errors during storage shutdown:',
        errors.map(e => e.message),
      )
    }

    console.log('🗄️ PostgreSQL storage closed')
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private helper methods
  // ─────────────────────────────────────────────────────────────────────────────

  private sessionToContext(session: SessionEntity): ConversationContext {
    const messages: LLMMessage[] = (session.messages ?? []).map(msg => ({
      role: msg.role,
      content: msg.content,
      toolCallId: msg.toolCallId,
      toolCalls: msg.toolCalls,
    }))

    return {
      messages,
      extractedInfo: session.extractedInfo,
      lastUpdated: session.lastUpdated.getTime(),
    }
  }

  private cacheKey(connectionId: string): string {
    return `concieragent:context:${connectionId}`
  }

  private async getCachedContext(connectionId: string): Promise<ConversationContext | null> {
    if (!this.redis) return null

    try {
      const cached = await this.redis.get(this.cacheKey(connectionId))
      if (cached) {
        const parsed: unknown = JSON.parse(cached)
        // Validate the parsed data has the expected structure
        if (this.isValidConversationContext(parsed)) {
          return parsed
        }
        // Invalid cache data, invalidate it
        console.warn('⚠️ Invalid cache data structure, invalidating')
        await this.invalidateCache(connectionId)
      }
    } catch (error) {
      console.warn('⚠️ Redis cache read failed:', error)
    }

    return null
  }

  /**
   * Type guard to validate ConversationContext structure from cache
   */
  private isValidConversationContext(data: unknown): data is ConversationContext {
    if (!data || typeof data !== 'object') return false
    const obj = data as Record<string, unknown>
    return (
      Array.isArray(obj.messages) &&
      typeof obj.extractedInfo === 'object' &&
      obj.extractedInfo !== null &&
      typeof obj.lastUpdated === 'number'
    )
  }

  private async cacheContext(connectionId: string, context: ConversationContext): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.setEx(this.cacheKey(connectionId), this.CACHE_TTL_SECONDS, JSON.stringify(context))
    } catch (error) {
      console.warn('⚠️ Redis cache write failed:', error)
    }
  }

  private async invalidateCache(connectionId: string): Promise<void> {
    if (!this.redis) return

    try {
      await this.redis.del(this.cacheKey(connectionId))
    } catch (error) {
      console.warn('⚠️ Redis cache invalidation failed:', error)
    }
  }
}
