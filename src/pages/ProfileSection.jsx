import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faLock, faEdit, faSpinner, faUserShield, faCamera, faUpload } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';
import { API_BASE } from '../config/api';

const ProfileSection = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    image: '',
    phone: '',
    address: '',
    bio: '',
    currentPassword: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [storedPassword, setStoredPassword] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = Cookies.get('userId');
        const isAdmin = Cookies.get('isAdmin') === 'true';
        
        if (!userId) {
          throw new Error('Session expired. Please login again.');
        }
        
        setIsAdmin(isAdmin);
        
        const endpoint = isAdmin ? `/api/admin/users/${userId}` : `/api/users/${userId}`;
        const response = await fetch(`${API_BASE}${endpoint}`, { credentials: 'include' });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const data = await response.json();
        setStoredPassword(data.password || ''); // Store the current password
        setProfile(prev => ({
          ...prev,
          name: data.username || '',
          email: data.email || '',
          image: data.image ? `${API_BASE}/img/${data.image}` : `${API_BASE}/img/profile.png`,
          phone: data.phone || '',
          address: data.address || '',
          bio: data.bio || ''
        }));
      } catch (err) {
        setError(err.message);
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setProfile(prev => ({ ...prev, image: `${API_BASE}/img/${data.filename}` }));
      setSuccess('Profile image updated successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  setSuccess('');
  
  try {
    const userId = Cookies.get('userId');
    const isAdmin = Cookies.get('isAdmin') === 'true';
    
    if (!userId) {
      throw new Error('Session expired. Please login again.');
    }

    if (showPasswordFields) {
      // Validate current password matches stored password
      if (profile.currentPassword !== storedPassword) {
        throw new Error('Current password is incorrect');
      }

      if (profile.password !== profile.confirmPassword) {
        throw new Error('New passwords do not match');
      }

   
    }









     const endpoint = isAdmin ? `/api/admin/users/${userId}` : `/api/users/${userId}`;
    
    const updateData = {
      username: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      bio: profile.bio,
      currentPassword: profile.currentPassword,
      password: profile.password
    };

    // Fix image path handling - check for both possible paths
    if (profile.image) {
      if (profile.image.startsWith(`${API_BASE}/img/`)) {
        updateData.image = profile.image.replace(`${API_BASE}/img/`, '');
      } else if (profile.image.startsWith('/img/')) {
        updateData.image = profile.image.replace('/img/', '');
      }
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData),
      credentials: 'include'
    });
    







    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    if (profile.name !== Cookies.get('username')) {
      Cookies.set('username', profile.name, { expires: 7 });
    }
    
    // Update stored password if it was changed
    if (showPasswordFields) {
      setStoredPassword(profile.password);
    }
    
    setSuccess('Profile updated successfully');
    setShowPasswordFields(false);
    setEditMode(false);
  } catch (err) {
    setError(err.message);
    console.error('Profile update error:', err);
  } finally {
    setLoading(false);
  }
};

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  if (loading && !editMode) {
    return (
      <div className="profile-section">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin && window.location.pathname.includes('admin')) {
    return (
      <div className="profile-section">
        <div className="admin-only-message">
          <FontAwesomeIcon icon={faUserShield} size="3x" />
          <h2>Admin Access Required</h2>
          <p>This section is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="profile-header">
        <h2>Profile Information {isAdmin && <span className="admin-badge">Admin</span>}</h2>
        <button 
          onClick={() => {
            setEditMode(!editMode);
            setShowPasswordFields(false);
            setError('');
            setSuccess('');
          }}
          className={`edit-btn ${editMode ? 'cancel' : ''}`}
          disabled={loading}
        >
          <FontAwesomeIcon icon={editMode ? faLock : faEdit} />
          {editMode ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-image-container">
          <div className="profile-image-wrapper">
        <img 
  src={profile.image} 
  alt="Profile" 
  className="profile-image"
  onError={(e) => {
    e.target.src = '/img/profile.png';
  }}
/>
            {editMode && (
              <>
                <input
                  type="file"
                  id="profile-pic"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <div className="image-upload-overlay">
                  <button 
                    className="image-upload-btn"
                    onClick={triggerFileInput}
                    disabled={loading}
                  >
                    {loading ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCamera} />
                        <span>Change Photo</span>
                      </>
                    )}
                  </button>
                  {profile.image && profile.image !== '/img/profile.png' && (
                    <button 
                      className="image-remove-btn"
                      onClick={() => setProfile(prev => ({ ...prev, image: '/img/profile.png' }))}
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={profile.address}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                rows="4"
                disabled={loading}
              />
            </div>

            {!showPasswordFields && (
              <button 
                type="button" 
                className="change-password-btn"
                onClick={() => setShowPasswordFields(true)}
              >
                Change Password
              </button>
            )}

           {showPasswordFields && (
  <div className="password-fields">
    <div className="form-group">
      <label htmlFor="currentPassword">Current Password</label>
      <input
        type="password"  // Changed from "currentPassword"
        id="currentPassword"
        name="currentPassword"
        value={profile.currentPassword}
        onChange={handleInputChange}
        required
        disabled={loading}
      />
    </div>

    <div className="form-group">
      <label htmlFor="password">New Password</label>
      <input
        type="password"  // Changed from "currentPassword"
        id="password"
        name="password"
        value={profile.password}
        onChange={handleInputChange}
        required
        disabled={loading}
      />
    </div>

    <div className="form-group">
      <label htmlFor="confirmPassword">Confirm New Password</label>
      <input
        type="password"  // Changed from "currentPassword"
        id="confirmPassword"
        name="confirmPassword"
        value={profile.confirmPassword}
        onChange={handleInputChange}
        required
        disabled={loading}
      />
    </div>
  </div>
)}

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin /> Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-item">
              <FontAwesomeIcon icon={faUser} className="detail-icon" />
              <div>
                <h3>Full Name</h3>
                <p>{profile.name || 'Not provided'}</p>
              </div>
            </div>

            <div className="detail-item">
              <FontAwesomeIcon icon={faEnvelope} className="detail-icon" />
              <div>
                <h3>Email</h3>
                <p>{profile.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="detail-item">
              <FontAwesomeIcon icon={faPhone} className="detail-icon" />
              <div>
                <h3>Phone</h3>
                <p>{profile.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="detail-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="detail-icon" />
              <div>
                <h3>Address</h3>
                <p>{profile.address || 'Not provided'}</p>
              </div>
            </div>

            <div className="detail-item bio">
              <div>
                <h3>About Me</h3>
                <p>{profile.bio || 'Not provided'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
