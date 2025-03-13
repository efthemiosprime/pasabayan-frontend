import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faPlane,
  faBoxes,
  faUser,
  faStar,
  faHandshake,
  faTimes,
  faPlusCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Dashboard</h3>
        <button className="sidebar-close-btn" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {user.profile_photo ? (
            <img src={user.profile_photo} alt={user.name} />
          ) : (
            <div className="default-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="sidebar-user-info">
          <h4>{user.name}</h4>
          <p>{user.role === 'sender' ? 'Sender' : 'Traveler'}</p>
          <div className="user-rating">
            <FontAwesomeIcon icon={faStar} className="star-icon" />
            <span>{user.rating !== undefined && user.rating !== null ? user.rating.toFixed(1) : '0.0'}</span>
          </div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className={location.pathname === '/' ? 'active' : ''}>
            <Link to="/" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faHome} />
              <span>Home</span>
            </Link>
          </li>
          
          <li className={location.pathname.includes('/profile') ? 'active' : ''}>
            <Link to="/profile" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faUser} />
              <span>My Profile</span>
            </Link>
          </li>
          
          {user.role === 'traveler' ? (
            <li className={location.pathname.includes('/my-trips') ? 'active' : ''}>
              <Link to="/my-trips" onClick={toggleSidebar}>
                <FontAwesomeIcon icon={faPlane} />
                <span>My Trips</span>
              </Link>
            </li>
          ) : (
            <>
              <li className={location.pathname.includes('/requests') && !location.pathname.includes('/create') ? 'active' : ''}>
                <Link to="/requests" onClick={toggleSidebar}>
                  <FontAwesomeIcon icon={faBoxes} />
                  <span>My Delivery Requests</span>
                </Link>
              </li>
              <li className={location.pathname.includes('/requests/create') ? 'active' : ''}>
                <Link to="/requests/create" onClick={toggleSidebar} className="create-link">
                  <FontAwesomeIcon icon={faPlusCircle} />
                  <span>Create Request</span>
                </Link>
              </li>
            </>
          )}
          
          <li className={location.pathname.includes('/matches') ? 'active' : ''}>
            <Link to="/matches" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faHandshake} />
              <span>My Matches</span>
            </Link>
          </li>
          
          <li className={location.pathname.includes('/reviews') ? 'active' : ''}>
            <Link to="/my-received-reviews" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faStar} />
              <span>My Reviews</span>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <p>Need help? <Link to="/help" onClick={toggleSidebar}>Contact Support</Link></p>
      </div>
    </aside>
  );
};

export default Sidebar; 