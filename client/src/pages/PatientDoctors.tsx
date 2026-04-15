import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useFetch } from '../hooks/useFetch';
import { UserRound, Search, Phone, Mail, Award } from 'lucide-react';
import '../styles/dashboard.css';

interface Doctor {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  specialty: string;
  tel: string;
}

const PatientDoctors: React.FC = () => {
  const { data: doctors, loading } = useFetch<Doctor[]>('/patient/doctors');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDoctors = doctors?.filter(d => 
    d.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="All Doctors">
      <div className="content-header">
        <h2 className="heading-main">Browse Doctors</h2>
        <div className="search-box" style={{ width: '400px' }}>
          <input 
            type="text" 
            placeholder="Search by Name or Specialty..." 
            className="input-text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="doctors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {loading ? (
          <p>Loading doctors...</p>
        ) : filteredDoctors?.length === 0 ? (
          <p>No doctors found.</p>
        ) : (
          filteredDoctors.map((doc) => (
            <div key={doc._id} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '15px', padding: '25px' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', width: '100%' }}>
                <div className="stat-icon" style={{ margin: 0 }}><UserRound size={24} /></div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Dr. {doc.user.name}</h3>
                  <p style={{ margin: 0, color: 'var(--primary-color)', fontSize: '14px', fontWeight: 600 }}>{doc.specialty}</p>
                </div>
              </div>
              
              <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-sub)', marginBottom: '8px' }}>
                  <Mail size={14} /> {doc.user.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--text-sub)' }}>
                  <Phone size={14} /> {doc.tel}
                </div>
              </div>

              <a 
                href="/patient/schedule" 
                className="btn-primary btn" 
                style={{ width: '100%', textAlign: 'center', textDecoration: 'none', marginTop: '10px', fontSize: '14px' }}
              >
                View Sessions
              </a>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientDoctors;
