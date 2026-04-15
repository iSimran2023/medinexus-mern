import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useFetch } from '../hooks/useFetch';
import { UserRound, Search } from 'lucide-react';
import '../styles/dashboard.css';

interface Patient {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  tel: string;
  dob: string;
}

const AdminPatients: React.FC = () => {
  const { data: patients, loading } = useFetch<Patient[]>('/admin/patients');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients?.filter(p => 
    p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
              <th className="table-headin">Email</th>
              <th className="table-headin">Date of Birth</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredPatients?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  <img src="/img/notfound.svg" width="150" alt="Not found" />
                  <p>No patients found.</p>
                </td>
              </tr>
            ) : (
              filteredPatients?.map((patient) => (
                <tr key={patient._id}>
                  <td style={{ padding: '15px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="doc-icon"><UserRound size={18} /></div>
                    {patient.user.name}
                  </td>
                  <td>{patient.tel}</td>
                  <td>{patient.user.email}</td>
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

export default AdminPatients;
