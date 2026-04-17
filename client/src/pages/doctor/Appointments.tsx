import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmModal from '../../components/ConfirmModal';
import { useFetch } from '../../hooks/useFetch';
import { Trash2, Printer, ChevronDown, ChevronUp, Eye, CalendarX, CheckCircle2, Clock } from 'lucide-react';
import { printAppointmentPdf } from '../../utils/printPdf';
import api from '../../services/api';
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
  status: 'Pending' | 'Reviewed';
  gender?: string;
}

const VITE_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

const Appointments: React.FC = () => {
  const { data: appointments, loading, setData } = useFetch<Appointment[]>('/doctor/appointments');
  
  // Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Reviewed'>('Pending');

  const handleCancelClick = (id: string) => {
    setPendingCancelId(id);
    setIsConfirmOpen(true);
  };

  const handleReview = async (id: string) => {
    try {
      await api.put(`/doctor/appointments/${id}/review`);
      setData(appointments?.map(a => a.id === id ? { ...a, status: 'Reviewed' as const } : a) || null);
      showToast('Appointment marked as reviewed', 'success');
    } catch (err) {
      alert('Error updating status');
    }
  };

  const filteredByTab = appointments?.filter(a => a.status === activeTab);

  const confirmCancel = async () => {
    try {
      await api.delete(`/doctor/appointments/${pendingCancelId}`);
      setData(appointments?.filter(a => a.id !== pendingCancelId) || null);
    } catch (err) {
      alert('Error cancelling appointment');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <DashboardLayout title="">
      <div className="content-header" style={{ marginBottom: '0' }}>
        <h2 className="heading-main">Appointment Manager</h2>
      </div>

      <div className="tabs-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveTab('Pending')}
          style={{ 
            padding: '12px 20px', 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            color: activeTab === 'Pending' ? 'var(--primary-color)' : '#64748b',
            borderBottom: activeTab === 'Pending' ? '2px solid var(--primary-color)' : '2px solid transparent',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Clock size={18} /> Pending Appointments
        </button>
        <button 
          onClick={() => setActiveTab('Reviewed')}
          style={{ 
            padding: '12px 20px', 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            color: activeTab === 'Reviewed' ? 'var(--primary-color)' : '#64748b',
            borderBottom: activeTab === 'Reviewed' ? '2px solid var(--primary-color)' : '2px solid transparent',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={18} /> Reviewed History
        </button>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">Patient Name</th>
              <th className="table-headin">Appoint. Number</th>
              <th className="table-headin">Priority</th>
              <th className="table-headin">Session Details</th>
              <th className="table-headin">Medical Notes</th>
              <th className="table-headin">Events</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredByTab?.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '50%', color: '#94a3b8' }}>
                      <CalendarX size={48} strokeWidth={1.5} />
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 500 }}>No {activeTab.toLowerCase()} appointments found.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredByTab?.map((app, index) => (
                <tr key={app.id}>
                  <td style={{ padding: '15px', fontWeight: 600 }}>{app.patientName || 'N/A'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                    {app.appointmentNumber}
                  </td>
                  <td>
                    {app.priority === 'Emergency' && <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Emergency</span>}
                    {(!app.priority || app.priority === 'Routine') && <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Routine</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{app.scheduleTitle}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {app.scheduleDate ? new Date(app.scheduleDate).toLocaleDateString() : 'N/A'} @{app.scheduleTime || ''}
                      </span>
                    </div>
                  </td>
                  <td>
                    {app.symptoms ? (
                      <div style={{ fontSize: '13px' }}>
                        <div style={{ color: '#ef4444', marginBottom: '2px' }}><strong>Symptoms:</strong> {app.symptoms?.substring(0, 30)}{app.symptoms?.length > 30 ? '...' : ''}</div>
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '13px' }}>No data</span>
                    )}
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
                      {activeTab === 'Pending' && (
                        <button 
                          onClick={() => handleReview(app.id)} 
                          className="btn-primary-soft btn-sm" 
                          style={{ color: '#10b981', background: '#ecfdf5' }}
                          title="Mark as Reviewed"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => printAppointmentPdf(app)} 
                        className="btn-primary-soft btn-sm" 
                        title="Print PDF"
                      >
                        <Printer size={16} />
                      </button>
                      {activeTab === 'Pending' && (
                        <button 
                          onClick={() => handleCancelClick(app.id)} 
                          className="btn-primary-soft btn-sm btn-danger" 
                          title="Cancel Appointment"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )).flatMap((tr, index) => {
                const app = filteredByTab![index];
                const isExpanded = expandedRow === app.id;
                return [
                  tr,
                  isExpanded && (
                    <tr key={`${app.id}-expanded`} style={{ backgroundColor: '#f8fafc' }}>
                      <td colSpan={6} style={{ padding: '20px', borderTop: 'none' }}>
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
        message="Are you sure you want to cancel this appointment? This action will remove the patient from this session."
      />
    </DashboardLayout>
  );
};

export default Appointments;
