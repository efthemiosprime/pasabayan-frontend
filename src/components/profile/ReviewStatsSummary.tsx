import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faChartBar, faComment, faTrophy } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../styles/pages/_reviews.scss';

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ReviewStatsSummaryProps {
  userId: number;
}

const ReviewStatsSummary: React.FC<ReviewStatsSummaryProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  
  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`/api/users/${userId}/review-stats`);
        
        if (response.data.success) {
          setStats(response.data.stats);
          setError(null);
        } else {
          setError('Failed to load review statistics');
        }
      } catch (err: any) {
        console.error('Error fetching review stats:', err);
        setError('Error loading review statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviewStats();
  }, [userId]);
  
  if (loading) {
    return (
      <div className="review-stats-summary">
        <div className="card-loader">
          <div className="loader"></div>
        </div>
      </div>
    );
  }
  
  if (error || !stats) {
    return null;
  }
  
  // Calculate percentage for rating distribution bar
  const calculatePercentage = (count: number) => {
    if (stats.totalReviews === 0) return 0;
    return (count / stats.totalReviews) * 100;
  };
  
  return (
    <div className="review-stats-summary">
      <div className="review-stats-header">
        <h3>
          <FontAwesomeIcon icon={faChartBar} /> Review Statistics
        </h3>
        <Link to={`/users/${userId}/reviews`} className="view-all-link">
          View all reviews
        </Link>
      </div>
      
      <div className="review-stats-content">
        <div className="review-stats-summary-row">
          <div className="stats-card">
            <div className="stats-icon">
              <FontAwesomeIcon icon={faStar} />
            </div>
            <div className="stats-details">
              <div className="stats-value">{stats.averageRating.toFixed(1)}</div>
              <div className="stats-label">Average Rating</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon">
              <FontAwesomeIcon icon={faComment} />
            </div>
            <div className="stats-details">
              <div className="stats-value">{stats.totalReviews}</div>
              <div className="stats-label">Total Reviews</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon">
              <FontAwesomeIcon icon={faTrophy} />
            </div>
            <div className="stats-details">
              <div className="stats-value">{stats.ratingDistribution[5]}</div>
              <div className="stats-label">5-Star Reviews</div>
            </div>
          </div>
        </div>
        
        <div className="rating-distribution">
          <h4>Rating Distribution</h4>
          
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="rating-bar-container">
              <div className="rating-label">
                {rating} <FontAwesomeIcon icon={faStar} />
              </div>
              <div className="rating-bar">
                <div 
                  className="rating-fill"
                  style={{ width: `${calculatePercentage(stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution])}%` }}
                ></div>
              </div>
              <div className="rating-count">
                {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewStatsSummary; 