import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { UserRound, Search, Users } from 'lucide-react';
import '../../styles/dashboard.css';

interface Patient {
  id: string;
  name: string;
  email: string;
  tel: string;
  address: string;
  dob: string;
  gender: string;
}

const Patients: React.FC = () => {
  const { data: patients, loading } = useFetch<Patient[]>('/admin/patients');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="">
      <div className="content-header">
        <h2 className="heading-main">All Patients</h2>
        <div className="header-actions">
          <div className="search-box" style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="input-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '350px' }}
            />
            <button className="btn-primary btn button-icon"><Search size={18} /> </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">Name</th>
              <th className="table-headin">Telephone</th>
              <th className="table-headin">Address</th>
              <th className="table-headin">Gender</th>
              <th className="table-headin">Date of Birth</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredPatients?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '50%', color: '#94a3b8' }}>
                      <Users size={48} strokeWidth={1.5} />
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 500 }}>No patients found.</div>
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>The central patient registry is currently empty.</div>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPatients?.map((patient) => (
                <tr key={patient.id}>
                  <td style={{ padding: '15px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="doc-icon"><UserRound size={18} /></div>
                    {patient.name}
                  </td>
                  <td>{patient.tel}</td>
                  <td>{patient.address}</td>
                  <td>{patient.gender || 'N/A'}</td>
                  <td>{new Date(patient.dob).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default Patients;
