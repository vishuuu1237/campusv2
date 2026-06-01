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
  }, [id, user]);

  const fetchOrder = async () => {
    try {
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
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Order not found</p>
        <Link to="/orders" className="text-primary-600 hover:underline mt-4 inline-block">
          View All Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Thank you for your order</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Details</h2>
            <p className="text-sm text-gray-600">
              <strong>Order ID:</strong> #{order.id.slice(-8)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Status:</strong>{' '}
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Items Ordered:</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="text-gray-700 font-semibold">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-800">
              <span>Total:</span>
              <span className="text-primary-600">{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">Payment Information</h3>
          <p className="text-sm text-blue-700 mb-2">
            <strong>Payment Method:</strong> {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
          </p>
          <p className="text-sm text-blue-700">
            {order.paymentMethod === 'cash' && (
              <>You'll pay in cash when you pick up the item. Contact the seller to arrange pickup.</>
            )}
            {order.paymentMethod === 'venmo' && (
              <>Please send payment via Venmo. Contact the seller for their Venmo details.</>
            )}
            {order.paymentMethod === 'paypal' && (
              <>Please send payment via PayPal. Contact the seller for their PayPal email.</>
            )}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-800 mb-2">Shipping Address</h3>
          <p className="text-sm text-gray-700">
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
            {order.shippingAddress.campusLocation && (
              <>
                <br />
                {order.shippingAddress.campusLocation}
              </>
            )}
          </p>
        </div>

        <div className="flex space-x-4 justify-center">
          {order.status === 'pending' || order.status === 'processing' ? (
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to cancel this order?')) {
                  try {
                    await axios.post(`/api/orders/${order.id}/cancel`);
                    alert('Order cancelled successfully');
                    navigate('/orders');
                  } catch (error) {
                    alert(error.response?.data?.error || 'Failed to cancel order');
                  }
                }
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              Cancel Order
            </button>
          ) : null}
          <Link
            to="/orders"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            View All Orders
          </Link>
          <Link
            to="/"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

