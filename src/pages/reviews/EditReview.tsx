import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faUser, 
  faArrowLeft, 
  faPaperPlane,
  faExclamationTriangle,
  faTrash
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

interface Review {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  delivery_request_id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewee: User;
}

const EditReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    
    const fetchReview = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/reviews/${id}`);
        
        if (response.data.success) {
          const reviewData = response.data.review;
          setReview(reviewData);
          setRating(reviewData.rating);
          setComment(reviewData.comment);
          
          // Check if the current user is the reviewer
          if (user && user.id !== reviewData.reviewer_id) {
            setError('You are not authorized to edit this review');
          } else {
            setError(null);
          }
        } else {
          setError('Failed to load review');
        }
      } catch (err: any) {
        console.error('Error fetching review:', err);
        setError('Error loading review. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReview();
  }, [id, isAuthenticated, navigate, user]);
  
  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Please provide a comment for your review');
      return;
    }
    
    if (!review) {
      setError('Review not found');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await axios.put(`/api/reviews/${id}`, {
        rating,
        comment
      });
      
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError('Failed to update review. Please try again.');
      }
    } catch (err: any) {
      console.error('Error updating review:', err);
      
      if (err.response && err.response.status === 422) {
        // Validation error
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat();
        setError(errorMessages.join('. '));
      } else if (err.response && err.response.status === 403) {
        setError('You are not authorized to edit this review');
      } else {
        setError('Error updating review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    try {
      setDeleting(true);
      
      const response = await axios.delete(`/api/reviews/${id}`);
      
      if (response.data.success) {
        navigate('/profile', { state: { message: 'Review deleted successfully' } });
      } else {
        setError('Failed to delete review');
        setConfirmDelete(false);
      }
    } catch (err: any) {
      console.error('Error deleting review:', err);
      setError('Error deleting review. Please try again.');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
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
          <FontAwesomeIcon icon={faStar} /> Edit Review
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
          <h2>Review Updated Successfully!</h2>
          <p>Your review has been updated.</p>
          <div className="success-actions">
            <button 
              onClick={() => navigate('/profile')} 
              className="btn btn-primary"
            >
              Go to Profile
            </button>
          </div>
        </div>
      ) : (
        <div className="review-form-container">
          {review && review.reviewee && (
            <div className="reviewee-info">
              <div className="reviewee-avatar">
                {review.reviewee.profile_photo ? (
                  <img src={review.reviewee.profile_photo} alt={review.reviewee.name} />
                ) : (
                  <div className="avatar-placeholder">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
              </div>
              <div className="reviewee-details">
                <h2>Reviewing {review.reviewee.name}</h2>
                {review.reviewee.rating !== undefined && (
                  <div className="current-rating">
                    <span className="stars">
                      {[...Array(5)].map((_, i) => (
                        <FontAwesomeIcon
                          key={i}
                          icon={faStar}
                          className={i < Math.round(review.reviewee.rating || 0) ? 'filled' : ''}
                        />
                      ))}
                    </span>
                    <span className="rating-text">
                      {review.reviewee.rating.toFixed(1)} current rating
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
              <div className="left-actions">
                <button 
                  type="button"
                  onClick={handleDelete}
                  className={`btn btn-danger ${confirmDelete ? 'confirm-delete' : ''}`}
                  disabled={submitting || deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner"></span>
                      Deleting...
                    </>
                  ) : confirmDelete ? (
                    'Confirm Delete'
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTrash} />
                      Delete Review
                    </>
                  )}
                </button>
              </div>
              
              <div className="right-actions">
                <button 
                  type="button"
                  onClick={() => navigate(-1)}
                  className="btn btn-outline-secondary"
                  disabled={submitting || deleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || deleting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Update Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EditReview; 