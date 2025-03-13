import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faUser, 
  faArrowLeft, 
  faPaperPlane,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/_reviews.scss';

interface User {
  id: number;
  name: string;
  profile_photo?: string;
  email: string;
  rating?: number;
}

const CreateReview: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reviewee, setReviewee] = useState<User | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  
  // Parse query parameters
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    const id = params.get('id');
    const reqId = params.get('request_id');
    
    if (!type || !id || !reqId) {
      setError('Missing required parameters');
      setLoading(false);
      return;
    }
    
    setRequestId(reqId);
    
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${id}`);
        
        if (response.data.success) {
          setReviewee(response.data.user);
          setError(null);
        } else {
          setError('Failed to load user details');
        }
      } catch (err: any) {
        console.error('Error fetching user details:', err);
        setError('Error loading user details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [isAuthenticated, location.search, navigate]);
  
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Please provide a comment for your review');
      return;
    }
    
    if (!reviewee || !requestId) {
      setError('Missing required information');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await axios.post('/api/reviews', {
        reviewee_id: reviewee.id,
        delivery_request_id: requestId,
        rating,
        comment
      });
      
      if (response.data.success) {
        setSuccess(true);
        // Clear form
        setComment('');
        setRating(5);
      } else {
        setError('Failed to submit review. Please try again.');
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      
      if (err.response && err.response.status === 422) {
        // Validation error
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join('. '));
      } else {
        setError('Error submitting review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="review-container">
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="review-container">
      <div className="review-header">
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-link back-button"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h1>
          <FontAwesomeIcon icon={faStar} /> Write a Review
        </h1>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {error}
        </div>
      )}
      
      {success ? (
        <div className="review-success">
          <div className="success-icon">
            <FontAwesomeIcon icon={faStar} />
          </div>
          <h2>Review Submitted Successfully!</h2>
          <p>Thank you for your feedback. Your review helps build trust in our community.</p>
          <div className="success-actions">
            <button 
              onClick={() => navigate('/requests')} 
              className="btn btn-primary"
            >
              Go to My Requests
            </button>
          </div>
        </div>
      ) : (
        <div className="review-form-container">
          {reviewee && (
            <div className="reviewee-info">
              <div className="reviewee-avatar">
                {reviewee.profile_photo ? (
                  <img src={reviewee.profile_photo} alt={reviewee.name} />
                ) : (
                  <div className="avatar-placeholder">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
              </div>
              <div className="reviewee-details">
                <h2>Reviewing {reviewee.name}</h2>
                {reviewee.rating !== undefined && (
                  <div className="current-rating">
                    <span className="stars">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={i < Math.round(reviewee.rating || 0) ? 'filled' : ''}
                        />
                      ))}
                    </span>
                    <span className="rating-text">
                      {reviewee.rating.toFixed(1)} current rating
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-group rating-group">
              <label>Your Rating</label>
              <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={`star-btn ${i < rating ? 'active' : ''}`}
                    onClick={() => handleRatingChange(i + 1)}
                  >
                    <FontAwesomeIcon icon={faStar} />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="comment">Your Review</label>
              <textarea
                id="comment"
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this user..."
                className="form-control"
                required
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-outline-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateReview; 