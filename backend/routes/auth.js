import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { appendFileSync } from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');
const JWT_SECRET = process.env.JWT_SECRET || 'campus-marketplace-secret-key';

let inMemoryUsers = [];
let inMemoryResets = [];

// Helper to read/write users
const getUsers = async () => {
  const filePath = path.join(dataDir, 'users.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    inMemoryUsers = parsed || [];
    return inMemoryUsers;
  } catch (err) {
    return inMemoryUsers || [];
  }
};

const saveUsers = async (users) => {
  inMemoryUsers = users;
  const filePath = path.join(dataDir, 'users.json');
  try {
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));
  } catch (err) {}
};

// Helpers for password reset tokens
const getResets = async () => {
  const filePath = path.join(dataDir, 'password_resets.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    inMemoryResets = JSON.parse(data || '[]');
    return inMemoryResets;
  } catch (err) {
    return inMemoryResets || [];
  }
};

const saveResets = async (resets) => {
  inMemoryResets = resets;
  const filePath = path.join(dataDir, 'password_resets.json');
  try {
    await fs.writeFile(filePath, JSON.stringify(resets, null, 2));
  } catch (err) {}
};

// Log password reset emails (for development) to backend/logs/password_reset_emails.log
const logResetEmail = (email, resetLink) => {
  try {
    const logFile = path.join(__dirname, '..', 'logs', 'password_reset_emails.log');
    const entry = JSON.stringify({ email, resetLink, timestamp: new Date().toISOString() }) + '\n';
    appendFileSync(logFile, entry);
  } catch (e) {
    console.error('Failed to write password reset email log', e.message);
  }
};

// Verify student email (ends with .edu)
const isStudentEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const normalizedEmail = email.toLowerCase().trim();
  return normalizedEmail.endsWith('gmail.com') || normalizedEmail.includes('@student.') || normalizedEmail.endsWith('.edu');
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isStudentEmail(email)) {
      return res.status(400).json({ error: 'Please use a valid student email (.edu domain)' });
    }

    const users = await getUsers();
    const normalizedEmail = email.toLowerCase().trim();

    if (users.find(u => u.email.toLowerCase() === normalizedEmail)) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      studentId: studentId ? studentId.trim() : null,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const users = await getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed. Please try again.' });
  }
});

// Login by name + PRN (studentId)
router.post('/login-prn', async (req, res) => {
  try {
    const { name, prn } = req.body;

    if (!name || !prn) {
      return res.status(400).json({ error: 'Name and PRN are required' });
    }

    const users = await getUsers();
    const normalizedName = name.toString().trim().toLowerCase();
    const user = users.find(u => (u.name || '').toString().trim().toLowerCase() === normalizedName && ((u.studentId || u.prn || '').toString() === prn.toString()));

    if (!user) {
      return res.status(401).json({ error: 'Invalid name or PRN' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login-PRN error:', error);
    res.status(500).json({ error: error.message || 'Login failed. Please try again.' });
  }
});

// Request password reset: provide { email }
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const users = await getUsers();
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find(u => (u.email || '').toLowerCase() === normalizedEmail);
    if (!user) {
      // Do not reveal whether email exists — respond success
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    // create token
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    const resets = await getResets();
    resets.push({ token, userId: user.id, email: user.email, expiresAt });
    await saveResets(resets);

    // Build reset link — adjust host/origin in production
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const resetLink = `${origin}/reset-password/${token}`;

    // Log the email send (for dev) and return success
    logResetEmail(user.email, resetLink);

    return res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Request password reset error:', error);
    return res.status(500).json({ error: 'Failed to request password reset' });
  }
});

// Reset password: provide { token, password }
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });

    const resets = await getResets();
    const idx = resets.findIndex(r => r.token === token);
    if (idx === -1) return res.status(400).json({ error: 'Invalid or expired token' });
    const entry = resets[idx];
    if (Date.now() > entry.expiresAt) {
      // remove expired
      resets.splice(idx, 1);
      await saveResets(resets);
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const users = await getUsers();
    const user = users.find(u => u.id === entry.userId || (u.email || '').toLowerCase() === (entry.email || '').toLowerCase());
    if (!user) return res.status(400).json({ error: 'User not found for this token' });

    // Hash and save new password
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await saveUsers(users);

    // remove token
    resets.splice(idx, 1);
    await saveResets(resets);

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Middleware to verify token
export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default router;
