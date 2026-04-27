import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { UserRound, Users, BookOpen, CalendarDays, ExternalLink } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import { formatApptNumber } from '../../utils/formatters';
import '../../styles/dashboard.css';

interface Stats {
  doctors: number;
  patients: number;
  appointments: number;
  sessions: number;
}

interface Appointment {
  id: string;
  patientName: string;
  scheduleTitle: string;
  appointmentNumber: number;
  scheduleDate: string;
  status: string;
}

interface Schedule {
  id: string;
  title: string;
  doctorName: string;
  date: string;
  time: string;
}

const Dashboard: React.FC = () => {
  const { data: stats, loading: statsLoading } = useFetch<Stats>('/admin/stats');
  const { data: appointments } = useFetch<Appointment[]>('/admin/appointments');
  const { data: schedules } = useFetch<Schedule[]>('/admin/schedules');

  const upcomingAppointments = useMemo(() => 
    appointments?.filter(app => app.status === 'Pending') || [], 
    [appointments]
  );

  const upcomingSchedules = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    return schedules?.filter(s => {
      const schDate = new Date(s.date);
      // Combine date and time
      if (s.time) {
        const [hours, minutes] = s.time.split(':');
        schDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      
      return schDate >= now && schDate <= nextWeek;
    }) || [];
  }, [schedules]);

  const statConfig = useMemo(() => [
    { label: 'Doctors', value: stats?.doctors || 0, icon: <UserRound />, link: '/admin/doctors' },
    { label: 'Patients', value: stats?.patients || 0, icon: <Users />, link: '/admin/patients' },
    { label: 'New Booking', value: stats?.appointments || 0, icon: <BookOpen />, link: '/admin/appointments' },
    { label: 'Today Sessions', value: stats?.sessions || 0, icon: <CalendarDays />, link: '/admin/schedule' },
  ], [stats]);

  const navigate = useNavigate();

  return (
    <DashboardLayout title="Dashboard">
      <div className="stats-grid">
        {statConfig.map((stat, index) => (
          <div key={index} className="stat-card" onClick={() => navigate(stat.link)} style={{ cursor: 'pointer' }}>
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
            {upcomingAppointments.length > 0 ? (
              <table className="sub-table">
                <thead>
                  <tr>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>Patient</th>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>Session</th>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>No</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingAppointments.slice(0, 5).map(app => (
                    <tr key={app.id}>
                      <td style={{ padding: '12px 20px' }}>{app.patientName || 'Unknown'}</td>
                      <td style={{ padding: '12px 20px' }}>{app.scheduleTitle || 'Session'}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 600 }}>{formatApptNumber(app.scheduleDate, app.appointmentNumber)}</td>
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
            {upcomingSchedules.length > 0 ? (
              <table className="sub-table">
                <thead>
                  <tr>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>Title</th>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>Doctor</th>
                    <th className="table-headin" style={{ padding: '12px 20px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingSchedules.slice(0, 5).map(sch => (
                    <tr key={sch.id}>
                      <td style={{ padding: '12px 20px' }}>{sch.title}</td>
                      <td style={{ padding: '12px 20px' }}>Dr. {sch.doctorName || 'Unknown'}</td>
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

export default Dashboard;
