/**
 * LLM Providers
 * Factory and exports for multi-provider support
 */

export * from './types'
export { OpenAIProvider } from './openai-provider'
export { ClaudeProvider } from './claude-provider'
export { OllamaProvider } from './ollama-provider'

import type { LLMProvider, LLMProviderType, LLMProviderConfig } from './types'
import { OpenAIProvider } from './openai-provider'
import { ClaudeProvider } from './claude-provider'
import { OllamaProvider } from './ollama-provider'

/**
 * Create an LLM provider based on type
 */
export function createProvider(type?: LLMProviderType, config?: LLMProviderConfig): LLMProvider {
  // Determine provider type from env or parameter
  const providerType = type || (process.env.LLM_PROVIDER as LLMProviderType) || 'openai'

  console.log(`🤖 Creating LLM provider: ${providerType}`)

  switch (providerType) {
    case 'openai':
      return new OpenAIProvider(config)

    case 'claude':
      return new ClaudeProvider(config)

    case 'ollama':
      return new OllamaProvider(config)

    default:
      console.warn(`⚠️ Unknown provider type: ${providerType}, falling back to OpenAI`)
      return new OpenAIProvider(config)
  }
}

/**
 * Get the configured provider from environment variables
 */
export function getConfiguredProvider(): LLMProvider {
  return createProvider()
}

/**
 * Check which providers are available based on configuration
 */
export function getAvailableProviders(): { type: LLMProviderType; configured: boolean }[] {
  return [
    {
      type: 'openai',
      configured: !!process.env.OPENAI_API_KEY,
    },
    {
      type: 'claude',
      configured: !!process.env.ANTHROPIC_API_KEY,
    },
    {
      type: 'ollama',
      configured: true, // Ollama doesn't need API key
    },
  ]
}
