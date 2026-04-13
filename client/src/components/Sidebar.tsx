import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserRound, 
  CalendarDays, 
  BookOpen, 
  Users, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboard.css';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    const common = [
      { path: `/${user?.role}`, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    ];

    if (user?.role === 'admin') {
      return [
        ...common,
        { path: '/admin/doctors', label: 'Doctors', icon: <UserRound size={20} /> },
        { path: '/admin/schedule', label: 'Schedule', icon: <CalendarDays size={20} /> },
        { path: '/admin/appointments', label: 'Appointments', icon: <BookOpen size={20} /> },
        { path: '/admin/patients', label: 'Patients', icon: <Users size={20} /> },
      ];
    }

    if (user?.role === 'doctor') {
      return [
        ...common,
        { path: '/doctor/appointments', label: 'My Appointments', icon: <BookOpen size={20} /> },
        { path: '/doctor/schedule', label: 'My Sessions', icon: <CalendarDays size={20} /> },
        { path: '/doctor/patients', label: 'My Patients', icon: <Users size={20} /> },
      ];
    }

    // patient
    return [
      ...common,
      { path: '/patient/doctors', label: 'All Doctors', icon: <UserRound size={20} /> },
      { path: '/patient/schedule', label: 'Scheduled Sessions', icon: <CalendarDays size={20} /> },
      { path: '/patient/appointments', label: 'My Bookings', icon: <BookOpen size={20} /> },
    ];
  };

  return (
    <div className="sidebar">
      <div className="profile-card">
        <div className="profile-image">
          <img src="/img/user.png" alt="User" />
        </div>
        <div className="profile-info">
          <p className="profile-name">{user?.name}</p>
          <p className="profile-email">{user?.email}</p>
        </div>
        <button onClick={logout} className="logout-btn">
          <LogOut size={16} /> Log out
        </button>
      </div>

      <nav className="sidebar-nav">
        {getMenuItems().map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-text">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
