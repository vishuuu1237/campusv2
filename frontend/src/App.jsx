import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

