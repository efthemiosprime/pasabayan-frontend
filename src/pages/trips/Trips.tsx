import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlane, 
  faMapMarkerAlt, 
  faCalendarAlt, 
  faSearch, 
  faFilter,
  faSortAmountDown,
  faUser,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Trip {
  id: number;
  traveler_id: number;
  traveler: {
    id: number;
    name: string;
    rating: number;
    profile_photo?: string;
    email: string;
    phone: string;
    is_verified: boolean;
  };
  origin: string;
  destination: string;
  departure_date: string;
  arrival_date: string;
  available_space: number;
  notes?: string;
  status: string;
  created_at: string;
}

const Trips: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    dateFrom: '',
    dateTo: '',
    status: 'active'
  });
  
  // Fetch trips from API
  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        // Ensure we use the /api prefix for all endpoints
        const endpoint = isAuthenticated ? '/api/trips' : '/api/public/trips';
        console.log('Fetching trips with params:', { search: searchTerm, ...filters });
        
        const response = await axios.get(endpoint, {
          params: {
            search: searchTerm,
            ...filters
          }
        });
        
        console.log('API response:', response.data);
        
        if (response.data && response.data.success && Array.isArray(response.data.trips)) {
          setTrips(response.data.trips);
          console.log(`Found ${response.data.trips.length} trips`);
        } else {
          console.error('Unexpected API response format:', response.data);
          setTrips([]);
          setError('Received invalid data format from the server');
        }
        
        setAuthError(false);
      } catch (err: any) {
        console.error('Error fetching trips:', err);
        
        // Only show auth error if we receive a 401 AND the user is not authenticated
        if (err.response && err.response.status === 401 && !isAuthenticated) {
          setAuthError(true);
          setError('You need to be logged in to view trips.');
          setTrips([]);
        } else {
          // For other errors, just show a generic error
          setError('Failed to load trips. Please try again.');
          setTrips([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, [searchTerm, filters, isAuthenticated]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Search changed to:', e.target.value);
    setSearchTerm(e.target.value);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted with term:', searchTerm);
    // The useEffect hook will handle the actual API call when searchTerm changes
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`Filter ${name} changed to:`, value);
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const toggleFilters = () => {
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
  
  return (
    <div className="trips-container">
      <div className="trips-header">
        <h1 className="trips-title">Find Trips</h1>
        <Link to="/trips/create" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlane} /> Create New Trip
        </Link>
      </div>
      
      <form onSubmit={handleSearch} className="trips-search-bar">
        <div className="input-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for trips..." 
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>
      
      <button 
        className={`btn ${filterOpen ? 'btn-primary' : 'btn-outline-primary'}`}
        onClick={toggleFilters}
      >
        <FontAwesomeIcon icon={faFilter} /> Filters
      </button>
      
      {filterOpen && (
        <div className="trips-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="origin">Origin</label>
              <input
                type="text"
                id="origin"
                name="origin"
                placeholder="From where?"
                value={filters.origin}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="destination">Destination</label>
              <input
                type="text"
                id="destination"
                name="destination"
                placeholder="To where?"
                value={filters.destination}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
          </div>
          
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="dateFrom">From Date</label>
              <input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="dateTo">To Date</label>
              <input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-input"
              >
                <option value="active">Active</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="all">All</option>
              </select>
            </div>
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
        <div className="trips-empty">
          <h3>No trips found</h3>
          <p>Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="trips-list">
          {trips.map(trip => (
            <div className="trip-card" key={trip.id}>
              <div className="trip-card-header">
                <div className="trip-traveler">
                  <div className="trip-traveler-avatar">
                    {trip.traveler.profile_photo ? (
                      <img src={trip.traveler.profile_photo} alt={trip.traveler.name} />
                    ) : (
                      <div className="default-avatar">
                        {trip.traveler.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="trip-traveler-info">
                    <span className="traveler-name">
                      <FontAwesomeIcon icon={faUser} /> {trip.traveler.name}
                    </span>
                    <span className="traveler-rating">
                      <FontAwesomeIcon icon={faStar} /> {trip.traveler.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className={`trip-status trip-status-${trip.status}`}>
                  {trip.status.replace('_', ' ')}
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
                
                {trip.notes && (
                  <div className="trip-notes">
                    <p>{trip.notes}</p>
                  </div>
                )}
                
                <div className="trip-space">
                  <span>Available Space: <strong>{trip.available_space} kg</strong></span>
                </div>
              </div>
              
              <div className="trip-card-footer">
                <Link to={`/trips/${trip.id}`} className="btn btn-outline-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trips;