import express from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import pool from '../config/database';
import { generateToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

// Register
router.post('/register', validate(registerSchema), async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('User already exists', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const result = await pool.query(
    'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
    [email, hashedPassword, 'user']
  );

  const user = result.rows[0];

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

// Login
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const result = await pool.query(
    'SELECT id, email, password_hash, role FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new AppError('Invalid credentials', 401);
  }

  const user = result.rows[0];

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

export default router;

