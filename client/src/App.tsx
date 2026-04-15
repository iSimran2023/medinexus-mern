import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminDoctors from './pages/AdminDoctors';
import AdminSchedule from './pages/AdminSchedule';
import AdminPatients from './pages/AdminPatients';
import AdminAppointments from './pages/AdminAppointments';
import PatientDashboard from './pages/PatientDashboard';
import PatientSessions from './pages/PatientSessions';
import PatientDoctors from './pages/PatientDoctors';
import PatientAppointments from './pages/PatientAppointments';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorSessions from './pages/DoctorSessions';
import DoctorPatients from './pages/DoctorPatients';
import ProfileSettings from './pages/ProfileSettings';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/schedule" element={<AdminSchedule />} />
        <Route path="/admin/patients" element={<AdminPatients />} />
        <Route path="/admin/appointments" element={<AdminAppointments />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/schedule" element={<PatientSessions />} />
        <Route path="/patient/doctors" element={<PatientDoctors />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/schedule" element={<DoctorSessions />} />
        <Route path="/doctor/patients" element={<DoctorPatients />} />
        <Route path="/settings" element={<ProfileSettings />} />
      </Routes>
    </Router>
  );
}

export default App;
