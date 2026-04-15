import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useFetch } from '../hooks/useFetch';
import { Search } from 'lucide-react';
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
    doctor: {
      user: { name: string };
    };
  };
}

const AdminAppointments: React.FC = () => {
  const { data: appointments, loading } = useFetch<Appointment[]>('/admin/appointments');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAppointments = appointments?.filter(a => 
    a.patient.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.schedule.doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="">
      <div className="content-header">
        <h2 className="heading-main">Appointment Manager</h2>
        <div className="header-actions">
          <div className="search-box" style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Search by patient, doctor or session..." 
              className="input-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '350px' }}
            />
            <button className="btn-primary btn button-icon"><Search size={18} /></button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">Patient Name</th>
              <th className="table-headin">Appoint. Number</th>
              <th className="table-headin">Doctor</th>
              <th className="table-headin">Session Title</th>
              <th className="table-headin">Session Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredAppointments?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  <img src="/img/notfound.svg" width="150" alt="Not found" />
                  <p>No appointments found.</p>
                </td>
              </tr>
            ) : (
              filteredAppointments?.map((app) => (
                <tr key={app._id}>
                  <td style={{ padding: '15px', fontWeight: 600 }}>{app.patient.user.name}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                    {app.appointmentNumber}
                  </td>
                  <td>Dr. {app.schedule.doctor.user.name}</td>
                  <td>{app.schedule.title}</td>
                  <td>
                    {new Date(app.schedule.date).toLocaleDateString()} @{app.schedule.time}
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

export default AdminAppointments;
