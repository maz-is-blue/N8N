import express from 'express';
import { z } from 'zod';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    json: z.any(), // Workflow JSON structure
  }),
});

const updateWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    json: z.any().optional(),
    is_active: z.boolean().optional(),
  }),
});

// Get all workflows for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  const result = await pool.query(
    'SELECT id, name, description, json, version, is_active, created_at, updated_at FROM workflows WHERE user_id = $1 ORDER BY updated_at DESC',
    [req.user!.id]
  );

  res.json({ workflows: result.rows });
});

// Get single workflow
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT id, name, description, json, version, is_active, created_at, updated_at FROM workflows WHERE id = $1 AND user_id = $2',
    [id, req.user!.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Workflow not found', 404);
  }

  res.json({ workflow: result.rows[0] });
});

// Create workflow
router.post('/', authenticateToken, validate(createWorkflowSchema), async (req: AuthRequest, res) => {
  const { name, description, json } = req.body;

  const result = await pool.query(
    `INSERT INTO workflows (user_id, name, description, json, version)
     VALUES ($1, $2, $3, $4, 1)
     RETURNING id, name, description, json, version, is_active, created_at, updated_at`,
    [req.user!.id, name, description || null, JSON.stringify(json)]
  );

  res.status(201).json({ workflow: result.rows[0] });
});

// Update workflow
router.put('/:id', authenticateToken, validate(updateWorkflowSchema), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name, description, json, is_active } = req.body;

  // Check ownership
  const checkResult = await pool.query(
    'SELECT id FROM workflows WHERE id = $1 AND user_id = $2',
    [id, req.user!.id]
  );

  if (checkResult.rows.length === 0) {
    throw new AppError('Workflow not found', 404);
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramCount++}`);
    values.push(name);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramCount++}`);
    values.push(description);
  }
  if (json !== undefined) {
    updates.push(`json = $${paramCount++}`);
    values.push(JSON.stringify(json));
    updates.push(`version = version + 1`);
  }
  if (is_active !== undefined) {
    updates.push(`is_active = $${paramCount++}`);
    values.push(is_active);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE workflows SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, name, description, json, version, is_active, created_at, updated_at`,
    values
  );

  res.json({ workflow: result.rows[0] });
});

// Delete workflow
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'DELETE FROM workflows WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.user!.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Workflow not found', 404);
  }

  res.json({ message: 'Workflow deleted successfully' });
});

export default router;

