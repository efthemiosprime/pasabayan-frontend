import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // If authenticated, redirect to home
  if (isAuthenticated && !loading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-logo">
          <Link to="/">
            <h1>Pasabay</h1>
          </Link>
        </div>
        <div className="auth-card">
          <Outlet />
        </div>
        <div className="auth-footer">
          <p>&copy; {new Date().getFullYear()} Pasabay. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 