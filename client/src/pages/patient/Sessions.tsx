import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { Calendar, Clock, User, BookOpen } from 'lucide-react';
import api from '../../services/api';
import '../../styles/dashboard.css';
import { useToast } from '../../context/ToastContext';

interface Schedule {
  id: string;
  title: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  maxAppointments: number;
}

const Sessions: React.FC = () => {
  const { data: schedules, loading } = useFetch<Schedule[]>('/patient/sessions');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const navigate = useNavigate();

  const filteredSchedules = schedules?.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.doctorSpecialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBook = (scheduleId: string) => {
    const rescheduleId = queryParams.get('rescheduleId');
    if (rescheduleId) {
      navigate(`/patient/book/${scheduleId}?rescheduleId=${rescheduleId}`);
    } else {
      navigate(`/patient/book/${scheduleId}`);
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
            <div key={s.id} className="session-card animate-in-bottom">
              <div className="session-info">
                <h3>{s.title}</h3>
                <div className="info-item"><User size={16} /> Dr. {s.doctorName} ({s.doctorSpecialty || 'General'})</div>
                <div className="info-item"><Calendar size={16} /> {new Date(s.date).toLocaleDateString()}</div>
                <div className="info-item"><Clock size={16} /> {s.time}</div>
              </div>
              <button 
                className="btn-primary btn book-btn" 
                onClick={() => handleBook(s.id)}
              >
                Book Now
              </button>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sessions;
