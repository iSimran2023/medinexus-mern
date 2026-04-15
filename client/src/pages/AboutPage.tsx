import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartPulse, Clock, Globe, Users } from 'lucide-react';
import '../styles/landing.css';

const AboutPage: React.FC = () => {
  return (
    <div className="landing-page">
      <nav className="nav-bar">
        <div className="logo-section">
          <Link to="/" style={{ textDecoration: 'none' }}><span className="edoc-logo">MediNexus.</span></Link>
          <span className="edoc-logo-sub">ABOUT US</span>
        </div>
        <div className="nav-links">
          <Link to="/login" className="nav-item">Sign In</Link>
          <Link to="/signup" className="nav-item register">Join Network</Link>
        </div>
      </nav>

      <main className="hero-container" style={{ paddingTop: '120px' }}>
        <section className="hero-content">
          <span className="badge">Our Vision</span>
          <h1 className="heading-text">
            Revolutionizing <br />
            <span>Healthcare Delivery.</span>
          </h1>
          <p className="sub-text">
            MediNexus is more than just an appointment system. We are an integrated network 
            built to bridge the gap between patients and medical expertise. Our platform 
            empowers doctors with efficient management tools while providing patients 
            with the fastest way to get quality care.
          </p>
          <div className="stats-mini" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #eee' }}>
              <HeartPulse color="var(--primary)" size={24} />
              <h3 style={{ margin: '10px 0 5px' }}>Patient First</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sub)' }}>Designing every feature around your recovery journey.</p>
            </div>
            <div style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #eee' }}>
              <Clock color="var(--primary)" size={24} />
              <h3 style={{ margin: '10px 0 5px' }}>Zero Delay</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sub)' }}>Real-time scheduling to minimize waiting room time.</p>
            </div>
          </div>
        </section>

        <section className="hero-visual">
          <div className="hero-img-wrapper">
             <img src="/img/landing-hero.png" alt="Medical Hero" style={{ filter: 'grayscale(30%)' }} />
          </div>
          <div className="floating-card" style={{ top: '50%', left: '-20px', transform: 'translateY(-50%)', width: '280px' }}>
             <Globe color="var(--primary)" />
             <div className="card-info">
                <h4>Global Standards</h4>
                <p>HIPAA compliant data architecture.</p>
             </div>
          </div>
        </section>
      </main>

      <div style={{ padding: '80px 8%', background: 'white' }}>
         <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '36px', marginBottom: '30px' }}>Why Choose MediNexus?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
               <div>
                  <ShieldCheck size={40} color="var(--primary)" style={{ marginBottom: '15px' }} />
                  <h4>Secure Records</h4>
                  <p style={{ color: 'var(--text-sub)' }}>All your medical history is encrypted and accessible only to your authorized doctors.</p>
               </div>
               <div>
                  <Users size={40} color="var(--primary)" style={{ marginBottom: '15px' }} />
                  <h4>Expert Network</h4>
                  <p style={{ color: 'var(--text-sub)' }}>We verify every medical professional to ensure you receive care from the best in the field.</p>
               </div>
               <div>
                  <Clock size={40} color="var(--primary)" style={{ marginBottom: '15px' }} />
                  <h4>Instant Booking</h4>
                  <p style={{ color: 'var(--text-sub)' }}>No phone calls, no waiting. Select your doctor and book your slot in under 60 seconds.</p>
               </div>
            </div>
         </div>
      </div>

      <footer className="footer">
         <div className="sub-footer">
            <p>© 2026 MediNexus Healthcare Management System. All Rights Reserved.</p>
            <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Back to Home</Link>
         </div>
      </footer>
    </div>
  );
};

export default AboutPage;
