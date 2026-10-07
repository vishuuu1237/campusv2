import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const CONDITIONS = ['All Items', 'New', 'Like New', 'Good', 'Fair'];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [error, setError] = useState(null);

  // Filters & sorting state
  const selectedCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';
  const [selectedCondition, setSelectedCondition] = useState('All Items');
  const [sortBy, setSortBy] = useState('newest');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await axios.get('/api/products', { params });
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Unable to load listings. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by condition
    if (selectedCondition !== 'All Items') {
      result = result.filter(
        (p) =>
          p.condition &&
          p.condition.toLowerCase() === selectedCondition.toLowerCase()
      );
    }

    // Filter by max price
    if (maxPriceFilter) {
      result = result.filter((p) => Number(p.price) <= Number(maxPriceFilter));
    }

    // Filter by verified (in this app, all logged in sellers are verified)
    if (verifiedOnly) {
      result = result.filter((p) => Boolean(p.sellerId));
    }

    // Exclude own listings for logged-in users
    if (user) {
      result = result.filter((p) => p.sellerId !== user.id);
    }
      // Sort results based on selected sort option
      result.sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'price-asc') {
          return Number(a.price) - Number(b.price);
        }
        if (sortBy === 'price-desc') {
          return Number(b.price) - Number(a.price);
        }
        if (sortBy === 'popular') {
          return (b.rating || 0) - (a.rating || 0);
        }
        return 0;
      });


    return result;
  }, [products, selectedCondition, maxPriceFilter, verifiedOnly, sortBy]);

  const clearSearchFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    setSearchParams(params);
  };

  const clearCategoryFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    setSearchParams(params);
  };

  return (
    <div className="w-full">
      {/* Top TradeHub Guarantee Escrow Banner */}
      <section className="w-full bg-gradient-to-r from-primary via-primary-container to-surface-tint text-on-primary px-4 md:px-margin py-3 relative overflow-hidden shadow-sm">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-space-sm text-sm font-label-lg">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center justify-center p-1 rounded-full bg-surface-container-lowest/15 backdrop-blur-sm">
              <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">
                verified_user
              </span>
            </span>
            <span className="tracking-tight text-white font-headline-sm hidden sm:inline">
              TradeHub Guarantee:
            </span>
            <span className="text-surface-container-high font-body-md text-xs sm:text-sm">
              Local & Verified Peer-to-Peer Marketplace — 100% Escrow Buyer Protection on Every Order
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="hidden md:flex items-center gap-2 font-label-sm text-surface-container-high">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse" />
              <span>Campus Escrow Active</span>
            </div>
            <button
              onClick={() => setShowEscrowModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded bg-surface-container-lowest/20 hover:bg-surface-container-lowest/30 text-white font-label-md transition-all cursor-pointer"
            >
              <span>How Escrow Works</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* Filter & Discovery Controls Layer */}
      <section className="w-full bg-surface-container-lowest border-b border-outline-variant/30 shadow-xs sticky top-[108px] z-30">
        <div className="max-w-[1360px] mx-auto px-4 md:px-margin py-3 space-y-3">
          {/* Top Row: Location Pill + Active Filters + Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm">
            <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm">
              {/* Active Location Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm shadow-2xs">
                <span className="material-symbols-outlined text-primary text-[16px]">
                  near_me
                </span>
                <span>Campus & Safe Hub Zones</span>
              </div>

              {/* Active Search Query Badge */}
              {searchQuery && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-sm">
                  <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    onClick={clearSearchFilter}
                    aria-label="Clear search"
                    className="hover:text-error transition-colors flex items-center"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              )}

              {/* Active Category Badge */}
              {selectedCategory && selectedCategory !== 'All' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-on-secondary-container font-label-sm">
                  <span>Category: {selectedCategory}</span>
                  <button
                    onClick={clearCategoryFilter}
                    aria-label="Clear category"
                    className="hover:text-error transition-colors flex items-center"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sorter & View Toggle */}
            <div className="flex items-center gap-space-sm ml-auto">
              <label
                htmlFor="sort-select"
                className="font-label-sm text-on-surface-variant hidden sm:inline"
              >
                Sort by:
              </label>
              <div className="relative inline-flex items-center bg-surface-container-low rounded-lg px-2.5 py-1 shadow-2xs">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-transparent font-label-md text-on-surface pr-6 pl-1 py-0.5 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newly Listed</option>
                  <option value="popular">Most Popular</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <span className="material-symbols-outlined absolute right-1.5 pointer-events-none text-on-surface-variant text-[18px]">
                  expand_more
                </span>
              </div>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center bg-surface-container-low rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-1.5 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-1.5 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">view_list</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Condition Chips & Quick Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm pt-0.5">
            {/* Condition Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-label-sm text-outline uppercase tracking-wider mr-1 text-[10px]">
                Condition:
              </span>
              {CONDITIONS.map((cond) => {
                const isActive = selectedCondition === cond;
                return (
                  <button
                    key={cond}
                    onClick={() => setSelectedCondition(cond)}
                    className={`px-3 py-1 rounded-full font-label-sm transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>

            {/* Quick Toggles */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm transition-all ${
                  verifiedOnly
                    ? 'bg-tertiary-container text-on-tertiary shadow-xs'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Verified Only</span>
              </button>

              {(selectedCondition !== 'All Items' || maxPriceFilter || verifiedOnly) && (
                <button
                  onClick={() => {
                    setSelectedCondition('All Items');
                    setMaxPriceFilter('');
                    setVerifiedOnly(false);
                  }}
                  className="font-label-sm text-primary hover:underline px-2 py-1"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Marketplace Canvas */}
      <main className="max-w-[1360px] mx-auto px-4 md:px-margin py-space-lg">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm mb-space-md">
          <div>
            <div className="flex items-center gap-2 text-outline font-label-sm uppercase tracking-widest mb-1">
              <span>Active Escrow Protected Exchange</span>
              <span>•</span>
              <span className="text-tertiary-container font-semibold">
                {filteredProducts.length} Listings Available
              </span>
            </div>
            <h1 className="font-headline-lg text-on-surface">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory && selectedCategory !== 'All'
                ? `${selectedCategory} Collection`
                : 'Curated Campus Finds & Verified Listings'}
            </h1>
          </div>
          <div className="flex items-center gap-space-sm text-on-surface-variant font-body-sm">
            <span>
              Showing {filteredProducts.length} of {products.length} items
            </span>
            <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{
                  width: `${
                    products.length > 0
                      ? Math.min(100, Math.round((filteredProducts.length / products.length) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 mb-6 rounded-xl bg-error-container text-on-error-container font-body-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
            <button
              onClick={fetchProducts}
              className="px-3 py-1 rounded-lg bg-surface-container-lowest text-error font-label-sm font-bold shadow-xs hover:bg-surface-container"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter py-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-3 animate-pulse space-y-3"
              >
                <div className="aspect-square bg-surface-container-high rounded-lg w-full" />
                <div className="h-4 bg-surface-container-high rounded w-2/3" />
                <div className="h-3 bg-surface-container-low rounded w-full" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-surface-container-high rounded w-1/3" />
                  <div className="w-6 h-6 rounded-full bg-surface-container-high" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">inventory_2</span>
            </div>
            <h3 className="font-headline-md text-on-surface mb-2">No listings found</h3>
            <p className="font-body-md text-on-surface-variant mb-6">
              {searchQuery || selectedCategory !== 'All'
                ? 'We could not find anything matching your search filters. Try adjusting your search query or clear filters.'
                : 'There are currently no listings on the exchange. Be the first student to post an item!'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {(searchQuery || selectedCategory !== 'All' || selectedCondition !== 'All Items') && (
                <button
                  onClick={() => {
                    clearSearchFilter();
                    clearCategoryFilter();
                    setSelectedCondition('All Items');
                  }}
                  className="px-5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-label-md hover:bg-surface-container"
                >
                  Clear All Filters
                </button>
              )}
              <Link
                to="/sell"
                className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-all shadow-sm flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Post a Listing</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid / List */
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter'
                : 'flex flex-col gap-4'
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!loading && filteredProducts.length > 0 && (
          <div className="mt-space-xl flex flex-col items-center justify-center gap-space-sm text-center">
            <button
              onClick={fetchProducts}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-surface-container-lowest text-primary font-label-lg shadow-sm hover:shadow-md hover:bg-surface-container-low transition-all border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
              <span>Refresh Marketplace Listings</span>
            </button>
            <p className="font-body-sm text-on-surface-variant">
              TradeHub Peer Exchange • Real-time verified campus inventory
            </p>
          </div>
        )}
      </main>

      {/* Trust Reassurance Ribbon */}
      <section className="w-full bg-surface-container-low py-space-xl mt-space-xl border-t border-outline-variant/20 shadow-inner">
        <div className="max-w-[1360px] mx-auto px-4 md:px-margin">
          <div className="text-center max-w-2xl mx-auto mb-space-lg">
            <span className="font-label-sm text-primary uppercase tracking-wider font-semibold">
              Peer-to-Peer Without Risk
            </span>
            <h2 className="font-headline-lg text-on-surface mt-1">
              Built to replace shady parking lot meetups
            </h2>
            <p className="font-body-md text-on-surface-variant mt-1">
              Every campus transaction is safeguarded by TradeHub's verified escrow protection before funds ever move.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Feature 1 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </div>
              <h3 className="font-headline-sm text-on-surface">Digital Vault Escrow</h3>
              <p className="font-body-md text-on-surface-variant">
                Your payment is held safely in escrow until you inspect the item in person and confirm condition.
              </p>
              <div className="mt-auto pt-2 flex items-center gap-1 text-primary font-label-sm font-semibold">
                <span>100% Buyer Protection</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-[28px]">badge</span>
              </div>
              <h3 className="font-headline-sm text-on-surface">Strict Student ID Verification</h3>
              <p className="font-body-md text-on-surface-variant">
                Zero anonymous spam profiles. Sellers must be verified with active campus or authenticated credentials.
              </p>
              <div className="mt-auto pt-2 flex items-center gap-1 text-tertiary font-label-sm font-semibold">
                <span>Campus Verification Standard</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-space-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm border border-outline-variant/20">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed/40 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[28px]">health_and_safety</span>
              </div>
              <h3 className="font-headline-sm text-on-surface">Verified Safe Exchange Spots</h3>
              <p className="font-body-md text-on-surface-variant">
                Designated exchange points inside monitored campus library lobbies, student unions, and campus security points.
              </p>
              <div className="mt-auto pt-2 flex items-center gap-1 text-secondary font-label-sm font-semibold">
                <span>Campus Safe Zones</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Escrow Informational Modal */}
      {showEscrowModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  security
                </span>
                <h3 className="font-headline-md text-on-surface">TradeHub Escrow System</h3>
              </div>
              <button
                onClick={() => setShowEscrowModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-md text-on-surface-variant text-sm">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-on-surface block">Buyer Places Order</strong>
                  Funds are safely locked into TradeHub digital escrow. The seller does not receive payment yet.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-on-surface block">Safe Meetup or Shipping</strong>
                  Buyer and seller meet at a verified campus safe zone, or the item is shipped with tracking.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-on-surface block">Inspection & Release</strong>
                  Buyer inspects the condition. Once confirmed, payment is instantly released to the seller.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowEscrowModal(false)}
              className="w-full py-2.5 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container transition-colors"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
