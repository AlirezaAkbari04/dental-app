import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/CaretakerDashboard.css'; // Changed from '../styles/CaretakerDashboard.css'
import logoImage from '../../logo.svg'; // Changed from '../logo.svg'
import MySchools from './caretaker/MySchools';
import StudentsList from './caretaker/StudentsList';
import HealthReports from './caretaker/HealthReports';
import UrgentReferrals from './caretaker/UrgentReferrals';
import DatabaseService from '../../services/DatabaseService'; // Add this import
import MigrationService from '../../services/MigrationService'; // Add this import

const CaretakerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schools');
  const [teacherName, setTeacherName] = useState('');
  
  // Load user data and initialize database
  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Initialize database
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }
        
        // Run migration if needed
        await MigrationService.migrateCaretakerDataToDatabase();
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    
    initDatabase();
    
    // Existing code to load user data from localStorage
    const teacherProfile = JSON.parse(localStorage.getItem('teacherProfile') || '{}');
    setTeacherName(teacherProfile.name || 'معلم بهداشت');
  }, []);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('userAuth');
    localStorage.removeItem('userRole');
    
    // Navigate to login page
    navigate('/login');
  };
  
  // Render the appropriate content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'schools':
        return <MySchools />;
      case 'students':
        return <StudentsList />;
      case 'reports':
        return <HealthReports />;
      case 'referrals':
        return <UrgentReferrals />;
      default:
        return <MySchools />;
    }
  };
  
  return (
    <div className="caretaker-dashboard">
      <header className="dashboard-header">
        <div className="logo-container">
          <img 
            src={logoImage} 
            alt="لبخند شاد دندان سالم" 
            className="dashboard-logo" 
          />
          <span className="app-name">لبخند شاد دندان سالم</span>
        </div>
        <div className="user-info">
          <span className="welcome-text">خوش آمدید {teacherName}</span>
          <button onClick={handleLogout} className="logout-button">خروج</button>
        </div>
      </header>
      
      <div className="dashboard-container">
        <nav className="dashboard-sidebar">
          <div className="user-profile">
            <div className="profile-icon">👨‍⚕️</div>
            <div className="profile-name">{teacherName}</div>
            <div className="profile-title">معلم بهداشت</div>
          </div>
          
          <ul className="nav-menu">
            <li 
              className={`nav-item ${activeTab === 'schools' ? 'active' : ''}`}
              onClick={() => handleTabChange('schools')}
            >
              <span className="nav-icon">🏫</span>
              <span className="nav-text">مدارس من</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => handleTabChange('students')}
            >
              <span className="nav-icon">👧</span>
              <span className="nav-text">لیست دانش‌آموزان</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => handleTabChange('reports')}
            >
              <span className="nav-icon">📋</span>
              <span className="nav-text">گزارش سلامت</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'referrals' ? 'active' : ''}`}
              onClick={() => handleTabChange('referrals')}
            >
              <span className="nav-icon">🔴</span>
              <span className="nav-text">ارجاع‌های فوری</span>
            </li>
          </ul>
        </nav>
        
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
      
      <footer className="dashboard-footer">
        <p>لبخند شاد دندان سالم &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default CaretakerDashboard;