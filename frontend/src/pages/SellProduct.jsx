import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { formatINR, calculateListingFee } from '../utils/currency';

const CATEGORIES = [
  'Textbooks',
  'Electronics',
  'Cameras & Audio',
  'Furniture',
  'Collectibles',
  'Gaming',
  'Fashion',
  'Clothing',
  'Sports',
  'Other'
];

const CONDITIONS = [
  {
    title: 'Brand New',
    desc: 'Unopened original packaging, never used',
  },
  {
    title: 'Like New',
    desc: 'Pristine condition, no visible flaws or scratches',
  },
  {
    title: 'Good',
    desc: 'Minor cosmetic wear, 100% fully functional',
  },
  {
    title: 'Fair',
    desc: 'Noticeable signs of usage, still works well',
  },
];

const SellProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Textbooks',
    image: '',
    stock: '1',
    condition: 'Like New',
    acceptOffers: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removePhoto = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const calculateProgress = () => {
    let score = 0;
    if (imageFile || formData.image) score += 25;
    if (formData.name.trim().length >= 5) score += 25;
    if (formData.description.trim().length >= 10) score += 25;
    if (formData.price && Number(formData.price) > 0) score += 25;
    return score;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide a listing title.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    try {
      setLoading(true);

      if (imageFile) {
        const fd = new FormData();
        fd.append('name', formData.name.trim());
        fd.append('description', formData.description.trim());
        fd.append('price', formData.price);
        fd.append('category', formData.category);
        fd.append('stock', formData.stock || '1');
        fd.append('condition', formData.condition);
        if (formData.image) fd.append('image', formData.image);
        fd.append('imageFile', imageFile);

        await axios.post('/api/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('/api/products', {
          ...formData,
          image: formData.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        });
      }

      navigate('/');
    } catch (err) {
      console.error('Error posting listing:', err);
      setError(err.response?.data?.error || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-margin pb-space-xl">
      {/* Header & Breadcrumb */}
      <div className="py-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-outline-variant/20 mb-space-md">
        <div>
          <div className="flex items-center gap-1.5 font-label-sm text-on-surface-variant mb-1">
            <Link to="/" className="hover:text-primary transition-colors">
              Marketplace
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Post a Listing</span>
          </div>
          <h1 className="font-headline-lg text-on-surface">Create a Verified Listing</h1>
          <p className="font-body-md text-on-surface-variant">
            Reach fellow campus students locally or ship securely with Recampus escrow protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-sm text-on-surface">Escrow Protected Listing</span>
          </div>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-space-lg bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm pb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                imageFile || formData.image
                  ? 'bg-tertiary-container text-on-tertiary'
                  : 'bg-primary text-on-primary'
              }`}
            >
              1
            </div>
            <div className="min-w-0">
              <p className="font-label-sm text-on-surface font-semibold truncate">1. Photos</p>
              <p className="font-body-sm text-on-surface-variant text-[11px] truncate">
                Visual proof
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                formData.name.trim().length >= 5
                  ? 'bg-tertiary-container text-on-tertiary'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              2
            </div>
            <div className="min-w-0">
              <p className="font-label-sm text-on-surface font-semibold truncate">2. Details</p>
              <p className="font-body-sm text-on-surface-variant text-[11px] truncate">
                Title & specs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                formData.price
                  ? 'bg-tertiary-container text-on-tertiary'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              3
            </div>
            <div className="min-w-0">
              <p className="font-label-sm text-on-surface font-semibold truncate">3. Pricing</p>
              <p className="font-body-sm text-on-surface-variant text-[11px] truncate">
                Rates & stock
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                progress === 100
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              4
            </div>
            <div className="min-w-0">
              <p className="font-label-sm text-on-surface font-semibold truncate">4. Publish</p>
              <p className="font-body-sm text-on-surface-variant text-[11px] truncate">
                Go live
              </p>
            </div>
          </div>
        </div>

        {/* Progress Track */}
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Grid: 8-col Form + 4-col Guidance Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Form Container (8 Cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 flex flex-col gap-space-lg">
          {error && (
            <div className="p-4 rounded-xl bg-error-container text-on-error-container font-body-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Photos & Media */}
          <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  add_photo_alternate
                </span>
                <h2 className="font-headline-sm text-on-surface">Photos & Media</h2>
              </div>
              <span className="font-label-sm text-primary bg-primary-fixed/60 px-2.5 py-0.5 rounded-full">
                {imageFile ? 'Photo Selected' : 'Optional File'}
              </span>
            </div>

            <p className="font-body-sm text-on-surface-variant">
              Authentic photos build instant confidence with student buyers. Natural daylight and clear angles receive up to 3x more views.
            </p>

            {/* Dropzone Container */}
            {!imagePreview ? (
              <label className="relative bg-surface-container-low rounded-xl p-space-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container transition-all group border-2 border-dashed border-outline-variant/40">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="w-14 h-14 rounded-2xl bg-surface-container-lowest shadow-sm flex items-center justify-center mb-2 text-primary group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                </div>
                <p className="font-label-lg text-on-surface mb-0.5">
                  Click to browse or drag & drop photo
                </p>
                <p className="font-body-sm text-on-surface-variant text-xs">
                  Supports JPEG, PNG, or JPG (up to 10MB)
                </p>
              </label>
            ) : (
              <div className="relative w-48 aspect-square rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/30 group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-primary text-on-primary font-label-sm text-[10px] shadow-xs">
                  Cover Photo
                </span>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-error text-on-error flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            {/* Optional Direct URL Fallback */}
            <div>
              <label className="font-label-sm text-on-surface-variant block mb-1">
                Or enter image URL:
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/product-image.jpg"
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </section>

          {/* Section 2: Item Details */}
          <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">description</span>
              <h2 className="font-headline-sm text-on-surface">Item Details</h2>
            </div>

            {/* Title with Character Counter */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-label-md text-on-surface font-semibold">
                  Listing Title *
                </label>
                <span className="font-label-sm text-on-surface-variant text-xs">
                  {formData.name.length}/80
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={80}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Calculus Early Transcendentals 8th Edition or Sony WH-1000XM5"
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="font-label-md text-on-surface font-semibold block mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Selector Cards */}
            <div>
              <label className="font-label-md text-on-surface font-semibold block mb-2">
                Condition *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                {CONDITIONS.map((cond) => {
                  const isSelected = formData.condition === cond.title;
                  return (
                    <div
                      key={cond.title}
                      onClick={() => setFormData({ ...formData, condition: cond.title })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-2xs'
                          : 'border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-primary bg-primary' : 'border-outline'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface font-semibold">{cond.title}</p>
                        <p className="font-body-sm text-on-surface-variant text-xs">{cond.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="font-label-md text-on-surface font-semibold block mb-1">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Include details on usage, included accessories, edition, warranty, or reasons for selling..."
                className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </section>

          {/* Section 3: Pricing & Logistics */}
          <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
              <h2 className="font-headline-sm text-on-surface">Pricing & Inventory</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1">
                  Asking Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-on-surface-variant font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full h-11 pl-8 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-label-md text-on-surface font-semibold block mb-1">
                  Stock / Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Platform Listing Fee & Estimated Payout Breakdown */}
            {(() => {
              const priceNum = Number(formData.price) || 0;
              const fee = calculateListingFee(priceNum);
              const netPayout = Math.max(0, priceNum - fee);
              return (
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-primary">receipt_long</span>
                      <span className="font-label-md text-on-surface font-bold">Seller Listing Charge</span>
                    </div>
                    <span className="font-headline-sm text-primary font-bold">
                      {formatINR(fee)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-body-sm text-on-surface-variant">
                    <div className={`p-2 rounded-lg text-center transition-all ${priceNum > 0 && priceNum <= 100 ? 'bg-primary-container text-on-primary font-bold shadow-xs' : 'bg-surface-container'}`}>
                      <span className="block text-[11px]">₹1 – ₹100</span>
                      <strong className="text-sm">₹5</strong>
                    </div>
                    <div className={`p-2 rounded-lg text-center transition-all ${priceNum > 100 && priceNum <= 500 ? 'bg-primary-container text-on-primary font-bold shadow-xs' : 'bg-surface-container'}`}>
                      <span className="block text-[11px]">₹101 – ₹500</span>
                      <strong className="text-sm">₹10</strong>
                    </div>
                    <div className={`p-2 rounded-lg text-center transition-all ${priceNum > 500 && priceNum <= 1000 ? 'bg-primary-container text-on-primary font-bold shadow-xs' : 'bg-surface-container'}`}>
                      <span className="block text-[11px]">₹501 – ₹1,000</span>
                      <strong className="text-sm">₹25</strong>
                    </div>
                    <div className={`p-2 rounded-lg text-center transition-all ${priceNum > 1000 ? 'bg-primary-container text-on-primary font-bold shadow-xs' : 'bg-surface-container'}`}>
                      <span className="block text-[11px]">&gt; ₹1,000</span>
                      <strong className="text-sm">₹50 + ₹2/500₹</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs font-body-sm">
                    <span className="text-on-surface-variant">Estimated Net Payout upon sale:</span>
                    <span className="font-headline-sm text-tertiary-container font-bold text-sm">
                      {formatINR(netPayout)}
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Accept Offers Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
              <div>
                <span className="font-label-md text-on-surface font-semibold block">
                  Allow Buyer Negotiations
                </span>
                <span className="font-body-sm text-on-surface-variant text-xs">
                  Buyers can make custom offers below your asking price
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, acceptOffers: !formData.acceptOffers })
                }
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  formData.acceptOffers ? 'bg-primary' : 'bg-surface-container-highest'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    formData.acceptOffers ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Submit Action CTA */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-surface-container-low text-on-surface font-label-md hover:bg-surface-container"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                {loading ? 'progress_activity' : 'publish'}
              </span>
              <span>{loading ? 'Publishing...' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>

        {/* Sidebar Guidance Canvas (4 Cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-space-md">
          {/* Fee Schedule Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/20 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[22px]">price_change</span>
              <h3 className="font-headline-sm text-base">Listing Fee Schedule</h3>
            </div>
            <p className="font-body-sm text-on-surface-variant text-xs">
              Transparent, tiered listing charges supporting campus ID security and escrow buyer protection:
            </p>
            <div className="space-y-1.5 text-xs font-body-sm text-on-surface">
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span>₹1 – ₹100</span>
                <span className="font-bold text-primary">₹5</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span>₹101 – ₹500</span>
                <span className="font-bold text-primary">₹10</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span>₹501 – ₹1,000</span>
                <span className="font-bold text-primary">₹25</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Above ₹1,000</span>
                <span className="font-bold text-primary">₹50 + ₹2 / ₹500</span>
              </div>
            </div>
          </div>

          {/* Seller Protection Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/20 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-[22px]">shield</span>
              <h3 className="font-headline-sm text-base">Recampus Seller Safety</h3>
            </div>
            <p className="font-body-sm text-on-surface-variant">
              When a buyer purchases your item, the money is placed into secure escrow before you meet or ship. You are 100% protected against buyer chargebacks and fake payments.
            </p>
            <div className="pt-2 border-t border-outline-variant/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-label-sm text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-tertiary">
                  check
                </span>
                <span>Verified Campus Handoff</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-label-sm text-on-surface">
                <span className="material-symbols-outlined text-[16px] text-tertiary">
                  check
                </span>
                <span>Instant Payout Release</span>
              </div>
            </div>
          </div>

          {/* Photography Tips */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-outline-variant/20 space-y-3">
            <div className="flex items-center gap-2 text-secondary">
              <span className="material-symbols-outlined text-[22px]">lightbulb</span>
              <h3 className="font-headline-sm text-base">Tips for Faster Sales</h3>
            </div>
            <ul className="space-y-2 text-xs font-body-sm text-on-surface-variant">
              <li className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary shrink-0 mt-0.5">
                  arrow_right
                </span>
                <span>Use clear, well-lit photos without flash reflections.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary shrink-0 mt-0.5">
                  arrow_right
                </span>
                <span>Highlight any visible blemishes or flaws honestly.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary shrink-0 mt-0.5">
                  arrow_right
                </span>
                <span>Mention textbook edition numbers or model identifiers.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SellProduct;
