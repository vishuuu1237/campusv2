import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await axios.put('/api/cart/update', {
        productId,
        quantity: newQuantity,
      });
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update cart');
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.delete(`/api/cart/remove/${productId}`);
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Clear all items from your cart?')) return;
    try {
      await axios.delete('/api/cart/clear');
      fetchCart();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to clear cart');
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
        <p className="mt-4 font-body-md text-on-surface-variant">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-margin py-space-md pb-space-xl">
      <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20 mb-space-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">Escrow Shopping Cart</h1>
          <p className="font-body-sm text-on-surface-variant">
            Items are reserved and protected under Recampus escrow checkout.
          </p>
        </div>

        {cart.items && cart.items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-label-sm text-error hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            <span>Clear Cart</span>
          </button>
        )}
      </div>

      {(!cart.items || cart.items.length === 0) ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">shopping_bag</span>
          </div>
          <h2 className="font-headline-md text-on-surface mb-2">Your cart is empty</h2>
          <p className="font-body-md text-on-surface-variant mb-6">
            Browse campus textbooks, electronics, and dorm furniture from verified student peers.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md font-semibold hover:bg-primary-container transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            <span>Explore Marketplace</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Items List (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 hover:shadow-md transition-shadow"
              >
                <img
                  src={
                    item.image ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={item.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl bg-surface-container-low shrink-0"
                />

                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <Link
                    to={`/product/${item.productId}`}
                    className="font-headline-sm text-base sm:text-lg text-on-surface hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <p className="font-headline-md text-primary mt-1 font-bold">
                    {formatINR(item.price)}
                  </p>
                  <span className="inline-flex items-center gap-1 font-label-sm text-tertiary-container mt-1 text-xs">
                    <span className="material-symbols-outlined text-[14px]">shield</span>
                    Escrow Protected
                  </span>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-bold flex items-center justify-center shadow-xs"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-label-md font-bold text-on-surface">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-bold flex items-center justify-center shadow-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label="Remove item"
                    className="p-2 rounded-xl text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Pane (4 Cols) */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-outline-variant/20 flex flex-col gap-4 sticky top-32">
            <h3 className="font-headline-sm text-on-surface">Order Summary</h3>

            <div className="space-y-2.5 font-body-md text-on-surface-variant text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.length} items)</span>
                <span className="font-semibold text-on-surface">{formatINR(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Escrow Buyer Guarantee</span>
                <span className="text-tertiary-container font-semibold">Free (₹0)</span>
              </div>
              <div className="flex justify-between">
                <span>Campus Peer Fee</span>
                <span className="text-tertiary-container font-semibold">Free (₹0)</span>
              </div>
              <div className="border-t border-outline-variant/20 pt-2.5 flex justify-between font-headline-md text-on-surface font-bold text-lg">
                <span>Total Payable</span>
                <span className="text-primary">{formatINR(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full h-12 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.99]"
            >
              <span>Proceed to Escrow Checkout</span>
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </button>

            <div className="p-3 rounded-xl bg-surface-container-low flex items-start gap-2.5 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px] text-tertiary-container shrink-0 mt-0.5">
                verified_user
              </span>
              <span>
                Funds remain safely in escrow. The seller only receives payout after you inspect and accept the item in person.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
