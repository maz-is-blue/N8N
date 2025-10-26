import { MCPTool } from './types';
import { EmailTool } from './tools/email';
import { GoogleSheetsTool } from './tools/googleSheets';
import { WhatsAppTool } from './tools/whatsapp';
import { N8nTool } from './tools/n8n';

class MCPRegistry {
  private tools: Map<string, MCPTool> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  private registerDefaultTools() {
    this.register(new EmailTool());
    this.register(new GoogleSheetsTool());
    this.register(new WhatsAppTool());
    this.register(new N8nTool());
  }

  register(tool: MCPTool) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  listTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  getToolByType(type: string): MCPTool | undefined {
    // Map node types to tool names
    const typeMapping: Record<string, string> = {
      'action.email.send': 'email.send',
      'action.google_sheets.read': 'google_sheets.read',
      'action.google_sheets.append_row': 'google_sheets.append',
      'action.whatsapp.send': 'whatsapp.send',
      'external.n8n': 'n8n.trigger',
    };

    const toolName = typeMapping[type];
    return toolName ? this.getTool(toolName) : undefined;
  }
}

export const mcpRegistry = new MCPRegistry();

