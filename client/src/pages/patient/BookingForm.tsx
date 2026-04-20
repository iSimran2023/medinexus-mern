import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Activity, 
  History, 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  FileUp, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar as CalendarIcon,
  Stethoscope,
  Info,
  ChevronRight,
  ChevronLeft,
  Video,
  UserCheck,
  HeartPulse,
  Syringe,
  Pill,
  ShieldCheck
} from 'lucide-react';
import '../../styles/dashboard.css';

interface Schedule {
  id: string;
  title: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
}

interface PatientProfile {
  name: string;
  email: string;
  tel: string;
  address: string;
  dob: string;
  gender: string;
}

const BookingForm: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingStep, setFetchingStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    symptoms: '',
    reason: '',
    existingDiseases: '',
    allergies: '',
    medications: '',
    history: '',
    appointmentType: 'In-person',
    priority: 'Routine',
    emergencyContact: '',
    documentName: ''
  });
  
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // Initial Data (Session Info)
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const rescheduleId = new URLSearchParams(window.location.search).get('rescheduleId');
        
        // We always need session info for the header card
        const res = await api.get(`/patient/booking/step3/${scheduleId}`);
        setSchedule(res.data);
        
        // Load Step 1 data by default
        await loadStepData(1);
      } catch (err) {
        showToast('Error loading session', 'error');
        navigate('/patient/schedule');
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [scheduleId]);

  const loadStepData = async (stepNumber: number) => {
    setFetchingStep(true);
    try {
      const rescheduleId = new URLSearchParams(window.location.search).get('rescheduleId');
      const queryStr = rescheduleId ? `?rescheduleId=${rescheduleId}` : '';

      if (stepNumber === 1) {
        const res = await api.get('/patient/booking/step1');
        setPatient(res.data);
      } else if (stepNumber === 2) {
        const res = await api.get(`/patient/booking/step2${queryStr}`);
        // The backend now parses and returns separate fields
        if (!formData.history && res.data) {
          setFormData(prev => ({ 
            ...prev, 
            symptoms: res.data.symptoms || '',
            reason: res.data.reason || '',
            existingDiseases: res.data.existingDiseases || '',
            allergies: res.data.allergies || '',
            medications: res.data.medications || '',
            emergencyContact: res.data.emergencyContact || '',
            history: res.data.history || ''
          }));
        }
      } else if (stepNumber === 3) {
        const res = await api.get(`/patient/booking/step3/${scheduleId}${queryStr}`);
        setSchedule(res.data);
        if (rescheduleId && res.data.rescheduleData && !formData.documentName) {
          setFormData(prev => ({
            ...prev,
            priority: res.data.rescheduleData.priority || 'Routine',
            documentName: res.data.rescheduleData.documentName || '',
            appointmentType: res.data.rescheduleData.appointmentType || 'In-person'
          }));
        }
      }
    } catch (err) {
      console.error(`Error loading step ${stepNumber} data`, err);
    } finally {
      setFetchingStep(false);
    }
  };

  const nextStep = () => {
    const nextS = step + 1;
    setStep(nextS);
    loadStepData(nextS);
  };
  
  const prevStep = () => {
    const prevS = step - 1;
    setStep(prevS);
    loadStepData(prevS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const rescheduleId = new URLSearchParams(window.location.search).get('rescheduleId');
      
      let finalDocumentName = formData.documentName || '';

      if (fileToUpload) {
        const uploadData = new FormData();
        uploadData.append('document', fileToUpload);
        const uploadRes = await api.post('/patient/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalDocumentName = uploadRes.data.filename;
      }

      const enrichedHistory = `
Reason: ${formData.reason}
Diseases: ${formData.existingDiseases}
Allergies: ${formData.allergies}
Meds: ${formData.medications}
Emergency: ${formData.emergencyContact}
Notes: ${formData.history}
Type: ${formData.appointmentType}
`.trim();

      const payload = {
        scheduleId,
        medicalData: { 
          symptoms: formData.symptoms, 
          history: enrichedHistory, 
          documentName: finalDocumentName 
        },
        priority: formData.priority,
      };

      if (rescheduleId) {
        await api.put(`/patient/appointments/${rescheduleId}/reschedule`, payload);
        showToast('Appointment rescheduled successfully!', 'success');
      } else {
        await api.post('/patient/book', payload);
        showToast('Appointment booked successfully!', 'success');
      }
      
      navigate('/patient/appointments');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error processing request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout title="Booking Form"><div className="loading-spinner">Loading session...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Confirm Appointment">
      <div className="booking-form-container animate-in-bottom" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* PREMIUM SUMMARY CARD */}
        <div className="booking-summary-card" style={{ 
          marginBottom: '30px', 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', color: '#eff6ff', zIndex: 0 }}>
            <ShieldCheck size={120} />
          </div>
          
          <div className="summary-header" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ background: '#ecfdf5', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
              <CheckCircle2 size={32} color="#10b981" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>Finalize Your Booking</h2>
            <p style={{ color: '#64748b', fontSize: '15px' }}>Your health is our priority. Please review and complete your details.</p>
          </div>
          
          {schedule && (
            <div className="session-details-mini" style={{ 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              marginTop: '20px',
              border: '1px solid #f1f5f9',
              position: 'relative',
              zIndex: 1
            }}>
              <div className="detail-item">
                <span className="detail-label" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>SESSION</span>
                <span className="detail-value" style={{ fontSize: '15px', color: 'var(--primary-color)' }}>{schedule.title}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>DOCTOR</span>
                <span className="detail-value" style={{ fontSize: '15px' }}>Dr. {schedule.doctorName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>SPECIALITY</span>
                <span className="detail-value" style={{ fontSize: '15px', fontWeight: 600 }}>{schedule.doctorSpecialty || 'General Physician'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>SCHEDULED FOR</span>
                <span className="detail-value" style={{ fontSize: '15px' }}>{new Date(schedule.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {schedule.time}</span>
              </div>
            </div>
          )}
        </div>

        {/* STEPPER PROGRESS */}
        <div className="stepper-wrapper" style={{ marginBottom: '40px', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '22px', left: '0', right: '0', height: '3px', background: '#f1f5f9', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: '22px', left: '0', width: `${(step - 1) * 50}%`, height: '3px', background: 'var(--primary-color)', zIndex: 1, transition: 'all 0.5s ease' }} />

            {[1, 2, 3].map((s) => (
              <div key={s} style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px' }}>
                <div style={{ 
                  width: '45px', 
                  height: '45px', 
                  borderRadius: '50%', 
                  background: step >= s ? 'var(--primary-color)' : 'white',
                  border: step >= s ? '4px solid #eff6ff' : '3px solid #f1f5f9',
                  color: step >= s ? 'white' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px',
                  boxShadow: step === s ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  {step > s ? <CheckCircle2 size={24} /> : s}
                </div>
                <span style={{ 
                  marginTop: '12px', 
                  fontSize: '13px', 
                  fontWeight: step >= s ? 700 : 500, 
                  color: step >= s ? '#1e293b' : '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em'
                }}>
                  {s === 1 ? 'Patient' : s === 2 ? 'Medical' : 'Finalize'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FORM CONTAINER */}
        <div className="medical-data-form" style={{ 
          background: 'white', 
          padding: '45px', 
          borderRadius: '24px', 
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.01)',
          border: '1px solid #f1f5f9',
          minHeight: '400px',
          position: 'relative'
        }}>
          {fetchingStep && (
            <div style={{ position: 'absolute', top: '10px', right: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--primary-color)', fontWeight: 600 }}>
              <div className="spinner-mini" /> Updating data...
            </div>
          )}
          
          {/* STEP 1: PATIENT PROFILE */}
          {step === 1 && (
            <div className="stepper-content animate-in-right">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px' }}>
                  <User size={24} color="var(--primary-color)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>1. Basic Patient Information</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Details from your registered profile.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div className="profile-field-card">
                  <label><UserCheck size={14} /> Full Name</label>
                  <div className="value-box">{patient?.name || 'Loading...'}</div>
                </div>
                <div className="profile-field-card">
                  <label><CalendarIcon size={14} /> Date of Birth</label>
                  <div className="value-box">{patient?.dob ? new Date(patient.dob).toLocaleDateString([], { dateStyle: 'long' }) : 'Loading...'}</div>
                </div>
                <div className="profile-field-card">
                  <label><Mail size={14} /> Email Address</label>
                  <div className="value-box">{patient?.email || 'Loading...'}</div>
                </div>
                <div className="profile-field-card">
                  <label><Phone size={14} /> Phone Number</label>
                  <div className="value-box">{patient?.tel || 'Loading...'}</div>
                </div>
                <div className="profile-field-card">
                  <label><Info size={14} /> Gender</label>
                  <div className="value-box">{patient?.gender || 'Loading...'}</div>
                </div>
                <div className="profile-field-card">
                  <label><MapPin size={14} /> Address</label>
                  <div className="value-box">{patient?.address || 'Loading...'}</div>
                </div>
                
                <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                  <label htmlFor="emergencyContact" style={{ fontWeight: 600, color: '#334155' }}>
                    Emergency Contact (Optional)
                  </label>
                  <input 
                    type="text" 
                    id="emergencyContact"
                    placeholder="e.g. Spouse Name - 98XXXXXXXX"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    style={{ 
                      padding: '16px', 
                      borderRadius: '14px', 
                      border: '2px solid #f1f5f9', 
                      width: '100%',
                      fontSize: '15px'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MEDICAL HISTORY */}
          {step === 2 && (
            <div className="stepper-content animate-in-right">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '12px' }}>
                  <Stethoscope size={24} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>2. Medical Information</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Help us understand your current condition.</p>
                </div>
              </div>
              
              <div className="form-group">
                <label style={{ fontWeight: 600 }}><Activity size={18} /> Symptoms</label>
                <textarea
                  placeholder="What are you feeling right now?"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  style={{ borderRadius: '14px', padding: '16px', border: '2px solid #f1f5f9', minHeight: '100px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}><HeartPulse size={16} /> Existing Diseases</label>
                  <input 
                    type="text" 
                    placeholder="Diabetes, High BP, etc."
                    value={formData.existingDiseases}
                    onChange={(e) => setFormData({...formData, existingDiseases: e.target.value})}
                    className="premium-input"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}><Syringe size={16} /> Allergies</label>
                  <input 
                    type="text" 
                    placeholder="Any drug/food allergies"
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    className="premium-input"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}><Pill size={16} /> Current Medications</label>
                  <input 
                    type="text" 
                    placeholder="List your meds..."
                    value={formData.medications}
                    onChange={(e) => setFormData({...formData, medications: e.target.value})}
                    className="premium-input"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}><History size={16} /> Previous History</label>
                  <input 
                    type="text" 
                    placeholder="Past surgeries or conditions"
                    value={formData.history}
                    onChange={(e) => setFormData({...formData, history: e.target.value})}
                    className="premium-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FINALIZE */}
          {step === 3 && (
            <div className="stepper-content animate-in-right">
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '35px' }}>
                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '12px' }}>
                  <ClipboardList size={24} color="#22c55e" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>3. Finalize Details</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Confirm your visit type and priority.</p>
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Appointment Type</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {[
                    { id: 'In-person', icon: <User size={24} />, desc: 'Physical Visit' },
                    { id: 'Online consultation', icon: <Video size={24} />, desc: 'Telehealth Call' }
                  ].map(type => (
                    <div 
                      key={type.id}
                      onClick={() => setFormData({...formData, appointmentType: type.id})}
                      style={{ 
                        flex: 1, 
                        cursor: 'pointer',
                        padding: '20px', 
                        borderRadius: '16px', 
                        border: '2px solid', 
                        borderColor: formData.appointmentType === type.id ? 'var(--primary-color)' : '#f1f5f9',
                        background: formData.appointmentType === type.id ? '#eff6ff' : 'white',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ color: formData.appointmentType === type.id ? 'var(--primary-color)' : '#94a3b8', marginBottom: '8px' }}>
                        {type.icon}
                      </div>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{type.id}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600 }}>Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '2px solid #f1f5f9', background: '#fff' }}
                  >
                    <option value="Routine">Routine - Non-Urgent</option>
                    <option value="Emergency">Emergency - Urgent Care</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600 }}><FileUp size={16} /> Documents (Optional)</label>
                  <div className="custom-file-input-wrapper">
                    <input
                      type="file"
                      id="document-upload"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setFileToUpload(e.target.files[0]);
                        } else {
                          setFileToUpload(null);
                        }
                      }}
                      style={{ display: 'none' }}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <label 
                      htmlFor="document-upload"
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 14px', 
                        borderRadius: '14px', 
                        border: '2px solid #f1f5f9', 
                        width: '100%', 
                        fontSize: '13px',
                        cursor: 'pointer',
                        background: '#fff',
                        transition: 'border-color 0.2s ease'
                      }}
                      className="custom-file-label"
                    >
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        marginRight: '12px',
                        color: '#475569',
                        fontWeight: 500
                      }}>
                        Choose File
                      </div>
                      <span style={{ color: (fileToUpload || formData.documentName) ? '#1e293b' : '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {fileToUpload ? fileToUpload.name : (formData.documentName ? formData.documentName.split('-').pop() : 'No file chosen')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div style={{ 
            marginTop: '50px', 
            paddingTop: '30px', 
            borderTop: '1px solid #f1f5f9', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {step === 1 ? (
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/patient/schedule')}>Cancel</button>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={prevStep} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ChevronLeft size={18} /> Back
              </button>
            )}

            <div style={{ display: 'flex', gap: '15px' }}>
              {step < 3 ? (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={nextStep} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Continue <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  type="submit" 
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ background: '#10b981', borderColor: '#10b981' }}
                >
                  {submitting ? 'Processing...' : (new URLSearchParams(window.location.search).get('rescheduleId') ? 'Confirm Reschedule' : 'Confirm Appointment')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .profile-field-card {
          background: #f8fafc;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }
        .profile-field-card label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 5px;
        }
        .value-box {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }
        .premium-input {
          width: 100%;
          padding: 16px;
          border-radius: 14px;
          border: 2px solid #f1f5f9;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .premium-input:focus {
          border-color: var(--primary-color);
          background: white;
          outline: none;
        }
        .spinner-mini {
          width: 12px;
          height: 12px;
          border: 2px solid #cbd5e1;
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
        @keyframes slideInRight {
          from { transform: translateX(15px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default BookingForm;
