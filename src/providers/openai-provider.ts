/**
 * OpenAI Provider
 * Adapter for OpenAI's GPT models
 */

import { OpenAI } from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions";
import type { 
  LLMProvider, 
  LLMProviderConfig, 
  LLMMessage, 
  LLMTool, 
  LLMResponse,
  LLMToolCall 
} from "./types";

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai' as const;
  readonly model: string;
  private client: OpenAI;

  constructor(config?: LLMProviderConfig) {
    const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ OpenAI API key not configured');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: config?.baseUrl,
    });

    this.model = config?.model || process.env.OPENAI_MODEL || 'gpt-4o';
  }

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async chat(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMResponse> {
    // Convert to OpenAI format
    const openaiMessages = this.convertMessages(messages);
    const openaiTools = tools ? this.convertTools(tools) : undefined;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: openaiMessages,
      tools: openaiTools,
    });

    const choice = response.choices[0];
    const message = choice.message;

    // Convert tool calls back to our format
    const toolCalls: LLMToolCall[] = [];
    if (message.tool_calls) {
      for (const tc of message.tool_calls) {
        // Type guard: check if this is a function tool call (not custom)
        if ('function' in tc && tc.function) {
          toolCalls.push({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments),
          });
        }
      }
    }

    return {
      content: message.content,
      toolCalls,
      finishReason: choice.finish_reason === 'tool_calls' ? 'tool_calls' : 
                    choice.finish_reason === 'length' ? 'length' : 'stop',
    };
  }

  private convertMessages(messages: LLMMessage[]): ChatCompletionMessageParam[] {
    return messages.map(msg => {
      if (msg.role === 'tool') {
        return {
          role: 'tool' as const,
          content: msg.content,
          tool_call_id: msg.toolCallId!,
        };
      }
      
      if (msg.role === 'assistant' && msg.toolCalls && msg.toolCalls.length > 0) {
        return {
          role: 'assistant' as const,
          content: msg.content,
          tool_calls: msg.toolCalls.map(tc => ({
            id: tc.id,
            type: 'function' as const,
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments),
            },
          })),
        };
      }

      return {
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      };
    });
  }

  private convertTools(tools: LLMTool[]): ChatCompletionTool[] {
    return tools.map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }
}

