import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/form.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // For now, mocking the login call since backend routes aren't all set
      // In a real scenario, this would be an API call
      // const response = await api.post('/auth/login', { email, password });
      
      // Mock Data for testing UI
      if (email === 'admin@medinexus.com' && password === '123') {
        login('mock_token', { id: '1', email, role: 'admin', name: 'System Admin' });
        navigate('/admin');
      } else if (email === 'doctor@medinexus.com' && password === '123') {
        login('mock_token', { id: '2', email, role: 'doctor', name: 'Test Doctor' });
        navigate('/doctor');
      } else if (email === 'patient@medinexus.com' && password === '123') {
        login('mock_token', { id: '3', email, role: 'patient', name: 'Test Patient' });
        navigate('/patient');
      } else {
        setError('Invalid email or password. Use test credentials (e.g., admin@medinexus.com / 123)');
      }
    } catch (err) {
      setError('An error occurred during login.');
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2 className="header-text">Welcome Back!</h2>
        <p className="sub-text">Login with your details to continue</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="input-text" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="input-text" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <button type="submit" className="login-btn btn-primary">Login</button>
        </form>
        
        <div className="footer-link">
          Don't have an account? <Link to="/signup" className="hover-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
