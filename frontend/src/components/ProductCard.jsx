import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatINR } from '../utils/currency';

const ProductCard = ({ product, onAddToCart }) => {
  const [favorited, setFavorited] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorited((prev) => !prev);
  };

  const placeholderImage = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  const imageUrl = (!imgError && product.image) ? product.image : placeholderImage;

  // Derive condition badge label
  const conditionLabel = product.condition || 'Verified Condition';

  // Calculate estimated MSRP comparison for display
  const simulatedMSRP = Math.round(Number(product.price) * 1.35);
  const savingsPct = Math.round(((simulatedMSRP - Number(product.price)) / simulatedMSRP) * 100);

  return (
    <article className="group flex flex-col bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden transform hover:-translate-y-1 border border-outline-variant/20">
      <Link to={`/product/${product.id}`} className="flex flex-col h-full">
        {/* Aspect Ratio 1:1 Image Container */}
        <div className="relative w-full aspect-square bg-surface-container-low overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top-Left Status Pills */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-on-surface font-semibold bg-surface-container-lowest/95 shadow-xs backdrop-blur-md">
              {conditionLabel}
            </span>
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-label-sm bg-tertiary-container text-on-tertiary shadow-xs">
              <span className="material-symbols-outlined text-[12px]">security</span>
              Escrow
            </span>
          </div>

          {/* Top-Right Favorite Heart Button */}
          <button
            onClick={handleFavoriteClick}
            aria-label="Save to favorites"
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-surface-container-lowest/90 hover:bg-surface-container-lowest flex items-center justify-center transition-all shadow-xs z-10 ${
              favorited ? 'text-error' : 'text-on-surface-variant hover:text-error'
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0" }}
            >
              favorite
            </span>
          </button>

          {/* Bottom Location & Time Strip */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-sm">
            <span className="flex items-center gap-1 truncate max-w-[140px]">
              <span className="material-symbols-outlined text-[13px] text-tertiary-fixed shrink-0">
                fmd_good
              </span>
              <span className="truncate">Campus Safe Hub</span>
            </span>
            <span className="shrink-0 text-[11px] text-inverse-on-surface/80">
              {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Verified'}
            </span>
          </div>
        </div>

        {/* Card Body Information */}
        <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-label-sm text-outline uppercase tracking-wider truncate">
                {product.category || 'General'}
              </span>
              <span className="font-label-sm text-on-surface-variant flex items-center gap-0.5 shrink-0">
                <span className="material-symbols-outlined text-secondary text-[14px]">
                  star
                </span>
                <strong>4.9</strong> (12)
              </span>
            </div>

            <h2 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h2>

            <p className="font-body-sm text-on-surface-variant line-clamp-2 mt-0.5 min-h-[36px]">
              {product.description}
            </p>
          </div>

          {/* Price & Seller Verification Row */}
          <div className="pt-2 border-t border-outline-variant/20 flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-headline-md text-headline-md text-primary">
                  {formatINR(product.price)}
                </span>
                {savingsPct > 5 && (
                  <span className="font-body-sm text-outline line-through">
                    {formatINR(simulatedMSRP)}
                  </span>
                )}
              </div>
              <span className="font-label-sm text-tertiary-container font-medium block">
                {savingsPct > 5 ? `Save ${savingsPct}% off retail` : 'Verified Fair Price'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="w-6 h-6 rounded-full bg-surface-container-high text-on-surface text-[10px] font-bold flex items-center justify-center border border-outline-variant/30"
                title="Verified Student Seller"
              >
                ST
              </div>
              <span
                className="material-symbols-outlined text-tertiary-container text-[16px]"
                title="Campus ID Verified"
              >
                verified
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
