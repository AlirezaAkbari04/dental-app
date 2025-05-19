
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ChildDashboard.css';
import ChildHome from './child/ChildHome';
import BrushReminder from './child/BrushReminder';
import ChildGames from './child/ChildGames';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';
import MigrationService from '../../services/MigrationService';

const ChildDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [showMessage, setShowMessage] = useState(false);
  const [childName, setChildName] = useState('');
  
  // Added logout function from useUser
  const { currentUser, logout } = useUser();
  
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize database and run migration if needed
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
          await MigrationService.migrateChildDataToDatabase();
        }
        
        // Get child profile
        const childProfile = currentUser?.id 
          ? await DatabaseService.getChildProfile(currentUser.id)
          : JSON.parse(localStorage.getItem('childProfile') || '{}');
        
        setChildName(childProfile.fullName || 'کودک عزیز');
        
        // Show the logo message after a short delay
        const messageTimer = setTimeout(() => {
          setShowMessage(true);
          
          // Hide the message after 5 seconds
          const hideTimer = setTimeout(() => {
            setShowMessage(false);
          }, 5000);
          
          return () => clearTimeout(hideTimer);
        }, 1000);
        
        return () => clearTimeout(messageTimer);
      } catch (error) {
        console.error('Error initializing app:', error);
        
        // Fallback to localStorage
        const storedProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
        setChildName(storedProfile.fullName || 'کودک عزیز');
      }
    };
    
    initApp();
  }, [currentUser]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleLogout = async () => {
    try {
      // Close database connection if open
      if (DatabaseService.initialized) {
        await DatabaseService.close();
      }
      
      // Clear auth data
      localStorage.removeItem('userAuth');
      localStorage.removeItem('userRole');
      
      // Use the useUser hook's logout function if available
      if (typeof logout === 'function') {
        await logout();
      }
      
      // Navigate directly to login page, not to parent dashboard
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Still logout even if error
      localStorage.removeItem('userAuth');
      localStorage.removeItem('userRole');
      
      // Force navigation to login
      navigate('/login', { replace: true });
    }
  };
  
  const navigateToFAQ = () => {
    // ذخیره نقش کاربر برای برگشت به داشبورد مناسب
    localStorage.setItem('userRole', 'child');
    navigate('/faq');
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <ChildHome childName={childName} />;
      case 'brush':
        return <BrushReminder />;
      case 'games':
        return <ChildGames />;
      default:
        return <ChildHome childName={childName} />;
    }
  };
  
  return (
    <div className="child-dashboard">
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
          {showMessage && (
            <div className="logo-message">
              هر 6 ماه یک بار به دندان پزشک مراجعه کنید
            </div>
          )}
        </div>
        <div className="user-info">
          <span className="welcome-text">خوش آمدی {childName}!</span>
          <button onClick={handleLogout} className="logout-button">خروج</button>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <ul className="nav-list">
          <li 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabChange('home')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">خانه</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'brush' ? 'active' : ''}`}
            onClick={() => handleTabChange('brush')}
          >
            <span className="nav-icon">🪥</span>
            <span className="nav-text">یادآوری مسواک</span>
          </li>
          <li 
            className={`nav-item ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => handleTabChange('games')}
          >
            <span className="nav-icon">🎮</span>
            <span className="nav-text">بازی</span>
          </li>
        </ul>
      </nav>
      
      <main className="dashboard-content">
        {renderContent()}
      </main>
      
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

export default ChildDashboard;