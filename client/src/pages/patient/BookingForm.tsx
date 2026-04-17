import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Activity, History, ClipboardList, CheckCircle2, AlertTriangle, FileUp } from 'lucide-react';
import '../../styles/dashboard.css';

interface Schedule {
  id: string;
  title: string;
  doctorName: string;
  date: string;
  time: string;
}

const BookingForm: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    symptoms: '',
    history: '',
    priority: 'Routine',
    documentName: ''
  });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get(`/patient/sessions`);
        const found = response.data.find((s: Schedule) => s.id === scheduleId);
        if (found) {
          setSchedule(found);
        } else {
          showToast('Session not found', 'error');
          navigate('/patient/schedule');
        }
      } catch (err) {
        showToast('Error fetching session details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [scheduleId, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symptoms.trim()) {
      showToast('Please describe your symptoms', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let finalDocumentName = '';

      // If a file was selected, upload it first
      if (fileToUpload) {
        const uploadData = new FormData();
        uploadData.append('document', fileToUpload);
        const uploadRes = await api.post('/patient/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalDocumentName = uploadRes.data.filename;
      }

      await api.post('/patient/book', {
        scheduleId,
        medicalData: { symptoms: formData.symptoms, history: formData.history, documentName: finalDocumentName },
        priority: formData.priority,
      });
      showToast('Appointment booked successfully! SMS confirmation has been sent.', 'success');
      navigate('/patient/appointments');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error booking appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout title="Booking Form"><div>Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout title="Confirm Appointment">
      <div className="booking-form-container animate-in-bottom">
        <div className="booking-summary-card">
          <div className="summary-header">
            <CheckCircle2 className="success-icon" />
            <h2>Finalize Your Booking</h2>
            <p>Please provide your medical details to complete the appointment.</p>
          </div>
          
          {schedule && (
            <div className="session-details-mini">
              <div className="detail-item">
                <span className="detail-label">Session:</span>
                <span className="detail-value">{schedule.title}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Doctor:</span>
                <span className="detail-value">Dr. {schedule.doctorName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date & Time:</span>
                <span className="detail-value">{new Date(schedule.date).toLocaleDateString()} at {schedule.time}</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="medical-data-form">
          <div className="form-group">
            <label htmlFor="symptoms">
              <Activity size={18} /> Current Symptoms / Reason for Visit
            </label>
            <textarea
              id="symptoms"
              placeholder="Please describe what you are feeling or the reason for this consultation..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              required
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="history">
              <History size={18} /> Brief Medical History (Optional)
            </label>
            <textarea
              id="history"
              placeholder="Any past conditions, allergies, or medications we should know about?"
              value={formData.history}
              onChange={(e) => setFormData({ ...formData, history: e.target.value })}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">
              <AlertTriangle size={18} />Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input-select"
              style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
            >
              <option value="Routine">Routine - General Checkup / Non-Urgent</option>
              <option value="Emergency">Emergency - Immediate attention required</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="document">
              <FileUp size={18} /> Upload Old Reports (Optional)
            </label>
            <input
              type="file"
              id="document"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFileToUpload(e.target.files[0]);
                  setFormData({ ...formData, documentName: e.target.files[0].name });
                } else {
                  setFileToUpload(null);
                  setFormData({ ...formData, documentName: '' });
                }
              }}
              style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', width: '100%' }}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <small style={{ color: '#666', marginTop: '4px' }}>Supported: PDF, JPG, PNG. Used for doctor reference.</small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/patient/schedule')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary submit-booking-btn"
              disabled={submitting}
            >
              <ClipboardList size={18} />
              {submitting ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default BookingForm;
