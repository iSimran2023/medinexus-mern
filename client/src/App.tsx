import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminSchedule from './pages/admin/Schedule';
import AdminPatients from './pages/admin/Patients';
import AdminAppointments from './pages/admin/Appointments';
import PatientDashboard from './pages/patient/Dashboard';
import PatientSessions from './pages/patient/Sessions';
import PatientDoctors from './pages/patient/Doctors';
import PatientAppointments from './pages/patient/Appointments';
import PatientBookingForm from './pages/patient/BookingForm';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorSessions from './pages/doctor/Sessions';
import DoctorPatients from './pages/doctor/Patients';
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
        <Route path="/patient/book/:scheduleId" element={<PatientBookingForm />} />
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
