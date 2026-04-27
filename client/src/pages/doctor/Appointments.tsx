import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmModal from '../../components/ConfirmModal';
import { useFetch } from '../../hooks/useFetch';
import { Trash2, Printer, ChevronDown, ChevronUp, Eye, CalendarX, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { printAppointmentPdf } from '../../utils/printPdf';
import { formatApptNumber } from '../../utils/formatters';
import MedicalHistoryDisplay from '../../components/MedicalHistoryDisplay';
import api from '../../services/api';
import '../../styles/dashboard.css';
import { useToast } from '../../context/ToastContext';

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
  status: 'Pending' | 'Reviewed' | 'Missed' | 'Rescheduled' | 'Cancelled';
  gender?: string;
  prescription?: {
    diagnosis: string;
    medications: string[];
    notes: string;
  };
  scheduleId?: string;
}

const VITE_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

const Appointments: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Rescheduled' | 'Reviewed' | 'Missed' | 'Cancelled'>('Pending');
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const { data: schedules } = useFetch<any[]>('/doctor/sessions');
  const { data: appointments, loading, setData } = useFetch<Appointment[]>(`/doctor/appointments?status=${activeTab}${selectedScheduleId ? `&scheduleId=${selectedScheduleId}` : ''}`);
  const { showToast } = useToast();
  
  // Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReviewConfirmOpen, setIsReviewConfirmOpen] = useState(false);
  const [pendingActionId, setPendingActionId] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Prescription Form State
  const [prescription, setPrescription] = useState({
    diagnosis: '',
    medications: '',
    notes: ''
  });

  const handleCancelClick = (id: string) => {
    setPendingActionId(id);
    setIsConfirmOpen(true);
  };

  const handleReviewClick = (id: string) => {
    setPendingActionId(id);
    setIsReviewConfirmOpen(true);
  };

  const confirmReview = async () => {
    try {
      const payload = {
        prescription: {
          ...prescription,
          medications: prescription.medications.split(',').map(m => m.trim()).filter(m => m !== '')
        }
      };
      await api.put(`/doctor/appointments/${pendingActionId}/review`, payload);
      setData(appointments?.map(a => a.id === pendingActionId ? { 
        ...a, 
        status: 'Reviewed' as const,
        prescription: payload.prescription
      } : a) || null);
      showToast('Appointment reviewed and prescription saved.', 'success');
      setIsReviewConfirmOpen(false);
      setPrescription({ diagnosis: '', medications: '', notes: '' });
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  const updateServingToken = async (scheduleId: string, tokenNumber: number, date: string) => {
    try {
      await api.put('/doctor/sessions/serving-token', { scheduleId, tokenNumber });
      showToast(`Now serving ${formatApptNumber(date, tokenNumber)}`, 'success');
    } catch (err) {
      showToast('Error updating serving token', 'error');
    }
  };

  const filteredByTab = appointments;

  const confirmCancel = async () => {
    try {
      await api.delete(`/doctor/appointments/${pendingActionId}`);
      setData(appointments?.filter(a => a.id !== pendingActionId) || null);
      showToast('Appointment cancelled successfully', 'success');
      setIsConfirmOpen(false);
    } catch (err) {
      showToast('Error cancelling appointment', 'error');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <DashboardLayout title="">
      <div className="content-header" style={{ marginBottom: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="heading-main">Appointment Manager</h2>
        
        <div className="header-controls">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Filter by Session:</span>
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
        </div>
      </div>

      <div className="tabs-container" style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', marginTop: '20px' }}>
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
          onClick={() => setActiveTab('Rescheduled')}
          style={{ 
            padding: '12px 20px', 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            color: activeTab === 'Rescheduled' ? 'var(--primary-color)' : '#64748b',
            borderBottom: activeTab === 'Rescheduled' ? '2px solid var(--primary-color)' : '2px solid transparent',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Calendar size={18} /> Rescheduled Appointments
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
          <CheckCircle2 size={18} /> Reviewed Appointments
        </button>
        <button 
          onClick={() => setActiveTab('Missed')}
          style={{ 
            padding: '12px 20px', 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            color: activeTab === 'Missed' ? 'var(--primary-color)' : '#64748b',
            borderBottom: activeTab === 'Missed' ? '2px solid var(--primary-color)' : '2px solid transparent',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CalendarX size={18} /> Missed Appointments
        </button>
        <button 
          onClick={() => setActiveTab('Cancelled')}
          style={{ 
            padding: '12px 20px', 
            border: 'none', 
            background: 'none', 
            cursor: 'pointer',
            color: activeTab === 'Cancelled' ? 'var(--primary-color)' : '#64748b',
            borderBottom: activeTab === 'Cancelled' ? '2px solid var(--primary-color)' : '2px solid transparent',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Trash2 size={18} /> Cancelled Appointments
        </button>
      </div>

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="sub-table" style={{ width: '100%', minWidth: '800px' }}>
          <thead>
            <tr>
              <th className="table-headin">Patient Name</th>
              <th className="table-headin">Appoint. Number</th>
              <th className="table-headin">Priority</th>
              <th className="table-headin">Status</th>
              <th className="table-headin">Session Details</th>
              <th className="table-headin">Booking Confirmed At</th>
              <th className="table-headin">Events</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredByTab?.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '80px 20px' }}>
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
                    {formatApptNumber(app.scheduleDate, app.appointmentNumber)}
                  </td>
                  <td>
                    {app.priority === 'Emergency' && <span className="priority-emergency">Emergency</span>}
                    {(!app.priority || app.priority === 'Routine') && <span className="priority-routine">Routine</span>}
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
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500 }}>{app.scheduleTitle}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {app.scheduleDate ? new Date(app.scheduleDate).toLocaleDateString() : 'N/A'} @{app.scheduleTime || ''}
                      </span>
                    </div>
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
                      {app.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => {
                              updateServingToken(app.scheduleId!, app.appointmentNumber, app.scheduleDate!);
                            }}
                            className="btn-primary-soft btn-sm"
                            style={{ color: '#8b5cf6', background: '#f5f3ff' }}
                            title="Call Patient (Update Serving Token)"
                          >
                            <Clock size={16} />
                          </button>
                          <button 
                            onClick={() => handleReviewClick(app.id)} 
                            className="btn-primary-soft btn-sm" 
                            style={{ color: '#10b981', background: '#ecfdf5' }}
                            title="Complete & Prescribe"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => printAppointmentPdf(app)} 
                        className="btn-primary-soft btn-sm" 
                        title="Print PDF"
                      >
                        <Printer size={16} />
                      </button>
                      {app.status === 'Pending' && (
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
        message="Are you sure you want to cancel this appointment? This action will remove the patient from this session."
      />

      <ConfirmModal 
        isOpen={isReviewConfirmOpen}
        onClose={() => setIsReviewConfirmOpen(false)}
        onConfirm={confirmReview}
        title="Digital Prescription & Review"
        message="Enter the diagnosis and medications for this patient."
        confirmLabel="Save & Complete"
        cancelLabel="Discard"
        variant="primary"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Diagnosis</label>
            <input 
              type="text" 
              className="input-text" 
              placeholder="e.g. Viral Fever"
              value={prescription.diagnosis}
              onChange={(e) => setPrescription({ ...prescription, diagnosis: e.target.value })}
              style={{ width: '100%', padding: '10px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Medications (comma separated)</label>
            <textarea 
              className="input-text" 
              placeholder="e.g. Paracetamol 500mg, Amoxicillin"
              value={prescription.medications}
              onChange={(e) => setPrescription({ ...prescription, medications: e.target.value })}
              style={{ width: '100%', padding: '10px', minHeight: '60px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '5px' }}>Additional Notes</label>
            <textarea 
              className="input-text" 
              placeholder="e.g. Bed rest for 3 days"
              value={prescription.notes}
              onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
              style={{ width: '100%', padding: '10px', minHeight: '80px' }}
            />
          </div>
        </div>
      </ConfirmModal>
    </DashboardLayout>
  );
};

export default Appointments;
