/**
 * LLM Provider Types
 * Abstract interface for multiple LLM backends (OpenAI, Claude, Ollama)
 */

// Tool definition that works across providers
export interface LLMTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

// Tool call request from the LLM
export interface LLMToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

// Message roles
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

// Message format that works across providers
export interface LLMMessage {
  role: MessageRole;
  content: string;
  toolCallId?: string;  // For tool response messages
  toolCalls?: LLMToolCall[];  // For assistant messages with tool calls
}

// Response from LLM
export interface LLMResponse {
  content: string | null;
  toolCalls: LLMToolCall[];
  finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
}

// Provider configuration
export interface LLMProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// Supported providers
export type LLMProviderType = 'openai' | 'claude' | 'ollama';

// Provider interface - all providers must implement this
export interface LLMProvider {
  readonly name: LLMProviderType;
  readonly model: string;
  
  /**
   * Send a chat completion request
   */
  chat(
    messages: LLMMessage[],
    tools?: LLMTool[]
  ): Promise<LLMResponse>;
  
  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean;
}

// Factory function type
export type LLMProviderFactory = (config?: LLMProviderConfig) => LLMProvider;

