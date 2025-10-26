import axios from 'axios';
import { MCPTool, MCPToolContext, MCPToolResult } from '../types';

export class WhatsAppTool implements MCPTool {
  name = 'whatsapp.send';
  description = 'Send WhatsApp message via Twilio, Meta Cloud API, or TextMe Bot';

  private provider: string;

  constructor() {
    this.provider = process.env.WHATSAPP_PROVIDER || 'twilio';
  }

  validateParams(params: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!params.to && !params.toField) {
      errors.push('Missing required parameter: to or toField');
    }
    if (!params.message && !params.messageTemplate) {
      errors.push('Missing required parameter: message or messageTemplate');
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

      if (this.provider === 'twilio') {
        return await this.sendViaTwilio(params, logs);
      } else if (this.provider === 'meta') {
        return await this.sendViaMeta(params, logs);
      } else if (this.provider === 'textme') {
        return await this.sendViaTextMe(params, logs);
      } else {
        // Mock mode for testing
        return this.mockSend(params, logs);
      }
    } catch (error: any) {
      logs.push(`Error: ${error.message}`);
      return {
        success: false,
        error: error.message,
        logs,
      };
    }
  }

  private async sendViaTwilio(params: any, logs: string[]): Promise<MCPToolResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken || !from) {
      logs.push('Twilio credentials not configured - using mock mode');
      return this.mockSend(params, logs);
    }

    const to = params.to || params.toField;
    const message = params.message || params.messageTemplate;

    logs.push(`Sending WhatsApp via Twilio to ${to}`);

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: from,
        To: `whatsapp:${to}`,
        Body: message,
      }),
      {
        auth: {
          username: accountSid,
          password: authToken,
        },
      }
    );

    logs.push(`Message sent successfully: ${response.data.sid}`);

    return {
      success: true,
      data: {
        messageId: response.data.sid,
        status: response.data.status,
      },
      logs,
    };
  }

  private async sendViaMeta(params: any, logs: string[]): Promise<MCPToolResult> {
    const token = process.env.META_WHATSAPP_TOKEN;
    const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      logs.push('Meta WhatsApp credentials not configured - using mock mode');
      return this.mockSend(params, logs);
    }

    const to = params.to || params.toField;
    const message = params.message || params.messageTemplate;

    logs.push(`Sending WhatsApp via Meta Cloud API to ${to}`);

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''), // Remove non-digits
        type: 'text',
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    logs.push(`Message sent successfully: ${response.data.messages[0].id}`);

    return {
      success: true,
      data: {
        messageId: response.data.messages[0].id,
      },
      logs,
    };
  }

  private async sendViaTextMe(params: any, logs: string[]): Promise<MCPToolResult> {
    const apiKey = process.env.TEXTME_API_KEY;

    if (!apiKey) {
      logs.push('TextMe Bot API key not configured - using mock mode');
      return this.mockSend(params, logs);
    }

    const to = params.to || params.toField;
    const message = params.message || params.messageTemplate;

    logs.push(`Sending WhatsApp via TextMe Bot to ${to}`);

    // TextMe Bot API uses GET request with query parameters
    const response = await axios.get('https://api.textmebot.com/send.php', {
      params: {
        recipient: to.replace(/\D/g, ''), // Remove non-digits
        apikey: apiKey,
        text: message,
      },
    });

    logs.push(`Message sent successfully via TextMe Bot`);

    return {
      success: true,
      data: {
        messageId: `textme_${Date.now()}`,
        status: 'sent',
        response: response.data,
      },
      logs,
    };
  }

  private mockSend(params: any, logs: string[]): MCPToolResult {
    const to = params.to || params.toField;
    const message = params.message || params.messageTemplate;

    logs.push('[MOCK MODE] Would send WhatsApp message');
    logs.push(`To: ${to}`);
    logs.push(`Message: ${message}`);

    return {
      success: true,
      data: {
        messageId: `mock_${Date.now()}`,
        status: 'sent',
        mock: true,
      },
      logs,
    };
  }
}

