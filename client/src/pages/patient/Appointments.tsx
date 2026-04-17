import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { Calendar, Clock, User, Bookmark, Printer, Eye, ChevronDown, ChevronUp, Inbox } from 'lucide-react';
import { printAppointmentPdf } from '../../utils/printPdf';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
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
}

const VITE_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');

const Appointments: React.FC = () => {
  const { data: bookings, loading } = useFetch<Booking[]>('/patient/bookings');
  const { user } = useAuth();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <DashboardLayout title="My Bookings">
      <div className="content-header">
        <h2 className="heading-main">My Appointment History</h2>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">App. No</th>
              <th className="table-headin">Session Title</th>
              <th className="table-headin">Doctor</th>
              <th className="table-headin">My Details</th>
              <th className="table-headin">Date & Time</th>
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
                    {booking.appointmentNumber}
                  </td>
                  <td style={{ fontWeight: 500 }}>{booking.scheduleTitle || 'Untitled Session'}</td>
                  <td>Dr. {booking.doctorName || 'Unknown'}</td>
                  <td>
                    {booking.priority === 'Emergency' && <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Emergency</span>}
                    {(!booking.priority || booking.priority === 'Routine') && <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>Routine</span>}
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
                        <div style={{ display: 'flex', gap: '40px' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ marginBottom: '10px', color: '#334155' }}>Registration Details</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#64748b' }}>
                              <p><strong>Full Name:</strong> {booking.patientName}</p>
                              <p><strong>Email:</strong> {booking.patientEmail || 'N/A'}</p>
                              <p><strong>Phone:</strong> {booking.patientPhone || 'N/A'}</p>
                              <p><strong>Address:</strong> {booking.address || 'N/A'}</p>
                              <p><strong>Gender:</strong> {booking.gender || 'N/A'}</p>
                              <p><strong>DOB:</strong> {booking.dob ? new Date(booking.dob).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                          <div style={{ flex: 2 }}>
                            <h4 style={{ marginBottom: '10px', color: '#334155' }}>Medical Notes</h4>
                            <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#64748b', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <p style={{ marginBottom: '8px' }}><strong style={{ color: '#ef4444' }}>Symptoms:</strong><br/>{booking.symptoms || 'None reported'}</p>
                              <p style={{ marginBottom: '8px' }}><strong style={{ color: '#334155' }}>Medical History:</strong><br/>{booking.history || 'None reported'}</p>
                              {booking.document && (
                                <p>
                                  <strong style={{ color: '#334155' }}>Attached Document:</strong>{' '}
                                  <a 
                                    href={`${VITE_BASE_URL}/uploads/${booking.document}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }}
                                  >
                                    {booking.document}
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
    </DashboardLayout>
  );
};

export default Appointments;
