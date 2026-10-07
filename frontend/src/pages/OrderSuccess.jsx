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

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) {
      fetchOrder();
    }
  }, [id, user, navigate]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-space-xl">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 p-6 sm:p-8 text-center space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mx-auto shadow-sm">
          <span className="material-symbols-outlined text-[36px]">verified</span>
        </div>

        <div>
          <span className="font-label-sm text-tertiary-container font-semibold uppercase tracking-wider block mb-1">
            Escrow Holding Established
          </span>
          <h1 className="font-headline-lg text-on-surface">Order Placed Successfully!</h1>
          <p className="font-body-md text-on-surface-variant max-w-md mx-auto mt-1">
            Your funds are safely held in neutral TradeHub escrow. The seller has been alerted to prepare the handoff.
          </p>
        </div>

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
              <span className="text-outline block text-[11px]">Handoff Status</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                Pending Handoff
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
              <span className="text-outline block text-[11px]">Total Paid (Escrow)</span>
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
