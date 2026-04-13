import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-background">
      <nav className="nav-bar">
        <div className="logo-section">
          <span className="edoc-logo">MediNexus.</span>
          <span className="edoc-logo-sub">| THE INTEGRATED HEALTHCARE NETWORK</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-item">LOGIN</Link>
          <Link to="/signup" className="nav-item">REGISTER</Link>
        </div>
      </nav>

      <main className="hero-section">
        <h1 className="heading-text">Avoid Hassles & Delays.</h1>
        <p className="sub-text">
          How is your health today? Sounds like it could be better!<br />
          Don't worry. Find your specialist online and book appointments at your convenience with MediNexus.<br />
          We provide a seamless clinical connection service. Secure your slot now.
        </p>
        <Link to="/login" className="btn-primary">
          Make Appointment
        </Link>
      </main>

      <footer className="footer-text">
        © 2026 MediNexus Healthcare Management System. A Professional Web Solution.
      </footer>
    </div>
  );
};

export default LandingPage;
