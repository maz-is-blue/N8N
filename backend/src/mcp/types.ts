export interface MCPToolContext {
  userId: number;
  runId: number;
  nodeId: string;
  credentials?: any;
}

export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  logs?: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  execute(params: any, context: MCPToolContext): Promise<MCPToolResult>;
  validateParams(params: any): { valid: boolean; errors?: string[] };
}

export interface ToolExecution {
  tool: string;
  params: any;
  context: MCPToolContext;
}

