/* eslint-disable import/no-commonjs */
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

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
  const todo = await prisma.todo.findUnique({ where: { id: Number(id) } });
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

// Example: Create a todo
app.post('/todos', async (req, res) => {
  const { title, completed = false, userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const todo = await prisma.todo.create({ data: { title, completed, userId } });
  res.status(201).json(todo);
});

app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const todo = await prisma.todo.update({
    where: { id: Number(id) },
    data: { title, completed }
  });
  res.json(todo);
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.todo.delete({ where: { id: Number(id) } });
  res.status(204).send();
});

async function createUser(prisma, email, password) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('User already exists');
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({ data: { email, password: hashed } });
}

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  console.log('[SIGNUP] Request:', { email, password }); // Log incoming signup request
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await createUser(prisma, email, password);
    console.log('[SIGNUP] Success:', user); // Log created user
    res.status(201).json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('[SIGNUP] Error:', err.message); // Log error
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
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Signin failed' });
  }
});

// Dashboard endpoint (use userId from query param)
app.get('/dashboard', async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const activeTodos = await prisma.todo.count({ where: { userId, completed: false } });
    const reminders = await prisma.reminder.count({ where: { userId } });
    res.json({ activeTodos, reminders });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

// Create a new reminder
app.post('/reminders', async (req, res) => {
  const { message, dueDate, userId } = req.body;
  console.log('[REMINDER] Request:', { message, dueDate, userId });
  if (!message || !dueDate || !userId) return res.status(400).json({ error: 'message, dueDate, and userId required' });
  try {
    const reminder = await prisma.reminder.create({
      data: { message, dueDate: new Date(dueDate), userId }
    });
    res.status(201).json(reminder);
  } catch (err) {
    console.error('[REMINDER] Error:', err.message);
    res.status(500).json({ error: 'Failed to add reminder' });
  }
});

// Get all reminders for a user
app.get('/reminders', async (req, res) => {
  const userId = Number(req.query.userId);
  if (!userId) return res.status(400).json({ error: 'userId required' });
  try {
    const reminders = await prisma.reminder.findMany({ where: { userId } });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});