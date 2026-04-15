import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Activity, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import '../styles/landing.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      <nav className="nav-bar">
        <div className="logo-section">
          <span className="edoc-logo">MediNexus.</span>
          <span className="edoc-logo-sub">INTEGRATED HEALTHCARE</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-item">Sign In</Link>
          <Link to="/signup" className="nav-item register">Join Network</Link>
        </div>
      </nav>

      <main className="hero-container">
        <section className="hero-content">
          <span className="badge">#1 Healthcare Management System</span>
          <h1 className="heading-text">
            Avoid Hassles, <br />
            <span>Empower Health.</span>
          </h1>
          <p className="sub-text">
            Connecting specialists with patients in a seamless clinical network. 
            Experience zero-delay bookings, digital records, and professional health management 
            right at your fingertips.
          </p>
          <div className="cta-group">
            <Link to="/signup" className="btn-primary">
              Make Appointment
            </Link>
            <Link to="/about" className="btn-secondary">
              <span className="card-icon" style={{width: '32px', height: '32px', background: 'white', color: 'var(--primary)', border: '1px solid #eee'}}>
                <Play size={14} fill="var(--primary)" />
              </span>
              Watch Demo
            </Link>
          </div>
        </section>

        <section className="hero-visual">
          <div className="hero-img-wrapper">
            <img src="/img/landing-hero.png" alt="Medical Hero" />
          </div>
          
          <div className="floating-card card-1">
            <div className="card-icon">
              <Activity size={20} />
            </div>
            <div className="card-info">
              <h4>98%</h4>
              <p>Success Rate</p>
            </div>
          </div>

          <div className="floating-card card-2">
            <div className="card-icon" style={{background: '#10b981'}}>
              <ShieldCheck size={20} />
            </div>
            <div className="card-info">
              <h4>Secure</h4>
              <p>Data Protection</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-section footer-brand">
            <span className="footer-logo">MediNexus.</span>
            <p>
              The unified healthcare network connecting thousands of patients with 
              specialists. Quality care, delivered digitally.
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/login">Find Doctors</Link></li>
              <li><Link to="/signup">Join Network</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Get in Touch</h4>
            <div className="contact-info">
              <p><Mail size={16} /> contact@medinexus.health</p>
              <p><Phone size={16} /> +977 9800000000</p>
              <p><MapPin size={16} /> 750 Health Plaza, Medical District, XYZ</p>
            </div>
          </div>
        </div>

        <div className="sub-footer">
          <p>© 2026 MediNexus Healthcare Management System. All Rights Reserved.</p>
          <div className="social-links">
            <a href="#" className="social-icon"><Mail size={18} /></a>
            <a href="#" className="social-icon"><Phone size={18} /></a>
            <a href="#" className="social-icon"><Activity size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
