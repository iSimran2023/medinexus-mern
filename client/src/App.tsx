import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminDoctors from './pages/AdminDoctors';
import AdminSchedule from './pages/AdminSchedule';
import PatientDashboard from './pages/PatientDashboard';
import PatientSessions from './pages/PatientSessions';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/doctors" element={<AdminDoctors />} />
        <Route path="/admin/schedule" element={<AdminSchedule />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/patient/schedule" element={<PatientSessions />} />
      </Routes>
    </Router>
  );
}

export default App;
