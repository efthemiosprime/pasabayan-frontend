import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBox, 
  faMapMarkerAlt, 
  faRoute,
  faExchangeAlt,
  faPlus,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/_matches.scss';

interface Trip {
  id: number;
  origin: string;
  destination: string;
  travel_date: string;
  status: string;
  _matchCount?: number;
}

interface DeliveryRequest {
  id: number;
  pickup_location: string;
  dropoff_location: string;
  delivery_date: string;
  status: string;
  _matchCount?: number;
}

const MatchesIndex: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'traveler') {
        fetchTripsWithMatches();
      } else {
        fetchRequestsWithMatches();
      }
    }
  }, [isAuthenticated, user]);

  const fetchTripsWithMatches = async () => {
    try {
      setLoading(true);
      // First get active trips
      const tripsResponse = await axios.get('/api/my-trips?status=active');
      
      if (tripsResponse.data.success) {
        const activeTrips = tripsResponse.data.trips || [];
        
        // For each trip, check how many matching requests there are
        const tripsWithMatchCounts = await Promise.all(
          activeTrips.map(async (trip: Trip) => {
            try {
              const matchResponse = await axios.get(`/api/matches/trip/${trip.id}`);
              if (matchResponse.data.status === 'success') {
                const matchCount = matchResponse.data.data.total || 0;
                return { ...trip, _matchCount: matchCount };
              }
              return { ...trip, _matchCount: 0 };
            } catch (err) {
              console.error(`Error fetching matches for trip ${trip.id}:`, err);
              return { ...trip, _matchCount: 0 };
            }
          })
        );
        
        setTrips(tripsWithMatchCounts);
      } else {
        setError('Failed to load your trips.');
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Error loading your trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestsWithMatches = async () => {
    try {
      setLoading(true);
      // First get pending requests
      const requestsResponse = await axios.get('/api/my-requests?status=pending');
      
      if (requestsResponse.data.success) {
        const pendingRequests = requestsResponse.data.requests || [];
        
        // For each request, check how many matching trips there are
        const requestsWithMatchCounts = await Promise.all(
          pendingRequests.map(async (request: DeliveryRequest) => {
            try {
              const matchResponse = await axios.get(`/api/matches/request/${request.id}`);
              if (matchResponse.data.status === 'success') {
                const matchCount = matchResponse.data.data.total || 0;
                return { ...request, _matchCount: matchCount };
              }
              return { ...request, _matchCount: 0 };
            } catch (err) {
              console.error(`Error fetching matches for request ${request.id}:`, err);
              return { ...request, _matchCount: 0 };
            }
          })
        );
        
        setRequests(requestsWithMatchCounts);
      } else {
        setError('Failed to load your delivery requests.');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Error loading your delivery requests. Please try again.');
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
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="matches-container">
      <div className="matches-header">
        <h1>
          <FontAwesomeIcon icon={faExchangeAlt} /> My Matches
        </h1>
        {user?.role === 'traveler' ? (
          <Link to="/trips/create" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} /> Create New Trip
          </Link>
        ) : (
          <Link to="/trips" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} /> Create New Request
          </Link>
        )}
      </div>

      {error && (
        <div className="alert alert-danger">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      )}

      <div className="matches-content">
        {user?.role === 'traveler' ? (
          <>
            <h2>Your Trips with Matching Requests</h2>
            
            {trips.length === 0 ? (
              <div className="no-matches">
                <p>You don't have any active trips.</p>
                <Link to="/trips/create" className="btn btn-primary">
                  Create a Trip
                </Link>
              </div>
            ) : (
              <div className="matches-list">
                {trips.map(trip => (
                  <div key={trip.id} className="match-card">
                    <div className="match-header">
                      <div className="route-info">
                        <FontAwesomeIcon icon={faRoute} />
                        <span>{trip.origin} → {trip.destination}</span>
                      </div>
                      <div className="match-count">
                        <FontAwesomeIcon icon={faBox} />
                        <span>
                          {trip._matchCount !== undefined ? (
                            <>
                              {trip._matchCount} match{trip._matchCount !== 1 ? 'es' : ''}
                            </>
                          ) : (
                            'No matches'
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="match-content">
                      <div className="match-date">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>Travel Date: {formatDate(trip.travel_date)}</span>
                      </div>
                    </div>
                    
                    <div className="match-actions">
                      <Link 
                        to={`/trips/${trip.id}`} 
                        className="btn btn-outline btn-sm"
                      >
                        View Trip
                      </Link>
                      
                      <Link 
                        to={`/matches/trip/${trip.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        {trip._matchCount !== undefined && trip._matchCount > 0 ? 'View Matches' : 'Find Matches'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <h2>Your Requests with Matching Trips</h2>
            
            {requests.length === 0 ? (
              <div className="no-matches">
                <p>You don't have any pending delivery requests.</p>
                <Link to="/trips" className="btn btn-primary">
                  Create a Request
                </Link>
              </div>
            ) : (
              <div className="matches-list">
                {requests.map(request => (
                  <div key={request.id} className="match-card">
                    <div className="match-header">
                      <div className="route-info">
                        <FontAwesomeIcon icon={faBox} />
                        <span>Delivery Request #{request.id}</span>
                      </div>
                      <div className="match-count">
                        {request._matchCount} match{request._matchCount !== 1 ? 'es' : ''}
                      </div>
                    </div>
                    
                    <div className="match-content">
                      <div className="match-locations">
                        <div className="location">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>From: {request.pickup_location}</span>
                        </div>
                        <div className="location">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>To: {request.dropoff_location}</span>
                        </div>
                      </div>
                      
                      <div className="match-date">
                        <FontAwesomeIcon icon={faMapMarkerAlt} />
                        <span>Delivery By: {formatDate(request.delivery_date)}</span>
                      </div>
                    </div>
                    
                    <div className="match-actions">
                      <Link 
                        to={`/requests/${request.id}`} 
                        className="btn btn-outline btn-sm"
                      >
                        View Request
                      </Link>
                      
                      <Link 
                        to={`/matches/request/${request.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        {request._matchCount !== undefined && request._matchCount > 0 ? 'View Matches' : 'Find Matches'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MatchesIndex; 