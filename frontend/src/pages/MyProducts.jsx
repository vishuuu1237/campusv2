import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

const MyProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyProducts();
  }, [user]);

  const fetchMyProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      // Filter products to show only the ones listed by the current user
      const myProducts = response.data.filter(product => product.sellerId === user.id);
      setProducts(myProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/products/${productId}`);
      // Remove the product from the list
      setProducts(products.filter(p => p.id !== productId));
      alert('Product deleted successfully');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
        <Link
          to="/sell"
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          + List New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">You haven't listed any products yet</p>
          <Link
            to="/sell"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block"
          >
            List Your First Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
              <Link to={`/product/${product.id}`}>
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-primary-600">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-primary-600">
                    {formatINR(product.price)}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Stock: {product.stock}</span>
                  <span>Condition: {product.condition}</span>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/product/${product.id}`}
                    className="flex-1 text-center px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;

