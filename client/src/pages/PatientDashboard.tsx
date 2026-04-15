import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { UserRound, Users, BookOpen, CalendarDays, Search } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';
import '../styles/dashboard.css';

interface Stats {
  doctors: number;
  patients: number;
  appointments: number;
  sessions: number;
}

interface Booking {
  _id: string;
  appointmentNumber: number;
  schedule: {
    title: string;
    date: string;
    time: string;
    doctor: {
      user: { name: string };
    };
  };
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: stats } = useFetch<Stats>('/patient/stats');
  const { data: bookings } = useFetch<Booking[]>('/patient/bookings');
  const [search, setSearch] = React.useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/patient/schedule?search=${encodeURIComponent(search)}`);
    }
  };

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
          <h1 className="welcome-main">{user?.name}.</h1>
          <p className="welcome-desc">
            Haven't any idea about doctors? no problem let's jumping to <a href="/patient/doctors">"All Doctors"</a> section or <a href="/patient/schedule">"Sessions"</a>.
            Track your past and future appointments history.
          </p>
          
          <div className="search-section">
            <h3>Channel a Doctor Here</h3>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search Doctor and We will Find The Session Available" 
                className="input-text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                className="btn-primary btn search-btn"
                onClick={handleSearch}
              >
                <Search size={18} />
              </button>
            </div>
          </div>
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
          <h2 className="section-title">Your Upcoming Booking</h2>
          <div className="table-container scrollable-table">
            <table className="sub-table">
              <thead>
                <tr>
                  <th className="table-headin">Appoint. Number</th>
                  <th className="table-headin">Session Title</th>
                  <th className="table-headin">Doctor</th>
                  <th className="table-headin">Scheduled Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {bookings?.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Nothing to show here!</td></tr>
                ) : (
                  bookings?.slice(0, 5).map((booking) => (
                    <tr key={booking._id}>
                      <td className="booking-number">{booking.appointmentNumber}</td>
                      <td>{booking.schedule?.title || 'Untitled Session'}</td>
                      <td>Dr. {booking.schedule?.doctor?.user?.name || 'Unknown'}</td>
                      <td>{booking.schedule ? `${new Date(booking.schedule.date).toLocaleDateString()} ${booking.schedule.time}` : '-'}</td>
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

export default PatientDashboard;
