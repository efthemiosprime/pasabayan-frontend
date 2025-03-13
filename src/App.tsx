import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/main.scss';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Loading Component
import Loader from './components/common/Loader';

// Auth Context Provider
import { AuthProvider } from './context/AuthContext';

// Direct imports for all components
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Profile from './pages/profile/Profile';
import Trips from './pages/trips/Trips';
import TripDetail from './pages/trips/TripDetail';
import CreateTrip from './pages/trips/CreateTrip';
import MyTrips from './pages/trips/MyTrips';
import MyRequests from './pages/requests/MyRequests';
import RequestDetail from './pages/requests/RequestDetail';
import CreateRequest from './pages/requests/CreateRequest';
import MyReceivedReviews from './pages/reviews/MyReceivedReviews';
import MatchesIndex from './pages/matches/MatchesIndex';
import TripMatches from './pages/matches/TripMatches';
import RequestMatches from './pages/matches/RequestMatches';
import CreateReview from './pages/reviews/CreateReview';
import EditReview from './pages/reviews/EditReview';
import UserReviews from './pages/reviews/UserReviews';
import NotFound from './pages/NotFound';

// Private Route Component
const PrivateRoute = ({ element }: { element: React.ReactNode }) => {
  // Get authentication state from context
  const isAuthenticated = localStorage.getItem('token') !== null;
  console.log('PrivateRoute: Authentication check - Token exists:', isAuthenticated);
  
  return isAuthenticated ? <>{element}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>
          
          {/* Main App Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            
            {/* Trip Routes */}
            <Route path="/trips" element={<Trips />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            <Route path="/trips/create" element={<PrivateRoute element={<CreateTrip />} />} />
            <Route path="/my-trips" element={<PrivateRoute element={<MyTrips />} />} />
            
            {/* Request Routes */}
            <Route path="/requests" element={<PrivateRoute element={<MyRequests />} />} />
            <Route path="/requests/:id" element={<PrivateRoute element={<RequestDetail />} />} />
            <Route path="/requests/create" element={<PrivateRoute element={<CreateRequest />} />} />
            
            {/* Matches Routes */}
            <Route path="/matches" element={<PrivateRoute element={<MatchesIndex />} />} />
            <Route path="/matches/trip/:id" element={<PrivateRoute element={<TripMatches />} />} />
            <Route path="/matches/request/:id" element={<PrivateRoute element={<RequestMatches />} />} />
            
            {/* Review Routes */}
            <Route path="/review/create" element={<PrivateRoute element={<CreateReview />} />} />
            <Route path="/reviews/:id/edit" element={<PrivateRoute element={<EditReview />} />} />
            <Route path="/users/:id/reviews" element={<UserReviews />} />
            <Route path="/my-received-reviews" element={<PrivateRoute element={<MyReceivedReviews />} />} />
            
            {/* Profile Routes */}
            <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
