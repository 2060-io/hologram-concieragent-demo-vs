/**
 * Claude Provider
 * Adapter for Anthropic's Claude models
 */

import Anthropic from '@anthropic-ai/sdk'
import type { LLMProvider, LLMProviderConfig, LLMMessage, LLMTool, LLMResponse, LLMToolCall } from './types'

export class ClaudeProvider implements LLMProvider {
  readonly name = 'claude' as const
  readonly model: string
  private client: Anthropic

  constructor(config?: LLMProviderConfig) {
    const apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      console.warn('⚠️ Anthropic API key not configured')
    }

    this.client = new Anthropic({
      apiKey: apiKey,
      baseURL: config?.baseUrl,
    })

    this.model = config?.model || process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514'
  }

  isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY
  }

  async chat(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMResponse> {
    // Extract system message (Claude handles it separately)
    const systemMessage = messages.find(m => m.role === 'system')
    const nonSystemMessages = messages.filter(m => m.role !== 'system')

    // Convert to Claude format
    const claudeMessages = this.convertMessages(nonSystemMessages)
    const claudeTools = tools ? this.convertTools(tools) : undefined

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemMessage?.content || '',
      messages: claudeMessages,
      tools: claudeTools,
    })

    // Parse response
    const toolCalls: LLMToolCall[] = []
    let textContent = ''

    for (const block of response.content) {
      if (block.type === 'text') {
        textContent += block.text
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input as Record<string, any>,
        })
      }
    }

    return {
      content: textContent || null,
      toolCalls,
      finishReason:
        response.stop_reason === 'tool_use'
          ? 'tool_calls'
          : response.stop_reason === 'max_tokens'
            ? 'length'
            : 'stop',
    }
  }

  private convertMessages(messages: LLMMessage[]): Anthropic.MessageParam[] {
    const result: Anthropic.MessageParam[] = []

    for (const msg of messages) {
      if (msg.role === 'user') {
        result.push({
          role: 'user',
          content: msg.content,
        })
      } else if (msg.role === 'assistant') {
        if (msg.toolCalls && msg.toolCalls.length > 0) {
          // Assistant message with tool calls
          const content: Anthropic.ContentBlockParam[] = []

          if (msg.content) {
            content.push({ type: 'text', text: msg.content })
          }

          for (const tc of msg.toolCalls) {
            content.push({
              type: 'tool_use',
              id: tc.id,
              name: tc.name,
              input: tc.arguments,
            })
          }

          result.push({ role: 'assistant', content })
        } else {
          result.push({
            role: 'assistant',
            content: msg.content,
          })
        }
      } else if (msg.role === 'tool') {
        // Tool results in Claude are user messages with tool_result content
        result.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: msg.toolCallId!,
              content: msg.content,
            },
          ],
        })
      }
    }

    return result
  }

  private convertTools(tools: LLMTool[]): Anthropic.Tool[] {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object' as const,
        ...tool.parameters,
      },
    }))
  }
}
