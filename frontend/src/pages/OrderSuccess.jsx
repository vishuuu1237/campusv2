import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) {
      fetchAndVerifyOrder();
    }
  }, [id, user, navigate]);

  const fetchAndVerifyOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${id}`);
      const orderData = response.data;
      setOrder(orderData);

      // If it's an online payment and not yet marked paid, verify with backend
      if (
        orderData &&
        orderData.paymentMethod !== 'cash' &&
        orderData.paymentStatus !== 'paid'
      ) {
        verifyPayment(orderData.id);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (orderId) => {
    try {
      setVerifying(true);
      setVerifyMessage('Verifying transaction with payment gateway...');
      const response = await axios.post('/api/payment/verify', { orderId: orderId || id });
      if (response.data && response.data.order) {
        setOrder(response.data.order);
        if (response.data.status === 'PAID') {
          setVerifyMessage('Payment verified successfully!');
        } else {
          setVerifyMessage('Payment awaiting confirmation.');
        }
      }
    } catch (err) {
      console.error('Payment verification error:', err);
      setVerifyMessage('Unable to auto-verify status right now.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="mt-4 font-body-md text-on-surface-variant">
          Confirming escrow transaction...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-headline-md text-on-surface">Order Record Not Found</h2>
        <Link to="/orders" className="text-primary hover:underline font-label-md">
          View All Orders
        </Link>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'paid';
  const isCash = order.paymentMethod === 'cash';

  return (
    <div className="max-w-2xl mx-auto px-4 py-space-xl">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-6 sm:p-8 text-center space-y-6">
        {/* Success Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm ${
            isPaid || isCash
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : 'bg-secondary-fixed text-on-secondary-fixed'
          }`}
        >
          <span className="material-symbols-outlined text-[36px]">
            {isPaid || isCash ? 'verified' : 'hourglass_top'}
          </span>
        </div>

        <div>
          <span
            className={`font-label-sm font-semibold uppercase tracking-wider block mb-1 ${
              isPaid
                ? 'text-tertiary-container'
                : isCash
                ? 'text-primary'
                : 'text-secondary-container'
            }`}
          >
            {isPaid
              ? 'Payment Verified & Escrow Locked'
              : isCash
              ? 'Meetup Escrow Order Confirmed'
              : 'Escrow Payment Initiated'}
          </span>
          <h1 className="font-headline-lg text-on-surface">
            {isPaid
              ? 'Payment Successful & Order Placed!'
              : isCash
              ? 'Order Placed for Cash Meetup!'
              : 'Order Placed — Payment Processing'}
          </h1>
          <p className="font-body-md text-on-surface-variant max-w-md mx-auto mt-1">
            {isPaid
              ? 'Your funds are securely locked in TradeHub Escrow. The seller has been alerted to prepare the handoff.'
              : isCash
              ? 'Prepare exact cash for the meetup. Inspect the item thoroughly before handoff.'
              : 'Your payment session is pending confirmation. Once verified, escrow will be locked.'}
          </p>
        </div>

        {/* Payment Verification Banner if pending */}
        {!isCash && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs">
            <div className="flex items-center gap-2 text-left">
              <span className="material-symbols-outlined text-[20px] text-primary">
                {isPaid ? 'check_circle' : 'security'}
              </span>
              <div>
                <p className="font-semibold text-on-surface">
                  Payment Status:{' '}
                  <span className={isPaid ? 'text-tertiary-container font-bold' : 'text-primary font-bold'}>
                    {isPaid ? 'PAID / SECURED' : 'PENDING GATEWAY CONFIRMATION'}
                  </span>
                </p>
                {verifyMessage && (
                  <p className="text-on-surface-variant text-[11px] mt-0.5">{verifyMessage}</p>
                )}
              </div>
            </div>

            {!isPaid && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => verifyPayment(order.id)}
                  disabled={verifying}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-sm font-semibold transition-all disabled:opacity-50"
                >
                  {verifying ? 'Checking...' : 'Check Status'}
                </button>
                {order.paymentUrl && (
                  <a
                    href={order.paymentUrl}
                    className="px-3 py-1.5 rounded-lg bg-secondary-fixed hover:bg-secondary text-on-secondary-fixed font-label-sm font-semibold transition-all"
                  >
                    Open Gateway
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order Details Dossier */}
        <div className="bg-surface-container-low rounded-2xl p-5 text-left space-y-4 text-xs font-body-sm text-on-surface-variant">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-outline-variant/20">
            <div>
              <span className="text-outline block text-[11px]">Escrow Order ID</span>
              <span className="font-headline-sm text-on-surface font-bold text-sm">
                #{order.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-outline block text-[11px]">Payment Method</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface font-semibold capitalize">
                {order.paymentMethod === 'cash' ? 'Cash on Meetup' : 'Online Escrow (UPI/Gateway)'}
              </span>
            </div>
          </div>

          {/* Items summary */}
          <div>
            <span className="font-label-md text-on-surface font-semibold block mb-2">
              Reserved Items:
            </span>
            <div className="space-y-1.5">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1">
                  <span className="text-on-surface">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold text-on-surface">
                    {formatINR(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Total */}
          <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-outline block text-[11px]">Safe Handoff Spot</span>
              <span className="text-on-surface font-semibold">
                {order.shippingAddress?.campusLocation || 'Campus Hub'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-outline block text-[11px]">
                {isPaid ? 'Total Paid (Escrow)' : 'Total Payable'}
              </span>
              <span className="font-headline-md text-primary font-bold text-lg">
                {formatINR(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/orders"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold transition-all shadow-sm"
          >
            Track in My Orders
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md transition-all"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
