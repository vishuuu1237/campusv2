import express from 'express';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from './auth.js';
import { createPaymentOrder, verifyPaymentStatus } from '../services/paymentService.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getDataDir = () => {
  const cwdData = path.join(process.cwd(), 'backend', 'data');
  if (existsSync(cwdData)) return cwdData;
  return path.join(__dirname, '../data');
};
const dataDir = getDataDir();

const getOrders = async () => {
  const filePath = path.join(dataDir, 'orders.json');
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch {
    return [];
  }
};

const saveOrders = async (orders) => {
  const filePath = path.join(dataDir, 'orders.json');
  await fs.writeFile(filePath, JSON.stringify(orders, null, 2));
};

/**
 * POST /api/payment/create-session
 * Create payment gateway checkout session for an order
 */
router.post('/create-session', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const orders = await getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];

    // Check authorization
    if (order.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized for this order' });
    }

    // If order is already paid, prevent duplicate sessions
    if (order.paymentStatus === 'paid' || order.status === 'processing' || order.status === 'delivered') {
      return res.status(400).json({ error: 'Order has already been paid' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const origin = req.headers.origin || `${protocol}://${host}`;

    const redirectUrl = `${origin}/order-success/${order.id}`;
    const webhookUrl = `${protocol}://${host}/api/payment/webhook`;

    const paymentResult = await createPaymentOrder({
      orderId: order.id,
      amount: order.total,
      customerMobile: order.shippingAddress?.phone || '9999999999',
      remark: `Order #${order.id}`,
      redirectUrl,
      webhookUrl
    });

    // Update order with pending payment session info
    orders[orderIndex].paymentStatus = 'pending';
    orders[orderIndex].paymentUrl = paymentResult.paymentUrl;
    orders[orderIndex].paymentInitiatedAt = new Date().toISOString();
    await saveOrders(orders);

    res.json({
      success: true,
      orderId: order.id,
      paymentUrl: paymentResult.paymentUrl,
      amount: order.total
    });
  } catch (error) {
    console.error('Create payment session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment session' });
  }
});

/**
 * POST /api/payment/verify
 * Authoritative payment status check from payment gateway
 */
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    const orders = await getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];

    if (order.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized for this order' });
    }

    // If already marked paid idempotently
    if (order.paymentStatus === 'paid') {
      return res.json({
        success: true,
        orderId: order.id,
        status: 'PAID',
        paymentStatus: 'paid',
        order
      });
    }

    // Call payment gateway status endpoint
    const statusResult = await verifyPaymentStatus(order.id);

    if (statusResult.isPaid) {
      orders[orderIndex].paymentStatus = 'paid';
      orders[orderIndex].status = 'processing'; // Ready for escrow handoff
      orders[orderIndex].paidAt = new Date().toISOString();
      if (statusResult.transactionId) {
        orders[orderIndex].transactionId = statusResult.transactionId;
      }
      await saveOrders(orders);

      return res.json({
        success: true,
        orderId: order.id,
        status: 'PAID',
        paymentStatus: 'paid',
        order: orders[orderIndex]
      });
    } else if (statusResult.isFailed) {
      orders[orderIndex].paymentStatus = 'failed';
      await saveOrders(orders);

      return res.json({
        success: false,
        orderId: order.id,
        status: 'FAILED',
        paymentStatus: 'failed',
        order: orders[orderIndex]
      });
    }

    return res.json({
      success: false,
      orderId: order.id,
      status: 'PENDING',
      paymentStatus: order.paymentStatus || 'pending',
      order: orders[orderIndex]
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message || 'Payment verification failed' });
  }
});

/**
 * GET /api/payment/status/:orderId
 * Check order and payment status
 */
router.get('/status/:orderId', verifyToken, async (req, res) => {
  try {
    const orders = await getOrders();
    const order = orders.find(o => o.id === req.params.orderId && o.userId === req.userId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus || (order.paymentMethod === 'cash' ? 'cash_on_delivery' : 'pending'),
      paymentMethod: order.paymentMethod,
      total: order.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/payment/webhook
 * Webhook endpoint for payment gateway callbacks
 */
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body || {};
    const orderId = payload.order_id || payload.orderId || payload.orderid;

    if (!orderId) {
      return res.status(400).json({ status: 'ignored', message: 'Missing order_id' });
    }

    // Always re-verify authoritatively with the gateway to prevent fake callbacks
    const verification = await verifyPaymentStatus(orderId);

    const orders = await getOrders();
    const orderIndex = orders.findIndex(o => o.id === String(orderId));

    if (orderIndex !== -1) {
      const order = orders[orderIndex];

      if (verification.isPaid && order.paymentStatus !== 'paid') {
        orders[orderIndex].paymentStatus = 'paid';
        orders[orderIndex].status = 'processing';
        orders[orderIndex].paidAt = new Date().toISOString();
        if (verification.transactionId || payload.txn_id) {
          orders[orderIndex].transactionId = verification.transactionId || payload.txn_id;
        }
        await saveOrders(orders);
        console.log(`[Webhook] Order ${orderId} marked as PAID`);
      } else if (verification.isFailed && order.paymentStatus !== 'paid') {
        orders[orderIndex].paymentStatus = 'failed';
        await saveOrders(orders);
        console.log(`[Webhook] Order ${orderId} marked as FAILED`);
      }
    }

    // Gateway expects HTTP 200 OK
    res.status(200).json({ status: 'ok', received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(200).json({ status: 'error', error: error.message });
  }
});

export default router;
