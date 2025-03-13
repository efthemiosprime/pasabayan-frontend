import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faPhone, faUserTag } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

interface FormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  role: 'sender' | 'traveler';
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  phone?: string;
  role?: string;
  general?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    role: 'sender'
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.response && err.response.data) {
        // Handle validation errors from backend
        if (err.response.data.errors) {
          const backendErrors: FormErrors = {};
          
          Object.entries(err.response.data.errors).forEach(([key, value]) => {
            backendErrors[key as keyof FormErrors] = Array.isArray(value) 
              ? value[0] as string 
              : value as string;
          });
          
          setErrors(backendErrors);
        } else {
          // General error message
          setErrors({
            general: err.response.data.message || 'Registration failed. Please try again.'
          });
        }
      } else {
        setErrors({
          general: 'Registration failed. Please try again later.'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="auth-form-container">
      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">Join Pasabay today</p>
      
      {errors.general && (
        <div className="alert alert-danger">
          {errors.general}
        </div>
      )}
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            <FontAwesomeIcon icon={faUser} /> Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <div className="form-invalid-feedback">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            <FontAwesomeIcon icon={faEnvelope} /> Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="form-invalid-feedback">{errors.email}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            <FontAwesomeIcon icon={faLock} /> Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {errors.password && <div className="form-invalid-feedback">{errors.password}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password_confirmation" className="form-label">
            <FontAwesomeIcon icon={faLock} /> Confirm Password
          </label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
            placeholder="Confirm your password"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
          />
          {errors.password_confirmation && (
            <div className="form-invalid-feedback">{errors.password_confirmation}</div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            <FontAwesomeIcon icon={faPhone} /> Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <div className="form-invalid-feedback">{errors.phone}</div>}
        </div>
        
        <div className="form-group">
          <label className="form-label">
            <FontAwesomeIcon icon={faUserTag} /> I am a:
          </label>
          <div className="role-selection">
            <div className={`role-option ${formData.role === 'sender' ? 'selected' : ''}`}>
              <input
                type="radio"
                id="role-sender"
                name="role"
                value="sender"
                checked={formData.role === 'sender'}
                onChange={handleChange}
              />
              <label htmlFor="role-sender">Sender</label>
              <p className="role-description">I want to send packages with travelers</p>
            </div>
            
            <div className={`role-option ${formData.role === 'traveler' ? 'selected' : ''}`}>
              <input
                type="radio"
                id="role-traveler"
                name="role"
                value="traveler"
                checked={formData.role === 'traveler'}
                onChange={handleChange}
              />
              <label htmlFor="role-traveler">Traveler</label>
              <p className="role-description">I want to deliver packages while traveling</p>
            </div>
          </div>
          {errors.role && <div className="form-invalid-feedback">{errors.role}</div>}
        </div>
        
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner spinner-sm spinner-border"></span>
              <span className="ml-2">Creating Account...</span>
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>
      
      <div className="auth-footer">
        <p>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 