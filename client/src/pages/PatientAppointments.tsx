import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useFetch } from '../hooks/useFetch';
import { Calendar, Clock, User, Bookmark } from 'lucide-react';
import '../styles/dashboard.css';

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
  createdAt: string;
}

const PatientAppointments: React.FC = () => {
  const { data: bookings, loading } = useFetch<Booking[]>('/patient/bookings');

  return (
    <DashboardLayout title="My Bookings">
      <div className="content-header">
        <h2 className="heading-main">My Appointment History</h2>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">App. No</th>
              <th className="table-headin">Session Title</th>
              <th className="table-headin">Doctor</th>
              <th className="table-headin">Date & Time</th>
              <th className="table-headin">Booked On</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : bookings?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  <img src="/img/notfound.svg" width="100" alt="Not found" />
                  <p>You haven't made any bookings yet.</p>
                </td>
              </tr>
            ) : (
              bookings?.map((booking) => (
                <tr key={booking._id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {booking.appointmentNumber}
                  </td>
                  <td style={{ fontWeight: 500 }}>{booking.schedule?.title || 'Untitled Session'}</td>
                  <td>Dr. {booking.schedule?.doctor?.user?.name || 'Unknown'}</td>
                  <td>
                    {booking.schedule ? (
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                        <span>{new Date(booking.schedule.date).toLocaleDateString()}</span>
                        <span style={{ color: 'var(--text-sub)' }}>{booking.schedule.time}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default PatientAppointments;
