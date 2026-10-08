import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    campusLocation: 'Student Union / Central Library',
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
      setCart(response.data || { items: [] });
      if (!response.data || !response.data.items || response.data.items.length === 0) {
        navigate('/cart');
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await axios.post('/api/orders', {
        shippingAddress,
        paymentMethod,
      });

      const orderData = response.data;

      // If gateway returned a checkout payment URL, redirect user to pay
      if (orderData.paymentUrl) {
        window.location.href = orderData.paymentUrl;
      } else {
        navigate(`/order-success/${orderData.id}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(
        err.response?.data?.error ||
        'Failed to initiate checkout. Please try again.'
      );
      setSubmitting(false);
    }
  };

  const total = (cart.items || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
    0
  );

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="mt-4 font-body-md text-on-surface-variant">
          Preparing secure checkout session...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-margin py-space-md pb-space-xl">
      {/* Header */}
      <div className="pb-space-sm border-b border-outline-variant/20 mb-space-md flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 font-label-sm text-on-surface-variant mb-1">
            <Link to="/cart" className="hover:text-primary transition-colors">
              Cart
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Escrow Checkout</span>
          </div>
          <h1 className="font-headline-lg text-on-surface">Secure Escrow Checkout</h1>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low shadow-2xs self-start md:self-auto">
          <span className="material-symbols-outlined text-[18px] text-tertiary-container">
            lock
          </span>
          <span className="font-label-sm text-on-surface">256-bit Encrypted Session</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error-container text-on-error-container font-body-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Form (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {/* Section 1: Handoff Location / Shipping Address */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/20 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[24px]">pin_drop</span>
              <h2 className="font-headline-sm text-on-surface">
                Campus Handoff & Shipping Details
              </h2>
            </div>

            <div>
              <label className="font-label-md text-on-surface font-semibold block mb-1">
                Preferred Campus Safe Meeting Spot *
              </label>
              <select
                value={shippingAddress.campusLocation}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, campusLocation: e.target.value })
                }
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Student Union / Central Library">
                  Central Library Entrance (24/7 Security)
                </option>
                <option value="Student Union Building Cafe">
                  Student Union Hub / Dining Commons
                </option>
                <option value="Campus Main Gate Security Booth">
                  Main Campus Gate Security Booth
                </option>
                <option value="Dorm / Hostel Quad">Residence Hall / Hostel Quadrangle</option>
                <option value="Direct Shipping to Address">
                  Direct Mail Delivery to Street Address
                </option>
              </select>
            </div>

            <div>
              <label className="font-label-md text-on-surface font-semibold block mb-1">
                Street Address / Room / Department *
              </label>
              <input
                type="text"
                required
                value={shippingAddress.street}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, street: e.target.value })
                }
                placeholder="e.g. Room 304, Hall 4, West Campus"
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                  placeholder="Campus City"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1">
                  Contact Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={shippingAddress.phone}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, phone: e.target.value })
                  }
                  placeholder="10-digit mobile number"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, state: e.target.value })
                  }
                  placeholder="State"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1">
                  Postal Code *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.zip}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, zip: e.target.value })
                  }
                  placeholder="ZIP / PIN Code"
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/20 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[24px]">payments</span>
              <h2 className="font-headline-sm text-on-surface">Payment & Escrow Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setPaymentMethod('upi')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'upi' || paymentMethod === 'card'
                    ? 'border-primary bg-primary/5 shadow-2xs'
                    : 'border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'upi' || paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('upi')}
                  className="mt-1 text-primary accent-primary"
                />
                <div>
                  <p className="font-label-md text-on-surface font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      qr_code_2
                    </span>
                    <span>Instant UPI / Gateway Escrow</span>
                  </p>
                  <p className="font-body-sm text-on-surface-variant text-xs mt-1">
                    Pay securely via UPI QR, GPay, PhonePe, Paytm, or NetBanking. Funds stay locked in escrow until verified.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  paymentMethod === 'cash'
                    ? 'border-primary bg-primary/5 shadow-2xs'
                    : 'border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                  className="mt-1 text-primary accent-primary"
                />
                <div>
                  <p className="font-label-md text-on-surface font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">
                      payments
                    </span>
                    <span>Cash on Safe Meetup</span>
                  </p>
                  <p className="font-body-sm text-on-surface-variant text-xs mt-1">
                    Pay in person after physically inspecting the item at the verified meetup zone.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-outline-variant/20 flex flex-col gap-4 sticky top-32">
          <h3 className="font-headline-sm text-on-surface">Order Summary</h3>

          {/* Items mini list */}
          <div className="max-h-48 overflow-y-auto space-y-2 border-b border-outline-variant/20 pb-3">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-xs">
                <span className="truncate max-w-[180px] font-body-sm text-on-surface">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold text-on-surface">
                  {formatINR(Number(item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 font-body-md text-on-surface-variant text-sm">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="font-semibold text-on-surface">{formatINR(total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Escrow Service Fee</span>
              <span className="text-tertiary-container font-semibold">Free (0%)</span>
            </div>
            <div className="flex justify-between">
              <span>Gateway Handling</span>
              <span className="text-on-surface font-semibold">₹0.00</span>
            </div>
            <div className="border-t border-outline-variant/20 pt-2 flex justify-between font-headline-md text-on-surface font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatINR(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 active:scale-[0.99]"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                <span>{paymentMethod === 'cash' ? 'Placing Order...' : 'Connecting to Gateway...'}</span>
              </>
            ) : (
              <>
                <span>{paymentMethod === 'cash' ? 'Place Escrow Order' : 'Proceed to Pay with Gateway'}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {paymentMethod === 'cash' ? 'verified' : 'arrow_forward'}
                </span>
              </>
            )}
          </button>

          <p className="font-body-sm text-on-surface-variant text-center text-xs">
            By placing this order, you agree to the TradeHub Peer Escrow Safety Guidelines.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
