import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { Calendar, Clock, User, Bookmark, Printer, Eye, ChevronDown, ChevronUp, Inbox, Trash2 } from 'lucide-react';
import { printAppointmentPdf } from '../../utils/printPdf';
import { formatApptNumber } from '../../utils/formatters';
import MedicalHistoryDisplay from '../../components/MedicalHistoryDisplay';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useState } from 'react';
import api from '../../services/api';
import '../../styles/dashboard.css';

interface Booking {
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
  currentlyServingToken?: number;
  currentlyServingTokenFull?: string;
  currentlyServingPriority?: string;
  gender?: string;
  prescription?: {
    diagnosis: string;
    medications: string[];
    notes: string;
  };
}

const VITE_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

const Appointments: React.FC = () => {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const { data: schedules } = useFetch<any[]>('/patient/sessions');
  const { data: bookings, loading } = useFetch<Booking[]>(`/patient/bookings${selectedScheduleId ? `?scheduleId=${selectedScheduleId}` : ''}`);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.put(`/patient/appointments/${id}/cancel`);
        showToast('Appointment cancelled', 'success');
        // Refresh or update state
        window.location.reload();
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Error cancelling appointment', 'error');
      }
    }
  };

  const calculateWaitTime = (myToken: number, currentToken: number, status: string, currentPriority: string) => {
    if (currentToken === 0) return '-';
    const diff = myToken - currentToken;
    if (status === 'Reviewed') return 'Completed';
    
    if (diff < 0) {
      // If a higher token is being served but it's an emergency, your turn hasn't necessarily passed.
      if (currentPriority === 'Emergency') return 'Waiting (Priority Call)';
      return 'Turn Passed';
    }
    
    if (diff === 0) return 'It\'s your turn! Proceed now.';
    if (diff === 1) return 'You\'re next! (Coming up)';
    return `~${diff * 10} minutes`;
  };

  return (
    <DashboardLayout title="My Bookings">
      <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 className="heading-main">My Appointment History</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Filter by Session:</span>
          <select 
            className="input-text" 
            style={{ width: '250px', padding: '8px 12px' }}
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

      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table className="sub-table" style={{ width: '100%', minWidth: '900px' }}>
          <thead>
            <tr>
              <th className="table-headin">App. No</th>
              <th className="table-headin">Session Title</th>
              <th className="table-headin">Doctor</th>
              <th className="table-headin">Booking Confirmed At</th>
              <th className="table-headin">Scheduled Date & Time</th>
              <th className="table-headin">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : bookings?.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '50%', color: '#94a3b8' }}>
                      <Inbox size={48} strokeWidth={1.5} />
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 500 }}>No bookings yet.</div>
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>Your appointment history will be displayed here.</div>
                  </div>
                </td>
              </tr>
            ) : (
              bookings?.map((booking) => (
                <tr key={booking.id}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                    {formatApptNumber(booking.scheduleDate, booking.appointmentNumber)}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {booking.scheduleTitle || 'Untitled Session'}
                      {booking.status === 'Rescheduled' && (
                        <span style={{ fontSize: '10px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>RESCHEDULED</span>
                      )}
                      {booking.status === 'Missed' && (
                        <span style={{ fontSize: '10px', background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>MISSED</span>
                      )}
                    </div>
                  </td>
                  <td>Dr. {booking.doctorName || 'Unknown'}</td>
                  <td>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>
                      {booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                    </div>
                  </td>
                  <td>
                    {booking.scheduleDate ? (
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                        <span>{new Date(booking.scheduleDate).toLocaleDateString()}</span>
                        <span style={{ color: 'var(--text-sub)' }}>{booking.scheduleTime}</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button 
                        onClick={() => toggleExpand(booking.id)} 
                        className="btn-primary-soft btn-sm" 
                        title="View Details"
                      >
                        {expandedRow === booking.id ? <ChevronUp size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        className="btn-primary-soft btn-sm" 
                        title="Print PDF"
                        onClick={() => printAppointmentPdf(booking)}
                        style={{ padding: '6px' }}
                      >
                        <Printer size={16} />
                      </button>
                      {booking.status === 'Pending' && (
                        <>
                          <button 
                            className="btn-primary-soft btn-sm btn-danger" 
                            title="Cancel Appointment"
                            onClick={() => handleCancel(booking.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                          <button 
                            className="btn-primary-soft btn-sm" 
                            title="Reschedule"
                            onClick={() => navigate(`/patient/schedule?rescheduleId=${booking.id}`)}
                            style={{ color: '#6366f1', background: '#e0e7ff' }}
                          >
                            <Calendar size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )).flatMap((tr, index) => {
                const booking = bookings![index];
                const isExpanded = expandedRow === booking.id;
                return [
                  tr,
                  isExpanded && (
                    <tr key={`${booking.id}-expanded`} style={{ backgroundColor: '#f8fafc' }}>
                      <td colSpan={6} style={{ padding: '20px', borderTop: 'none' }}>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                          <div style={{ flex: '1 1 300px' }}>
                            <h4 style={{ marginBottom: '10px', color: '#334155' }}>Medical Details</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#64748b', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', height: 'calc(100% - 35px)' }}>
                              <p style={{ marginBottom: '5px' }}><strong>Symptoms:</strong> {booking.symptoms || 'N/A'}</p>
                              <div style={{ whiteSpace: 'pre-wrap' }}>
                                <strong>History:</strong>
                                <MedicalHistoryDisplay historyString={booking.history || ''} />
                              </div>
                              {booking.document && (
                                <div style={{ marginTop: '10px' }}>
                                  <strong>Document:</strong> <a href={`${VITE_BASE_URL}/uploads/${booking.document}`} target="_blank" rel="noreferrer" style={{ color: '#6366f1' }}>View File</a>
                                </div>
                              )}
                            </div>
                          </div>

                          {booking.status === 'Pending' && (
                            <div style={{ flex: '1 1 300px' }}>
                              <h4 style={{ marginBottom: '10px', color: '#334155' }}>Queue Status</h4>
                              <div style={{ 
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                                padding: '20px', 
                                borderRadius: '12px', 
                                color: '#fff',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                height: 'calc(100% - 35px)'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>Your Token:</span>
                                  <span style={{ fontSize: '24px', fontWeight: 800 }}>{formatApptNumber(booking.scheduleDate, booking.appointmentNumber)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>Your Priority:</span>
                                  <span style={{ 
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    background: booking.priority === 'Emergency' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                                    color: booking.priority === 'Emergency' ? '#fca5a5' : '#fff'
                                  }}>
                                    {booking.priority || 'Routine'}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
                                  <span>Now Serving:</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '24px', fontWeight: 800 }}>
                                      {booking.currentlyServingToken && booking.currentlyServingToken > 0 ? booking.currentlyServingTokenFull : '-'}
                                    </span>
                                    {booking.currentlyServingToken > 0 && (
                                      <span style={{ 
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: booking.currentlyServingPriority === 'Emergency' ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
                                        color: '#fff',
                                        textTransform: 'uppercase'
                                      }}>
                                        {booking.currentlyServingPriority}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px', marginTop: '5px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Est. Wait Time:</span>
                                    <span style={{ fontWeight: 600 }}>{calculateWaitTime(booking.appointmentNumber, booking.currentlyServingToken || 0, booking.status, booking.currentlyServingPriority || 'Routine')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {booking.status === 'Reviewed' && (
                            <div style={{ flex: '1 1 300px' }}>
                              <h4 style={{ marginBottom: '10px', color: '#334155' }}>Prescription / Notes</h4>
                              <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#64748b', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', height: 'calc(100% - 35px)' }}>
                                {booking.prescription ? (
                                  <>
                                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#10b981' }}>Diagnosis:</strong><br/>{booking.prescription.diagnosis || 'N/A'}</p>
                                    <p style={{ marginBottom: '8px' }}><strong style={{ color: '#6366f1' }}>Medications:</strong><br/>{booking.prescription.medications?.join(', ') || 'N/A'}</p>
                                    <p><strong style={{ color: '#334155' }}>Doctor Notes:</strong><br/>{booking.prescription.notes || 'N/A'}</p>
                                  </>
                                ) : (
                                  <p>No prescription details provided.</p>
                                )}
                              </div>
                            </div>
                          )}

                          {booking.status === 'Missed' && (
                            <div style={{ flex: '1 1 300px' }}>
                              <h4 style={{ marginBottom: '10px', color: '#334155' }}>Attendance Status</h4>
                              <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#64748b', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', height: 'calc(100% - 35px)' }}>
                                <p style={{ color: '#ef4444', fontWeight: 600, marginBottom: '8px' }}>Appointment Missed</p>
                                <p>You did not attend this scheduled appointment. Please book a new session if you still require a consultation.</p>
                              </div>
                            </div>
                          )}
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
    </DashboardLayout>
  );
};

export default Appointments;
