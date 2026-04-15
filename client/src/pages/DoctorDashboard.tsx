import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { UserRound, Users, BookOpen, CalendarDays } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import '../styles/dashboard.css';

interface Stats {
  doctors: number;
  patients: number;
  appointments: number;
  sessions: number;
}

interface Appointment {
  _id: string;
  appointmentNumber: number;
  patient: {
    user: { name: string };
  };
  schedule: {
    title: string;
    date: string;
    time: string;
  };
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: stats } = useFetch<Stats>('/doctor/stats');
  const { data: appointments } = useFetch<Appointment[]>('/doctor/appointments');

  const statConfig = [
    { label: 'All Doctors', value: stats?.doctors || 0, icon: <UserRound /> },
    { label: 'All Patients', value: stats?.patients || 0, icon: <Users /> },
    { label: 'New Booking', value: stats?.appointments || 0, icon: <BookOpen /> },
    { label: 'Today Sessions', value: stats?.sessions || 0, icon: <CalendarDays /> },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="patient-welcome">
        <div className="welcome-text">
          <p className="welcome-sub">Welcome!</p>
          <h1 className="welcome-main">Dr. {user?.name}.</h1>
          <p className="welcome-desc">
            Thanks for joining with us. We are always trying to get you a complete service.
            You can view your daily schedule and reach patients' appointments at home!
          </p>
          <a href="/doctor/appointments" className="btn-primary btn" style={{ display: 'inline-block', width: 'auto', padding: '12px 30px' }}>
            View My Appointments
          </a>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stats-section">
          <h2 className="section-title">Status</h2>
          <div className="stats-grid">
            {statConfig.map((stat, index) => (
              <div key={index} className="stat-card">
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
                <div className="stat-icon">{stat.icon}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="upcoming-section">
          <h2 className="section-title">Upcoming Sessions (until Next week)</h2>
          <div className="table-container scrollable-table">
            <table className="sub-table">
              <thead>
                <tr>
                  <th className="table-headin">Session Title</th>
                  <th className="table-headin">Patient</th>
                  <th className="table-headin">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {appointments?.length === 0 ? (
                  <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No upcoming sessions found.</td></tr>
                ) : (
                  appointments?.slice(0, 5).map((app) => (
                    <tr key={app._id}>
                      <td style={{ padding: '15px' }}>{app.schedule.title}</td>
                      <td>{app.patient.user.name}</td>
                      <td>{new Date(app.schedule.date).toLocaleDateString()} {app.schedule.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
