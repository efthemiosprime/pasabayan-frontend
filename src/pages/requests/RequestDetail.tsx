import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faBox, 
  faMapMarkerAlt, 
  faCalendarAlt, 
  faClock,
  faTimes,
  faUser,
  faCheck,
  faTruck,
  faMoneyBill,
  faComment,
  faExclamationTriangle,
  faPaperPlane,
  faWeight,
  faStar
} from '@fortawesome/free-solid-svg-icons';

interface DeliveryRequest {
  id: number;
  trip_id: number;
  sender_id: number;
  package_description?: string;
  item_description?: string;
  pickup_location: string;
  delivery_location?: string;
  dropoff_location?: string;
  package_size: number | string;
  package_weight?: number;
  special_instructions?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  delivery_date?: string;
  estimated_cost?: number;
  urgency?: string;
  trip: {
    id: number;
    traveler_id: number;
    origin: string;
    destination: string;
    travel_date?: string;
    return_date?: string;
    available_capacity?: number;
    traveler: {
      id: number;
      name: string;
      profile_photo?: string;
      email: string;
      phone: string;
      rating?: number;
    }
  }
}

const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/user');
        setIsAuthenticated(true);
      } catch (err) {
        setIsAuthenticated(false);
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Fetch request details
  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/api/requests/${id}`);
        
        if (response.data.success) {
          console.log('API Response:', response.data);
          setRequest(response.data.request);
        } else {
          setError('Failed to load request details. Please try again.');
        }
      } catch (err: any) {
        console.error('Error fetching request details:', err);
        
        if (err.response && err.response.status === 404) {
          setError('Request not found.');
        } else if (err.response && err.response.status === 403) {
          setError('You do not have permission to view this request.');
        } else {
          setError('Failed to load request details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && id) {
      fetchRequestDetails();
    }
  }, [isAuthenticated, id]);
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return 'N/A';
    }
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
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
  
  const openCancelModal = () => {
    setCancelModalOpen(true);
  };
  
  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setCancelReason('');
    setCancelError(null);
  };
  
  const openCompleteModal = () => {
    setCompleteModalOpen(true);
  };
  
  const closeCompleteModal = () => {
    setCompleteModalOpen(false);
    setCompleteError(null);
  };
  
  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      setCancelError('Please provide a reason for cancellation.');
      return;
    }
    
    try {
      setCancelLoading(true);
      setCancelError(null);
      
      const response = await axios.put(`/api/requests/${id}/cancel`, {
        cancellation_reason: cancelReason
      });
      
      if (response.data.success) {
        closeCancelModal();
        // Update the request in state
        setRequest(prev => prev ? { ...prev, status: 'cancelled' } : null);
      } else {
        setCancelError('Failed to cancel the request. Please try again.');
      }
    } catch (err: any) {
      console.error('Error cancelling request:', err);
      setCancelError('Failed to cancel the request. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };
  
  const handleCompleteRequest = async () => {
    try {
      setCompleteLoading(true);
      setCompleteError(null);
      
      const response = await axios.put(`/api/requests/${id}/complete`);
      
      if (response.data.success) {
        closeCompleteModal();
        // Update the request in state
        setRequest(prev => prev ? { ...prev, status: 'completed' } : null);
      } else {
        setCompleteError('Failed to mark the request as completed. Please try again.');
      }
    } catch (err: any) {
      console.error('Error completing request:', err);
      setCompleteError('Failed to mark the request as completed. Please try again.');
    } finally {
      setCompleteLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="request-detail-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading request details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="request-detail-container">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>{error}</p>
          <Link to="/requests" className="btn btn-primary">Back to My Requests</Link>
        </div>
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="request-detail-container">
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <p>Request not found.</p>
          <Link to="/requests" className="btn btn-primary">Back to My Requests</Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="request-detail">
      <div className="request-detail-header">
        <Link to="/requests" className="back-link">
          <FontAwesomeIcon icon={faArrowLeft} className="icon" />
          <span>Back to My Requests</span>
        </Link>
        
        <div className={`request-status ${getStatusClass(request.status)}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </div>
      </div>
      
      <div className="request-detail-content">
        <div className="request-info-panel">
          <div className="panel-section">
            <h2 className="section-title">Request Summary</h2>
            
            <div className="request-item">
              <FontAwesomeIcon icon={faBox} className="icon" />
              <div className="item-content">
                <h3>Package Description</h3>
                <p>{request.package_description || request.item_description || 'No description provided'}</p>
              </div>
            </div>
            
            <div className="request-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
              <div className="item-content">
                <h3>Pickup Location</h3>
                <p>{request.pickup_location}</p>
              </div>
            </div>
            
            <div className="request-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
              <div className="item-content">
                <h3>Delivery Location</h3>
                <p>{request.delivery_location || request.dropoff_location || 'No delivery location provided'}</p>
              </div>
            </div>
            
            <div className="request-item">
              <FontAwesomeIcon icon={faMoneyBill} className="icon" />
              <div className="item-content">
                <h3>Package Size</h3>
                <p>{typeof request.package_size === 'number' ? `${request.package_size} kg` : request.package_size}</p>
              </div>
            </div>
            
            {request.package_weight && (
              <div className="request-item">
                <FontAwesomeIcon icon={faWeight} className="icon" />
                <div className="item-content">
                  <h3>Package Weight</h3>
                  <p>{request.package_weight} kg</p>
                </div>
              </div>
            )}
            
            {request.special_instructions && (
              <div className="request-item">
                <FontAwesomeIcon icon={faComment} className="icon" />
                <div className="item-content">
                  <h3>Special Instructions</h3>
                  <p>{request.special_instructions}</p>
                </div>
              </div>
            )}
            
            <div className="request-item">
              <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
              <div className="item-content">
                <h3>Request Date</h3>
                <p>{request.created_at ? formatDate(request.created_at) : 'N/A'}</p>
              </div>
            </div>
            
            {request.delivery_date && (
              <div className="request-item">
                <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
                <div className="item-content">
                  <h3>Delivery Date</h3>
                  <p>{formatDate(request.delivery_date)}</p>
                </div>
              </div>
            )}
            
            {request.estimated_cost && (
              <div className="request-item">
                <FontAwesomeIcon icon={faMoneyBill} className="icon" />
                <div className="item-content">
                  <h3>Estimated Cost</h3>
                  <p>${request.estimated_cost.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="panel-section">
            <h2 className="section-title">Route Details</h2>
            
            <div className="request-route">
              <div className="route-stop">
                <div className="stop-icon pickup">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div className="stop-details">
                  <h3>Pickup Location</h3>
                  <p>{request.pickup_location}</p>
                </div>
              </div>
              
              <div className="route-line"></div>
              
              <div className="route-stop">
                <div className="stop-icon delivery">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                </div>
                <div className="stop-details">
                  <h3>Delivery Location</h3>
                  <p>{request.delivery_location}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="panel-section">
            <h2 className="section-title">Trip Details</h2>
            
            <div className="trip-details-card">
              <h3 className="card-title">Trip Details</h3>
              
              {request.trip ? (
                <>
                  <div className="trip-info">
                    <div className="trip-route">
                      <div className="route-origin">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
                        <span>{request.trip.origin}</span>
                      </div>
                      <div className="route-separator">→</div>
                      <div className="route-destination">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="icon" />
                        <span>{request.trip.destination}</span>
                      </div>
                    </div>
                    
                    <div className="trip-dates">
                      <div className="date-item">
                        <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
                        <div>
                          <span className="date-label">Travel Date</span>
                          <span className="date-value">{request.trip.travel_date ? formatDate(request.trip.travel_date) : 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="date-item">
                        <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
                        <div>
                          <span className="date-label">Return Date</span>
                          <span className="date-value">{request.trip.return_date ? formatDate(request.trip.return_date) : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="trip-capacity">
                    <FontAwesomeIcon icon={faBox} className="icon" />
                    <div>
                      <span className="capacity-label">Available Capacity</span>
                      <span className="capacity-value">{request.trip.available_capacity || 'N/A'} kg</span>
                    </div>
                  </div>
                  
                  <Link to={`/trips/${request.trip_id}`} className="btn btn-outline btn-sm">
                    View Trip Details
                  </Link>
                </>
              ) : (
                <div className="trip-not-found">
                  <p>Trip details are not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="traveler-panel">
          <h2 className="section-title">Traveler Information</h2>
          
          {request.trip && request.trip.traveler ? (
            <div className="traveler-profile">
              <div className="traveler-avatar">
                {request.trip.traveler.profile_photo ? (
                  <img src={request.trip.traveler.profile_photo} alt={request.trip.traveler.name} />
                ) : (
                  <div className="avatar-placeholder">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
              </div>
              
              <div className="traveler-name">
                {request.trip.traveler.name}
              </div>
              
              {request.trip.traveler.rating && (
                <div className="traveler-rating">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i}
                      className={`fa fa-star ${i < Math.round(request.trip.traveler.rating || 0) ? 'filled' : ''}`}
                    >★</span>
                  ))}
                  <span className="rating-value">{request.trip.traveler.rating.toFixed(1)}</span>
                </div>
              )}
              
              <div className="traveler-contact">
                <div className="contact-item">
                  <FontAwesomeIcon icon={faUser} />
                  <span>{request.trip.traveler.email}</span>
                </div>
                {request.trip.traveler.phone && (
                  <div className="contact-item">
                    <FontAwesomeIcon icon={faUser} />
                    <span>{request.trip.traveler.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="traveler-not-found">
              <p>Traveler information is not available</p>
            </div>
          )}
          
          <div className="request-timeline">
            <h3>Request Timeline</h3>
            
            <div className="timeline">
              <div className={`timeline-item ${request.status === 'pending' || request.status === 'accepted' || request.status === 'rejected' || request.status === 'completed' || request.status === 'cancelled' ? 'completed' : ''}`}>
                <div className="timeline-icon">
                  <FontAwesomeIcon icon={faPaperPlane} />
                </div>
                <div className="timeline-content">
                  <h4>Request Submitted</h4>
                  <p>{request.created_at ? formatDate(request.created_at) : 'N/A'}</p>
                </div>
              </div>
              
              {(request.status === 'accepted' || request.status === 'completed') && (
                <div className="timeline-item completed">
                  <div className="timeline-icon">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <div className="timeline-content">
                    <h4>Request Accepted</h4>
                    <p>The traveler has accepted your request</p>
                  </div>
                </div>
              )}
              
              {request.status === 'rejected' && (
                <div className="timeline-item completed">
                  <div className="timeline-icon">
                    <FontAwesomeIcon icon={faTimes} />
                  </div>
                  <div className="timeline-content">
                    <h4>Request Rejected</h4>
                    <p>The traveler has rejected your request</p>
                  </div>
                </div>
              )}
              
              {request.status === 'cancelled' && (
                <div className="timeline-item completed">
                  <div className="timeline-icon">
                    <FontAwesomeIcon icon={faTimes} />
                  </div>
                  <div className="timeline-content">
                    <h4>Request Cancelled</h4>
                    <p>You cancelled this request</p>
                  </div>
                </div>
              )}
              
              {request.status === 'completed' && (
                <div className="timeline-item completed">
                  <div className="timeline-icon">
                    <FontAwesomeIcon icon={faCheck} />
                  </div>
                  <div className="timeline-content">
                    <h4>Delivery Completed</h4>
                    <p>Your item has been delivered</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="request-detail-actions">
        {request.status === 'pending' && (
          <button 
            className="btn btn-danger" 
            onClick={openCancelModal}
          >
            <FontAwesomeIcon icon={faTimes} />
            <span>Cancel Request</span>
          </button>
        )}
        
        {request.status === 'accepted' && (
          <button 
            className="btn btn-success" 
            onClick={openCompleteModal}
          >
            <FontAwesomeIcon icon={faCheck} />
            <span>Mark as Received</span>
          </button>
        )}
        
        {request.status === 'completed' && (
          <Link 
            className="btn btn-outline-primary"
            to={`/review/create?type=traveler&id=${request.trip && request.trip.traveler ? request.trip.traveler.id : ''}&request_id=${request.id}`}
          >
            <FontAwesomeIcon icon={faStar} /> Review Traveler
          </Link>
        )}
      </div>
      
      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Cancel Delivery Request</h3>
              <button className="modal-close" onClick={closeCancelModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to cancel this delivery request?</p>
              
              <div className="form-group">
                <label htmlFor="cancelReason">Reason for cancellation</label>
                <textarea 
                  id="cancelReason"
                  className={`form-control ${cancelError ? 'is-invalid' : ''}`}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Please explain why you're cancelling this request"
                ></textarea>
                {cancelError && <div className="invalid-feedback">{cancelError}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={closeCancelModal}
                disabled={cancelLoading}
              >
                Keep Request
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleCancelRequest}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Complete Modal */}
      {completeModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Mark Delivery as Received</h3>
              <button className="modal-close" onClick={closeCompleteModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to mark this delivery as received?</p>
              <p className="info-text">This action cannot be undone and will complete the delivery process.</p>
              
              {completeError && <div className="alert alert-danger">{completeError}</div>}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline" 
                onClick={closeCompleteModal}
                disabled={completeLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success" 
                onClick={handleCompleteRequest}
                disabled={completeLoading}
              >
                {completeLoading ? 'Processing...' : 'Confirm Receipt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestDetail; 