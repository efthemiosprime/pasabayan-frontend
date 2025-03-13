import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faCalendarAlt, 
  faClock, 
  faInfoCircle, 
  faBox,
  faPlane,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface FormData {
  origin: string;
  destination: string;
  departure_date: string;
  departure_time: string;
  arrival_date: string;
  arrival_time: string;
  available_space: number;
  notes: string;
}

interface FormErrors {
  origin?: string;
  destination?: string;
  departure_date?: string;
  departure_time?: string;
  arrival_date?: string;
  arrival_time?: string;
  available_space?: string;
  notes?: string;
  general?: string;
}

const CreateTrip: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    destination: '',
    departure_date: '',
    departure_time: '',
    arrival_date: '',
    arrival_time: '',
    available_space: 5,
    notes: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  useEffect(() => {
    // Only travelers can create trips
    if (user && user.role !== 'traveler') {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin is required';
    }
    
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    }
    
    if (!formData.departure_date) {
      newErrors.departure_date = 'Departure date is required';
    }
    
    if (!formData.departure_time) {
      newErrors.departure_time = 'Departure time is required';
    }
    
    if (!formData.arrival_date) {
      newErrors.arrival_date = 'Arrival date is required';
    }
    
    if (!formData.arrival_time) {
      newErrors.arrival_time = 'Arrival time is required';
    }
    
    const departureDatetime = new Date(`${formData.departure_date}T${formData.departure_time}`);
    const arrivalDatetime = new Date(`${formData.arrival_date}T${formData.arrival_time}`);
    
    if (isNaN(departureDatetime.getTime())) {
      newErrors.departure_date = 'Invalid departure date or time';
    }
    
    if (isNaN(arrivalDatetime.getTime())) {
      newErrors.arrival_date = 'Invalid arrival date or time';
    }
    
    if (!newErrors.departure_date && !newErrors.arrival_date) {
      if (departureDatetime >= arrivalDatetime) {
        newErrors.arrival_date = 'Arrival must be after departure';
      }
    }
    
    if (formData.available_space <= 0) {
      newErrors.available_space = 'Available space must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Combine date and time
    const departure = new Date(`${formData.departure_date}T${formData.departure_time}`);
    const arrival = new Date(`${formData.arrival_date}T${formData.arrival_time}`);
    
    setLoading(true);
    
    try {
      console.log('Creating trip with API endpoint: /api/trips');
      const response = await axios.post('/api/trips', {
        origin: formData.origin,
        destination: formData.destination,
        departure_date: departure.toISOString(),
        arrival_date: arrival.toISOString(),
        available_space: formData.available_space,
        notes: formData.notes
      });
      
      // Redirect to the new trip
      navigate(`/trips/${response.data.trip.id}`);
    } catch (err: any) {
      console.error('Error creating trip:', err);
      
      if (err.response && err.response.status === 401) {
        setAuthError(true);
        setErrors({
          general: 'You need to be logged in to create a trip'
        });
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }
      
      if (err.response && err.response.data && err.response.data.errors) {
        // Handle validation errors from the server
        const serverErrors: FormErrors = {};
        
        Object.entries(err.response.data.errors).forEach(([key, value]) => {
          const errorMessage = Array.isArray(value) ? value[0] : value;
          serverErrors[key as keyof FormErrors] = errorMessage as string;
        });
        
        setErrors(serverErrors);
      } else {
        setErrors({
          general: err.response?.data?.message || 'Failed to create trip. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="create-trip-container">
      <div className="create-trip-header">
        <h1 className="create-trip-title">Create New Trip</h1>
      </div>
      
      {errors.general && (
        <div className="alert alert-danger">
          {errors.general}
        </div>
      )}
      
      <div className="create-trip-content">
        <form className="create-trip-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h3 className="form-section-title">Trip Route</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="origin" className="form-label">
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> Origin
                </label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  className={`form-control ${errors.origin ? 'is-invalid' : ''}`}
                  placeholder="City, Country"
                  value={formData.origin}
                  onChange={handleChange}
                  required
                />
                {errors.origin && <div className="form-invalid-feedback">{errors.origin}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="destination" className="form-label">
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> Destination
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  className={`form-control ${errors.destination ? 'is-invalid' : ''}`}
                  placeholder="City, Country"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
                {errors.destination && <div className="form-invalid-feedback">{errors.destination}</div>}
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="form-section-title">Trip Schedule</h3>
            
            <div className="form-row">
              <div className="form-group date-time-group">
                <label htmlFor="departure_date" className="form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} /> Departure Date
                </label>
                <input
                  type="date"
                  id="departure_date"
                  name="departure_date"
                  className={`form-control ${errors.departure_date ? 'is-invalid' : ''}`}
                  value={formData.departure_date}
                  onChange={handleChange}
                  required
                />
                {errors.departure_date && <div className="form-invalid-feedback">{errors.departure_date}</div>}
              </div>
              
              <div className="form-group date-time-group">
                <label htmlFor="departure_time" className="form-label">
                  <FontAwesomeIcon icon={faClock} /> Departure Time
                </label>
                <input
                  type="time"
                  id="departure_time"
                  name="departure_time"
                  className={`form-control ${errors.departure_time ? 'is-invalid' : ''}`}
                  value={formData.departure_time}
                  onChange={handleChange}
                  required
                />
                {errors.departure_time && <div className="form-invalid-feedback">{errors.departure_time}</div>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group date-time-group">
                <label htmlFor="arrival_date" className="form-label">
                  <FontAwesomeIcon icon={faCalendarAlt} /> Arrival Date
                </label>
                <input
                  type="date"
                  id="arrival_date"
                  name="arrival_date"
                  className={`form-control ${errors.arrival_date ? 'is-invalid' : ''}`}
                  value={formData.arrival_date}
                  onChange={handleChange}
                  required
                />
                {errors.arrival_date && <div className="form-invalid-feedback">{errors.arrival_date}</div>}
              </div>
              
              <div className="form-group date-time-group">
                <label htmlFor="arrival_time" className="form-label">
                  <FontAwesomeIcon icon={faClock} /> Arrival Time
                </label>
                <input
                  type="time"
                  id="arrival_time"
                  name="arrival_time"
                  className={`form-control ${errors.arrival_time ? 'is-invalid' : ''}`}
                  value={formData.arrival_time}
                  onChange={handleChange}
                  required
                />
                {errors.arrival_time && <div className="form-invalid-feedback">{errors.arrival_time}</div>}
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h3 className="form-section-title">Trip Details</h3>
            
            <div className="form-group">
              <label htmlFor="available_space" className="form-label">
                <FontAwesomeIcon icon={faBox} /> Available Space (kg)
              </label>
              <input
                type="number"
                id="available_space"
                name="available_space"
                className={`form-control ${errors.available_space ? 'is-invalid' : ''}`}
                value={formData.available_space}
                onChange={handleChange}
                min="1"
                required
              />
              {errors.available_space && <div className="form-invalid-feedback">{errors.available_space}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                <FontAwesomeIcon icon={faInfoCircle} /> Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
                placeholder="Additional information about your trip, requirements, etc."
                value={formData.notes}
                onChange={handleChange}
                rows={4}
              />
              {errors.notes && <div className="form-invalid-feedback">{errors.notes}</div>}
            </div>
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm spinner-border"></span>
                  <span className="ml-2">Creating Trip...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlane} /> Create Trip
                </>
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              <FontAwesomeIcon icon={faTimes} /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip; 