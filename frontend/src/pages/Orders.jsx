import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this order? Funds in escrow will be refunded to you.'
      )
    ) {
      return;
    }

    try {
      await axios.post(`/api/orders/${orderId}/cancel`);
      alert('Order cancelled and escrow released.');
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  const clearCancelledOrders = async () => {
    if (!window.confirm('Clear all your cancelled orders from history?')) return;
    try {
      const resp = await axios.delete('/api/orders/clear-cancelled');
      alert(`${resp.data.removed || 0} cancelled order(s) cleared.`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to clear cancelled orders');
    }
  };

  const canCancelOrder = (order) => {
    return order.status === 'pending' || order.status === 'processing';
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: {
        bg: 'bg-secondary-fixed/50 text-secondary',
        icon: 'hourglass_empty',
        label: 'Escrow Pending',
      },
      processing: {
        bg: 'bg-primary-fixed text-primary',
        icon: 'sync',
        label: 'Awaiting Meetup',
      },
      shipped: {
        bg: 'bg-surface-container-high text-primary',
        icon: 'local_shipping',
        label: 'En Route',
      },
      delivered: {
        bg: 'bg-tertiary-fixed text-on-tertiary-fixed',
        icon: 'verified',
        label: 'Delivered & Released',
      },
      cancelled: {
        bg: 'bg-error-container text-on-error-container',
        icon: 'cancel',
        label: 'Cancelled / Refunded',
      },
    };

    const cfg = config[status] || {
      bg: 'bg-surface-container text-on-surface-variant',
      icon: 'info',
      label: status,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-xs font-semibold ${cfg.bg}`}
      >
        <span className="material-symbols-outlined text-[14px]">{cfg.icon}</span>
        <span>{cfg.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="mt-4 font-body-md text-on-surface-variant">Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-margin py-space-md pb-space-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-space-sm border-b border-outline-variant/20 mb-space-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">Escrow Orders & Purchases</h1>
          <p className="font-body-sm text-on-surface-variant">
            Track active campus deliveries, safe meetups, and escrow release status.
          </p>
        </div>

        {orders.some((o) => o.status === 'cancelled') && (
          <button
            onClick={clearCancelledOrders}
            className="px-3.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-sm text-xs flex items-center gap-1 self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">clear_all</span>
            <span>Clear Cancelled</span>
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">receipt_long</span>
          </div>
          <h2 className="font-headline-md text-on-surface mb-2">No orders placed yet</h2>
          <p className="font-body-md text-on-surface-variant mb-6">
            When you purchase verified campus items, they will appear here with full escrow tracking.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md font-semibold hover:bg-primary-container transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            <span>Browse Marketplace</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">package_2</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-lg text-on-surface font-bold">
                        Order #{order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="font-body-sm text-on-surface-variant text-xs mt-0.5">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-label-sm text-outline block text-xs">Total Amount</span>
                  <span className="font-headline-md text-primary font-bold">
                    {formatINR(order.total)}
                  </span>
                </div>
              </div>

              {/* Items List in this Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(order.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low"
                  >
                    <img
                      src={
                        item.image ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg bg-surface-container shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-label-md text-on-surface font-semibold truncate">
                        {item.name}
                      </p>
                      <p className="font-body-sm text-on-surface-variant text-xs">
                        Qty: {item.quantity} • {formatINR(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping & Actions Footer */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-body-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-container">
                    fmd_good
                  </span>
                  <span>
                    Location: {order.shippingAddress?.campusLocation || 'Campus Hub'} —{' '}
                    {order.shippingAddress?.street}, {order.shippingAddress?.city}
                  </span>
                </div>

                {canCancelOrder(order) && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="px-3.5 py-1.5 rounded-lg border border-error/40 text-error hover:bg-error-container/20 font-label-sm transition-colors self-start sm:self-auto"
                  >
                    Cancel & Release Escrow
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
