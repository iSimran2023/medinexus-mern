import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import { useFetch } from '../hooks/useFetch';
import { Eye } from 'lucide-react';
import '../styles/dashboard.css';

interface Schedule {
  _id: string;
  title: string;
  date: string;
  time: string;
  maxAppointments: number;
}

interface Appointment {
  _id: string;
  appointmentNumber: number;
  patient: {
    user: { name: string; email: string };
    tel: string;
  };
  schedule: {
    _id: string;
  };
}

const DoctorSessions: React.FC = () => {
  const { data: sessions, loading } = useFetch<Schedule[]>('/doctor/sessions');
  const { data: allAppointments } = useFetch<Appointment[]>('/doctor/appointments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSessionApps, setSelectedSessionApps] = useState<Appointment[]>([]);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState('');

  const handleViewPatients = (session: Schedule) => {
    setSelectedSessionTitle(session.title);
    const sessionApps = allAppointments?.filter(app => app.schedule?._id === session._id) || [];
    setSelectedSessionApps(sessionApps);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout title="">
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
              <th className="table-headin">Events</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : sessions?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  <img src="/img/notfound.svg" width="150" alt="Not found" />
                  <p>No sessions found.</p>
                </td>
              </tr>
            ) : (
              sessions?.map((session) => (
                <tr key={session._id}>
                  <td style={{ padding: '15px', fontWeight: 500 }}>{session.title}</td>
                  <td>{new Date(session.date).toLocaleDateString()}</td>
                  <td>{session.time}</td>
                  <td>{session.maxAppointments}</td>
                  <td>
                    <div className="action-btns">
                        <button 
                          onClick={() => handleViewPatients(session)} 
                          className="btn-primary-soft btn-sm"
                          title="View Patients"
                        >
                          <Eye size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Patients for ${selectedSessionTitle}`}
      >
        <div className="table-container" style={{ margin: 0, boxShadow: 'none' }}>
          <table className="sub-table" style={{ width: '100%', minWidth: '500px' }}>
            <thead>
              <tr>
                <th className="table-headin">App. No</th>
                <th className="table-headin">Patient Name</th>
                <th className="table-headin">Telephone</th>
              </tr>
            </thead>
            <tbody>
              {selectedSessionApps.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '20px' }}>
                    No patients booked for this session yet.
                  </td>
                </tr>
              ) : (
                selectedSessionApps.sort((a, b) => a.appointmentNumber - b.appointmentNumber).map((app) => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {app.appointmentNumber}
                    </td>
                    <td style={{ padding: '10px' }}>{app.patient?.user?.name || 'Unknown'}</td>
                    <td>{app.patient?.tel || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default DoctorSessions;
