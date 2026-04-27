import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { useFetch } from '../../hooks/useFetch';
import { Eye } from 'lucide-react';
import { LayoutGrid } from 'lucide-react';
import { formatApptNumber } from '../../utils/formatters';
import '../../styles/dashboard.css';

interface Schedule {
  id: string;
  title: string;
  date: string;
  time: string;
  maxAppointments: number;
}

interface Appointment {
  id: string;
  appointmentNumber: number;
  patientName: string;
  patientPhone: string;
  scheduleId: string;
}

const Sessions: React.FC = () => {
  const { data: sessions, loading } = useFetch<Schedule[]>('/doctor/sessions');
  const { data: allAppointments } = useFetch<Appointment[]>('/doctor/appointments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSessionApps, setSelectedSessionApps] = useState<Appointment[]>([]);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState('');
  const [selectedSessionDate, setSelectedSessionDate] = useState('');

  const handleViewPatients = (session: Schedule) => {
    setSelectedSessionTitle(session.title);
    setSelectedSessionDate(session.date);
    const sessionApps = allAppointments?.filter(app => app.scheduleId === session.id) || [];
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
                <td colSpan={5} style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '50%', color: '#94a3b8' }}>
                      <LayoutGrid size={48} strokeWidth={1.5} />
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 500 }}>No sessions found.</div>
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>Your created sessions will appear here.</div>
                  </div>
                </td>
              </tr>
            ) : (
              sessions?.map((session) => (
                <tr key={session.id}>
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
                  <tr key={app.id}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {formatApptNumber(selectedSessionDate, app.appointmentNumber)}
                    </td>
                    <td style={{ padding: '10px' }}>{app.patientName || 'Unknown'}</td>
                    <td>{app.patientPhone || '-'}</td>
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

export default Sessions;
