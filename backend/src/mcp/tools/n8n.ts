import axios from 'axios';
import { MCPTool, MCPToolContext, MCPToolResult } from '../types';

export class N8nTool implements MCPTool {
  name = 'n8n.trigger';
  description = 'Trigger n8n workflow via HTTP API';

  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.apiKey = process.env.N8N_API_KEY || '';
  }

  validateParams(params: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!params.workflowId && !params.webhookUrl) {
      errors.push('Missing required parameter: workflowId or webhookUrl');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  async execute(params: any, context: MCPToolContext): Promise<MCPToolResult> {
    const logs: string[] = [];

    try {
      const validation = this.validateParams(params);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors?.join(', '),
          logs,
        };
      }

      // Option 1: Trigger via workflow ID (using n8n API)
      if (params.workflowId) {
        return await this.triggerViaAPI(params, logs);
      }

      // Option 2: Trigger via webhook URL
      if (params.webhookUrl) {
        return await this.triggerViaWebhook(params, logs);
      }

      return {
        success: false,
        error: 'No valid trigger method specified',
        logs,
      };
    } catch (error: any) {
      logs.push(`Error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        logs,
      };
    }
  }

  private async triggerViaAPI(params: any, logs: string[]): Promise<MCPToolResult> {
    if (!this.apiKey) {
      logs.push('n8n API key not configured - using mock mode');
      return this.mockTrigger(params, logs);
    }

    logs.push(`Triggering n8n workflow: ${params.workflowId}`);

    const url = `${this.baseUrl}/api/v1/workflows/${params.workflowId}/execute`;

    const response = await axios.post(
      url,
      {
        data: params.payload || {},
      },
      {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    logs.push(`n8n workflow triggered: ${response.data.executionId}`);

    return {
      success: true,
      data: {
        executionId: response.data.executionId,
        status: response.data.status,
        result: response.data.data,
      },
      logs,
    };
  }

  private async triggerViaWebhook(params: any, logs: string[]): Promise<MCPToolResult> {
    logs.push(`Triggering n8n webhook: ${params.webhookUrl}`);

    const response = await axios.post(params.webhookUrl, params.payload || {}, {
      headers: {
        'Content-Type': 'application/json',
        ...(params.secretRef && {
          'X-N8N-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET,
        }),
      },
    });

    logs.push('n8n webhook triggered successfully');

    return {
      success: true,
      data: response.data,
      logs,
    };
  }

  private mockTrigger(params: any, logs: string[]): MCPToolResult {
    logs.push('[MOCK MODE] Would trigger n8n workflow');
    logs.push(`Workflow ID: ${params.workflowId}`);
    logs.push(`Payload: ${JSON.stringify(params.payload || {})}`);

    return {
      success: true,
      data: {
        executionId: `mock_exec_${Date.now()}`,
        status: 'success',
        mock: true,
      },
      logs,
    };
  }
}

