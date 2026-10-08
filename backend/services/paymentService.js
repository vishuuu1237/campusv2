import 'dotenv/config';

// Payment gateway configuration from environment variables
const API_KEY = process.env.PAYMENT_GATEWAY_KEY || process.env.ZAP_UPI_API_KEY;
const BASE_URL = (
  process.env.PAYMENT_GATEWAY_BASE_URL ||
  process.env.PAYMENT_GATEWAY_URL ||
  process.env.ZAP_UPI_BASE_URL ||
  'https://pay.zapupi.com'
).replace(/\/$/, '');

const SIMULATION_MODE = process.env.ZAP_UPI_SIMULATION === 'true' || !API_KEY;

/**
 * Creates an order session on the payment gateway
 * @param {Object} params
 * @param {string} params.orderId - Unique order ID
 * @param {number} params.amount - Order amount in INR
 * @param {string} [params.customerMobile] - 10-digit mobile number
 * @param {string} [params.remark] - Payment remark/description
 * @param {string} [params.redirectUrl] - URL to redirect user after payment
 * @param {string} [params.webhookUrl] - Gateway callback URL
 * @returns {Promise<Object>}
 */
export const createPaymentOrder = async ({
  orderId,
  amount,
  customerMobile = '9999999999',
  remark = 'Campus Marketplace Order',
  redirectUrl,
  webhookUrl
}) => {
  if (!orderId || !amount) {
    throw new Error('Order ID and Amount are required for payment creation');
  }

  const numericAmount = Number(amount).toFixed(2);

  // If running in simulation mode or missing key
  if (SIMULATION_MODE) {
    console.log(`[PaymentService] Simulation Mode: Order ${orderId} initialized for ₹${numericAmount}`);
    return {
      success: true,
      mode: 'simulation',
      orderId,
      amount: numericAmount,
      paymentUrl: redirectUrl 
        ? `${redirectUrl}?order_id=${encodeURIComponent(orderId)}&status=simulation_success`
        : `/order-success/${encodeURIComponent(orderId)}?payment_status=success`,
      message: 'Simulation payment session created'
    };
  }

  const endpoint = `${BASE_URL}/api/create-order`;

  const payload = {
    zap_key: API_KEY,
    order_id: String(orderId),
    amount: numericAmount,
    customer_mobile: String(customerMobile).replace(/\D/g, '').slice(-10) || '9999999999',
    remark: String(remark).slice(0, 100),
    ...(redirectUrl && { redirect_url: redirectUrl }),
    ...(webhookUrl && { webhook_url: webhookUrl })
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      console.error(`[PaymentService] Gateway responded with status: ${response.status}`);
      throw new Error((data && data.message) || `Payment gateway error (${response.status})`);
    }

    // Extract payment checkout URL
    const paymentUrl =
      data.payment_url ||
      data.paymentUrl ||
      data.url ||
      (data.results && (data.results.payment_url || data.results.url)) ||
      (data.data && (data.data.payment_url || data.data.url));

    if (!paymentUrl) {
      // If gateway accepted without returning direct URL, fallback to gateway pay page
      const fallbackUrl = `${BASE_URL}/pay?order_id=${encodeURIComponent(orderId)}`;
      return {
        success: true,
        orderId,
        amount: numericAmount,
        paymentUrl: fallbackUrl,
        rawStatus: data.status
      };
    }

    return {
      success: true,
      orderId,
      amount: numericAmount,
      paymentUrl,
      rawStatus: data.status
    };
  } catch (err) {
    console.error(`[PaymentService] Failed to create payment order for ${orderId}:`, err.message);
    throw new Error(`Failed to initiate payment gateway session: ${err.message}`);
  }
};

/**
 * Authoritatively verifies order payment status with gateway
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
export const verifyPaymentStatus = async (orderId) => {
  if (!orderId) {
    throw new Error('Order ID is required to verify payment status');
  }

  if (SIMULATION_MODE) {
    return {
      success: true,
      isPaid: true,
      orderId,
      status: 'PAID',
      mode: 'simulation',
      verifiedAt: new Date().toISOString()
    };
  }

  const endpoint = `${BASE_URL}/api/order-status`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        zap_key: API_KEY,
        order_id: String(orderId)
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      throw new Error(`Gateway returned status ${response.status}`);
    }

    const rawStatus = (
      data.status ||
      (data.results && data.results.status) ||
      (data.data && data.data.status) ||
      ''
    ).toString().toUpperCase();

    const isPaid = ['COMPLETED', 'SUCCESS', 'PAID', 'SUCCESSFUL', 'TRUE', '1'].includes(rawStatus) || data.status === true;
    const isFailed = ['FAILED', 'FAILURE', 'CANCELLED', 'EXPIRED'].includes(rawStatus);

    return {
      success: true,
      isPaid,
      isFailed,
      status: isPaid ? 'PAID' : (isFailed ? 'FAILED' : 'PENDING'),
      rawStatus,
      transactionId: data.txn_id || data.utr || data.reference_id || null,
      verifiedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error(`[PaymentService] Verification error for order ${orderId}:`, err.message);
    return {
      success: false,
      isPaid: false,
      status: 'ERROR',
      error: err.message
    };
  }
};

export default {
  createPaymentOrder,
  verifyPaymentStatus
};
