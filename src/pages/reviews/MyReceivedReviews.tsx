import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faUser, 
  faArrowLeft,
  faExclamationTriangle,
  faCalendarAlt,
  faFilter,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/_reviews.scss';

interface User {
  id: number;
  name: string;
  profile_photo?: string;
  email?: string;
}

interface Review {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  delivery_request_id: number;
  trip_id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: User;
}

const MyReceivedReviews: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('/api/my-received-reviews');
        
        console.log('API Response:', response.data);
        
        // Handle different response formats
        if (response.data) {
          let reviewsData = [];
          
          // Case 1: Direct array of reviews
          if (Array.isArray(response.data)) {
            reviewsData = response.data;
          } 
          // Case 2: Reviews in data property (standard Laravel API format)
          else if (response.data.data) {
            // Case 2a: data property is directly an array
            if (Array.isArray(response.data.data)) {
              reviewsData = response.data.data;
            } 
            // Case 2b: Paginated response (data.data is an array)
            else if (response.data.data.data && Array.isArray(response.data.data.data)) {
              reviewsData = response.data.data.data;
            }
          }
          // Case 3: Success status with reviews in 'reviews' property
          else if (response.data.success === true && response.data.reviews) {
            if (Array.isArray(response.data.reviews)) {
              reviewsData = response.data.reviews;
            } else if (response.data.reviews.data && Array.isArray(response.data.reviews.data)) {
              reviewsData = response.data.reviews.data;
            }
          }
          
          console.log('Extracted reviews:', reviewsData);
          
          if (Array.isArray(reviewsData)) {
            setReviews(reviewsData);
            setError(null);
          } else {
            console.error('Failed to extract reviews array from response');
            setError('Failed to load reviews: Invalid data format');
          }
        } else {
          setError('Failed to load reviews: No data received');
        }
      } catch (err: any) {
        console.error('Error fetching reviews:', err);
        setError(`Error loading reviews: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchReviews();
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const handleSortChange = (order: 'newest' | 'oldest' | 'highest' | 'lowest') => {
    setSortOrder(order);
    setDropdownOpen(false);
    
    let sortedReviews = [...reviews];
    
    switch (order) {
      case 'newest':
        sortedReviews.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'oldest':
        sortedReviews.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      case 'highest':
        sortedReviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sortedReviews.sort((a, b) => a.rating - b.rating);
        break;
      default:
        break;
    }
    
    setReviews(sortedReviews);
  };
  
  if (loading) {
    return (
      <div className="reviews-container">
        <h1>
          <FontAwesomeIcon icon={faStar} /> Reviews You've Received
        </h1>
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </div>
    );
  }
  
  const getSortLabel = () => {
    switch (sortOrder) {
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'highest': return 'Highest Rating';
      case 'lowest': return 'Lowest Rating';
      default: return 'Sort By';
    }
  };
  
  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h1>
          <FontAwesomeIcon icon={faStar} /> Reviews You've Received
        </h1>
        
        <div className="custom-dropdown" ref={dropdownRef}>
          <button 
            className="dropdown-toggle-btn" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            disabled={!Array.isArray(reviews) || reviews.length === 0}
          >
            <FontAwesomeIcon icon={faFilter} /> {getSortLabel()}
            <FontAwesomeIcon icon={faChevronDown} className="chevron-icon" />
          </button>
          
          {dropdownOpen && (
            <div className="custom-dropdown-menu">
              <button 
                className={`dropdown-item ${sortOrder === 'newest' ? 'active' : ''}`}
                onClick={() => handleSortChange('newest')}
              >
                Newest First
              </button>
              <button 
                className={`dropdown-item ${sortOrder === 'oldest' ? 'active' : ''}`}
                onClick={() => handleSortChange('oldest')}
              >
                Oldest First
              </button>
              <button 
                className={`dropdown-item ${sortOrder === 'highest' ? 'active' : ''}`}
                onClick={() => handleSortChange('highest')}
              >
                Highest Rating
              </button>
              <button 
                className={`dropdown-item ${sortOrder === 'lowest' ? 'active' : ''}`}
                onClick={() => handleSortChange('lowest')}
              >
                Lowest Rating
              </button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
          <button 
            className="btn btn-sm btn-outline-danger refresh-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}
      
      <div className="reviews-list">
        {!Array.isArray(reviews) ? (
          <div className="data-error">
            <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
            <h3>Data Error</h3>
            <p>Unable to load reviews data properly. This might be a temporary issue.</p>
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="no-reviews">
            <p>You haven't received any reviews yet.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.reviewer && review.reviewer.profile_photo ? (
                      <img src={review.reviewer.profile_photo} alt={review.reviewer.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                    )}
                  </div>
                  <div className="reviewer-details">
                    <h3>{review.reviewer ? review.reviewer.name : 'Unknown User'}</h3>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyReceivedReviews; 