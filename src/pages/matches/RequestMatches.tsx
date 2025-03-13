import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, 
  faMapMarkerAlt, 
  faCalendarAlt, 
  faUser,
  faArrowLeft,
  faExclamationTriangle,
  faWeightHanging,
  faPlane,
  faCar,
  faBus,
  faShip
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/_matches.scss';

interface Trip {
  id: number;
  traveler_id: number;
  origin: string;
  destination: string;
  travel_date: string;
  return_date: string;
  available_capacity: number;
  transport_mode: string;
  notes: string | null;
  status: 'active' | 'completed' | 'cancelled';
  traveler: {
    id: number;
    name: string;
    email: string;
    profile_photo: string | null;
    rating: number | null;
  };
}

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
}

const RequestMatches: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<DeliveryRequest | null>(null);
  const [matchingTrips, setMatchingTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchRequestDetails();
      fetchMatchingTrips();
    }
  }, [isAuthenticated, id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/requests/${id}`);
      
      if (response.data.success) {
        setRequest(response.data.request);
      } else {
        setError('Failed to load request details.');
      }
    } catch (err) {
      console.error('Error fetching request details:', err);
      setError('Error loading request details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchingTrips = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/matches/request/${id}`);
      
      if (response.data.status === 'success') {
        setMatchingTrips(response.data.data.data || []);
      } else {
        setError('Failed to load matching trips.');
      }
    } catch (err) {
      console.error('Error fetching matching trips:', err);
      setError('Error loading matching trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTrip = (tripId: number) => {
    setSelectedTripId(tripId);
  };

  const handleConfirmTrip = async () => {
    if (!selectedTripId) return;
    
    try {
      setLoading(true);
      const response = await axios.post('/api/matches/assign', {
        trip_id: selectedTripId,
        request_id: id
      });
      
      if (response.data.status === 'success') {
        // Redirect to the request details page
        window.location.href = `/requests/${id}`;
      } else {
        setError('Failed to assign trip to request.');
      }
    } catch (err: any) {
      console.error('Error assigning trip:', err);
      const errorMsg = err.response?.data?.message || 'Error assigning trip. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
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

  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'air':
        return faPlane;
      case 'car':
        return faCar;
      case 'bus':
        return faBus;
      case 'ship':
        return faShip;
      default:
        return faCar;
    }
  };

  if (loading && !request && !matchingTrips.length) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <Link to="/requests" className="btn btn-outline">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Requests
        </Link>
        <h1>Matching Trips</h1>
      </div>

      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      )}

      {request && (
        <div className="request-summary">
          <h2>Request Details</h2>
          <div className="request-card">
            <div className="request-locations">
              <div className="location">
                <h3>Pickup</h3>
                <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {request.pickup_location}</p>
              </div>
              <div className="location">
                <h3>Dropoff</h3>
                <p><FontAwesomeIcon icon={faMapMarkerAlt} /> {request.dropoff_location}</p>
              </div>
            </div>
            <div className="request-package">
              <FontAwesomeIcon icon={faBox} />
              <div>
                <h3>Package</h3>
                <p>{request.package_description}</p>
                <p className="package-details">
                  <span className="size">{request.package_size}</span>
                  <span className="weight">{request.package_weight} kg</span>
                </p>
              </div>
            </div>
            <div className="request-date">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <div>
                <h3>Delivery By</h3>
                <p>{formatDate(request.delivery_date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="matches-content">
        <h2>Matching Trips</h2>
        
        {matchingTrips.length === 0 ? (
          <div className="no-matches">
            <p>No matching trips found for this delivery request.</p>
            <p>Try adjusting your delivery date or location for better matches.</p>
          </div>
        ) : (
          <>
            <div className="matches-list">
              {matchingTrips.map(trip => (
                <div 
                  key={trip.id} 
                  className={`match-card ${selectedTripId === trip.id ? 'selected' : ''}`}
                  onClick={() => handleSelectTrip(trip.id)}
                >
                  <div className="match-header">
                    <div className="traveler-info">
                      <div className="traveler-avatar">
                        {trip.traveler.profile_photo ? (
                          <img src={trip.traveler.profile_photo} alt={trip.traveler.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            <FontAwesomeIcon icon={faUser} />
                          </div>
                        )}
                      </div>
                      <div className="traveler-details">
                        <h3>{trip.traveler.name}</h3>
                        {trip.traveler.rating && (
                          <div className="rating">
                            <span className="stars">★</span>
                            <span>{trip.traveler.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="transport-mode">
                      <FontAwesomeIcon icon={getTransportIcon(trip.transport_mode)} />
                    </div>
                  </div>
                  
                  <div className="match-content">
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
                      <div className="date-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>Travel: {formatDate(trip.travel_date)}</span>
                      </div>
                      <div className="date-item">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        <span>Return: {formatDate(trip.return_date)}</span>
                      </div>
                    </div>
                    
                    <div className="trip-capacity">
                      <FontAwesomeIcon icon={faWeightHanging} />
                      <span>Available Capacity: {trip.available_capacity} kg</span>
                    </div>
                    
                    {trip.notes && (
                      <div className="trip-notes">
                        <h4>Notes:</h4>
                        <p>{trip.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="match-actions">
                    <Link 
                      to={`/trips/${trip.id}`} 
                      className="btn btn-outline btn-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Details
                    </Link>
                    <div className="select-indicator">
                      {selectedTripId === trip.id ? 'Selected' : 'Click to Select'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="matches-actions">
              <button 
                className="btn btn-primary"
                onClick={handleConfirmTrip}
                disabled={!selectedTripId || loading}
              >
                {loading ? 'Processing...' : 'Confirm Selected Trip'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestMatches; 