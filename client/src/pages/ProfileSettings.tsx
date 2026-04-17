import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/dashboard.css';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    document: null as File | null
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'document' && e.target.files) {
      setFormData({ ...formData, document: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    
    try {
      await api.put('/auth/profile', formData);
      setMessage('Profile updated successfully! If you changed your password, please log in again.');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error updating profile');
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="content-header">
        <h2 className="heading-main">Profile Settings</h2>
      </div>

      <div className="settings-container" style={{ maxWidth: '600px', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        {message && <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f4ff', color: 'var(--primary-color)', borderRadius: '4px' }}>{message}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Name:</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Email:</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Current Password (required to change password):</label>
            <input 
              type="password" 
              name="currentPassword" 
              value={formData.currentPassword} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>New Password:</label>
            <input 
              type="password" 
              name="newPassword" 
              value={formData.newPassword} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Confirm New Password:</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Upload Medical Documents / ID:</label>
            <input 
              type="file" 
              name="document" 
              onChange={handleChange} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#f8f9fa' }}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>Supported formats: PDF, JPG, PNG (Max 5MB)</small>
          </div>
          <button type="submit" className="btn-primary btn" style={{ marginTop: '10px', width: '100%' }}>Update Profile</button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
