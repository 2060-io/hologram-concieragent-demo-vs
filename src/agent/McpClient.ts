import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { CallToolResult, ListToolsResult } from "@modelcontextprotocol/sdk/types.js";
import path from "path";
import { execSync } from "child_process";

/**
 * Check if a command is available in the system PATH
 */
function isCommandAvailable(command: string): boolean {
  try {
    if (process.platform === "win32") {
      execSync(`where ${command}`, { stdio: "ignore", timeout: 2000 });
    } else {
      execSync(`which ${command}`, { stdio: "ignore", timeout: 2000 });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Determine the best command to run Python scripts
 * Prefers 'uv run python' but falls back to 'python' or 'python3'
 */
function getPythonCommand(): { command: string; args: string[] } {
  // Check if uv is available
  if (isCommandAvailable("uv")) {
    return { command: "uv", args: ["run", "python"] };
  }

  // Fallback to python3 or python
  if (isCommandAvailable("python3")) {
    return { command: "python3", args: [] };
  }

  if (isCommandAvailable("python")) {
    return { command: "python", args: [] };
  }

  // Last resort: try python anyway (might work with full path)
  return { command: "python", args: [] };
}

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

    // Get the appropriate Python command
    const pythonCmd = getPythonCommand();
    const serverFileName = path.basename(serverPath);

    console.log(
      `🔧 Using command: ${pythonCmd.command} ${pythonCmd.args.join(" ")} ${serverFileName}`
    );

    const transport = new StdioClientTransport({
      command: pythonCmd.command,
      args: [...pythonCmd.args, serverFileName],
      env: { ...sanitizedProcessEnv, ...env },
      cwd: path.dirname(serverPath),
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
