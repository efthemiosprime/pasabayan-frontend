import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token') || '';
  const email = queryParams.get('email') || '';

  const [formData, setFormData] = useState({
    token,
    email,
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    password_confirmation?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Update form data if query params change
    setFormData(prevState => ({
      ...prevState,
      token,
      email
    }));
  }, [token, email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Clear the error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.token) {
      newErrors.general = 'Reset token is missing. Please use the link from your email.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword(
        formData.token,
        formData.email,
        formData.password,
        formData.password_confirmation
      );
      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      
      // Handle different types of errors
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && typeof err.response.data === 'object') {
          // Extract validation errors
          const validationErrors = err.response.data;
          const newErrors: typeof errors = {};
          
          Object.entries(validationErrors).forEach(([key, value]) => {
            if (key in formData) {
              newErrors[key as keyof typeof errors] = Array.isArray(value) 
                ? value[0] 
                : String(value);
            }
          });
          
          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsSubmitting(false);
            return;
          }
        } else if (err.response.status === 401) {
          errorMessage = 'Invalid or expired token. Please request a new password reset link.';
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="auth-form-container">
        <h1 className="auth-title">Invalid Reset Link</h1>
        <div className="alert alert-danger">
          <p>The password reset link is invalid or has expired.</p>
          <p>Please request a new password reset link.</p>
        </div>
        <div className="auth-footer">
          <Link to="/forgot-password" className="btn btn-primary">
            Request Password Reset
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-form-container">
      <h1 className="auth-title">Reset Your Password</h1>
      <p className="auth-subtitle">
        Create a new password for your account
      </p>
      
      {errors.general && (
        <div className="alert alert-danger">
          {errors.general}
        </div>
      )}
      
      {success ? (
        <div className="auth-success-container">
          <div className="alert alert-success">
            <p>Your password has been reset successfully!</p>
            <p>You will be redirected to the login page shortly.</p>
          </div>
          <div className="auth-footer">
            <Link to="/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FontAwesomeIcon icon={faLock} /> New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.password && <div className="form-invalid-feedback">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password_confirmation" className="form-label">
              <FontAwesomeIcon icon={faLock} /> Confirm New Password
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              className={`form-control ${errors.password_confirmation ? 'is-invalid' : ''}`}
              placeholder="Confirm your new password"
              value={formData.password_confirmation}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
            {errors.password_confirmation && (
              <div className="form-invalid-feedback">{errors.password_confirmation}</div>
            )}
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner spinner-sm spinner-border"></span>
                <span className="ml-2">Resetting Password...</span>
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}
      
      <div className="auth-footer">
        <Link to="/login" className="auth-link">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword; 