import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { UserRound, Users, BookOpen, CalendarDays } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

interface Stats {
  doctors: number;
  patients: number;
  appointments: number;
  sessions: number;
}

const AdminDashboard: React.FC = () => {
  const { data: stats, loading } = useFetch<Stats>('/admin/stats');

  const statConfig = [
    { label: 'Doctors', value: stats?.doctors || 0, icon: <UserRound /> },
    { label: 'Patients', value: stats?.patients || 0, icon: <Users /> },
    { label: 'New Booking', value: stats?.appointments || 0, icon: <BookOpen /> },
    { label: 'Today Sessions', value: stats?.sessions || 0, icon: <CalendarDays /> },
  ];

  return (
    <DashboardLayout title="Status">
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Status</h2>
      <div className="stats-grid">
        {statConfig.map((stat, index) => (
          <div key={index} className="stat-card">
            <div>
              <div className="stat-value">{loading ? '...' : stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
            <div className="stat-icon">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '40px' }}>
        <div className="abc" style={{ border: '1px solid #ebebeb', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ color: 'var(--primary-color)', margin: '0 0 10px' }}>Upcoming Appointments</h3>
          <p style={{ fontSize: '14px', color: '#777' }}>Quick access to appointments for the next 7 days.</p>
          {/* Table would go here */}
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <img src="/img/notfound.svg" alt="Not found" style={{ width: '100px', marginBottom: '15px' }} />
            <p>No upcoming appointments</p>
          </div>
        </div>

        <div className="abc" style={{ border: '1px solid #ebebeb', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ color: 'var(--primary-color)', margin: '0 0 10px' }}>Upcoming Sessions</h3>
          <p style={{ fontSize: '14px', color: '#777' }}>Upcoming scheduled sessions for the next 7 days.</p>
          {/* Table would go here */}
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <img src="/img/notfound.svg" alt="Not found" style={{ width: '100px', marginBottom: '15px' }} />
            <p>No upcoming sessions</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
