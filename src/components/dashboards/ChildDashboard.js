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
  
  // Use UserContext for proper state management
  const { currentUser, logout } = useUser();
  
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize database and run migration if needed
        if (!DatabaseService.initialized) {
          await DatabaseService.ensureInitialized();
          await MigrationService.migrateChildDataToDatabase();
        }
        
        // Load child profile data
        await loadChildProfile();
        
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
        setChildName(storedProfile.fullName || 'Dear Child');
      }
    };
    
    const loadChildProfile = async () => {
      try {
        if (currentUser?.id) {
          // Try to get from database first
          const userProfile = await DatabaseService.getUserById(currentUser.id);
          if (userProfile && userProfile.profile_data) {
            const profileData = JSON.parse(userProfile.profile_data);
            setChildName(profileData.fullName || profileData.name || 'Dear Child');
          } else {
            // Fallback to localStorage
            const storedProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
            setChildName(storedProfile.fullName || 'Dear Child');
          }
        } else {
          // Fallback to localStorage if no currentUser
          const storedProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
          setChildName(storedProfile.fullName || 'Dear Child');
        }
      } catch (error) {
        console.error('Error loading child profile:', error);
        // Final fallback
        const storedProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
        setChildName(storedProfile.fullName || 'Dear Child');
      }
    };
    
    initApp();
  }, [currentUser]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleLogout = async () => {
    try {
      console.log('Child logout initiated');
      
      // Close database connection if open
      if (DatabaseService.initialized) {
        await DatabaseService.close();
      }
      
      // Clear child-specific localStorage items
      localStorage.removeItem('childProfile');
      localStorage.removeItem('childAchievements');
      localStorage.removeItem('brushAlarms');
      localStorage.removeItem('healthySnackScore');
      localStorage.removeItem('userRole');
      
      // Use the UserContext logout function
      await logout();
      
      // Reset component state
      setChildName('');
      setActiveTab('home');
      setShowMessage(false);
      
      console.log('Child logout completed, navigating to login');
      
      // Navigate to login page and replace the history stack
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during child logout:', error);
      
      // Force cleanup even if error occurs
      localStorage.removeItem('userAuth');
      localStorage.removeItem('childProfile');
      localStorage.removeItem('childAchievements');
      localStorage.removeItem('brushAlarms');
      localStorage.removeItem('healthySnackScore');
      localStorage.removeItem('userRole');
      
      // Reset component state
      setChildName('');
      setActiveTab('home');
      setShowMessage(false);
      
      // Force navigation to login
      navigate('/login', { replace: true });
    }
  };
  
  const navigateToFAQ = () => {
    // Save user role for returning to appropriate dashboard
    localStorage.setItem('userRole', 'child');
    navigate('/faq');
  };
  
  const navigateToAboutUs = () => {
    localStorage.setItem('userRole', 'child');
    navigate('/about-us');
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
            alt="Healthy Teeth Happy Smile"
            className="dashboard-logo"
            onError={(e) => {
              console.warn('Failed to load logo, trying alternative');
              e.target.src = "/logo.png";
            }}
          />
          {showMessage && (
            <div className="logo-message">
              Visit your dentist every 6 months
            </div>
          )}
        </div>
        <div className="user-info">
          <span className="welcome-text">Welcome {childName}!</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <ul className="nav-list">
          <li
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleTabChange('home')}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </li>
          <li
            className={`nav-item ${activeTab === 'brush' ? 'active' : ''}`}
            onClick={() => handleTabChange('brush')}
          >
            <span className="nav-icon">🪥</span>
            <span className="nav-text">Brushing Reminder</span>
          </li>
          <li
            className={`nav-item ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => handleTabChange('games')}
          >
            <span className="nav-icon">🎮</span>
            <span className="nav-text">Games</span>
          </li>
        </ul>
      </nav>
      
      <main className="dashboard-content">
        {renderContent()}
      </main>
      
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

export default ChildDashboard;