import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useFetch } from '../../hooks/useFetch';
import { Users } from 'lucide-react';
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
  const { data: patients, loading } = useFetch<Patient[]>('/doctor/patients');

  return (
    <DashboardLayout title="">
      <div className="content-header">
        <h2 className="heading-main">My Patients</h2>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">Patient Name</th>
              <th className="table-headin">Telephone</th>
              <th className="table-headin">Address</th>
              <th className="table-headin">Gender</th>
              <th className="table-headin">Date of Birth</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : patients?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '80px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '50%', color: '#94a3b8' }}>
                      <Users size={48} strokeWidth={1.5} />
                    </div>
                    <div style={{ color: '#64748b', fontWeight: 500 }}>No patients found.</div>
                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>Your patient records will be listed here.</div>
                  </div>
                </td>
              </tr>
            ) : (
              patients?.map((patient) => (
                <tr key={patient.id}>
                  <td style={{ padding: '15px', fontWeight: 600 }}>{patient.name}</td>
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
