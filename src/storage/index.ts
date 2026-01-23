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

  console.log(`💾 Creating storage provider: ${providerType}`)

  switch (providerType) {
    case 'postgres':
      return new PostgresStorageProvider(config)

    case 'memory':
    default:
      return new MemoryStorageProvider(config)
  }
}

/**
 * Check which storage providers are available based on configuration
 */
export function getAvailableStorageProviders(): { type: StorageProviderType; configured: boolean }[] {
  return [
    {
      type: 'memory',
      configured: true, // Always available
    },
    {
      type: 'postgres',
      configured: !!(process.env.POSTGRES_HOST && process.env.POSTGRES_DATABASE && process.env.POSTGRES_USER),
    },
  ]
}
