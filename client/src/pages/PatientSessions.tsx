import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useFetch } from '../hooks/useFetch';
import { Calendar, Clock, User } from 'lucide-react';
import api from '../services/api';
import '../styles/dashboard.css';
import { useToast } from '../context/ToastContext';

interface Schedule {
  _id: string;
  title: string;
  doctor: {
    user: { name: string };
    specialty: string;
  };
  date: string;
  time: string;
  maxAppointments: number;
}

const PatientSessions: React.FC = () => {
  const { data: schedules, loading } = useFetch<Schedule[]>('/patient/sessions');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const { showToast } = useToast();

  const filteredSchedules = schedules?.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.doctor?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.doctor?.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBook = async (scheduleId: string) => {
    setBookingLoading(scheduleId);
    try {
      await api.post('/patient/book', { scheduleId });
      showToast('Appointment booked successfully!', 'success');
      window.location.href = '/patient';
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error booking appointment', 'error');
    } finally {
      setBookingLoading(null);
    }
  };

  return (
    <DashboardLayout title="Scheduled Sessions">
      <div className="content-header">
        <h2 className="heading-main">All Sessions</h2>
        <div className="search-box" style={{ width: '400px' }}>
          <input 
            type="text" 
            placeholder="Search by Title, Doctor or Specialty..." 
            className="input-text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="sessions-grid">
        {loading ? (
          <p>Loading sessions...</p>
        ) : filteredSchedules?.length === 0 ? (
          <p>No sessions found matching your criteria.</p>
        ) : (
          filteredSchedules?.map((s) => (
            <div key={s._id} className="session-card animate-in-bottom">
              <div className="session-info">
                <h3>{s.title}</h3>
                <div className="info-item"><User size={16} /> Dr. {s.doctor?.user?.name || 'Unknown'} ({s.doctor?.specialty || 'General'})</div>
                <div className="info-item"><Calendar size={16} /> {new Date(s.date).toLocaleDateString()}</div>
                <div className="info-item"><Clock size={16} /> {s.time}</div>
              </div>
              <button 
                className="btn-primary btn book-btn" 
                onClick={() => handleBook(s._id)}
                disabled={bookingLoading === s._id}
              >
                {bookingLoading === s._id ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientSessions;
