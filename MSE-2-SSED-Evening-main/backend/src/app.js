import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';
import { redis } from './redis.js';
import { config } from './config.js';
import { requireAuth } from './auth.js';

const app = express();
app.use(cors());
app.use(express.json());

const cacheKey = userId => `tasks:user:${userId}`;

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();
    res.json({ status: 'ok', postgres: 'ok', redis: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'unavailable', error: error.message });
  }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Name, valid email and password (minimum 6 characters) are required' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name.trim(), email.toLowerCase().trim(), passwordHash]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [(email || '').toLowerCase().trim()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});

app.get('/api/tasks', requireAuth, async (req, res, next) => {
  try {
    const key = cacheKey(req.user.id);
    const cached = await redis.get(key);
    if (cached) return res.json({ tasks: JSON.parse(cached), source: 'redis-cache' });

    const result = await pool.query(
      'SELECT id, title, description, status, created_at, updated_at FROM tasks WHERE user_id = $1 ORDER BY id DESC',
      [req.user.id]
    );
    await redis.set(key, JSON.stringify(result.rows), { EX: 30 });
    res.json({ tasks: result.rows, source: 'postgres' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/tasks', requireAuth, async (req, res, next) => {
  try {
    const { title, description = '' } = req.body || {};
    if (!title || !title.trim()) return res.status(400).json({ error: 'Task title is required' });
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, title.trim(), description]
    );
    await redis.del(cacheKey(req.user.id));
    res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.patch('/api/tasks/:id', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['title', 'description', 'status'];
    const updates = Object.entries(req.body || {}).filter(([key, value]) => allowed.includes(key) && value !== undefined);
    if (!updates.length) return res.status(400).json({ error: 'No valid fields supplied' });
    if (updates.some(([key, value]) => key === 'status' && !['Pending', 'In Progress', 'Completed'].includes(value))) {
      return res.status(400).json({ error: 'Invalid task status' });
    }
    const setClause = updates.map(([key], index) => `${key} = $${index + 1}`).join(', ');
    const values = updates.map(([, value]) => value);
    values.push(req.params.id, req.user.id);
    const result = await pool.query(
      `UPDATE tasks SET ${setClause}, updated_at = NOW() WHERE id = $${values.length - 1} AND user_id = $${values.length} RETURNING *`,
      values
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Task not found' });
    await redis.del(cacheKey(req.user.id));
    res.json({ task: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/tasks/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.user.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Task not found' });
    await redis.del(cacheKey(req.user.id));
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
