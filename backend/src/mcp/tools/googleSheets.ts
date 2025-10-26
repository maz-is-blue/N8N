import { google } from 'googleapis';
import { MCPTool, MCPToolContext, MCPToolResult } from '../types';
import { decryptJSON } from '../../utils/encryption';
import pool from '../../config/database';

export class GoogleSheetsTool implements MCPTool {
  name = 'google_sheets.read';
  description = 'Read data from Google Sheets';

  validateParams(params: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!params.sheet && !params.spreadsheetId) {
      errors.push('Missing required parameter: sheet or spreadsheetId');
    }
    if (!params.credentialRef) {
      errors.push('Missing required parameter: credentialRef');
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

      // Get credentials from database
      const credResult = await pool.query(
        'SELECT tokens FROM credentials WHERE user_id = $1 AND name = $2',
        [context.userId, params.credentialRef]
      );

      if (credResult.rows.length === 0) {
        return {
          success: false,
          error: `Credential not found: ${params.credentialRef}`,
          logs,
        };
      }

      const credentials = decryptJSON(credResult.rows[0].tokens);
      logs.push('Retrieved credentials');

      // Initialize Google Sheets API
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      // Parse sheet reference (e.g., "Sheet1!A1:F" or just spreadsheet ID)
      const range = params.sheet || params.range || 'Sheet1!A1:Z1000';
      const spreadsheetId = params.spreadsheetId || this.extractSpreadsheetId(range);

      logs.push(`Reading from ${spreadsheetId} range ${range}`);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values || [];
      logs.push(`Read ${rows.length} rows`);

      // Convert to objects if headers are present
      let data: any[] = rows;
      if (rows.length > 0 && params.hasHeaders !== false) {
        const headers = rows[0] as string[];
        data = rows.slice(1).map((row: any[]) => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
      }

      // Apply filter if specified
      if (params.filter) {
        const originalCount = data.length;
        data = this.applyFilter(data, params.filter);
        logs.push(`Filtered ${originalCount} rows to ${data.length} rows`);
      }

      return {
        success: true,
        data: {
          rows: data,
          count: data.length,
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

  private extractSpreadsheetId(ref: string): string {
    // Simple extraction - in production, this would be more robust
    if (ref.includes('/')) {
      const match = ref.match(/\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : ref;
    }
    return ref;
  }

  private applyFilter(data: any[], filter: string): any[] {
    // Simple filter implementation (supports basic comparisons)
    // Example: "status == 'pending'"
    try {
      return data.filter((row) => {
        // Very simple eval-like filter - in production use a safe expression parser
        const filterFn = new Function('row', `return ${filter.replace(/\{\{(\w+)\}\}/g, 'row.$1')}`);
        return filterFn(row);
      });
    } catch (error) {
      console.error('Filter error:', error);
      return data;
    }
  }
}

