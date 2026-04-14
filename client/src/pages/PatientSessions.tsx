import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useFetch } from '../hooks/useFetch';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';
import api from '../services/api';
import '../styles/dashboard.css';

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
  const { data: schedules, loading } = useFetch<Schedule[]>('/admin/schedules'); // Reusing admin schedules for now
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);

  const handleBook = async (scheduleId: string) => {
    setBookingLoading(scheduleId);
    try {
      await api.post('/patient/book', { scheduleId });
      alert('Appointment booked successfully!');
      window.location.href = '/patient'; // Go back to dashboard to see booking
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error booking appointment');
    } finally {
      setBookingLoading(null);
    }
  };

  return (
    <DashboardLayout title="Scheduled Sessions">
      <div className="content-header">
        <h2 className="heading-main">All Sessions</h2>
      </div>

      <div className="sessions-grid">
        {loading ? (
          <p>Loading sessions...</p>
        ) : schedules?.length === 0 ? (
          <p>No sessions available at the moment.</p>
        ) : (
          schedules?.map((s) => (
            <div key={s._id} className="session-card animate-in-bottom">
              <div className="session-info">
                <h3>{s.title}</h3>
                <div className="info-item"><User size={16} /> Dr. {s.doctor.user.name} ({s.doctor.specialty})</div>
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
