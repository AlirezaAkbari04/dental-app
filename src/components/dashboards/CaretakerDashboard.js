import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/CaretakerDashboard.css';
import MySchools from './caretaker/MySchools';
import StudentsList from './caretaker/StudentsList';
import HealthReports from './caretaker/HealthReports';
import UrgentReferrals from './caretaker/UrgentReferrals';
import EducationalContent from './caretaker/EducationalContent';
import DatabaseService from '../../services/DatabaseService';
import MigrationService from '../../services/MigrationService';
import { useUser } from '../../contexts/UserContext';

const CaretakerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schools');
  const [teacherName, setTeacherName] = useState('');
  
  // Use the UserContext for proper logout
  const { currentUser, logout } = useUser();
  
  // Load user data and initialize database
  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Initialize database
        if (!DatabaseService.initialized) {
          await DatabaseService.ensureInitialized();
        }
        
        // Run migration if needed
        await MigrationService.migrateCaretakerDataToDatabase();
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    
    initDatabase();
    
    // Load teacher profile data
    const loadTeacherProfile = async () => {
      try {
        if (currentUser?.id) {
          // Try to get from database first
          const teacherProfile = await DatabaseService.getUserById(currentUser.id);
          if (teacherProfile && teacherProfile.profile_data) {
            const profileData = JSON.parse(teacherProfile.profile_data);
            setTeacherName(profileData.name || 'معلم بهداشت');
          } else {
            // Fallback to localStorage
            const storedProfile = JSON.parse(localStorage.getItem('teacherProfile') || '{}');
            setTeacherName(storedProfile.name || 'معلم بهداشت');
          }
        } else {
          // Fallback to localStorage if no currentUser
          const storedProfile = JSON.parse(localStorage.getItem('teacherProfile') || '{}');
          setTeacherName(storedProfile.name || 'معلم بهداشت');
        }
      } catch (error) {
        console.error('Error loading teacher profile:', error);
        setTeacherName('معلم بهداشت');
      }
    };
    
    loadTeacherProfile();
  }, [currentUser]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleLogout = async () => {
    try {
      console.log('Caretaker logout initiated');
      
      // Close database connection if open
      if (DatabaseService.initialized) {
        await DatabaseService.close();
      }
      
      // Clear specific localStorage items
      localStorage.removeItem('teacherProfile');
      localStorage.removeItem('caretakerSchools');
      localStorage.removeItem('userRole');
      
      // Use the UserContext logout function
      await logout();
      
      // Reset component state
      setTeacherName('');
      setActiveTab('schools');
      
      console.log('Caretaker logout completed, navigating to login');
      
      // Navigate to login page and replace the history stack
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during caretaker logout:', error);
      
      // Force cleanup even if error occurs
      localStorage.removeItem('userAuth');
      localStorage.removeItem('teacherProfile');
      localStorage.removeItem('caretakerSchools');
      localStorage.removeItem('userRole');
      
      // Reset component state
      setTeacherName('');
      setActiveTab('schools');
      
      // Force navigation to login
      navigate('/login', { replace: true });
    }
  };
  
  const navigateToFAQ = () => {
    // Save user role for returning to appropriate dashboard
    localStorage.setItem('userRole', 'teacher');
    navigate('/faq');
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
      case 'educational':
        return <EducationalContent />;
      default:
        return <MySchools />;
    }
  };
  
  return (
    <div className="caretaker-dashboard">
      <header className="dashboard-header">
        <div className="logo-container">
          <img 
            src="/assets/images/logo.png" 
            alt="لبخند شاد دندان سالم" 
            className="dashboard-logo"
            onError={(e) => {
              console.warn('Failed to load logo, trying alternative');
              e.target.src = "/logo.png";
            }}
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
            <li 
              className={`nav-item ${activeTab === 'educational' ? 'active' : ''}`}
              onClick={() => handleTabChange('educational')}
            >
              <span className="nav-icon">📚</span>
              <span className="nav-text">محتوای آموزشی</span>
            </li>
          </ul>
        </nav>
        
        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
      
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>لبخند شاد دندان سالم &copy; {new Date().getFullYear()}</p>
          <button onClick={navigateToFAQ} className="help-button">
            <span className="help-icon">❓</span>
            <span className="help-text">راهنما و سوالات متداول</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CaretakerDashboard;