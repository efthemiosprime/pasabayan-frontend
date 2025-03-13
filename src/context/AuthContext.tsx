import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  rating: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  bio?: string;
  profile_photo?: string;
  is_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, email: string, password: string, password_confirmation: string) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  role: 'sender' | 'traveler';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:8000';
  
  // Add axios response interceptor for 401 errors
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401 && localStorage.getItem('token')) {
        // If we get a 401 error and have a token, it means the token is invalid or expired
        console.log('Authentication token expired or invalid. Clearing token.');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      }
      return Promise.reject(error);
    }
  );
  
  // Add token to headers if it exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    loadUser();
  }, []);

  // Load user data from token
  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      console.log('Loading user data from API endpoint: /api/user');
      const res = await axios.get('/api/user');
      
      // Ensure the user object has all required fields with defaults for missing ones
      const user = res.data.user || {};
      setUser({
        ...user,
        rating: user.rating ?? 0,
        is_verified: user.is_verified ?? false
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with API endpoint: /api/login');
      const res = await axios.post('/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Ensure the user object has all required fields with defaults for missing ones
      const user = res.data.user || {};
      setUser({
        ...user,
        rating: user.rating ?? 0,
        is_verified: user.is_verified ?? false
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Register user
  const register = async (userData: RegisterData) => {
    try {
      console.log('Attempting registration with API endpoint: /api/register');
      const res = await axios.post('/api/register', userData);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // Ensure the user object has all required fields with defaults for missing ones
      const user = res.data.user || {};
      setUser({
        ...user,
        rating: user.rating ?? 0,
        is_verified: user.is_verified ?? false
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      console.log('Attempting logout with API endpoint: /api/logout');
      await axios.post('/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  // Update user profile
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const res = await axios.put('/api/user/profile', userData);
      setUser(res.data.user);
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
      await axios.post('/api/forgot-password', { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (token: string, email: string, password: string, password_confirmation: string) => {
    try {
      await axios.post('/api/reset-password', {
        token,
        email,
        password,
        password_confirmation
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
        forgotPassword,
        resetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 