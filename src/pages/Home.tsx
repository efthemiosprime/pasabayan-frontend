import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlane, faBox, faStar, faHandshake, faShieldAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Connecting Travelers and Senders for Convenient Deliveries</h1>
          <p>
            Pasabay connects people who need to send items with travelers who are already heading to that destination,
            making deliveries more affordable and convenient.
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to={user?.role === 'traveler' ? '/trips/create' : '/requests/create'} className="btn btn-lg btn-primary">
                {user?.role === 'traveler' ? 'Create a Trip' : 'Create a Delivery Request'}
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-lg btn-primary">Get Started</Link>
                <Link to="/login" className="btn btn-lg btn-outline-primary">Log In</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-image">
          {/* Image can be added via CSS background or img tag */}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to get your packages delivered or to earn as a traveler</p>
        </div>

        <div className="steps-container">
          <div className="step">
            <div className="step-icon">
              <FontAwesomeIcon icon={faBox} />
            </div>
            <h3>Create a Request</h3>
            <p>
              Post your delivery request with details about your item, pickup and dropoff locations, and delivery date.
            </p>
          </div>

          <div className="step">
            <div className="step-icon">
              <FontAwesomeIcon icon={faPlane} />
            </div>
            <h3>Match with a Traveler</h3>
            <p>
              Get matched with travelers who are already headed to your destination and have space for your package.
            </p>
          </div>

          <div className="step">
            <div className="step-icon">
              <FontAwesomeIcon icon={faHandshake} />
            </div>
            <h3>Arrange Delivery</h3>
            <p>
              Coordinate with your matched traveler for pickup, handling instructions, and delivery details.
            </p>
          </div>

          <div className="step">
            <div className="step-icon">
              <FontAwesomeIcon icon={faStar} />
            </div>
            <h3>Leave a Review</h3>
            <p>
              After successful delivery, rate and review your experience to help build our trusted community.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose Pasabay</h2>
          <p>Benefits that make us the preferred peer-to-peer delivery platform</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <FontAwesomeIcon icon={faClock} className="feature-icon" />
            <h3>Faster Deliveries</h3>
            <p>
              Items travel with passengers on existing trips, often reaching destinations faster than traditional shipping.
            </p>
          </div>

          <div className="feature-card">
            <FontAwesomeIcon icon={faShieldAlt} className="feature-icon" />
            <h3>Secure Platform</h3>
            <p>
              Verified users, secure payments, and package protection give you peace of mind with every delivery.
            </p>
          </div>

          <div className="feature-card">
            <FontAwesomeIcon icon={faHandshake} className="feature-icon" />
            <h3>Community Trust</h3>
            <p>
              Our review system ensures accountability and helps build a trusted community of travelers and senders.
            </p>
          </div>

          <div className="feature-card">
            <FontAwesomeIcon icon={faStar} className="feature-icon" />
            <h3>Rated Service</h3>
            <p>
              Choose travelers based on ratings and reviews from previous senders for the best delivery experience.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of users sending and receiving packages through Pasabay</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-lg btn-primary">Sign Up Now</Link>
            <Link to="/trips" className="btn btn-lg btn-outline-primary">Browse Available Trips</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 