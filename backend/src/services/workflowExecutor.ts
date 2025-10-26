import pool from '../config/database';
import { mcpRegistry } from '../mcp/registry';
import { MCPToolContext } from '../mcp/types';

interface WorkflowNode {
  id: string;
  type: string;
  props: any;
  position?: { x: number; y: number };
}

interface WorkflowEdge {
  id?: string;
  source?: string;
  target?: string;
  from?: string;
  to?: string;
  when?: string;
}

interface WorkflowJSON {
  id?: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  version?: number;
}

export class WorkflowExecutor {
  private runId: number;
  private workflowId: number;
  private userId: number;
  private workflow: WorkflowJSON;
  private context: Map<string, any> = new Map();

  constructor(workflowId: number, userId: number, workflow: WorkflowJSON) {
    this.workflowId = workflowId;
    this.userId = userId;
    this.workflow = workflow;
    this.runId = 0;
  }

  async execute(triggerData: any = {}): Promise<{ runId: number; status: string; result: any }> {
    // Create workflow run
    const runResult = await pool.query(
      `INSERT INTO workflow_runs (workflow_id, status, trigger_data, started_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id`,
      [this.workflowId, 'running', JSON.stringify(triggerData)]
    );

    this.runId = runResult.rows[0].id;
    this.context.set('trigger', triggerData);

    try {
      // Find trigger node
      const triggerNode = this.workflow.nodes.find(
        (n) => n.type.startsWith('trigger.')
      );

      if (!triggerNode) {
        throw new Error('No trigger node found in workflow');
      }

      // Execute workflow starting from trigger
      const result = await this.executeNode(triggerNode, triggerData);

      // Update run as completed
      await pool.query(
        `UPDATE workflow_runs 
         SET status = $1, finished_at = NOW(), result = $2
         WHERE id = $3`,
        ['completed', JSON.stringify(result), this.runId]
      );

      return {
        runId: this.runId,
        status: 'completed',
        result,
      };
    } catch (error: any) {
      // Update run as failed
      await pool.query(
        `UPDATE workflow_runs 
         SET status = $1, finished_at = NOW(), error = $2
         WHERE id = $3`,
        ['failed', error.message, this.runId]
      );

      throw error;
    }
  }

  private async executeNode(node: WorkflowNode, input: any): Promise<any> {
    // Create step log
    const stepResult = await pool.query(
      `INSERT INTO run_steps (run_id, node_id, type, status, input, started_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id`,
      [this.runId, node.id, node.type, 'running', JSON.stringify(input)]
    );

    const stepId = stepResult.rows[0].id;

    try {
      let output: any;

      // Handle different node types
      if (node.type.startsWith('trigger.')) {
        output = await this.executeTrigger(node, input, stepId);
      } else if (node.type.startsWith('action.')) {
        output = await this.executeAction(node, input, stepId);
      } else if (node.type === 'condition') {
        output = await this.executeCondition(node, input, stepId);
      } else if (node.type === 'transform') {
        output = await this.executeTransform(node, input, stepId);
      } else if (node.type.startsWith('external.')) {
        output = await this.executeExternal(node, input, stepId);
      } else {
        throw new Error(`Unknown node type: ${node.type}`);
      }

      // Update step as completed
      await pool.query(
        `UPDATE run_steps 
         SET status = $1, output = $2, finished_at = NOW()
         WHERE id = $3`,
        ['completed', JSON.stringify(output), stepId]
      );

      // Store output in context
      this.context.set(node.id, output);

      // Execute next nodes
      const nextNodes = this.getNextNodes(node, output);
      for (const nextNode of nextNodes) {
        await this.executeNode(nextNode, output);
      }

      return output;
    } catch (error: any) {
      // Update step as failed
      await pool.query(
        `UPDATE run_steps 
         SET status = $1, error = $2, finished_at = NOW()
         WHERE id = $3`,
        ['failed', error.message, stepId]
      );

      throw error;
    }
  }

  private async executeTrigger(node: WorkflowNode, input: any, stepId: number): Promise<any> {
    await this.addStepLog(stepId, `Trigger activated: ${node.type}`);
    return input;
  }

  private async executeAction(node: WorkflowNode, input: any, stepId: number): Promise<any> {
    await this.addStepLog(stepId, `Executing action: ${node.type}`);

    // Get the appropriate MCP tool
    const tool = mcpRegistry.getToolByType(node.type);

    if (!tool) {
      throw new Error(`No tool found for action type: ${node.type}`);
    }

    // Prepare context
    const toolContext: MCPToolContext = {
      userId: this.userId,
      runId: this.runId,
      nodeId: node.id,
    };

    // Interpolate parameters with context data
    const params = this.interpolateParams(node.props, input);

    // Execute tool
    const result = await tool.execute(params, toolContext);

    // Log tool execution
    await pool.query(
      `INSERT INTO tool_executions (run_id, step_id, tool, params, response, status, created_at, finished_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        this.runId,
        stepId,
        tool.name,
        JSON.stringify(params),
        JSON.stringify(result.data),
        result.success ? 'completed' : 'failed',
      ]
    );

    // Add tool logs to step
    if (result.logs) {
      for (const log of result.logs) {
        await this.addStepLog(stepId, log);
      }
    }

    if (!result.success) {
      throw new Error(result.error || 'Tool execution failed');
    }

    return result.data;
  }

  private async executeCondition(node: WorkflowNode, input: any, stepId: number): Promise<any> {
    await this.addStepLog(stepId, `Evaluating condition: ${node.props.expr}`);

    const expr = node.props.expr;
    const result = this.evaluateExpression(expr, input);

    await this.addStepLog(stepId, `Condition result: ${result}`);

    return { conditionResult: result, data: input };
  }

  private async executeTransform(node: WorkflowNode, input: any, stepId: number): Promise<any> {
    await this.addStepLog(stepId, 'Applying transformations');

    let data = input;

    if (node.props.steps) {
      for (const step of node.props.steps) {
        data = this.applyTransformStep(step, data);
        await this.addStepLog(stepId, `Applied transformation: ${step.op}`);
      }
    }

    return data;
  }

  private async executeExternal(node: WorkflowNode, input: any, stepId: number): Promise<any> {
    await this.addStepLog(stepId, `Executing external service: ${node.type}`);

    // Use n8n tool for external nodes
    const tool = mcpRegistry.getTool('n8n.trigger');

    if (!tool) {
      throw new Error('n8n tool not available');
    }

    const toolContext: MCPToolContext = {
      userId: this.userId,
      runId: this.runId,
      nodeId: node.id,
    };

    const params = {
      workflowId: node.props.workflowId,
      payload: input,
      secretRef: node.props.secretRef,
    };

    const result = await tool.execute(params, toolContext);

    if (result.logs) {
      for (const log of result.logs) {
        await this.addStepLog(stepId, log);
      }
    }

    if (!result.success) {
      throw new Error(result.error || 'External execution failed');
    }

    return result.data;
  }

  private getNextNodes(currentNode: WorkflowNode, output: any): WorkflowNode[] {
    const nextNodes: WorkflowNode[] = [];

    for (const edge of this.workflow.edges) {
      const source = edge.source || edge.from;
      const target = edge.target || edge.to;

      if (source === currentNode.id) {
        // Check if edge has a condition
        if (edge.when) {
          const conditionMet = output.conditionResult === (edge.when === 'true');
          if (!conditionMet) continue;
        }

        const nextNode = this.workflow.nodes.find((n) => n.id === target);
        if (nextNode) {
          nextNodes.push(nextNode);
        }
      }
    }

    return nextNodes;
  }

  private interpolateParams(params: any, context: any): any {
    if (typeof params === 'string') {
      return params.replace(/\{\{(.+?)\}\}/g, (match, key) => {
        const value = this.getContextValue(key.trim(), context);
        return value !== undefined ? value : match;
      });
    }

    if (Array.isArray(params)) {
      return params.map((item) => this.interpolateParams(item, context));
    }

    if (typeof params === 'object' && params !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(params)) {
        result[key] = this.interpolateParams(value, context);
      }
      return result;
    }

    return params;
  }

  private getContextValue(path: string, data: any): any {
    const parts = path.split('.');
    let value = data;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private evaluateExpression(expr: string, data: any): boolean {
    // Simple expression evaluator - in production use a safe parser
    try {
      const fn = new Function('$', `return ${expr}`);
      return fn(data);
    } catch (error) {
      console.error('Expression evaluation error:', error);
      return false;
    }
  }

  private applyTransformStep(step: any, data: any): any {
    switch (step.op) {
      case 'trim':
        return this.trimFields(data, step.fields);
      case 'titleCase':
        return this.titleCaseFields(data, step.fields);
      case 'normalizePhone':
        return this.normalizePhone(data, step.field, step.country);
      case 'dropInvalid':
        return this.dropInvalid(data, step.rules);
      default:
        return data;
    }
  }

  private trimFields(data: any, fields: string[]): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.trimFields(item, fields));
    }

    const result = { ...data };
    for (const field of fields) {
      if (typeof result[field] === 'string') {
        result[field] = result[field].trim();
      }
    }
    return result;
  }

  private titleCaseFields(data: any, fields: string[]): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.titleCaseFields(item, fields));
    }

    const result = { ...data };
    for (const field of fields) {
      if (typeof result[field] === 'string') {
        result[field] = result[field]
          .toLowerCase()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    return result;
  }

  private normalizePhone(data: any, field: string, country: string): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalizePhone(item, field, country));
    }

    const result = { ...data };
    if (result[field]) {
      // Simple phone normalization (in production use libphonenumber)
      result[field] = result[field].replace(/\D/g, '');
      if (country === 'MY' && !result[field].startsWith('60')) {
        result[field] = '60' + result[field];
      }
    }
    return result;
  }

  private dropInvalid(data: any, rules: string[]): any {
    if (!Array.isArray(data)) return data;

    return data.filter((item) => {
      for (const rule of rules) {
        const [field, ...checks] = rule.split(':');
        if (checks.includes('required') && !item[field]) return false;
        if (checks.includes('email') && !this.isValidEmail(item[field])) return false;
      }
      return true;
    });
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private async addStepLog(stepId: number, message: string): Promise<void> {
    await pool.query(
      `UPDATE run_steps 
       SET logs = logs || $1::jsonb
       WHERE id = $2`,
      [JSON.stringify([{ timestamp: new Date().toISOString(), message }]), stepId]
    );
  }
}

