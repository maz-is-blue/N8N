import nodemailer from 'nodemailer';
import { MCPTool, MCPToolContext, MCPToolResult } from '../types';

export class EmailTool implements MCPTool {
  name = 'email.send';
  description = 'Send email using SMTP';

  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  validateParams(params: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!params.to) {
      errors.push('Missing required parameter: to');
    }
    if (!params.subject) {
      errors.push('Missing required parameter: subject');
    }
    if (!params.body && !params.html) {
      errors.push('Missing required parameter: body or html');
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

      logs.push(`Sending email to ${params.to}`);

      // Support CSV attachment from data
      const attachments = [];
      if (params.attachCSVFrom && params[params.attachCSVFrom]) {
        const csvData = this.convertToCSV(params[params.attachCSVFrom]);
        attachments.push({
          filename: 'data.csv',
          content: csvData,
        });
        logs.push('Attached CSV file');
      }

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: Array.isArray(params.to) ? params.to.join(',') : params.to,
        subject: params.subject,
        text: params.body,
        html: params.html,
        attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logs.push(`Email sent successfully: ${info.messageId}`);

      return {
        success: true,
        data: {
          messageId: info.messageId,
          accepted: info.accepted,
          rejected: info.rejected,
        },
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

  private convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || '')).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }
}

