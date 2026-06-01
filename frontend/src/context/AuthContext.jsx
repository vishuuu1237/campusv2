import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error ||
        (error.response?.status === 503 ? 'Database connection error. Please check if MongoDB is running.' : '') ||
        (error.response?.status === 0 ? 'Cannot connect to server. Make sure the backend is running on port 2210.' : '') ||
        'Login failed. Please check your credentials and try again.';
      return { success: false, error: errorMessage };
    }
  };

  const loginByPrn = async (name, prn) => {
    try {
      const response = await axios.post('/api/auth/login-prn', { name, prn });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login (PRN) error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials and try again.';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password, studentId) => {
    try {
      const response = await axios.post('/api/auth/register', {
        name,
        email,
        password,
        studentId
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error ||
        (error.response?.status === 503 ? 'Database connection error. Please check if MongoDB is running.' : '') ||
        (error.response?.status === 0 ? 'Cannot connect to server. Make sure the backend is running on port 2210.' : '') ||
        'Registration failed. Please check your information and try again.';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginByPrn, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

