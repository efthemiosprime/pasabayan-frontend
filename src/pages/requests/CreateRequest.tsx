import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faMapMarkerAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../../styles/pages/_requests.scss';

interface Trip {
  id: number;
  traveler_id: number;
  traveler_name: string;
  origin: string;
  destination: string;
  travel_date: string;
  return_date: string;
  available_capacity: number;
}

const CreateRequest: React.FC = () => {
  const navigate = useNavigate();
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    trip_id: '',
    item_description: '',
    pickup_location: '',
    dropoff_location: '',
    package_size: 'small',
    special_instructions: ''
  });

  useEffect(() => {
    const fetchAvailableTrips = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/available-trips');
        console.log('Available trips response:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
          setAvailableTrips(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setAvailableTrips(response.data.data);
        } else if (response.data && response.data.trips && Array.isArray(response.data.trips)) {
          setAvailableTrips(response.data.trips);
        } else {
          console.error('Unexpected API response format:', response.data);
          setError('Received unexpected data format from the server.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching available trips:', err);
        setError('Failed to load available trips. Please try again later.');
        setLoading(false);
      }
    };

    fetchAvailableTrips();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.trip_id) {
      toast.error('Please select a trip');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Create the request payload
      const requestData = {
        trip_id: parseInt(formData.trip_id),
        item_description: formData.item_description,
        pickup_location: formData.pickup_location,
        dropoff_location: formData.dropoff_location,
        package_size: formData.package_size,
        special_instructions: formData.special_instructions || null
      };
      
      console.log('Sending delivery request data:', requestData);
      
      const response = await axios.post('/api/requests', requestData);
      
      setSubmitting(false);
      toast.success('Delivery request created successfully!');
      navigate('/requests');
    } catch (err: any) {
      setSubmitting(false);
      console.error('Error creating delivery request:', err);
      
      if (err.response && err.response.data && err.response.data.errors) {
        // Handle validation errors
        const validationErrors = Object.values(err.response.data.errors).flat().join(', ');
        setError(validationErrors);
        toast.error(validationErrors);
      } else {
        setError('Failed to create delivery request. Please try again.');
        toast.error('Failed to create delivery request. Please try again.');
      }
    }
  };

  const packageSizeOptions = [
    { value: 'small', label: 'Small (fits in a shoebox)' },
    { value: 'medium', label: 'Medium (fits in a backpack)' },
    { value: 'large', label: 'Large (fits in a suitcase)' }
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading available trips...</p>
      </div>
    );
  }

  return (
    <div className="create-request-container">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h2 className="h4 mb-0">Create Delivery Request</h2>
            </Card.Header>
            <Card.Body>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Trip</Form.Label>
                  <Form.Select 
                    name="trip_id"
                    value={formData.trip_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select a trip --</option>
                    {availableTrips.length > 0 ? (
                      availableTrips.map(trip => (
                        <option key={trip.id} value={trip.id}>
                          {trip.origin} to {trip.destination} (Departing: {new Date(trip.travel_date).toLocaleDateString()})
                        </option>
                      ))
                    ) : (
                      <option disabled>No available trips found</option>
                    )}
                  </Form.Select>
                  {availableTrips.length === 0 && (
                    <div className="text-muted mt-2">
                      <FontAwesomeIcon icon={faInfoCircle} /> No trips available. Please check back later or contact support.
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FontAwesomeIcon icon={faBox} className="me-2" />
                    Item Description
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="item_description"
                    value={formData.item_description}
                    onChange={handleChange}
                    placeholder="Describe the item you want delivered"
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                        Pickup Location
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="pickup_location"
                        value={formData.pickup_location}
                        onChange={handleChange}
                        placeholder="Address for item pickup"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                        Dropoff Location
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="dropoff_location"
                        value={formData.dropoff_location}
                        onChange={handleChange}
                        placeholder="Address for item delivery"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Package Size</Form.Label>
                  <Form.Select
                    name="package_size"
                    value={formData.package_size}
                    onChange={handleChange}
                    required
                  >
                    {packageSizeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Special Instructions (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="special_instructions"
                    value={formData.special_instructions}
                    onChange={handleChange}
                    placeholder="Any special handling instructions or notes"
                    rows={3}
                  />
                </Form.Group>

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/requests')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={submitting || availableTrips.length === 0}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Submitting...
                      </>
                    ) : (
                      'Create Request'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateRequest; 