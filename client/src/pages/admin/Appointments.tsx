import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { Search, Download, Trash2, Printer, ChevronDown, ChevronUp, Eye, CalendarX } from 'lucide-react';
import { printAppointmentPdf } from '../../utils/printPdf';
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
}

const VITE_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

const Appointments: React.FC = () => {
  const { data: appointments, loading, setData } = useFetch<Appointment[]>('/admin/appointments');
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
      setData(appointments?.filter(a => a.id !== pendingCancelId) || null);
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
        `"${app.patientName}","${app.appointmentNumber}","Dr. ${app.doctorName}","${app.scheduleTitle}","${app.scheduleDate ? new Date(app.scheduleDate).toLocaleDateString() : 'N/A'}","${app.scheduleTime}"`
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
          <div className="search-box" style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Search by patient, doctor or session..." 
              className="input-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '350px' }}
            />
            <button onClick={exportToCSV} className="btn-primary btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
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
                    {app.appointmentNumber}
                  </td>
                  <td>
                    {app.priority === 'Emergency' && <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Emergency</span>}
                    {(!app.priority || app.priority === 'Routine') && <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Routine</span>}
                  </td>
                  <td>Dr. {app.doctorName || 'N/A'}</td>
                  <td>{app.scheduleTitle || 'N/A'}</td>
                  <td>
                    {app.scheduleDate ? new Date(app.scheduleDate).toLocaleDateString() : 'N/A'} @{app.scheduleTime || ''}
                  </td>
                  <td>
                    {app.status === 'Reviewed' ? (
                      <span style={{ background: '#ecfdf5', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Reviewed</span>
                    ) : (
                      <span style={{ background: '#fffbeb', color: '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>Pending</span>
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
                      <button onClick={() => printAppointmentPdf(app)} className="btn-primary-soft btn-sm" title="Print PDF"><Printer size={16} /></button>
                      <button onClick={() => handleCancelClick(app.id)} className="btn-primary-soft btn-sm btn-danger" title="Cancel Appointment"><Trash2 size={16} /></button>
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
                              <p style={{ marginBottom: '8px' }}><strong style={{ color: '#334155' }}>Medical History:</strong><br/>{app.history || 'None reported'}</p>
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
