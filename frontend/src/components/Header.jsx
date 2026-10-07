import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TradeHubLogo from './TradeHubLogo';
import axios from 'axios';

const CATEGORIES = [
  'All',
  'Textbooks',
  'Electronics',
  'Cameras & Audio',
  'Furniture',
  'Collectibles',
  'Gaming',
  'Fashion',
  'Sports',
  'Other'
];

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Sync category & search from URL search params
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All');
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch cart count when user is logged in
  useEffect(() => {
    if (user) {
      axios
        .get('/api/cart')
        .then((res) => {
          const totalQty = (res.data?.items || []).reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
          );
          setCartCount(totalQty);
        })
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [user, location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Shortcut key (Ctrl+K or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    navigate(`/?${params.toString()}`);
    setMobileOpen(false);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    navigate(`/?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="w-full">
        {/* Tier 1: Main Header Bar */}
        <div className="h-16 max-w-[1360px] mx-auto px-4 md:px-margin flex items-center justify-between gap-space-md">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <TradeHubLogo className="h-8" />
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-2xl items-center h-11 bg-surface-container-low rounded-lg px-space-sm gap-space-xs border border-transparent focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all"
          >
            {/* Category Select inside search */}
            <div className="relative flex items-center shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-transparent font-label-md text-on-surface-variant pr-6 pl-1 py-1 focus:outline-none cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-surface text-on-surface">
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-0 pointer-events-none text-on-surface-variant text-[18px]">
                expand_more
              </span>
            </div>

            <div className="h-5 w-[1px] bg-outline-variant shrink-0 mx-space-xs" />

            {/* Search Input */}
            <span className="material-symbols-outlined text-on-surface-variant shrink-0">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verified items, textbooks, electronics..."
              className="w-full bg-transparent font-body-md text-on-surface placeholder:text-outline focus:outline-none px-space-xs"
            />

            {/* Keyboard shortcut hint */}
            <div className="hidden lg:flex items-center shrink-0 px-space-xs py-0.5 rounded bg-surface-container-high font-label-sm text-on-surface-variant">
              ⌘K
            </div>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 font-label-lg text-on-surface-variant">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/' && !searchParams.get('category')
                  ? 'bg-primary-container text-on-primary font-bold'
                  : 'hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              Browse
            </Link>
            <Link
              to="/sell"
              className={`px-3 py-2 rounded-lg transition-colors ${
                location.pathname === '/sell'
                  ? 'bg-primary-container text-on-primary font-bold'
                  : 'hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              Sell
            </Link>
            {user && (
              <>
                <Link
                  to="/my-products"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === '/my-products'
                      ? 'bg-primary-container text-on-primary font-bold'
                      : 'hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  My Listings
                </Link>
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === '/orders'
                      ? 'bg-primary-container text-on-primary font-bold'
                      : 'hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  Orders
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & Auth Controls */}
          <div className="flex items-center gap-space-xs sm:gap-space-sm shrink-0">
            {/* Post Listing CTA Button */}
            <Link
              to="/sell"
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-space-md rounded-lg bg-primary font-label-lg text-on-primary hover:bg-primary-container transition-all shadow-[0_1px_3px_0_rgba(15,23,42,0.05)] active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Post Listing</span>
            </Link>

            {/* Cart Icon Button */}
            <Link
              to="/cart"
              aria-label="Shopping Cart"
              className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary-container text-on-secondary font-label-sm text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Dropdown or Login / Sign Up */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="User menu"
                  className="flex items-center gap-1.5 rounded-full p-1 pl-2 hover:bg-surface-container-low transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center shadow-sm">
                    {user.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      : 'U'}
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    keyboard_arrow_down
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-4 py-2.5 border-b border-outline-variant/20">
                      <p className="font-label-lg text-on-surface font-bold truncate">
                        {user.name}
                      </p>
                      <p className="font-body-sm text-on-surface-variant truncate">
                        {user.email}
                      </p>
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary-container font-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[13px]">
                            verified_user
                          </span>
                          Verified Student
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/sell"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          add_circle
                        </span>
                        Post New Listing
                      </Link>
                      <Link
                        to="/my-products"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          storefront
                        </span>
                        My Listings
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          receipt_long
                        </span>
                        My Orders
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          shopping_bag
                        </span>
                        Cart ({cartCount})
                      </Link>
                    </div>

                    <div className="border-t border-outline-variant/20 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 font-label-md text-error hover:bg-error-container/30 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg font-label-md text-primary hover:bg-surface-container transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-primary font-label-md text-on-primary hover:bg-primary-container transition-colors shadow-xs"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Tier 2: Category & Trust Ribbon */}
        <div className="h-11 max-w-[1360px] mx-auto px-4 md:px-margin flex items-center justify-between border-t border-outline-variant/20 overflow-x-auto gap-space-sm scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0 py-1">
            {CATEGORIES.map((category) => {
              const isActive =
                selectedCategory === category ||
                (category === 'All' && !selectedCategory);
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={`px-3 py-1 rounded-full font-label-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-xs font-bold'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-space-md shrink-0 font-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1 text-tertiary-container font-medium">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Escrow Secured
            </span>
            <span className="flex items-center gap-1 text-secondary font-medium">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              Same-day Handoffs
            </span>
          </div>
        </div>

        {/* Mobile Expandable Drawer Panel */}
        {mobileOpen && (
          <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/30 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="flex-1 flex items-center h-10 bg-surface-container-low rounded-lg px-3 gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings..."
                  className="w-full bg-transparent font-body-md text-on-surface focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 h-10 bg-primary text-on-primary rounded-lg font-label-md"
              >
                Go
              </button>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col gap-1 font-label-md text-on-surface">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">
                  explore
                </span>
                Browse Marketplace
              </Link>
              <Link
                to="/sell"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">
                  add_circle
                </span>
                Sell an Item
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-container"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    shopping_cart
                  </span>
                  Cart
                </div>
                {cartCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
              {user && (
                <>
                  <Link
                    to="/my-products"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      storefront
                    </span>
                    My Listings
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-surface-container"
                  >
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      receipt_long
                    </span>
                    My Orders
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Auth Actions */}
            <div className="pt-3 border-t border-outline-variant/20">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary font-bold text-xs flex items-center justify-center">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface font-semibold">
                        {user.name}
                      </p>
                      <p className="font-body-sm text-on-surface-variant text-xs">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-lg bg-surface-container text-error font-label-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-center font-label-md rounded-lg bg-surface-container text-primary"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-center font-label-md rounded-lg bg-primary text-on-primary font-semibold"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
