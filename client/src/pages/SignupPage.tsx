import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/form.css';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    address: '',
    dob: '',
    tel: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      showToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
      showToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="header-text">Let's Get Started</h2>
        <p className="sub-text">Create your patient account to book appointments</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name"
              className="input-text" 
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="input-text" 
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Telephone</label>
              <input 
                type="tel" 
                name="tel"
                className="input-text" 
                placeholder="07XXXXXXXX"
                value={formData.tel}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input 
                type="date" 
                className="input-text" 
                name="dob" 
                value={formData.dob} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select 
                name="gender" 
                className="input-text" 
                value={formData.gender} 
                onChange={handleChange} 
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input 
                type="text" 
                name="address"
                className="input-text" 
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                name="password"
                className="input-text" 
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                className="input-text" 
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
              />
            </div>
          </div>
          
          <button type="submit" className="login-btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="footer-link">
          Already have an account? <Link to="/login" className="hover-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
