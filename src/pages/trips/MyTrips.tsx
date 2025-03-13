import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlane,
  faMapMarkerAlt,
  faCalendarAlt,
  faEdit,
  faTrash,
  faExclamationTriangle,
  faSort,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Trip {
  id: number;
  traveler_id: number;
  origin: string;
  destination: string;
  departure_date: string;
  arrival_date: string;
  available_space: number;
  notes?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  requests_count: number;
}

const MyTrips: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  
  // Filter states
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [sortBy, setSortBy] = useState('departure_date');
  const [sortOrder, setSortOrder] = useState('asc');
  
  useEffect(() => {
    // Only travelers can access my trips
    if (user && user.role !== 'traveler') {
      navigate('/');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    const fetchMyTrips = async () => {
      try {
        setLoading(true);
        console.log('Fetching my trips from API endpoint: /api/my-trips');
        const response = await axios.get('/api/my-trips', {
          params: {
            status: filter !== 'all' ? filter : undefined,
            sort_by: sortBy,
            sort_order: sortOrder
          }
        });
        setTrips(response.data.trips || []);
        setError(null);
        setAuthError(false);
      } catch (err: any) {
        console.error('Error fetching my trips:', err);
        
        // Only show auth error if we receive a 401 AND the user is not authenticated
        if (err.response && err.response.status === 401 && !isAuthenticated) {
          setAuthError(true);
          setError('You need to be logged in to view your trips.');
          navigate('/login');
        } else {
          // For other errors, just show a generic error
          setError('Failed to load your trips. Please try again.');
        }
        
        setTrips([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.role === 'traveler') {
      fetchMyTrips();
    }
  }, [user, navigate, filter, sortBy, sortOrder, isAuthenticated]);

  const handleFilterClick = (newFilter: string) => {
    setFilter(newFilter);
  };
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  const toggleFilterPanel = () => {
    setFilterOpen(!filterOpen);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const handleDeleteClick = (tripId: number) => {
    setShowConfirmDelete(tripId);
  };
  
  const handleCancelDelete = () => {
    setShowConfirmDelete(null);
  };
  
  const handleConfirmDelete = async (tripId: number) => {
    try {
      await axios.delete(`/trips/${tripId}`);
      setTrips(trips.filter(trip => trip.id !== tripId));
      setShowConfirmDelete(null);
    } catch (err: any) {
      console.error('Error deleting trip:', err);
      setError('Failed to delete trip. Please try again.');
    }
  };
  
  const getTripStatusClass = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'status-upcoming';
      case 'in_progress':
        return 'status-in-progress';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };
  
  return (
    <div className="my-trips-container">
      <div className="my-trips-header">
        <h1 className="my-trips-title">My Trips</h1>
        <Link to="/trips/create" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlane} /> Create New Trip
        </Link>
      </div>
      
      <div className="my-trips-toolbar">
        <div className="toolbar-filters">
          <button 
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleFilterClick('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`filter-btn ${filter === 'in_progress' ? 'active' : ''}`}
            onClick={() => handleFilterClick('in_progress')}
          >
            In Progress
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => handleFilterClick('completed')}
          >
            Completed
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => handleFilterClick('cancelled')}
          >
            Cancelled
          </button>
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterClick('all')}
          >
            All
          </button>
        </div>
        
        <button
          className={`btn btn-sm ${filterOpen ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={toggleFilterPanel}
        >
          <FontAwesomeIcon icon={faFilter} /> Sort & Filter
        </button>
      </div>
      
      {filterOpen && (
        <div className="sort-panel">
          <div className="sort-options">
            <h4>Sort By</h4>
            <button
              className={`sort-option ${sortBy === 'departure_date' ? 'active' : ''}`}
              onClick={() => handleSort('departure_date')}
            >
              <FontAwesomeIcon icon={faSort} />
              Departure Date {sortBy === 'departure_date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`sort-option ${sortBy === 'created_at' ? 'active' : ''}`}
              onClick={() => handleSort('created_at')}
            >
              <FontAwesomeIcon icon={faSort} />
              Date Created {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              className={`sort-option ${sortBy === 'requests_count' ? 'active' : ''}`}
              onClick={() => handleSort('requests_count')}
            >
              <FontAwesomeIcon icon={faSort} />
              Requests {sortBy === 'requests_count' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger">
          {error}
          {authError && (
            <div className="mt-2">
              <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
              <span className="mx-2">or</span>
              <Link to="/register" className="btn btn-outline-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="loader-container"><div className="loader"></div></div>
      ) : trips.length === 0 ? (
        <div className="my-trips-empty">
          <h3>No trips found</h3>
          <p>You haven't created any trips yet.</p>
          <Link to="/trips/create" className="btn btn-primary">
            Create Your First Trip
          </Link>
        </div>
      ) : (
        <div className="my-trips-list">
          {trips.map(trip => (
            <div className="trip-card" key={trip.id}>
              {showConfirmDelete === trip.id && (
                <div className="delete-confirm">
                  <div className="delete-confirm-content">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
                    <h4>Delete Trip?</h4>
                    <p>Are you sure you want to delete this trip? This action cannot be undone.</p>
                    <div className="delete-actions">
                      <button
                        className="btn btn-danger"
                        onClick={() => handleConfirmDelete(trip.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelDelete}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="trip-card-header">
                <div className={`trip-status ${getTripStatusClass(trip.status)}`}>
                  {trip.status.replace('_', ' ')}
                </div>
                <div className="trip-actions">
                  {trip.status === 'upcoming' && (
                    <>
                      <Link to={`/trips/${trip.id}/edit`} className="btn btn-sm btn-outline-primary">
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteClick(trip.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="trip-card-body">
                <div className="trip-route">
                  <div className="trip-route-origin">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{trip.origin}</span>
                  </div>
                  <div className="trip-route-arrow">→</div>
                  <div className="trip-route-destination">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{trip.destination}</span>
                  </div>
                </div>
                
                <div className="trip-dates">
                  <div className="trip-date">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Departure: {formatDate(trip.departure_date)}</span>
                  </div>
                  <div className="trip-date">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span>Arrival: {formatDate(trip.arrival_date)}</span>
                  </div>
                </div>
                
                <div className="trip-details">
                  <div className="trip-space">
                    <span>Available Space: <strong>{trip.available_space} kg</strong></span>
                  </div>
                  <div className="trip-requests">
                    <span>Requests: <strong>{trip.requests_count}</strong></span>
                  </div>
                </div>
                
                {trip.notes && (
                  <div className="trip-notes">
                    <p>{trip.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="trip-card-footer">
                <Link to={`/trips/${trip.id}`} className="btn btn-outline-primary">
                  View Details
                </Link>
                {trip.requests_count > 0 && (
                  <Link to={`/trips/${trip.id}/requests`} className="btn btn-primary">
                    View Requests
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTrips; 