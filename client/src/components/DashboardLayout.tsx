import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Calendar } from 'lucide-react';
import '../styles/dashboard.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-bar">
          <div className="page-info">
            <h1 style={{ fontSize: '20px', margin: 0 }}>{title}</h1>
          </div>
          <div className="date-section">
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>Today's Date & Time</p>
              <p style={{ fontWeight: 600, margin: 0, color: 'var(--primary-color)' }}>
                {formatDate(currentTime)} <span style={{ color: '#64748b', fontSize: '14px', marginLeft: '5px' }}>{formatTime(currentTime)}</span>
              </p>
            </div>
            <div className="stat-icon" style={{ padding: '10px' }}>
              <Calendar size={20} />
            </div>
          </div>
        </header>

        <section className="content-body">
          {children}
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;
