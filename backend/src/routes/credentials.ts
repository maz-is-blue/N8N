import express from 'express';
import { z } from 'zod';
import pool from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';
import { encryptJSON, decryptJSON } from '../utils/encryption';

const router = express.Router();

const createCredentialSchema = z.object({
  body: z.object({
    provider: z.string().min(1),
    name: z.string().min(1),
    tokens: z.any(),
    scopes: z.string().optional(),
    expires_at: z.string().optional(),
  }),
});

// Get all credentials for user (without tokens)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  const result = await pool.query(
    `SELECT id, provider, name, scopes, expires_at, created_at, updated_at
     FROM credentials
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [req.user!.id]
  );

  res.json({ credentials: result.rows });
});

// Get specific credential (without tokens)
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `SELECT id, provider, name, scopes, expires_at, created_at, updated_at
     FROM credentials
     WHERE id = $1 AND user_id = $2`,
    [id, req.user!.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Credential not found', 404);
  }

  res.json({ credential: result.rows[0] });
});

// Create credential
router.post(
  '/',
  authenticateToken,
  validate(createCredentialSchema),
  async (req: AuthRequest, res) => {
    const { provider, name, tokens, scopes, expires_at } = req.body;

    // Encrypt tokens
    const encryptedTokens = encryptJSON(tokens);

    const result = await pool.query(
      `INSERT INTO credentials (user_id, provider, name, tokens, scopes, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, provider, name)
       DO UPDATE SET tokens = $4, scopes = $5, expires_at = $6
       RETURNING id, provider, name, scopes, expires_at, created_at, updated_at`,
      [req.user!.id, provider, name, encryptedTokens, scopes, expires_at]
    );

    res.status(201).json({ credential: result.rows[0] });
  }
);

// Update credential
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { tokens, scopes, expires_at } = req.body;

  // Check ownership
  const checkResult = await pool.query(
    'SELECT id FROM credentials WHERE id = $1 AND user_id = $2',
    [id, req.user!.id]
  );

  if (checkResult.rows.length === 0) {
    throw new AppError('Credential not found', 404);
  }

  const updates: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  if (tokens !== undefined) {
    updates.push(`tokens = $${paramCount++}`);
    values.push(encryptJSON(tokens));
  }
  if (scopes !== undefined) {
    updates.push(`scopes = $${paramCount++}`);
    values.push(scopes);
  }
  if (expires_at !== undefined) {
    updates.push(`expires_at = $${paramCount++}`);
    values.push(expires_at);
  }

  if (updates.length === 0) {
    throw new AppError('No fields to update', 400);
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE credentials SET ${updates.join(', ')}
     WHERE id = $${paramCount}
     RETURNING id, provider, name, scopes, expires_at, created_at, updated_at`,
    values
  );

  res.json({ credential: result.rows[0] });
});

// Delete credential
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'DELETE FROM credentials WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.user!.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Credential not found', 404);
  }

  res.json({ message: 'Credential deleted successfully' });
});

export default router;
