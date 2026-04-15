import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useFetch } from '../hooks/useFetch';
import '../styles/dashboard.css';

interface Patient {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  nic: string;
  dob: string;
  tel: string;
}

const DoctorPatients: React.FC = () => {
  const { data: patients, loading } = useFetch<Patient[]>('/doctor/patients');

  return (
    <DashboardLayout title="My Patients">
      <div className="content-header">
        <h2 className="heading-main">My Patients</h2>
      </div>

      <div className="table-container">
        <table className="sub-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th className="table-headin">Name</th>
              <th className="table-headin">NIC</th>
              <th className="table-headin">Telephone</th>
              <th className="table-headin">Email</th>
              <th className="table-headin">Date of Birth</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : patients?.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  <img src="/img/notfound.svg" width="150" alt="Not found" />
                  <p>No patients found.</p>
                </td>
              </tr>
            ) : (
              patients?.map((patient) => (
                <tr key={patient._id}>
                  <td style={{ padding: '15px', fontWeight: 500 }}>{patient.user.name}</td>
                  <td>{patient.nic}</td>
                  <td>{patient.tel}</td>
                  <td>{patient.user.email}</td>
                  <td style={{ textAlign: 'center' }}>{new Date(patient.dob).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatients;
