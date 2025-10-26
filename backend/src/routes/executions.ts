import express from 'express';
import { z } from 'zod';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { WorkflowExecutor } from '../services/workflowExecutor';

const router = express.Router();

const executeWorkflowSchema = z.object({
  body: z.object({
    triggerData: z.any().optional(),
  }),
});

// Execute a workflow
router.post(
  '/workflows/:id/execute',
  authenticateToken,
  validate(executeWorkflowSchema),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { triggerData } = req.body;

    // Get workflow
    const workflowResult = await pool.query(
      'SELECT id, json FROM workflows WHERE id = $1 AND user_id = $2',
      [id, req.user!.id]
    );

    if (workflowResult.rows.length === 0) {
      throw new AppError('Workflow not found', 404);
    }

    const workflow = workflowResult.rows[0];
    const executor = new WorkflowExecutor(
      workflow.id,
      req.user!.id,
      workflow.json
    );

    const result = await executor.execute(triggerData || {});

    res.json(result);
  }
);

// Get all runs for a workflow
router.get(
  '/workflows/:id/runs',
  authenticateToken,
  async (req: AuthRequest, res) => {
    const { id } = req.params;

    // Verify workflow ownership
    const workflowResult = await pool.query(
      'SELECT id FROM workflows WHERE id = $1 AND user_id = $2',
      [id, req.user!.id]
    );

    if (workflowResult.rows.length === 0) {
      throw new AppError('Workflow not found', 404);
    }

    const runsResult = await pool.query(
      `SELECT id, workflow_id, status, trigger_data, result, error, started_at, finished_at, created_at
       FROM workflow_runs
       WHERE workflow_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [id]
    );

    res.json({ runs: runsResult.rows });
  }
);

// Get specific run details with steps
router.get('/runs/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;

  // Get run
  const runResult = await pool.query(
    `SELECT wr.*, w.user_id
     FROM workflow_runs wr
     JOIN workflows w ON w.id = wr.workflow_id
     WHERE wr.id = $1`,
    [id]
  );

  if (runResult.rows.length === 0) {
    throw new AppError('Run not found', 404);
  }

  const run = runResult.rows[0];

  // Check ownership
  if (run.user_id !== req.user!.id) {
    throw new AppError('Unauthorized', 403);
  }

  // Get steps
  const stepsResult = await pool.query(
    `SELECT id, node_id, type, status, input, output, error, logs, started_at, finished_at
     FROM run_steps
     WHERE run_id = $1
     ORDER BY started_at ASC`,
    [id]
  );

  // Get tool executions
  const toolsResult = await pool.query(
    `SELECT id, step_id, tool, params, response, status, error, created_at, finished_at
     FROM tool_executions
     WHERE run_id = $1
     ORDER BY created_at ASC`,
    [id]
  );

  res.json({
    run: {
      id: run.id,
      workflow_id: run.workflow_id,
      status: run.status,
      trigger_data: run.trigger_data,
      result: run.result,
      error: run.error,
      started_at: run.started_at,
      finished_at: run.finished_at,
      created_at: run.created_at,
    },
    steps: stepsResult.rows,
    toolExecutions: toolsResult.rows,
  });
});

// Get run logs (for polling/streaming)
router.get('/runs/:id/logs', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;

  // Verify access
  const runResult = await pool.query(
    `SELECT wr.id, w.user_id
     FROM workflow_runs wr
     JOIN workflows w ON w.id = wr.workflow_id
     WHERE wr.id = $1`,
    [id]
  );

  if (runResult.rows.length === 0) {
    throw new AppError('Run not found', 404);
  }

  if (runResult.rows[0].user_id !== req.user!.id) {
    throw new AppError('Unauthorized', 403);
  }

  // Get latest logs
  const logsResult = await pool.query(
    `SELECT node_id, type, status, logs, started_at, finished_at
     FROM run_steps
     WHERE run_id = $1
     ORDER BY started_at ASC`,
    [id]
  );

  res.json({ logs: logsResult.rows });
});

export default router;
