import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useFetch } from '../hooks/useFetch';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { specialties } from '../constants/specialties';
import api from '../services/api';
import '../styles/dashboard.css';
import { useToast } from '../context/ToastContext';

interface Doctor {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  specialty: string;
  tel: string;
}

const AdminDoctors: React.FC = () => {
  const { data: doctors, loading, setData } = useFetch<Doctor[]>('/admin/doctors');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'view' | 'edit'>('add');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const { showToast } = useToast();
  
  // Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    tel: '',
    specialty: specialties[0],
    password: '',
    confirmPassword: '',
  });

  const filteredDoctors = doctors?.filter(d => 
    d.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (mode: 'add' | 'view' | 'edit', doctor?: Doctor) => {
    setModalMode(mode);
    if (doctor) {
      setSelectedDoctor(doctor);
      setFormData({
        name: doctor.user.name,
        email: doctor.user.email,
        tel: doctor.tel,
        specialty: doctor.specialty,
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        tel: '',
        specialty: specialties[0],
        password: '',
        confirmPassword: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/doctors/${pendingDeleteId}`);
      setData(doctors?.filter(d => d._id !== pendingDeleteId) || null);
      showToast('Doctor removed successfully', 'success');
      setIsConfirmOpen(false);
    } catch (err) {
      showToast('Error deleting doctor', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === 'add') {
      if (formData.password !== formData.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }
      try {
        await api.post('/admin/doctors', formData);
        showToast('Doctor added successfully', 'success');
        window.location.reload();
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Error adding doctor', 'error');
      }
    }
  };

  return (
    <DashboardLayout title="">
      <div className="content-header">
        <h2 className="heading-main">Doctor Management</h2>
        <div className="header-actions" style={{ display: 'flex', gap: '15px' }}>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search Doctors..." 
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
            <Plus size={18} /> Add New Doctor
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">Doctor Name</th>
              <th className="table-headin">Email</th>
              <th className="table-headin">Specialties</th>
              <th className="table-headin">Events</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredDoctors?.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                  <img src="/img/notfound.svg" width="150" alt="Not found" />
                  <p>No doctors found.</p>
                </td>
              </tr>
            ) : (
              filteredDoctors?.map((doc) => (
                <tr key={doc._id}>
                  <td style={{ padding: '15px' }}>{doc.user.name}</td>
                  <td>{doc.user.email}</td>
                  <td>{doc.specialty}</td>
                  <td>
                    <div className="action-btns">
                      <button onClick={() => handleOpenModal('view', doc)} className="btn-primary-soft btn-sm" title="View"><Eye size={16} /></button>
                      <button onClick={() => handleOpenModal('edit', doc)} className="btn-primary-soft btn-sm" title="Edit"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteClick(doc._id)} className="btn-primary-soft btn-sm btn-danger" title="Delete"><Trash2 size={16} /></button>
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
        title={modalMode === 'add' ? 'Add New Doctor' : modalMode === 'view' ? 'Doctor Details' : 'Edit Doctor'}
      >
        <form onSubmit={handleSubmit} className="doctor-form">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input 
              type="text" 
              className="input-text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              required 
              disabled={modalMode === 'view'}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="input-text" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              required 
              disabled={modalMode === 'view'}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Telephone</label>
              <input 
                type="tel" 
                className="input-text" 
                value={formData.tel} 
                onChange={(e) => setFormData({...formData, tel: e.target.value})} 
                required 
                disabled={modalMode === 'view'}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Specialty</label>
            <select 
              className="input-text" 
              value={formData.specialty} 
              onChange={(e) => setFormData({...formData, specialty: e.target.value})}
              disabled={modalMode === 'view'}
            >
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {modalMode === 'add' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="input-text" 
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input 
                  type="password" 
                  className="input-text" 
                  value={formData.confirmPassword} 
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                  required 
                />
              </div>
            </div>
          )}
          {modalMode !== 'view' && (
            <div className="form-actions">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Cancel</button>
              <button type="submit" className="btn-primary btn">{modalMode === 'add' ? 'Add Doctor' : 'Save Changes'}</button>
            </div>
          )}
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Doctor"
        message="Are you sure you want to remove this doctor? This will also delete their associated user account and schedules."
      />
    </DashboardLayout>
  );
};

export default AdminDoctors;
