import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlane,
  faMapMarkerAlt,
  faCalendarAlt,
  faBox,
  faInfoCircle,
  faUser,
  faStar,
  faArrowLeft,
  faEnvelope,
  faPhone,
  faBoxOpen,
  faCheckCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface Trip {
  id: number;
  traveler_id: number;
  traveler: {
    id: number;
    name: string;
    email: string;
    phone: string;
    rating: number;
    profile_photo?: string;
    is_verified: boolean;
  };
  origin: string;
  destination: string;
  departure_date: string;
  arrival_date: string;
  available_space: number;
  notes?: string;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

interface RequestFormData {
  package_description: string;
  package_size: number;
  pickup_address: string;
  delivery_address: string;
  notes: string;
}

interface RequestErrors {
  package_description?: string;
  package_size?: string;
  pickup_address?: string;
  delivery_address?: string;
  notes?: string;
  general?: string;
}

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);
  
  // Request form state
  const [requestForm, setRequestForm] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    item_description: '',
    pickup_location: '',
    delivery_location: '',
    package_size: 1,
    special_instructions: ''
  });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestErrors, setRequestErrors] = useState<{[key: string]: string}>({});
  const [requestSuccess, setRequestSuccess] = useState(false);
  
  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        console.log(`Fetching trip details from API endpoint: /api/trips/${id}`);
        const response = await axios.get(`/api/trips/${id}`);
        
        if (response.data.success) {
          setTrip(response.data.trip);
          setError(null);
          setAuthError(false);
        } else {
          console.error('Error fetching trip details:', response.data.message);
          setError('Failed to load trip details. Please try again.');
        }
      } catch (err: any) {
        console.error('Error fetching trip:', err);
        
        // Only show auth error if we receive a 401 AND the user is not authenticated
        if (err.response && err.response.status === 401 && !isAuthenticated) {
          setAuthError(true);
          setError('You need to be logged in to view trip details.');
        } else {
          // For other errors, just show a generic error
          setError('Failed to load trip details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchTripDetails();
    }
  }, [id, isAuthenticated]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  const toggleRequestForm = () => {
    setRequestForm(!requestForm);
    setRequestErrors({});
    setRequestSuccess(false);
  };
  
  const handleRequestChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRequestFormData({
      ...requestFormData,
      [name]: name === 'package_size' ? parseFloat(value) : value
    });
    
    // Clear error for this field when user changes it
    if (requestErrors[name]) {
      setRequestErrors({
        ...requestErrors,
        [name]: ''
      });
    }
  };
  
  const validateRequestForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!requestFormData.item_description.trim()) {
      errors.item_description = 'Item description is required';
    }
    
    if (!requestFormData.pickup_location.trim()) {
      errors.pickup_location = 'Pickup location is required';
    }
    
    if (!requestFormData.delivery_location.trim()) {
      errors.delivery_location = 'Delivery location is required';
    }
    
    if (requestFormData.package_size <= 0) {
      errors.package_size = 'Package size must be greater than 0';
    }
    
    if (trip && requestFormData.package_size > trip.available_space) {
      errors.package_size = `Package size exceeds available space (${trip.available_space} kg)`;
    }
    
    return errors;
  };
  
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateRequestForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setRequestErrors(validationErrors);
      return;
    }
    
    setRequestSubmitting(true);
    
    try {
      console.log('Submitting delivery request to API endpoint: /api/requests');
      const response = await axios.post('/api/requests', {
        trip_id: id,
        item_description: requestFormData.item_description,
        pickup_location: requestFormData.pickup_location,
        delivery_location: requestFormData.delivery_location,
        package_size: requestFormData.package_size,
        special_instructions: requestFormData.special_instructions,
      });
      
      setRequestSuccess(true);
      setRequestFormData({
        item_description: '',
        pickup_location: '',
        delivery_location: '',
        package_size: 1,
        special_instructions: ''
      });
      
      console.log('Request created successfully:', response.data);
      
      // Optionally, close the form after successful submission
      // setRequestForm(false);
    } catch (err: any) {
      console.error('Error creating request:', err);
      
      if (err.response && err.response.data && err.response.data.errors) {
        // Handle validation errors from server
        const serverErrors: {[key: string]: string} = {};
        Object.entries(err.response.data.errors).forEach(([key, value]) => {
          serverErrors[key] = Array.isArray(value) ? value[0] : value as string;
        });
        setRequestErrors(serverErrors);
      } else {
        // Handle general error
        setRequestErrors({
          general: 'Failed to create request. Please try again.'
        });
      }
    } finally {
      setRequestSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }
  
  if (error || !trip) {
    return (
      <div className="trip-detail-container">
        <div className="alert alert-danger">
          {error || 'Trip not found'}
        </div>
        <Link to="/trips" className="btn btn-primary">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Trips
        </Link>
      </div>
    );
  }
  
  const isTripOwner = user && user.id === trip.traveler_id;
  const isExpired = new Date(trip.departure_date) < new Date();
  const canRequest = !isTripOwner && !isExpired && trip.status === 'upcoming' && user && user.role === 'sender';
  
  return (
    <div className="trip-detail-container">
      <div className="trip-detail-header">
        <Link to="/trips" className="btn btn-outline-primary">
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Trips
        </Link>
        
        <div className={`trip-status trip-status-${trip.status}`}>
          {trip.status.replace('_', ' ')}
        </div>
      </div>
      
      {requestSuccess && (
        <div className="alert alert-success">
          <h4>Request Submitted Successfully!</h4>
          <p>Your delivery request has been sent to the traveler. They will review it and get back to you soon.</p>
        </div>
      )}
      
      <div className="trip-detail-content">
        <div className="trip-detail-main">
          <div className="trip-route-card">
            <h2 className="trip-route-title">Trip Route</h2>
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
            
            <div className="trip-space">
              <FontAwesomeIcon icon={faBox} />
              <span>Available Space: <strong>{trip.available_space} kg</strong></span>
            </div>
            
            {trip.notes && (
              <div className="trip-notes">
                <FontAwesomeIcon icon={faInfoCircle} />
                <div className="notes-content">
                  <h3>Notes from Traveler</h3>
                  <p>{trip.notes}</p>
                </div>
              </div>
            )}
            
            {trip && (
              <div className="trip-detail-actions">
                {isAuthenticated ? (
                  <button 
                    className="btn btn-primary"
                    onClick={toggleRequestForm}
                    disabled={trip.status !== 'upcoming' && trip.status !== 'in_progress'}
                  >
                    <FontAwesomeIcon icon={faBox} /> Request Delivery
                  </button>
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    Login to Request Delivery
                  </Link>
                )}
              </div>
            )}
            
            {isExpired && trip.status === 'upcoming' && (
              <div className="trip-expired-notice">
                <p>This trip has already departed and is no longer accepting delivery requests.</p>
              </div>
            )}
          </div>
          
          {requestForm && trip && (
            <div className="request-form-container">
              <div className="card">
                <div className="card-header">
                  <h3>Create Delivery Request</h3>
                </div>
                <div className="card-body">
                  {requestSuccess ? (
                    <div className="alert alert-success">
                      <FontAwesomeIcon icon={faCheckCircle} /> Your request has been submitted successfully!
                      <div className="mt-3">
                        <button 
                          className="btn btn-outline-primary me-2"
                          onClick={() => setRequestSuccess(false)}
                        >
                          Create Another Request
                        </button>
                        <button 
                          className="btn btn-outline-secondary"
                          onClick={toggleRequestForm}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleRequestSubmit}>
                      {requestErrors.general && (
                        <div className="alert alert-danger">
                          {requestErrors.general}
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <label htmlFor="item_description" className="form-label">Item Description*</label>
                        <input
                          type="text"
                          id="item_description"
                          name="item_description"
                          className={`form-control ${requestErrors.item_description ? 'is-invalid' : ''}`}
                          value={requestFormData.item_description}
                          onChange={handleRequestChange}
                          placeholder="E.g., Small electronics, documents, clothes"
                          disabled={requestSubmitting}
                        />
                        {requestErrors.item_description && (
                          <div className="form-invalid-feedback">{requestErrors.item_description}</div>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="pickup_location" className="form-label">Pickup Location*</label>
                        <input
                          type="text"
                          id="pickup_location"
                          name="pickup_location"
                          className={`form-control ${requestErrors.pickup_location ? 'is-invalid' : ''}`}
                          value={requestFormData.pickup_location}
                          onChange={handleRequestChange}
                          placeholder="Address where the item can be picked up"
                          disabled={requestSubmitting}
                        />
                        {requestErrors.pickup_location && (
                          <div className="form-invalid-feedback">{requestErrors.pickup_location}</div>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="delivery_location" className="form-label">Delivery Location*</label>
                        <input
                          type="text"
                          id="delivery_location"
                          name="delivery_location"
                          className={`form-control ${requestErrors.delivery_location ? 'is-invalid' : ''}`}
                          value={requestFormData.delivery_location}
                          onChange={handleRequestChange}
                          placeholder="Address where the item should be delivered"
                          disabled={requestSubmitting}
                        />
                        {requestErrors.delivery_location && (
                          <div className="form-invalid-feedback">{requestErrors.delivery_location}</div>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="package_size" className="form-label">Package Size (kg)*</label>
                        <input
                          type="number"
                          id="package_size"
                          name="package_size"
                          className={`form-control ${requestErrors.package_size ? 'is-invalid' : ''}`}
                          value={requestFormData.package_size}
                          onChange={handleRequestChange}
                          min="0.1"
                          step="0.1"
                          max={trip.available_space}
                          disabled={requestSubmitting}
                        />
                        {requestErrors.package_size && (
                          <div className="form-invalid-feedback">{requestErrors.package_size}</div>
                        )}
                        <small className="text-muted">
                          Maximum available space: {trip.available_space} kg
                        </small>
                      </div>
                      
                      <div className="mb-3">
                        <label htmlFor="special_instructions" className="form-label">Special Instructions</label>
                        <textarea
                          id="special_instructions"
                          name="special_instructions"
                          className="form-control"
                          value={requestFormData.special_instructions}
                          onChange={handleRequestChange}
                          placeholder="Any specific handling instructions or details"
                          rows={3}
                          disabled={requestSubmitting}
                        />
                      </div>
                      
                      <div className="d-flex justify-content-end">
                        <button
                          type="button"
                          className="btn btn-outline-secondary me-2"
                          onClick={toggleRequestForm}
                          disabled={requestSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={requestSubmitting}
                        >
                          {requestSubmitting ? (
                            <>
                              <FontAwesomeIcon icon={faSpinner} spin /> Submitting...
                            </>
                          ) : (
                            'Submit Request'
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="trip-detail-sidebar">
          <div className="traveler-card">
            <h3 className="traveler-card-title">Traveler</h3>
            <div className="traveler-info">
              <div className="traveler-avatar">
                {trip.traveler.profile_photo ? (
                  <img src={trip.traveler.profile_photo} alt={trip.traveler.name} />
                ) : (
                  <div className="default-avatar">
                    {trip.traveler.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="traveler-details">
                <h4 className="traveler-name">
                  <FontAwesomeIcon icon={faUser} /> {trip.traveler.name}
                </h4>
                
                <div className="traveler-rating">
                  <FontAwesomeIcon icon={faStar} className="star-icon" />
                  <span>{trip.traveler.rating.toFixed(1)}</span>
                </div>
                
                {trip.traveler.is_verified && (
                  <div className="traveler-verified">
                    <span>Verified Account</span>
                  </div>
                )}
                
                {isAuthenticated && (
                  <div className="traveler-contact">
                    <div className="contact-item">
                      <FontAwesomeIcon icon={faEnvelope} />
                      <span>{trip.traveler.email}</span>
                    </div>
                    <div className="contact-item">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{trip.traveler.phone}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {isTripOwner && (
              <div className="owner-actions">
                <Link to={`/trips/${trip.id}/requests`} className="btn btn-primary btn-block">
                  View Delivery Requests
                </Link>
                
                {trip.status === 'upcoming' && (
                  <Link to={`/trips/${trip.id}/edit`} className="btn btn-outline-primary btn-block">
                    Edit Trip
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger mb-4">
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
    </div>
  );
};

export default TripDetail; 