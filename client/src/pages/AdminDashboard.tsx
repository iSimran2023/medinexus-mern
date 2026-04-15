import React, { useMemo } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { UserRound, Users, BookOpen, CalendarDays, ExternalLink } from 'lucide-react';
import { useFetch } from '../hooks/useFetch';

interface Stats {
  doctors: number;
  patients: number;
  appointments: number;
  sessions: number;
}

interface Appointment {
  _id: string;
  patient: { user: { name: string } };
  schedule: { title: string; date: string };
  appointmentNumber: number;
}

interface Schedule {
  _id: string;
  title: string;
  doctor: { user: { name: string } };
  date: string;
}

const AdminDashboard: React.FC = () => {
  const { data: stats, loading: statsLoading } = useFetch<Stats>('/admin/stats');
  const { data: appointments } = useFetch<Appointment[]>('/admin/appointments');
  const { data: schedules } = useFetch<Schedule[]>('/admin/schedules');

  const statConfig = useMemo(() => [
    { label: 'Doctors', value: stats?.doctors || 0, icon: <UserRound /> },
    { label: 'Patients', value: stats?.patients || 0, icon: <Users /> },
    { label: 'New Booking', value: stats?.appointments || 0, icon: <BookOpen /> },
    { label: 'Today Sessions', value: stats?.sessions || 0, icon: <CalendarDays /> },
  ], [stats]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="stats-grid">
        {statConfig.map((stat, index) => (
          <div key={index} className="stat-card">
            <div>
              <div className="stat-value">{statsLoading ? '...' : stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
            <div className="stat-icon">{stat.icon}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px', marginTop: '30px' }}>
        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', width: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Upcoming Appointments</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>Next 7 days activity</p>
            </div>
            <a href="/admin/appointments" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', textDecoration: 'none' }}>
              View All <ExternalLink size={14} />
            </a>
          </div>
          
          <div style={{ width: '100%', minHeight: '200px' }}>
            {appointments && appointments.length > 0 ? (
              <table className="sub-table">
                <thead>
                  <tr>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>Patient</th>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>Session</th>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>No</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 5).map(app => (
                    <tr key={app._id}>
                      <td style={{ padding: '12px 20px' }}>{app.patient?.user?.name || 'Unknown'}</td>
                      <td style={{ padding: '12px 20px' }}>{app.schedule?.title || 'Session'}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 600 }}>{app.appointmentNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-sub)' }}>No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', width: '100%', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Upcoming Sessions</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>Next 7 days schedule</p>
            </div>
            <a href="/admin/schedule" style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', textDecoration: 'none' }}>
              View All <ExternalLink size={14} />
            </a>
          </div>

          <div style={{ width: '100%', minHeight: '200px' }}>
            {schedules && schedules.length > 0 ? (
              <table className="sub-table">
                <thead>
                  <tr>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>Title</th>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>Doctor</th>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.slice(0, 5).map(sch => (
                    <tr key={sch._id}>
                      <td style={{ padding: '12px 20px' }}>{sch.title}</td>
                      <td style={{ padding: '12px 20px' }}>Dr. {sch.doctor?.user?.name || 'Unknown'}</td>
                      <td style={{ padding: '12px 20px' }}>{new Date(sch.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-sub)' }}>No upcoming sessions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
