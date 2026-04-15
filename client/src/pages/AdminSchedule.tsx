import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useFetch } from '../hooks/useFetch';
import { Plus, Eye, Trash2, Calendar } from 'lucide-react';
import api from '../services/api';
import '../styles/dashboard.css';
import { useToast } from '../context/ToastContext';

interface Schedule {
  _id: string;
  title: string;
  doctor: {
    user: { name: string };
  };
  date: string;
  time: string;
  maxAppointments: number;
}

interface Doctor {
  _id: string;
  user: { name: string };
}

const AdminSchedule: React.FC = () => {
  const { data: schedules, loading, setData } = useFetch<Schedule[]>('/admin/schedules');
  const { data: doctors } = useFetch<Doctor[]>('/admin/doctors');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view'>('add');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();
  
  // Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [pendingDeleteTitle, setPendingDeleteTitle] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    docid: '',
    date: '',
    time: '',
    nop: 1,
  });

  const handleOpenModal = (mode: 'add' | 'view', schedule?: Schedule) => {
    setModalMode(mode);
    if (schedule) {
      setSelectedSchedule(schedule);
    } else {
      setFormData({
        title: '',
        docid: doctors?.[0]?._id || '',
        date: '',
        time: '',
        nop: 1,
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setPendingDeleteId(id);
    setPendingDeleteTitle(title);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/schedules/${pendingDeleteId}`);
      setData(schedules?.filter(s => s._id !== pendingDeleteId) || null);
      showToast('Schedule deleted successfully', 'success');
      setIsConfirmOpen(false);
    } catch (err) {
      showToast('Error deleting schedule', 'error');
    }
  };

  const filteredSchedules = schedules?.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.doctor.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/schedules', formData);
      showToast('Schedule created successfully', 'success');
      window.location.reload();
    } catch (err) {
      showToast('Error creating schedule', 'error');
    }
  };

  return (
    <DashboardLayout title="">
      <div className="content-header">
        <h2 className="heading-main">Schedule Manager</h2>
        <div className="header-actions" style={{ display: 'flex', gap: '15px' }}>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search by title or doctor..." 
              className="input-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '300px' }}
            />
          </div>
          <button 
            className="btn-primary btn button-icon" 
            onClick={() => handleOpenModal('add')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={18} /> Add a Session
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">Session Title</th>
              <th className="table-headin">Doctor</th>
              <th className="table-headin">Scheduled Date & Time</th>
              <th className="table-headin">Max Bookings</th>
              <th className="table-headin">Events</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredSchedules?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  <img src="/img/notfound.svg" width="150" alt="Not found" />
                  <p>No sessions found.</p>
                </td>
              </tr>
            ) : (
              filteredSchedules?.map((s) => (
                <tr key={s._id}>
                  <td style={{ padding: '15px' }}>{s.title}</td>
                  <td>Dr. {s.doctor.user.name}</td>
                  <td>{new Date(s.date).toLocaleDateString()} {s.time}</td>
                  <td style={{ textAlign: 'center' }}>{s.maxAppointments}</td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => handleOpenModal('view', s)} className="btn-primary-soft btn-sm"><Eye size={16} /></button>
                      <button onClick={() => handleDeleteClick(s._id, s.title)} className="btn-primary-soft btn-sm btn-danger"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={modalMode === 'add' ? 'Add New Session' : 'Session Details'}
      >
        <form onSubmit={handleSubmit} className="doctor-form">
          <div className="form-group">
            <label className="form-label">Session Title</label>
            <input 
              type="text" 
              className="input-text" 
              value={modalMode === 'add' ? formData.title : selectedSchedule?.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
              disabled={modalMode === 'view'}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Select Doctor</label>
            <select 
              className="input-text" 
              value={modalMode === 'add' ? formData.docid : selectedSchedule?.doctor.user.name} 
              onChange={(e) => setFormData({...formData, docid: e.target.value})}
              required
              disabled={modalMode === 'view'}
            >
              <option value="" disabled>Choose Doctor</option>
              {doctors?.map(d => <option key={d._id} value={d._id}>Dr. {d.user.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Session Date</label>
              <input 
                type="date" 
                className="input-text" 
                value={modalMode === 'add' ? formData.date : selectedSchedule?.date.split('T')[0]} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                required 
                disabled={modalMode === 'view'}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Schedule Time</label>
              <input 
                type="time" 
                className="input-text" 
                value={modalMode === 'add' ? formData.time : selectedSchedule?.time} 
                onChange={(e) => setFormData({...formData, time: e.target.value})} 
                required 
                disabled={modalMode === 'view'}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Max Appointments</label>
            <input 
              type="number" 
              className="input-text" 
              value={modalMode === 'add' ? formData.nop : selectedSchedule?.maxAppointments} 
              onChange={(e) => setFormData({...formData, nop: parseInt(e.target.value)})} 
              min="1"
              required 
              disabled={modalMode === 'view'}
            />
          </div>
          
          {modalMode !== 'view' && (
            <div className="form-actions">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Cancel</button>
              <button type="submit" className="btn-primary btn">Place Session</button>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Session"
        message={`Are you sure you want to delete session "${pendingDeleteTitle}"? All current appointments for this session will also be invalidated.`}
      />
    </DashboardLayout>
  );
};

export default AdminSchedule;
