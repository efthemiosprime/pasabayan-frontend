import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faUser, 
  faArrowLeft,
  faExclamationTriangle,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/_reviews.scss';

interface User {
  id: number;
  name: string;
  profile_photo?: string;
  email?: string;
  rating?: number;
  role?: string;
}

interface Review {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  delivery_request_id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: User;
}

const UserReviews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  
  useEffect(() => {
    const fetchUserAndReviews = async () => {
      try {
        setLoading(true);
        
        // Fetch user details
        const userResponse = await axios.get(`/api/users/${id}`);
        
        if (!userResponse.data.success) {
          setError('Failed to load user information');
          return;
        }
        
        setUserProfile(userResponse.data.user);
        
        // Fetch user's reviews
        const reviewsResponse = await axios.get(`/api/users/${id}/reviews`);
        
        if (reviewsResponse.data.success) {
          setReviews(reviewsResponse.data.reviews);
          setError(null);
        } else {
          setError('Failed to load reviews');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Error loading data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchUserAndReviews();
    }
  }, [id]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  if (loading) {
    return (
      <div className="reviews-container">
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <Link to="/users" className="btn btn-link back-button">
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </Link>
        <h1>
          <FontAwesomeIcon icon={faStar} /> User Reviews
        </h1>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {error}
        </div>
      )}
      
      {userProfile && (
        <div className="user-profile-card">
          <div className="user-avatar">
            {userProfile.profile_photo ? (
              <img src={userProfile.profile_photo} alt={userProfile.name} />
            ) : (
              <div className="avatar-placeholder">
                <FontAwesomeIcon icon={faUser} />
              </div>
            )}
          </div>
          <div className="user-details">
            <h2>{userProfile.name}</h2>
            <div className="user-role">
              {userProfile.role === 'traveler' ? 'Traveler' : 'Sender'}
            </div>
            
            {userProfile.rating !== undefined && (
              <div className="user-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon 
                      key={i} 
                      icon={faStar}
                      className={i < Math.round(userProfile.rating || 0) ? 'filled' : ''}
                    />
                  ))}
                </div>
                <span className="rating-text">
                  {userProfile.rating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="reviews-list">
        <h2>Reviews ({reviews.length})</h2>
        
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>This user hasn't received any reviews yet.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.reviewer.profile_photo ? (
                      <img src={review.reviewer.profile_photo} alt={review.reviewer.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                  </div>
                  <div className="reviewer-details">
                    <h3>{review.reviewer.name}</h3>
                    <div className="review-date">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="review-rating">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon 
                      key={i} 
                      icon={faStar}
                      className={i < review.rating ? 'filled' : ''}
                    />
                  ))}
                </div>
              </div>
              <div className="review-content">
                <p>{review.comment}</p>
              </div>
              
              {isAuthenticated && user && user.id === review.reviewer_id && (
                <div className="review-actions">
                  <Link 
                    to={`/reviews/${review.id}/edit`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    Edit Review
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserReviews; 