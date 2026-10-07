import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import SellProduct from './pages/SellProduct';
import MyProducts from './pages/MyProducts';
import OrderSuccess from './pages/OrderSuccess';
import RequestReset from './pages/RequestReset';
import ResetPassword from './pages/ResetPassword';

function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-[32px]">travel_explore</span>
      </div>
      <h2 className="font-headline-md text-on-surface">Page Not Found</h2>
      <p className="font-body-md text-on-surface-variant">
        The page you are looking for does not exist on the marketplace.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md"
      >
        <span>Back to Marketplace</span>
      </Link>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col justify-between selection:bg-primary-container selection:text-on-primary">
          <Header />
          <main className="pt-[112px] flex-1 w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/order-success/:id" element={<OrderSuccess />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/request-reset" element={<RequestReset />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/sell" element={<SellProduct />} />
              <Route path="/my-products" element={<MyProducts />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
