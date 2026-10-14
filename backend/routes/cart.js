import express from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from './auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getDataDir = () => {
  const cwdData = path.join(process.cwd(), 'backend', 'data');
  if (existsSync(cwdData)) return cwdData;
  return path.join(__dirname, '../data');
};
const dataDir = getDataDir();

let inMemoryCarts = {};

const getCarts = async () => {
  const filePath = path.join(dataDir, 'carts.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    inMemoryCarts = parsed || {};
    return inMemoryCarts;
  } catch (err) {
    return inMemoryCarts || {};
  }
};

const saveCarts = async (carts) => {
  inMemoryCarts = carts;
  const filePath = path.join(dataDir, 'carts.json');
  try {
    await fs.writeFile(filePath, JSON.stringify(carts, null, 2));
  } catch (err) {}
};

// Get user's cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const carts = await getCarts();
    const userCart = carts[req.userId] || { items: [] };
    res.json(userCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to cart
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Get product details
    const productsPath = path.join(dataDir, 'products.json');
    const productsData = await fs.readFile(productsPath, 'utf-8');
    const products = JSON.parse(productsData);
    const product = products.find(p => p.id === productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const carts = await getCarts();
    if (!carts[req.userId]) {
      carts[req.userId] = { items: [] };
    }

    const existingItem = carts[req.userId].items.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      carts[req.userId].items.push({
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: parseInt(quantity)
      });
    }

    await saveCarts(carts);
    res.json(carts[req.userId]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item quantity
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    const carts = await getCarts();
    if (!carts[req.userId]) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = carts[req.userId].items.find(item => item.productId === productId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      carts[req.userId].items = carts[req.userId].items.filter(item => item.productId !== productId);
    } else {
      item.quantity = parseInt(quantity);
    }

    await saveCarts(carts);
    res.json(carts[req.userId]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', verifyToken, async (req, res) => {
  try {
    const carts = await getCarts();
    if (!carts[req.userId]) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    carts[req.userId].items = carts[req.userId].items.filter(
      item => item.productId !== req.params.productId
    );

    await saveCarts(carts);
    res.json(carts[req.userId]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    const carts = await getCarts();
    carts[req.userId] = { items: [] };
    await saveCarts(carts);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
