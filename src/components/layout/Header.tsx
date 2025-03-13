import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <h1>Pasabay</h1>
          </Link>
        </div>

        <nav className="header-nav">
          <div className="header-nav-item">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
          </div>
          <div className="header-nav-item">
            <Link to="/trips" className={location.pathname.includes('/trips') ? 'active' : ''}>
              Trips
            </Link>
          </div>
          <div className="header-nav-item">
            <Link to="/requests" className={location.pathname.includes('/requests') ? 'active' : ''}>
              Requests
            </Link>
          </div>
          {isAuthenticated && (
            <>
              <div className="header-nav-item">
                <Link to="/profile" className={location.pathname.includes('/profile') ? 'active' : ''}>
                  Profile
                </Link>
              </div>
            </>
          )}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <div className="user-menu">
                <span className="user-name">{user?.name}</span>
                <button className="btn btn-sm btn-outline-primary" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm btn-outline-primary">Login</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
            </>
          )}
        </div>

        <button className="header-mobile-toggle" onClick={toggleMobileMenu}>
          <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
        </button>
      </div>

      <div className={`header-mobile-nav ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="header-mobile-nav-item">
          <Link to="/" onClick={toggleMobileMenu}>Home</Link>
        </div>
        <div className="header-mobile-nav-item">
          <Link to="/trips" onClick={toggleMobileMenu}>Trips</Link>
        </div>
        <div className="header-mobile-nav-item">
          <Link to="/requests" onClick={toggleMobileMenu}>Requests</Link>
        </div>
        {isAuthenticated ? (
          <>
            <div className="header-mobile-nav-item">
              <Link to="/profile" onClick={toggleMobileMenu}>Profile</Link>
            </div>
            <div className="header-mobile-nav-item">
              <button onClick={() => {
                handleLogout();
                toggleMobileMenu();
              }}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="header-mobile-nav-item">
              <Link to="/login" onClick={toggleMobileMenu}>Login</Link>
            </div>
            <div className="header-mobile-nav-item">
              <Link to="/register" onClick={toggleMobileMenu}>Register</Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header; 