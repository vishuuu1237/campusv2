import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from '../backend/routes/auth.js';
import productRoutes from '../backend/routes/products.js';
import cartRoutes from '../backend/routes/cart.js';
import orderRoutes from '../backend/routes/orders.js';
import paymentRoutes from '../backend/routes/payment.js';

import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize data files if not present
const initDataFiles = async () => {
  const dataDir = path.join(__dirname, '../backend/data');
  try { await fs.mkdir(dataDir, { recursive: true }); } catch (e) {}
  const initFile = async (name, def) => {
    const p = path.join(dataDir, name);
    try { await fs.access(p); } catch {
      try { await fs.writeFile(p, JSON.stringify(def, null, 2)); } catch (e) {}
    }
  };
  await Promise.all([
    initFile('users.json', []),
    initFile('products.json', []),
    initFile('carts.json', {}),
    initFile('orders.json', []),
    initFile('password_resets.json', [])
  ]);
};
initDataFiles().catch(() => {});

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Normalize URL for Vercel serverless function invocations
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index')) {
    req.url = req.url.replace(/^\/api\/index/, '') || '/';
  }
  next();
});

// Mount routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Mount routes without /api prefix (if Vercel strips /api during routing)
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/payment', paymentRoutes);

app.get(['/api/health', '/health', '/api', '/'], (req, res) => {
  res.json({ status: 'ok', message: 'Recampus API is running' });
});

export default app;
