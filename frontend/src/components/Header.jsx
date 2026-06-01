import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-primary-600">CampusMarket</h1>
            <span className="text-xs text-gray-500">Student Marketplace</span>
          </Link>

          {/* Desktop search (hidden on small screens) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="flex w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for textbooks, electronics, furniture..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition"
              >
                Search
              </button>
            </div>
          </form>

          {/* Desktop nav (hidden on small screens) */}
          <nav className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/my-products"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  My Products
                </Link>
                <Link
                  to="/sell"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sell
                </Link>
                <Link
                  to="/cart"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Cart
                </Link>
                <Link
                  to="/orders"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Orders
                </Link>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">Hi, {user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {/* Hamburger icon */}
              <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div className="md:hidden mt-3 border-t pt-3">
            <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} className="mb-3">
              <div className="flex px-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for textbooks, electronics, furniture..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition"
                >
                  Search
                </button>
              </div>
            </form>

            <nav className="flex flex-col px-2 space-y-2">
              {user ? (
                <>
                  <Link onClick={() => setMobileOpen(false)} to="/my-products" className="px-3 py-2 text-primary-600">My Products</Link>
                  <Link onClick={() => setMobileOpen(false)} to="/sell" className="px-3 py-2 text-primary-600">Sell</Link>
                  <Link onClick={() => setMobileOpen(false)} to="/cart" className="px-3 py-2 text-primary-600">Cart</Link>
                  <Link onClick={() => setMobileOpen(false)} to="/orders" className="px-3 py-2 text-primary-600">Orders</Link>
                  <div className="px-3 py-2 text-gray-700 flex items-center justify-between">
                    <span>Hi, {user.name}</span>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="px-3 py-1 bg-gray-200 rounded">Logout</button>
                  </div>
                </>
              ) : (
                <>
                  <Link onClick={() => setMobileOpen(false)} to="/login" className="px-3 py-2 text-primary-600">Login</Link>
                  <Link onClick={() => setMobileOpen(false)} to="/register" className="px-3 py-2 bg-primary-600 text-white rounded text-center">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

