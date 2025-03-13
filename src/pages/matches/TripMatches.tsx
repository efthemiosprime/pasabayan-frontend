import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, 
  faMapMarkerAlt, 
  faCalendarAlt, 
  faUser,
  faCheckCircle,
  faArrowLeft,
  faExclamationTriangle,
  faWeightHanging
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/_matches.scss';

interface DeliveryRequest {
  id: number;
  sender_id: number;
  trip_id: number | null;
  pickup_location: string;
  dropoff_location: string;
  package_size: string;
  package_weight: number;
  package_description: string;
  urgency: 'low' | 'medium' | 'high';
  delivery_date: string;
  status: 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
  estimated_cost: number | null;
  sender: {
    id: number;
    name: string;
    email: string;
    profile_photo: string | null;
    rating: number | null;
  };
}

interface Trip {
  id: number;
  traveler_id: number;
  origin: string;
  destination: string;
  travel_date: string;
  return_date: string;
  available_capacity: number;
  notes: string | null;
  status: 'active' | 'completed' | 'cancelled';
}

const TripMatches: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [matchingRequests, setMatchingRequests] = useState<DeliveryRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchTripDetails();
      fetchMatchingRequests();
    }
  }, [isAuthenticated, id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/trips/${id}`);
      
      if (response.data.success) {
        setTrip(response.data.trip);
      } else {
        setError('Failed to load trip details.');
      }
    } catch (err) {
      console.error('Error fetching trip details:', err);
      setError('Error loading trip details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchingRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/matches/trip/${id}`);
      
      if (response.data.status === 'success') {
        setMatchingRequests(response.data.data.data || []);
      } else {
        setError('Failed to load matching requests.');
      }
    } catch (err) {
      console.error('Error fetching matching requests:', err);
      setError('Error loading matching requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRequest = async (requestId: number) => {
    try {
      setAssigning(requestId);
      const response = await axios.post('/api/matches/assign', {
        trip_id: id,
        request_id: requestId
      });
      
      if (response.data.status === 'success') {
        setAssignSuccess(requestId);
        // Remove the assigned request from the list after a delay
        setTimeout(() => {
          setMatchingRequests(prev => prev.filter(request => request.id !== requestId));
          setAssignSuccess(null);
        }, 2000);
      } else {
        setError('Failed to assign request to trip.');
      }
    } catch (err: any) {
      console.error('Error assigning request:', err);
      const errorMsg = err.response?.data?.message || 'Error assigning request. Please try again.';
      setError(errorMsg);
    } finally {
      setAssigning(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
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

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'urgency-high';
      case 'medium': return 'urgency-medium';
      case 'low': return 'urgency-low';
      default: return '';
    }
  };

  if (loading && !trip && !matchingRequests.length) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <Link to="/trips" className="btn btn-outline">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Trips
        </Link>
        <h1>Matching Delivery Requests</h1>
      </div>

      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      )}

      {trip && (
        <div className="trip-summary">
          <h2>Trip Details</h2>
          <div className="trip-card">
            <div className="trip-route">
              <div className="origin">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{trip.origin}</span>
              </div>
              <div className="route-arrow">→</div>
              <div className="destination">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{trip.destination}</span>
              </div>
            </div>
            <div className="trip-dates">
              <div className="date">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Travel: {formatDate(trip.travel_date)}</span>
              </div>
              <div className="date">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>Return: {formatDate(trip.return_date)}</span>
              </div>
            </div>
            <div className="trip-capacity">
              <FontAwesomeIcon icon={faWeightHanging} />
              <span>Available Capacity: {trip.available_capacity} kg</span>
            </div>
          </div>
        </div>
      )}

      <div className="matches-content">
        <h2>Matching Delivery Requests</h2>
        
        {matchingRequests.length === 0 ? (
          <div className="no-matches">
            <p>No matching delivery requests found for this trip.</p>
          </div>
        ) : (
          <div className="matches-list">
            {matchingRequests.map(request => (
              <div 
                key={request.id} 
                className={`match-card ${assignSuccess === request.id ? 'assigned' : ''}`}
              >
                <div className="match-header">
                  <div className="sender-info">
                    <div className="sender-avatar">
                      {request.sender.profile_photo ? (
                        <img src={request.sender.profile_photo} alt={request.sender.name} />
                      ) : (
                        <div className="avatar-placeholder">
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                      )}
                    </div>
                    <div className="sender-details">
                      <h3>{request.sender.name}</h3>
                      {request.sender.rating && (
                        <div className="rating">
                          <span className="stars">★</span>
                          <span>{request.sender.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`urgency-badge ${getUrgencyClass(request.urgency)}`}>
                    {request.urgency.toUpperCase()}
                  </div>
                </div>
                
                <div className="match-content">
                  <div className="request-detail">
                    <FontAwesomeIcon icon={faBox} />
                    <div>
                      <h4>Package</h4>
                      <p>{request.package_description}</p>
                      <p className="sub-detail">
                        <span className="size">{request.package_size}</span>
                        <span className="weight">{request.package_weight} kg</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="request-detail">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <div>
                      <h4>Pickup</h4>
                      <p>{request.pickup_location}</p>
                    </div>
                  </div>
                  
                  <div className="request-detail">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <div>
                      <h4>Dropoff</h4>
                      <p>{request.dropoff_location}</p>
                    </div>
                  </div>
                  
                  <div className="request-detail">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <div>
                      <h4>Delivery Date</h4>
                      <p>{formatDate(request.delivery_date)}</p>
                    </div>
                  </div>
                  
                  {request.estimated_cost && (
                    <div className="request-detail">
                      <FontAwesomeIcon icon={faUser} />
                      <div>
                        <h4>Estimated Cost</h4>
                        <p className="estimated-cost">${request.estimated_cost.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="match-actions">
                  <Link 
                    to={`/requests/${request.id}`} 
                    className="btn btn-outline btn-sm"
                  >
                    View Details
                  </Link>
                  
                  <button 
                    className={`btn btn-primary btn-sm ${assigning === request.id ? 'loading' : ''}`}
                    onClick={() => handleAssignRequest(request.id)}
                    disabled={assigning !== null}
                  >
                    {assignSuccess === request.id ? (
                      <>
                        <FontAwesomeIcon icon={faCheckCircle} /> Assigned!
                      </>
                    ) : assigning === request.id ? (
                      <>
                        <span className="spinner"></span> Assigning...
                      </>
                    ) : (
                      'Accept Request'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripMatches; 