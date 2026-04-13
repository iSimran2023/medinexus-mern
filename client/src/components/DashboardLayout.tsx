import React from 'react';
import Sidebar from './Sidebar';
import { Search, Calendar } from 'lucide-react';
import '../styles/dashboard.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main-content">
        <header className="top-bar">
          <div className="search-bar">
            <input type="text" className="input-text" placeholder="Search..." />
            <button className="btn-primary-soft btn">Search</button>
          </div>
          <div className="date-section">
            <div>
              <p style={{ fontSize: '12px', color: '#777', margin: 0 }}>Today's Date</p>
              <p style={{ fontWeight: 600, margin: 0 }}>{today}</p>
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
