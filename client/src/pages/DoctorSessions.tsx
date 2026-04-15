import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useFetch } from '../hooks/useFetch';
import '../styles/dashboard.css';

interface Schedule {
  _id: string;
  title: string;
  date: string;
  time: string;
  maxAppointments: number;
}

const DoctorSessions: React.FC = () => {
  const { data: sessions, loading } = useFetch<Schedule[]>('/doctor/sessions');

  return (
    <DashboardLayout title="My Sessions">
      <div className="content-header">
        <h2 className="heading-main">My Sessions</h2>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">Session Title</th>
              <th className="table-headin">Scheduled Date</th>
              <th className="table-headin">Time</th>
              <th className="table-headin">Max Bookings</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : sessions?.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                  <img src="/img/notfound.svg" width="150" alt="Not found" />
                  <p>No sessions found.</p>
                </td>
              </tr>
            ) : (
              sessions?.map((session) => (
                <tr key={session._id}>
                  <td style={{ padding: '15px', fontWeight: 500 }}>{session.title}</td>
                  <td style={{ textAlign: 'center' }}>{new Date(session.date).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>{session.time}</td>
                  <td style={{ textAlign: 'center' }}>{session.maxAppointments}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default DoctorSessions;
