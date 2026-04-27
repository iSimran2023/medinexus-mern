import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { Search, Download, Trash2, Printer, ChevronDown, ChevronUp, Eye, CalendarX } from 'lucide-react';
import { printAppointmentPdf } from '../../utils/printPdf';
import { formatApptNumber } from '../../utils/formatters';
import MedicalHistoryDisplay from '../../components/MedicalHistoryDisplay';
import api from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import '../../styles/dashboard.css';

interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  address: string;
  dob: string;
  doctorName: string;
  doctorSpecialty: string;
  scheduleTitle: string;
  scheduleDate: string;
  scheduleTime: string;
  appointmentNumber: number;
  priority: string;
  appointmentDate: string;
  symptoms: string;
  history: string;
  document: string;
  status: string;
  gender?: string;
}

const VITE_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

const Appointments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Rescheduled' | 'Reviewed' | 'Missed' | 'Cancelled'>('Pending');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const { data: schedules } = useFetch<any[]>('/admin/schedules');
  const { data: appointments, loading, setData } = useFetch<Appointment[]>(`/admin/appointments?status=${activeTab}${selectedScheduleId ? `&scheduleId=${selectedScheduleId}` : ''}`);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  const filteredAppointments = appointments?.filter(a => 
    a.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.scheduleTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancelClick = (id: string) => {
    setPendingCancelId(id);
    setIsConfirmOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const confirmCancel = async () => {
    try {
      await api.delete(`/admin/appointments/${pendingCancelId}`);
      setData(appointments?.map(a => a.id === pendingCancelId ? { ...a, status: 'Cancelled' } : a) || null);
    } catch (err) {
      alert('Error cancelling appointment');
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const exportToCSV = () => {
    if (!filteredAppointments) return;
    const headers = ['Patient Name', 'Appointment Number', 'Doctor', 'Session Title', 'Date', 'Time'];
    const csvContent = [
      headers.join(','),
      ...filteredAppointments.map(app => 
        `"${app.patientName}","${formatApptNumber(app.scheduleDate, app.appointmentNumber)}","Dr. ${app.doctorName}","${app.scheduleTitle}","${app.scheduleDate ? new Date(app.scheduleDate).toLocaleDateString() : 'N/A'}","${app.scheduleTime}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'appointments_report.csv';
    link.click();
  };

  return (
    <DashboardLayout title="">
      <div className="content-header">
        <h2 className="heading-main">Appointment Manager</h2>
        <div className="header-actions">
          <div className="header-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Session:</span>
              <select 
                className="filter-dropdown" 
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
              >
                <option value="">All Sessions</option>
                {schedules?.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.title} - {new Date(s.date).toLocaleDateString()} @{s.time}
                  </option>
                ))}
              </select>
            </div>
            
            <input 
              type="text" 
              placeholder="Search patients, doctors..." 
              className="input-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '250px', marginBottom: 0 }}
            />
            
            <button onClick={exportToCSV} className="btn-primary btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '42px' }}>
              <Download size={18} /> Export Report
            </button>
          </div>
        </div>
      </div>
      
      <div className="tabs-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', marginTop: '20px' }}>
        {(['Pending', 'Rescheduled', 'Reviewed', 'Missed', 'Cancelled'] as const).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 15px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              color: activeTab === tab ? 'var(--primary-color)' : '#64748b',
              borderBottom: activeTab === tab ? '2px solid var(--primary-color)' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab} Appointments
          </button>
        ))}
      </div>

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="sub-table" style={{ width: '100%', minWidth: '1000px' }}>
          <thead>
            <tr>
              <th className="table-headin">Patient Name</th>
              <th className="table-headin">Appoint. Number</th>
              <th className="table-headin">Priority</th>
              <th className="table-headin">Doctor</th>
              <th className="table-headin">Session Title</th>
              <th className="table-headin">Session Date & Time</th>
              <th className="table-headin">Status</th>
              <th className="table-headin">Booking Confirmed At</th>
              <th className="table-headin">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredAppointments?.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '50%', color: '#94a3b8' }}>
                      <CalendarX size={48} strokeWidth={1.5} />
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 500 }}>No appointments found.</div>
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>The system-wide appointment list will appear here.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAppointments?.map((app) => (
                <tr key={app.id}>
                  <td style={{ padding: '15px', fontWeight: 600 }}>{app.patientName || 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                    {formatApptNumber(app.scheduleDate, app.appointmentNumber)}
                  </td>
                  <td>
                    {app.priority === 'Emergency' && <span className="priority-emergency">Emergency</span>}
                    {(!app.priority || app.priority === 'Routine') && <span className="priority-routine">Routine</span>}
                  </td>
                  <td>Dr. {app.doctorName || 'N/A'}</td>
                  <td>{app.scheduleTitle || 'N/A'}</td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{app.scheduleDate ? new Date(app.scheduleDate).toLocaleDateString() : 'N/A'}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>@{app.scheduleTime || ''}</div>
                  </td>
                  <td>
                    {app.status === 'Reviewed' ? (
                      <span className="badge badge-reviewed">Reviewed</span>
                    ) : app.status === 'Missed' ? (
                      <span className="badge badge-missed">Missed</span>
                    ) : app.status === 'Rescheduled' ? (
                      <span className="badge badge-rescheduled">Rescheduled</span>
                    ) : app.status === 'Cancelled' ? (
                      <span className="badge badge-cancelled">Cancelled</span>
                    ) : (
                      <span className="badge badge-pending">Pending</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>
                      {app.appointmentDate ? new Date(app.appointmentDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button 
                        onClick={() => toggleExpand(app.id)} 
                        className="btn-primary-soft btn-sm" 
                        title="View Details"
                      >
                        {expandedRow === app.id ? <ChevronUp size={16} /> : <Eye size={16} />}
                      </button>
                      {app.status !== 'Rescheduled' && app.status !== 'Cancelled' && (
                        <button onClick={() => handleCancelClick(app.id)} className="btn-primary-soft btn-sm btn-danger" title="Cancel Appointment"><Trash2 size={16} /></button>
                      )}
                      <button onClick={() => printAppointmentPdf(app)} className="btn-primary-soft btn-sm" title="Print PDF"><Printer size={16} /></button>
                    </div>
                  </td>
                </tr>
              )).flatMap((tr, index, array) => {
                const app = filteredAppointments![index];
                const isExpanded = expandedRow === app.id;
                return [
                  tr,
                  isExpanded && (
                    <tr key={`${app.id}-expanded`} style={{ backgroundColor: '#f8fafc' }}>
                      <td colSpan={8} style={{ padding: '20px', borderTop: 'none' }}>
                        <div style={{ display: 'flex', gap: '40px' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ marginBottom: '10px', color: '#334155' }}>Patient Registration Details</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#64748b' }}>
                              <p><strong>Email:</strong> {app.patientEmail || 'N/A'}</p>
                              <p><strong>Phone:</strong> {app.patientPhone || 'N/A'}</p>
                              <p><strong>Address:</strong> {app.address || 'N/A'}</p>
                              <p><strong>Gender:</strong> {app.gender || 'N/A'}</p>
                              <p><strong>DOB:</strong> {app.dob ? new Date(app.dob).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                          <div style={{ flex: 2 }}>
                            <h4 style={{ marginBottom: '10px', color: '#334155' }}>Full Medical Notes</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#64748b', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <p style={{ marginBottom: '8px' }}><strong style={{ color: '#ef4444' }}>Symptoms:</strong><br/>{app.symptoms || 'None reported'}</p>
                              <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: '#334155' }}>Medical History:</strong>
                                <MedicalHistoryDisplay historyString={app.history || ''} />
                              </div>
                              {app.document && (
                                <p>
                                  <strong style={{ color: '#334155' }}>Attached Document:</strong>{' '}
                                  <a 
                                    href={`${VITE_BASE_URL}/uploads/${app.document}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}
                                  >
                                    {app.document}
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                ];
              })
            )}
          </tbody>
        </table>
      </div>
      
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel and delete this appointment?"
      />
    </DashboardLayout>
  );
};

export default Appointments;
