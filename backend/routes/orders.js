import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from './auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../data');

const getOrders = async () => {
  const filePath = path.join(dataDir, 'orders.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

const saveOrders = async (orders) => {
  const filePath = path.join(dataDir, 'orders.json');
  await fs.writeFile(filePath, JSON.stringify(orders, null, 2));
};

const getCarts = async () => {
  const filePath = path.join(dataDir, 'carts.json');
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

const saveCarts = async (carts) => {
  const filePath = path.join(dataDir, 'carts.json');
  await fs.writeFile(filePath, JSON.stringify(carts, null, 2));
};

// Get user's orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await getOrders();
    const userOrders = orders.filter(order => order.userId === req.userId);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const orders = await getOrders();
    const order = orders.find(o => o.id === req.params.id && o.userId === req.userId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order from cart
router.post('/', verifyToken, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ error: 'Shipping address and payment method are required' });
    }

    const carts = await getCarts();
    const userCart = carts[req.userId];

    if (!userCart || !userCart.items || userCart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = userCart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = {
      id: Date.now().toString(),
      userId: req.userId,
      items: userCart.items,
      total,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const orders = await getOrders();
    orders.push(newOrder);
    await saveOrders(orders);

    // Clear cart after order
    carts[req.userId] = { items: [] };
    await saveCarts(carts);

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel order (buyer can cancel their own order)
router.post('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const orders = await getOrders();
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];

    // Check if user owns this order
    if (order.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }

    // Only allow cancellation if order is pending or processing
    if (order.status === 'shipped' || order.status === 'delivered') {
      return res.status(400).json({
        error: 'Cannot cancel order that has already been shipped or delivered'
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    // Update order status to cancelled
    orders[orderIndex].status = 'cancelled';
    orders[orderIndex].cancelledAt = new Date().toISOString();
    await saveOrders(orders);

    res.json({
      message: 'Order cancelled successfully',
      order: orders[orderIndex]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (for admin/seller)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const orders = await getOrders();
    const orderIndex = orders.findIndex(o => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    orders[orderIndex].status = status;
    await saveOrders(orders);

    res.json(orders[orderIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

// Endpoint to clear cancelled orders for the authenticated user
// DELETE /api/orders/clear-cancelled
router.delete('/clear-cancelled', verifyToken, async (req, res) => {
  try {
    const orders = await getOrders();
    const beforeCount = orders.length;

    // Keep orders that are NOT (owned by user AND cancelled)
    const remaining = orders.filter(o => !(o.userId === req.userId && o.status === 'cancelled'));

    const removed = beforeCount - remaining.length;
    if (removed > 0) {
      await saveOrders(remaining);
    }

    res.json({ message: 'Cleared cancelled orders', removed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
