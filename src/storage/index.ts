import logger from '../utils/logger'
/**
 * Storage Providers
 * Factory and exports for multi-storage support
 */

export * from './types'
export { MemoryStorageProvider } from './providers/memory-storage'
export { PostgresStorageProvider } from './providers/postgres-storage'

import type { StorageProvider, StorageProviderType, StorageProviderConfig } from './types'
import { MemoryStorageProvider } from './providers/memory-storage'
import { PostgresStorageProvider } from './providers/postgres-storage'

/**
 * Create a storage provider based on type
 */
export function createStorageProvider(
  type?: StorageProviderType,
  config?: StorageProviderConfig,
): StorageProvider {
  // Determine provider type from env or parameter
  const providerType = type || (process.env.STORAGE_PROVIDER as StorageProviderType) || 'memory'

  logger.info(`💾 Creating storage provider: ${providerType}`)

  switch (providerType) {
    case 'postgres':
      return new PostgresStorageProvider(config)

    case 'memory':
    default:
      return new MemoryStorageProvider(config)
  }
}
