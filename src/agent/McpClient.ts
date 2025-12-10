import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResult, ListToolsResult } from "@modelcontextprotocol/sdk/types.js";
import path from "path";

export class McpClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor(serverPath: string, env?: Record<string, string>) {
    // Sanitize process.env to ensure all values are strings (remove undefined)
    const sanitizedProcessEnv: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        sanitizedProcessEnv[key] = value;
      }
    }

    const transport = new StdioClientTransport({
      command: "uv",
      args: ["run", "python", path.basename(serverPath)],
      env: { ...sanitizedProcessEnv, ...env },
      cwd: path.dirname(serverPath)
    });

    this.transport = transport;
    this.client = new Client(
      { name: "concieragent", version: "1.0.0" },
      { capabilities: {} }
    );
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async listTools(): Promise<ListToolsResult> {
    return await this.client.listTools();
  }

  async callTool(name: string, args: any): Promise<CallToolResult> {
    return await this.client.callTool({
      name,
      arguments: args
    }) as CallToolResult;
  }

  async close() {
    await this.client.close();
  }
}
