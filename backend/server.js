import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import startAutoExport from './scripts/auto_export.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 2210;

// Initialize data directory
const dataDir = path.join(__dirname, 'data');
await fs.mkdir(dataDir, { recursive: true });

// Initialize JSON files if they don't exist
const initFile = async (filename, defaultData) => {
  const filePath = path.join(dataDir, filename);
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
  }
};

await initFile('users.json', []);
await initFile('products.json', []);
await initFile('carts.json', {});
await initFile('orders.json', []);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Campus Marketplace API is running',
    database: 'JSON file storage'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Using JSON file storage');
  try {
    // Start auto-export watcher to keep client_data.csv up to date
    startAutoExport(__dirname);
  } catch (e) {
    console.warn('Auto-export watcher failed to start:', e.message);
  }
});

