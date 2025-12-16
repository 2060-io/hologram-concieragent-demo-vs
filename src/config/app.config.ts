/**
 * Application configuration
 * Centralized configuration for the Concieragent application
 */

export interface AppConfig {
  /** Port number on which the application will run */
  port: number;
  
  /** VS Agent Admin API URL */
  vsAgentUrl: string;
  
  /** LLM Provider type */
  llmProvider: 'openai' | 'claude' | 'ollama';
  
  /** OpenAI configuration */
  openai?: {
    apiKey: string;
    model?: string;
  };
  
  /** Claude configuration */
  claude?: {
    apiKey: string;
    model?: string;
  };
  
  /** Ollama configuration */
  ollama?: {
    baseUrl?: string;
    model?: string;
  };
  
  /** MCP Server API Keys */
  mcp?: {
    serpapiKey?: string;
    openweatherApiKey?: string;
  };
}

/**
 * Get application configuration from environment variables
 */
export function getAppConfig(): AppConfig {
  return {
    port: parseInt(process.env.PORT || '4001', 10),
    vsAgentUrl: process.env.VS_AGENT_URL || 'http://localhost:3000',
    llmProvider: (process.env.LLM_PROVIDER as 'openai' | 'claude' | 'ollama') || 'openai',
    openai: process.env.OPENAI_API_KEY
      ? {
          apiKey: process.env.OPENAI_API_KEY,
          model: process.env.OPENAI_MODEL || 'gpt-4o',
        }
      : undefined,
    claude: process.env.ANTHROPIC_API_KEY
      ? {
          apiKey: process.env.ANTHROPIC_API_KEY,
          model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
        }
      : undefined,
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama3.1',
    },
    mcp: {
      serpapiKey: process.env.SERPAPI_KEY,
      openweatherApiKey: process.env.OPENWEATHER_API_KEY,
    },
  };
}
