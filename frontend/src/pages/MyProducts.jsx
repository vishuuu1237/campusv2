import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatINR, calculateListingFee } from '../utils/currency';

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
  }, [user, navigate]);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      const myProducts = (response.data || []).filter(
        (product) => product.sellerId === user.id
      );
      setProducts(myProducts);
    } catch (error) {
      console.error('Error fetching seller products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this listing? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/products/${productId}`);
      setProducts(products.filter((p) => p.id !== productId));
      alert('Listing deleted successfully.');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="mt-4 font-body-md text-on-surface-variant">
          Loading your active listings...
        </p>
      </div>
    );
  }

  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 1), 0);
  const totalListingCharges = products.reduce((sum, p) => {
    const fee = p.listingFee !== undefined ? Number(p.listingFee) : calculateListingFee(p.price);
    return sum + fee;
  }, 0);

  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-margin py-space-md pb-space-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-space-sm border-b border-outline-variant/20 mb-space-md">
        <div>
          <h1 className="font-headline-lg text-on-surface">My Marketplace Listings</h1>
          <p className="font-body-sm text-on-surface-variant">
            Manage your active items, inventory, listing charges, and campus sales.
          </p>
        </div>

        <Link
          to="/sell"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-all shadow-sm self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Post New Listing</span>
        </Link>
      </div>

      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-space-lg">
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">inventory_2</span>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Active Listings</p>
              <p className="font-headline-md text-on-surface font-bold">{products.length}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">payments</span>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Catalog Total Value</p>
              <p className="font-headline-md text-on-surface font-bold">{formatINR(totalValue)}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/20 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary/15 text-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">receipt_long</span>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Total Listing Charges</p>
              <p className="font-headline-md text-secondary-container font-bold">{formatINR(totalListingCharges)}</p>
            </div>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center max-w-lg mx-auto shadow-sm my-8">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">storefront</span>
          </div>
          <h2 className="font-headline-md text-on-surface mb-2">No active listings</h2>
          <p className="font-body-md text-on-surface-variant mb-6">
            You haven't listed any items for sale yet. Turn your unused textbooks and gadgets into cash!
          </p>
          <Link
            to="/sell"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md font-semibold hover:bg-primary-container transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>List Your First Product</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {products.map((product) => {
            const fee = product.listingFee !== undefined ? Number(product.listingFee) : calculateListingFee(product.price);
            const netPayout = Math.max(0, Number(product.price) - fee);

            return (
              <div
                key={product.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <Link to={`/product/${product.id}`} className="block relative aspect-video bg-surface-container-low overflow-hidden group">
                    <img
                      src={
                        product.image ||
                        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full font-label-sm text-xs bg-surface-container-lowest/90 font-semibold backdrop-blur-md shadow-2xs">
                      {product.condition || 'Verified'}
                    </span>
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full font-label-sm text-xs bg-secondary/90 text-on-secondary font-bold backdrop-blur-md shadow-2xs">
                      Fee: {formatINR(fee)}
                    </span>
                  </Link>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-outline uppercase text-[10px]">
                        {product.category || 'General'}
                      </span>
                      <span className="font-label-sm text-tertiary-container font-semibold">
                        Stock: {product.stock || 1}
                      </span>
                    </div>

                    <Link to={`/product/${product.id}`} className="font-headline-sm text-on-surface hover:text-primary transition-colors block line-clamp-1">
                      {product.name}
                    </Link>

                    <p className="font-body-sm text-on-surface-variant line-clamp-2 text-xs">
                      {product.description}
                    </p>

                    {/* Financial Breakdown Card */}
                    <div className="bg-surface-container-low/60 rounded-xl p-2.5 text-xs space-y-1 mt-2 border border-outline-variant/15">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Listing Charge:</span>
                        <span className="font-semibold text-secondary-container">{formatINR(fee)}</span>
                      </div>
                      <div className="flex justify-between text-on-surface font-semibold pt-1 border-t border-outline-variant/10">
                        <span>Net Seller Payout:</span>
                        <span className="text-tertiary">{formatINR(netPayout)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-outline-variant/20 mt-2 flex items-center justify-between">
                  <div>
                    <span className="font-label-sm text-outline text-[11px] block">Price</span>
                    <span className="font-headline-md text-primary font-bold">
                      {formatINR(product.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/product/${product.id}`}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm text-xs"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                      title="Delete listing"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
