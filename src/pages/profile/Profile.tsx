import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faEdit, 
  faSave, 
  faTimes, 
  faCamera,
  faUserTag,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import ReviewStatsSummary from '../../components/profile/ReviewStatsSummary';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    bio: ''
  });

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        postal_code: user.postal_code || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Here you would typically upload the image to your server
    // For now, we'll just log it
    console.log('Image selected:', file.name);
    
    // Mock implementation - in a real app, you'd upload the file
    // and then update the user profile with the new image URL
    setMessage({ type: 'success', text: 'Profile photo uploaded! (Not implemented yet)' });
  };

  if (!user) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">My Profile</h1>
        
        {!isEditing ? (
          <button className="btn btn-primary" onClick={toggleEdit}>
            <FontAwesomeIcon icon={faEdit} /> Edit Profile
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={toggleEdit}>
            <FontAwesomeIcon icon={faTimes} /> Cancel
          </button>
        )}
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message.text}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="profile-photo-container">
            <div className="profile-photo">
              {user.profile_photo ? (
                <img src={user.profile_photo} alt={user.name} />
              ) : (
                <div className="profile-photo-placeholder">
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
              
              {isEditing && (
                <div className="profile-photo-upload">
                  <label htmlFor="profile-photo-input">
                    <FontAwesomeIcon icon={faCamera} />
                    <span>Change Photo</span>
                  </label>
                  <input 
                    type="file" 
                    id="profile-photo-input" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="profile-meta">
            <div className="profile-rating">
              <span className="rating-value">{user.rating?.toFixed(1) || '0.0'}</span>
              <span className="rating-stars">★★★★★</span>
              <span className="rating-label">Rating</span>
            </div>
            
            <div className="profile-role">
              <FontAwesomeIcon icon={faUserTag} />
              <span>{user.role === 'sender' ? 'Sender' : 'Traveler'}</span>
            </div>
            
            {user.is_verified && (
              <div className="profile-verified">
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>Verified Account</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="profile-main">
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">
                  <FontAwesomeIcon icon={faUser} /> Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">
                  <FontAwesomeIcon icon={faEnvelope} /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled={true} // Email should not be editable
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">
                  <FontAwesomeIcon icon={faPhone} /> Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="address">
                  <FontAwesomeIcon icon={faMapMarkerAlt} /> Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="state">State/Province</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="postal_code">Postal Code</label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-control"
                rows={4}
                placeholder={isEditing ? "Tell us about yourself..." : ""}
              />
            </div>
            
            {isEditing && (
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner spinner-sm spinner-border"></span>
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faSave} /> Save Changes
                    </>
                  )}
                </button>
                
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={toggleEdit}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTimes} /> Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Review Statistics */}
      {user.id && <ReviewStatsSummary userId={user.id} />}
    </div>
  );
};

export default Profile; 