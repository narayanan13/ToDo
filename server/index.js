/* eslint-disable import/no-commonjs */
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Example: Get all todos
app.get('/todos', async (req, res) => {
  const todos = await prisma.todo.findMany();
  res.json(todos);
});

app.get('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('todos').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// Example: Create a todo
app.post('/todos', async (req, res) => {
  const { title, completed = false } = req.body;
  const todo = await prisma.todo.create({ data: { title, completed } });
  res.status(201).json(todo);
});

app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const { data, error } = await supabase
    .from('todos')
    .update({ title, completed })
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('todos').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

async function createUser(prisma, email, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('User already exists');
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email, password: hashed } });
}

function generateToken(user, secret) {
  return jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '7d' });
}

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await createUser(prisma, email, password);
    const token = generateToken(user, JWT_SECRET);
    res.status(201).json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(err.message === 'User already exists' ? 409 : 500).json({ error: err.message || 'Signup failed' });
  }
});

// Signin endpoint
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Signin failed' });
  }
});

// Dashboard endpoint
app.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const activeTodos = await prisma.todo.count({ where: { userId, completed: false } });
    const reminders = await prisma.reminder.count({ where: { userId } });
    res.json({ activeTodos, reminders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 