import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      
      // Handle different types of errors
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.status === 404) {
          errorMessage = 'No account found with that email address.';
        } else if (err.response.status === 429) {
          errorMessage = 'Too many attempts. Please try again later.';
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h1 className="auth-title">Reset Your Password</h1>
      <p className="auth-subtitle">
        Enter your email address and we'll send you a link to reset your password
      </p>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
      
      {success ? (
        <div className="auth-success-container">
          <div className="alert alert-success">
            <p>We've sent a password reset link to <strong>{email}</strong></p>
            <p>Please check your email and follow the instructions to reset your password.</p>
          </div>
          <div className="auth-footer">
            <Link to="/login" className="btn btn-primary">
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FontAwesomeIcon icon={faEnvelope} /> Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner spinner-sm spinner-border"></span>
                <span className="ml-2">Sending...</span>
              </>
            ) : (
              'Send Reset Link'
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

export default ForgotPassword; 