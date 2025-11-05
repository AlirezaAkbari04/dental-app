import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ParentDashboard.css';
import BrushingReport from './parent/BrushingReport';
import ReminderSettings from './parent/ReminderSettings';
import InfoGraphics from './parent/InfoGraphics';
import Questionnaire from './parent/Questionnaire'; // Import the Questionnaire component
import { useUser } from '../../contexts/UserContext';  
import DatabaseService from '../../services/DatabaseService';
import MigrationService from '../../services/MigrationService';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('report');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');

  // Access the currentUser and logout method from the UserContext
  const { currentUser, logout } = useUser();

  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Initialize database
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }
        
        // Run migration if needed
        await MigrationService.migrateParentDataToDatabase();
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initDatabase();

    const fetchProfileData = async () => {
      try {
        if (currentUser?.id) {
          const parentProfile = JSON.parse(localStorage.getItem('parentProfile') || '{}');
          setParentName(parentProfile.fullName || 'Dear Parent');

          await DatabaseService.ensureChildExists(currentUser.id, "Child");

          const childData = await DatabaseService.getChildForParent(currentUser.id);
          if (childData) {
            setChildName(childData.name || 'Your Child');
          } else {
            setChildName('Your Child');
          }
        } else {
          const parentProfile = JSON.parse(localStorage.getItem('parentProfile') || '{}');
          setParentName(parentProfile.fullName || 'Dear Parent');

          const childProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
          setChildName(childProfile.fullName || 'Your Child');
        }
      } catch (error) {
        console.error('Error loading profile data:', error);

        const parentProfile = JSON.parse(localStorage.getItem('parentProfile') || '{}');
        setParentName(parentProfile.fullName || 'Dear Parent');

        const childProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
        setChildName(childProfile.fullName || 'Your Child');
      }
    };

    fetchProfileData();
  }, [currentUser]);

  // Handle the logout process
  const handleLogout = async () => {
    try {
      // Ensure the database is closed (if it's initialized)
      if (DatabaseService.initialized) {
        console.log('Closing database...');
        await DatabaseService.close();
        console.log('Database closed.');
      }

      // Clear user authentication data
      console.log('Clearing user authentication data...');
      localStorage.removeItem('userAuth');
      localStorage.removeItem('userRole');

      // Reset currentUser state in UserContext
      logout();  // Using the logout function from UserContext

      // Redirect to the login page
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);

      // Ensure data is still cleared even if an error occurs
      localStorage.removeItem('userAuth');
      localStorage.removeItem('userRole');

      // Reset currentUser state in case of an error
      logout();  // Reset user context here

      // Navigate to the login page
      navigate('/login');
    }
  };


  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const navigateToFAQ = () => {
    // Save user role to return to appropriate dashboard
    localStorage.setItem('userRole', 'parent');
    navigate('/faq');
  };

  const navigateToAboutUs = () => {
    localStorage.setItem('userRole', 'parent');
    navigate('/about-us');
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'report':
        return <BrushingReport childName={childName} />;
      case 'reminders':
        return <ReminderSettings childName={childName} />;
      case 'infographics':
        return <InfoGraphics />;
      case 'questionnaire':
        return <Questionnaire childName={childName} />;  // Add the Questionnaire component
      default:
        return <BrushingReport childName={childName} />;
    }
  };

  return (
    <div className="parent-dashboard">
      <header className="dashboard-header">
        <div className="logo-container">
          <img
            src="/assets/images/logo.png"
            alt="Healthy Teeth Happy Smile"
            className="dashboard-logo"
            onError={(e) => {
              console.warn('Failed to load logo, trying alternative');
              e.target.src = "/logo.png";
            }}
          />
          <span className="app-name">Healthy Teeth Happy Smile</span>
        </div>
        <div className="user-info">
          <span className="welcome-text">Welcome {parentName}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-container">
        <nav className="dashboard-sidebar">
          <div className="user-profile">
            <div className="profile-icon">👨‍👩‍👧</div>
            <div className="profile-name">{parentName}</div>
            <div className="child-name">Parent of {childName}</div>
          </div>

          <ul className="nav-menu">
            <li
              className={`nav-item ${activeTab === 'report' ? 'active' : ''}`}
              onClick={() => handleTabChange('report')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">Brushing Report</span>
            </li>
            <li
              className={`nav-item ${activeTab === 'reminders' ? 'active' : ''}`}
              onClick={() => handleTabChange('reminders')}
            >
              <span className="nav-icon">🔔</span>
              <span className="nav-text">Reminders</span>
            </li>
            <li
              className={`nav-item ${activeTab === 'infographics' ? 'active' : ''}`}
              onClick={() => handleTabChange('infographics')}
            >
              <span className="nav-icon">📚</span>
              <span className="nav-text">Infographics</span>
            </li>
            <li
              className={`nav-item ${activeTab === 'questionnaire' ? 'active' : ''}`}
              onClick={() => handleTabChange('questionnaire')}
            >
              <span className="nav-icon">📝</span>
              <span className="nav-text">Questionnaire</span>
            </li>
          </ul>
        </nav>

        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>Healthy Teeth Happy Smile &copy; {new Date().getFullYear()}</p>
          <div className="footer-buttons">
            <button onClick={navigateToFAQ} className="help-button">
              <span className="help-icon">❓</span>
              <span className="help-text">Help & FAQ</span>
            </button>
            <button onClick={navigateToAboutUs} className="about-button">
              <span className="about-icon">ℹ️</span>
              <span className="about-text">About Us</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ParentDashboard;