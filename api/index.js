import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from '../backend/routes/auth.js';
import productRoutes from '../backend/routes/products.js';
import cartRoutes from '../backend/routes/cart.js';
import orderRoutes from '../backend/routes/orders.js';
import paymentRoutes from '../backend/routes/payment.js';

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

// Health check endpoints
app.get(['/api/health', '/health', '/api', '/'], (req, res) => {
  res.json({ status: 'ok', message: 'Recampus API is running' });
});

// Mount routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// Mount routes without /api prefix (fallback)
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/payment', paymentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

export default function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error('Fatal API Handler Error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
  }
}
