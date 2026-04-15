import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useFetch } from '../hooks/useFetch';
import { Trash2 } from 'lucide-react';
import api from '../services/api';
import '../styles/dashboard.css';

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

const DoctorAppointments: React.FC = () => {
  const { data: appointments, loading, setData } = useFetch<Appointment[]>('/doctor/appointments');

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.delete(`/doctor/appointments/${id}`);
        setData(appointments?.filter(a => a._id !== id) || null);
      } catch (err) {
        alert('Error cancelling appointment');
      }
    }
  };

  return (
    <DashboardLayout title="My Appointments">
      <div className="content-header">
        <h2 className="heading-main">Appointment Manager</h2>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">Patient Name</th>
              <th className="table-headin">Appoint. Number</th>
              <th className="table-headin">Session Title</th>
              <th className="table-headin">Session Date & Time</th>
              <th className="table-headin">Events</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : appointments?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  <img src="/img/notfound.svg" width="150" alt="Not found" />
                  <p>No appointments found.</p>
                </td>
              </tr>
            ) : (
              appointments?.map((app) => (
                <tr key={app._id}>
                  <td style={{ padding: '15px', fontWeight: 600 }}>{app.patient.user.name}</td>
                  <td style={{ textAlign: 'center', fontSize: '20px', fontWeight: 500, color: 'var(--primary-color)' }}>
                    {app.appointmentNumber}
                  </td>
                  <td>{app.schedule.title}</td>
                  <td style={{ textAlign: 'center' }}>
                    {new Date(app.schedule.date).toLocaleDateString()} @{app.schedule.time}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => handleCancel(app._id)} className="btn-primary-soft btn-sm btn-danger"><Trash2 size={16} /> Cancel</button>
                    </div>
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

export default DoctorAppointments;
