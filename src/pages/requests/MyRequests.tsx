import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFilter, 
  faSort, 
  faBox, 
  faMapMarkerAlt, 
  faCalendarAlt, 
  faTimes,
  faEye,
  faCheck,
  faTruck
} from '@fortawesome/free-solid-svg-icons';

interface DeliveryRequest {
  id: number;
  trip_id: number;
  sender_id: number;
  item_description: string;
  pickup_location: string;
  delivery_location: string;
  package_size: number;
  special_instructions?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  trip: {
    id: number;
    traveler_id: number;
    origin: string;
    destination: string;
    departure_date: string;
    arrival_date: string;
    traveler: {
      id: number;
      name: string;
      profile_photo?: string;
    }
  }
}

const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        const response = await axios.get('/api/user');
        console.log('Authentication successful:', response.data);
        setIsAuthenticated(true);
        setUserRole(response.data.role);
      } catch (err) {
        console.error('Authentication failed:', err);
        setIsAuthenticated(false);
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Fetch delivery requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        console.log('Fetching requests with filter:', statusFilter);
        setLoading(true);
        setError(null);
        setAuthError(false);
        
        let url = `/api/my-requests`;
        if (statusFilter !== 'all') {
          url += `?status=${statusFilter}`;
        }
        
        console.log('Making API request to:', url);
        const response = await axios.get(url);
        console.log('API response:', response.data);
        
        if (response.data.success) {
          setRequests(response.data.requests);
          setFilteredRequests(response.data.requests);
        } else {
          setError('Failed to load requests. Please try again.');
        }
      } catch (err: any) {
        console.error('Error fetching requests:', err);
        
        if (err.response && err.response.status === 401 && !isAuthenticated) {
          setAuthError(true);
          setError('You need to be logged in to view your requests.');
        } else {
          setError('Failed to load requests. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchRequests();
    }
  }, [isAuthenticated, statusFilter]);
  
  // Handle filter changes
  useEffect(() => {
    // Apply sorting to requests
    let sorted = [...requests];
    
    if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    
    setFilteredRequests(sorted);
  }, [requests, sortBy]);
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };
  
  const handleSort = (sort: string) => {
    setSortBy(sort);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };
  
  if (loading) {
    return (
      <div className="requests-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your requests...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="requests-container">
        <div className="error-message">
          <FontAwesomeIcon icon={faTimes} />
          <p>{error}</p>
          {authError && (
            <div className="auth-error-actions">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-outline">Register</Link>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="my-requests">
      <div className="requests-header">
        <h1 className="requests-title">My Delivery Requests</h1>
        
        <div className="requests-toolbar">
          <Link to="/requests/create" className="btn btn-primary create-btn">
            <FontAwesomeIcon icon={faBox} className="me-2" />
            Create New Request
          </Link>
          
          <button 
            className={`filter-button ${showFilters ? 'active' : ''}`}
            onClick={toggleFilters}
          >
            <FontAwesomeIcon icon={faFilter} />
            <span>Filter</span>
          </button>
          
          <div className="divider"></div>
          
          <div className="sort-dropdown">
            <button className="sort-button">
              <FontAwesomeIcon icon={faSort} />
              <span>Sort</span>
            </button>
            <div className="sort-panel">
              <div 
                className={`sort-option ${sortBy === 'newest' ? 'active' : ''}`}
                onClick={() => handleSort('newest')}
              >
                Newest first
              </div>
              <div 
                className={`sort-option ${sortBy === 'oldest' ? 'active' : ''}`}
                onClick={() => handleSort('oldest')}
              >
                Oldest first
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {showFilters && (
        <div className="requests-filters">
          <div className="filter-group">
            <h3>Status</h3>
            <div className="filter-options">
              <div 
                className={`filter-option ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('all')}
              >
                All
              </div>
              <div 
                className={`filter-option ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('pending')}
              >
                Pending
              </div>
              <div 
                className={`filter-option ${statusFilter === 'accepted' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('accepted')}
              >
                Accepted
              </div>
              <div 
                className={`filter-option ${statusFilter === 'completed' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('completed')}
              >
                Completed
              </div>
              <div 
                className={`filter-option ${statusFilter === 'rejected' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('rejected')}
              >
                Rejected
              </div>
              <div 
                className={`filter-option ${statusFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => handleStatusFilter('cancelled')}
              >
                Cancelled
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="requests-content">
        {filteredRequests.length === 0 ? (
          <div className="requests-empty">
            <FontAwesomeIcon icon={faBox} size="2x" />
            <h3>No delivery requests found</h3>
            <p>You haven't made any delivery requests yet.</p>
            <Link to="/trips" className="btn btn-primary">Find a Trip</Link>
          </div>
        ) : (
          <div className="requests-list">
            {filteredRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-status">
                  <span className={`status-badge ${getStatusClass(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                
                <div className="request-details">
                  <div className="request-item">
                    <FontAwesomeIcon icon={faBox} className="icon" />
                    <span>{request.item_description}</span>
                  </div>
                  
                  <div className="request-route">
                    <div className="location pickup">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="icon pickup-icon" />
                      <div>
                        <span className="label">Pickup</span>
                        <span className="value">{request.pickup_location}</span>
                      </div>
                    </div>
                    
                    <div className="route-arrow">→</div>
                    
                    <div className="location delivery">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="icon delivery-icon" />
                      <div>
                        <span className="label">Delivery</span>
                        <span className="value">{request.delivery_location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="request-info">
                    <div className="trip-info">
                      <FontAwesomeIcon icon={faTruck} className="icon" />
                      <span>
                        Trip: {request.trip.origin} to {request.trip.destination}
                      </span>
                    </div>
                    
                    <div className="traveler-info">
                      <div className="traveler-avatar">
                        {request.trip.traveler.profile_photo ? (
                          <img src={request.trip.traveler.profile_photo} alt={request.trip.traveler.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {request.trip.traveler.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="traveler-name">{request.trip.traveler.name}</span>
                    </div>
                    
                    <div className="request-date">
                      <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
                      <span>Requested on {formatDate(request.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="request-actions">
                  <Link to={`/requests/${request.id}`} className="btn btn-outline">
                    <FontAwesomeIcon icon={faEye} />
                    <span>View Details</span>
                  </Link>
                  
                  {request.status === 'accepted' && (
                    <button className="btn btn-success">
                      <FontAwesomeIcon icon={faCheck} />
                      <span>Mark as Received</span>
                    </button>
                  )}
                  
                  {request.status === 'pending' && (
                    <button className="btn btn-danger">
                      <FontAwesomeIcon icon={faTimes} />
                      <span>Cancel Request</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests; 