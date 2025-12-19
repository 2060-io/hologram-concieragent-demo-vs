/**
 * Ollama Provider
 * Adapter for local Ollama models
 *
 * Ollama supports tool calling for some models (llama3.1, mistral, etc.)
 * API: http://localhost:11434/api/chat
 */

import type { LLMProvider, LLMProviderConfig, LLMMessage, LLMTool, LLMResponse, LLMToolCall } from './types'

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: OllamaToolCall[]
}

interface OllamaToolCall {
  function: {
    name: string
    arguments: Record<string, any>
  }
}

interface OllamaTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, any>
  }
}

interface OllamaResponse {
  model: string
  message: {
    role: string
    content: string
    tool_calls?: OllamaToolCall[]
  }
  done: boolean
  done_reason?: string
}

export class OllamaProvider implements LLMProvider {
  readonly name = 'ollama' as const
  readonly model: string
  private baseUrl: string

  constructor(config?: LLMProviderConfig) {
    this.baseUrl = config?.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    this.model = config?.model || process.env.OLLAMA_MODEL || 'llama3.1'

    console.log(`🦙 Ollama provider initialized: ${this.model} @ ${this.baseUrl}`)
  }

  isConfigured(): boolean {
    // Ollama doesn't need an API key, just check if it's reachable
    return true
  }

  async chat(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMResponse> {
    const ollamaMessages = this.convertMessages(messages)
    const ollamaTools = tools ? this.convertTools(tools) : undefined

    const requestBody: any = {
      model: this.model,
      messages: ollamaMessages,
      stream: false,
    }

    // Only add tools if provided and model supports them
    if (ollamaTools && ollamaTools.length > 0) {
      requestBody.tools = ollamaTools
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
      }

      const data = (await response.json()) as OllamaResponse

      // Parse tool calls if present
      const toolCalls: LLMToolCall[] = []
      if (data.message.tool_calls) {
        for (let i = 0; i < data.message.tool_calls.length; i++) {
          const tc = data.message.tool_calls[i]
          toolCalls.push({
            id: `ollama_tc_${Date.now()}_${i}`, // Ollama doesn't provide IDs
            name: tc.function.name,
            arguments: tc.function.arguments,
          })
        }
      }

      return {
        content: data.message.content || null,
        toolCalls,
        finishReason: toolCalls.length > 0 ? 'tool_calls' : 'stop',
      }
    } catch (error: any) {
      // Check if Ollama is not running
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Ollama is not running at ${this.baseUrl}. Please start Ollama with 'ollama serve'`)
      }
      throw error
    }
  }

  private convertMessages(messages: LLMMessage[]): OllamaMessage[] {
    return messages.map(msg => {
      const ollamaMsg: OllamaMessage = {
        role: msg.role,
        content: msg.content,
      }

      // Add tool calls for assistant messages
      if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        ollamaMsg.tool_calls = msg.toolCalls.map(tc => ({
          function: {
            name: tc.name,
            arguments: tc.arguments,
          },
        }))
      }

      return ollamaMsg
    })
  }

  private convertTools(tools: LLMTool[]): OllamaTool[] {
    return tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }))
  }
}
