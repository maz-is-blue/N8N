import { EmailTool } from '../mcp/tools/email';
import { WhatsAppTool } from '../mcp/tools/whatsapp';
import { N8nTool } from '../mcp/tools/n8n';
import { MCPToolContext } from '../mcp/types';

describe('MCP Tools', () => {
  const mockContext: MCPToolContext = {
    userId: 1,
    runId: 1,
    nodeId: 'test-node',
  };

  describe('EmailTool', () => {
    const emailTool = new EmailTool();

    it('should validate email parameters', () => {
      const validParams = {
        to: 'test@example.com',
        subject: 'Test',
        body: 'Test body',
      };
      const validation = emailTool.validateParams(validParams);
      expect(validation.valid).toBe(true);
    });

    it('should fail validation without required params', () => {
      const invalidParams = {
        to: 'test@example.com',
      };
      const validation = emailTool.validateParams(invalidParams);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toBeDefined();
    });
  });

  describe('WhatsAppTool', () => {
    const whatsappTool = new WhatsAppTool();

    it('should validate WhatsApp parameters', () => {
      const validParams = {
        to: '+1234567890',
        message: 'Test message',
      };
      const validation = whatsappTool.validateParams(validParams);
      expect(validation.valid).toBe(true);
    });

    it('should execute in mock mode when credentials not configured', async () => {
      const params = {
        to: '+1234567890',
        message: 'Test message',
      };
      const result = await whatsappTool.execute(params, mockContext);
      expect(result.success).toBe(true);
      expect(result.data?.mock).toBe(true);
    });
  });

  describe('N8nTool', () => {
    const n8nTool = new N8nTool();

    it('should validate n8n parameters', () => {
      const validParams = {
        workflowId: 'test-workflow',
      };
      const validation = n8nTool.validateParams(validParams);
      expect(validation.valid).toBe(true);
    });

    it('should execute in mock mode when API key not configured', async () => {
      const params = {
        workflowId: 'test-workflow',
        payload: { test: 'data' },
      };
      const result = await n8nTool.execute(params, mockContext);
      expect(result.success).toBe(true);
      expect(result.data?.mock).toBe(true);
    });
  });
});
