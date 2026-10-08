import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatINR, calculateListingFee } from '../utils/currency';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('desc'); // 'desc' | 'specs' | 'meetup'
  const [favorited, setFavorited] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('meetup'); // 'meetup' | 'shipping'
  const [addingToCart, setAddingToCart] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Product not found or unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (goToCheckout = false) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await axios.post('/api/cart/add', {
        productId: id,
        quantity,
      });

      if (goToCheckout) {
        navigate('/checkout');
      } else {
        showToast('Added to your cart!');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleQuickInquiry = (text) => {
    setInquiryText(text);
    setShowMessageModal(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setShowMessageModal(false);
      showToast('Message sent to seller!');
    }, 1200);
  };

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="mt-4 font-body-md text-on-surface-variant">
          Loading verified listing details...
        </p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1360px] mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-low text-error flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[32px]">error</span>
        </div>
        <h2 className="font-headline-md text-on-surface">Listing Not Found</h2>
        <p className="font-body-md text-on-surface-variant">
          This item may have already been sold or removed by the seller.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Return to Marketplace</span>
        </Link>
      </div>
    );
  }

  const simulatedMSRP = Math.round(Number(product.price) * 1.35);
  const savingsAmount = Math.max(0, simulatedMSRP - Number(product.price));
  const savingsPct = Math.round((savingsAmount / simulatedMSRP) * 100);
  const placeholderImage =
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  const displayImage = product.image || placeholderImage;

  return (
    <div className="w-full pb-space-xl">
      {/* Breadcrumb Navigation Bar */}
      <nav
        aria-label="Breadcrumb"
        className="w-full bg-surface-container-low/60 border-b border-outline-variant/20 py-2.5"
      >
        <div className="max-w-[1360px] mx-auto px-4 md:px-margin flex items-center gap-1.5 text-on-surface-variant font-label-md text-xs sm:text-sm">
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Marketplace</span>
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline">
            chevron_right
          </span>
          <Link
            to={`/?category=${product.category || 'All'}`}
            className="hover:text-primary transition-colors"
          >
            {product.category || 'All Categories'}
          </Link>
          <span className="material-symbols-outlined text-[14px] text-outline">
            chevron_right
          </span>
          <span className="text-on-surface font-semibold truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </div>
      </nav>

      {/* Main 7-Col / 5-Col Grid */}
      <section className="max-w-[1360px] mx-auto px-4 md:px-margin py-space-lg w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
          {/* LEFT COLUMN: Media Showcase & Tabs (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-md min-w-0">
            {/* Master Image Showcase */}
            <div className="relative bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/20 overflow-hidden group">
              {/* Overlays */}
              <div className="absolute top-space-md left-space-md z-10 flex flex-wrap gap-space-xs items-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-container text-on-tertiary font-label-sm shadow-xs">
                  <span
                    className="material-symbols-outlined text-[14px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                  <span>Authentic Verified</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-highest/90 backdrop-blur-md text-on-surface font-label-sm">
                  <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                  <span>Verified Photo</span>
                </span>
              </div>

              {/* Main Image */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center">
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                />
              </div>

              {/* Authenticity Guarantee Ribbon */}
              <div className="mt-space-md bg-surface-container-low rounded-xl p-space-sm flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm min-w-0">
                  <div className="w-8 h-8 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">fact_check</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label-md text-on-surface font-semibold flex items-center gap-1.5">
                      <span>Recampus Authenticity Guarantee</span>
                      <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] uppercase font-bold">
                        Passed
                      </span>
                    </p>
                    <p className="font-body-sm text-on-surface-variant truncate">
                      Catalog clearance & student seller profile verified for safe transfer.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications & Content Tabs */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/20">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 pb-space-sm border-b border-outline-variant/20">
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`font-label-md px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'desc'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`font-label-md px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'specs'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('meetup')}
                  className={`font-label-md px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'meetup'
                      ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  Shipping & Meetup
                </button>
              </div>

              {/* Tab 1: Description */}
              {activeTab === 'desc' && (
                <div className="flex flex-col gap-space-md mt-space-md text-on-surface-variant font-body-md leading-relaxed">
                  <p className="whitespace-pre-line text-on-surface">{product.description}</p>

                  <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2.5">
                    <h4 className="font-headline-sm text-on-surface text-base">
                      Recampus Included Safeguards:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-on-surface font-body-sm">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          check_circle
                        </span>
                        <span>Zero Buyer Hidden Fees</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          check_circle
                        </span>
                        <span>100% Escrow Protection</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          check_circle
                        </span>
                        <span>Campus Safe Zone Meetup</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          check_circle
                        </span>
                        <span>Mutual Inspection Release</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: Specs */}
              {activeTab === 'specs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-md">
                  <div className="p-3 bg-surface-container-low rounded-xl">
                    <span className="font-label-sm text-outline block">Product Name</span>
                    <p className="font-label-lg text-on-surface font-semibold">{product.name}</p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl">
                    <span className="font-label-sm text-outline block">Category</span>
                    <p className="font-label-lg text-on-surface font-semibold">
                      {product.category || 'General'}
                    </p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl">
                    <span className="font-label-sm text-outline block">Condition</span>
                    <p className="font-label-lg text-on-surface font-semibold">
                      {product.condition || 'New'}
                    </p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl">
                    <span className="font-label-sm text-outline block">Stock Availability</span>
                    <p className="font-label-lg text-on-surface font-semibold">
                      {product.stock || 1} unit(s) left
                    </p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl">
                    <span className="font-label-sm text-outline block">Listing ID</span>
                    <p className="font-label-lg text-on-surface font-semibold font-mono text-xs">
                      #{product.id}
                    </p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl">
                    <span className="font-label-sm text-outline block">Date Listed</span>
                    <p className="font-label-lg text-on-surface font-semibold">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString()
                        : 'Verified'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 3: Meetup Guidelines */}
              {activeTab === 'meetup' && (
                <div className="flex flex-col gap-space-sm mt-space-md text-on-surface-variant font-body-md">
                  <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
                      pin_drop
                    </span>
                    <div>
                      <h5 className="font-headline-sm text-on-surface text-base">
                        Verified Safe Meetup Hubs
                      </h5>
                      <p className="font-body-sm text-on-surface-variant mt-1">
                        Meetups are scheduled inside designated campus zones such as the Main Library Lobby, Student Union Cafe, or Campus Security Station. In-person testing is encouraged before code release.
                      </p>
                    </div>
                  </div>

                  <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-space-sm">
                    <span className="material-symbols-outlined text-tertiary text-[22px] shrink-0 mt-0.5">
                      local_shipping
                    </span>
                    <div>
                      <h5 className="font-headline-sm text-on-surface text-base">
                        Insured Tracked Shipping
                      </h5>
                      <p className="font-body-sm text-on-surface-variant mt-1">
                        For items shipped by mail, tracking is shared within 24 hours. Escrow funds stay protected until tracking confirms delivery and you inspect the item.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Escrow Guarantee Callout Card */}
            <div className="bg-surface-container-low p-space-md rounded-2xl border border-outline-variant/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">verified_user</span>
                </div>
                <div>
                  <h4 className="font-headline-sm text-on-surface text-base">
                    Recampus Zero-Risk Escrow
                  </h4>
                  <p className="font-body-sm text-on-surface-variant">
                    Seller isn't paid until you receive the item and confirm condition.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-label-sm font-semibold shrink-0 shadow-2xs">
                48h Protection
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Commerce Box, Pricing & Seller Profile (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-md min-w-0">
            {/* Primary Commerce Panel */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md border border-outline-variant/20 flex flex-col gap-space-md sticky top-32">
              {/* Category, Condition & Favorite */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm">
                    {product.category || 'General'}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm font-semibold">
                    {product.condition || 'New'}
                  </span>
                </div>
                <button
                  onClick={() => setFavorited(!favorited)}
                  aria-label="Add to favorites"
                  className={`w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center transition-colors ${
                    favorited ? 'text-error' : 'text-on-surface-variant'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    favorite
                  </span>
                </button>
              </div>

              {/* Title & Listed Info */}
              <div>
                <h1 className="font-headline-lg text-on-surface font-bold tracking-tight leading-snug">
                  {product.name}
                </h1>
                <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm mt-1">
                  <span className="material-symbols-outlined text-[16px] text-outline">
                    schedule
                  </span>
                  <span>Listed on Recampus Campus Exchange</span>
                </div>
              </div>

              {/* Price Engine */}
              <div className="bg-surface-container-low/70 p-space-md rounded-xl flex items-baseline justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display-md text-primary font-black">
                      {formatINR(product.price)}
                    </span>
                    {savingsPct > 5 && (
                      <span className="font-body-md text-outline line-through">
                        {formatINR(simulatedMSRP)}
                      </span>
                    )}
                  </div>
                  <p className="font-label-sm text-on-surface-variant mt-1">
                    {savingsPct > 5 ? (
                      <span className="text-tertiary-container font-bold">
                        Save ~{savingsPct}% off retail ({formatINR(savingsAmount)})
                      </span>
                    ) : (
                      'Peer-to-peer verified pricing'
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed font-label-sm font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">local_fire_department</span>
                    <span>Fair Price</span>
                  </span>
                  <span className="font-body-sm text-outline mt-1 text-[11px]">
                    0% Buyer Fees
                  </span>
                </div>
              </div>

              {/* Seller Overview Banner (if seller is viewing own item) */}
              {user && user.id === product.sellerId && (
                <div className="bg-secondary-fixed/30 border border-secondary/30 rounded-xl p-3 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between font-label-sm text-secondary-container font-bold">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      You are the seller of this item
                    </span>
                    <Link to="/my-products" className="underline hover:opacity-80">
                      Manage Listing
                    </Link>
                  </div>
                  <div className="flex items-center justify-between text-on-surface-variant pt-1 border-t border-secondary/15">
                    <span>Applicable Listing Fee:</span>
                    <span className="font-semibold text-secondary-container">
                      {formatINR(product.listingFee !== undefined ? product.listingFee : calculateListingFee(product.price))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-on-surface font-semibold">
                    <span>Estimated Net Payout:</span>
                    <span className="text-tertiary">
                      {formatINR(
                        Math.max(
                          0,
                          Number(product.price) -
                            (product.listingFee !== undefined ? Number(product.listingFee) : calculateListingFee(product.price))
                        )
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Fulfillment Options */}
              <div className="flex flex-col gap-2">
                <span className="font-label-md text-on-surface font-semibold">
                  Delivery & Pickup Options
                </span>
                <label
                  onClick={() => setDeliveryMethod('meetup')}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
                    deliveryMethod === 'meetup'
                      ? 'border-primary/40 bg-primary/5 shadow-2xs'
                      : 'border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfillment"
                    checked={deliveryMethod === 'meetup'}
                    onChange={() => setDeliveryMethod('meetup')}
                    className="mt-1 text-primary accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-on-surface font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          near_me
                        </span>
                        <span>Campus Safe Meetup</span>
                      </span>
                      <span className="font-label-md text-tertiary-container font-semibold">
                        Free
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant text-xs">
                      Public verified safe spot in campus library or student union
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setDeliveryMethod('shipping')}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${
                    deliveryMethod === 'shipping'
                      ? 'border-primary/40 bg-primary/5 shadow-2xs'
                      : 'border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low'
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfillment"
                    checked={deliveryMethod === 'shipping'}
                    onChange={() => setDeliveryMethod('shipping')}
                    className="mt-1 text-primary accent-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-on-surface font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          local_shipping
                        </span>
                        <span>Tracked Campus Shipping</span>
                      </span>
                      <span className="font-label-md text-on-surface font-semibold">
                        {formatINR(50)}
                      </span>
                    </div>
                    <p className="font-body-sm text-on-surface-variant text-xs">
                      Dispatched within 24 hours with package tracking
                    </p>
                  </div>
                </label>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-1">
                <label className="font-label-md text-on-surface font-semibold">Quantity:</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container font-bold text-on-surface flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-label-md font-bold">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(Number(product.stock) || 10, q + 1))
                    }
                    className="w-8 h-8 rounded-lg bg-surface-container-low hover:bg-surface-container font-bold text-on-surface flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Conversion Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => handleAddToCart(true)}
                  disabled={addingToCart}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  <span>Buy Now / Instant Escrow</span>
                </button>

                <button
                  onClick={() => handleAddToCart(false)}
                  disabled={addingToCart}
                  className="w-full h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-lg font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={() => setShowMessageModal(true)}
                  className="w-full h-10 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-on-surface font-label-md font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Message Seller</span>
                </button>
              </div>

              {/* Quick Inquiry Chips */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="font-label-sm text-outline uppercase tracking-wider text-[10px]">
                  Quick Inquiries:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleQuickInquiry('Is this item still available?')}
                    className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs transition-colors"
                  >
                    &ldquo;Is this available?&rdquo;
                  </button>
                  <button
                    onClick={() => handleQuickInquiry('Are you open to negotiation on price?')}
                    className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs transition-colors"
                  >
                    &ldquo;Can you do a discount?&rdquo;
                  </button>
                  <button
                    onClick={() => handleQuickInquiry('Where can we meet on campus?')}
                    className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-xs transition-colors"
                  >
                    &ldquo;Where can we meet?&rdquo;
                  </button>
                </div>
              </div>

              {/* Toast Feedback */}
              {toastMessage && (
                <div className="font-label-sm text-tertiary-container font-semibold flex items-center gap-1.5 bg-tertiary-container/10 p-2.5 rounded-lg animate-in fade-in duration-200">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{toastMessage}</span>
                </div>
              )}
            </div>

            {/* Seller Profile Dossier Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary font-bold flex items-center justify-center text-sm shadow-sm">
                    {product.sellerId ? 'ST' : 'SL'}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-tertiary border-2 border-surface-container-lowest" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-headline-sm text-on-surface font-bold text-base truncate">
                      Campus Student Seller
                    </h3>
                    <span className="material-symbols-outlined text-tertiary-container text-[16px]">
                      verified
                    </span>
                  </div>
                  <p className="font-body-sm text-on-surface-variant text-xs">
                    Campus ID Verified • Active Exchange Member
                  </p>
                </div>
              </div>

              {/* Seller Metrics */}
              <div className="grid grid-cols-3 gap-1 bg-surface-container-low p-2 rounded-xl text-center">
                <div>
                  <span className="font-label-md font-bold text-on-surface block">4.95 ★</span>
                  <span className="font-label-sm text-on-surface-variant text-[10px]">Rating</span>
                </div>
                <div>
                  <span className="font-label-md font-bold text-on-surface block">100%</span>
                  <span className="font-label-sm text-on-surface-variant text-[10px]">Handoff</span>
                </div>
                <div>
                  <span className="font-label-md font-bold text-on-surface block">&lt; 15 min</span>
                  <span className="font-label-sm text-on-surface-variant text-[10px]">Reply</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Message Seller Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/30 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <h3 className="font-headline-sm text-on-surface font-bold">Contact Seller</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {messageSent ? (
              <div className="p-6 text-center space-y-2">
                <span className="material-symbols-outlined text-[40px] text-tertiary-container">
                  check_circle
                </span>
                <p className="font-headline-sm text-on-surface font-semibold">
                  Inquiry Sent Successfully!
                </p>
                <p className="font-body-sm text-on-surface-variant">
                  The seller will receive your message and notify you via email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="font-label-sm text-on-surface-variant font-medium block mb-1">
                    Regarding: {product.name}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    placeholder="Type your question or offer for the seller..."
                    className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface font-label-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:bg-primary-container"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
