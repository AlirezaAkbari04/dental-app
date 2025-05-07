import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ChildDashboard.css';
import logoImage from '../logo.svg';
import ChildHome from './child/ChildHome';
import BrushReminder from './child/BrushReminder';
import ChildGames from './child/ChildGames';
import ChildVideos from './child/ChildVideos';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';
import MigrationService from '../../services/MigrationService';

const ChildDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [showMessage, setShowMessage] = useState(false);
  const [childName, setChildName] = useState('');
  
  const { currentUser } = useUser();
  
  useEffect(() => {
    const initDatabase = async () => {
      try {
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }
        
        await MigrationService.migrateChildDataToDatabase();
        
        if (currentUser?.id) {
          const childProfile = await DatabaseService.getChildProfile(currentUser.id);
          setChildName(childProfile.fullName || 'کودک عزیز');
        } else {
          const storedProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
          setChildName(storedProfile.fullName || 'کودک عزیز');
        }
      } catch (error) {
        console.error('Error initializing database:', error);
        const storedProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
        setChildName(storedProfile.fullName || 'کودک عزیز');
      }
    };
    
    initDatabase();
    
    const messageTimer = setTimeout(() => {
      setShowMessage(true);
      
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      
      return () => clearTimeout(hideTimer);
    }, 1000);
    
    return () => clearTimeout(messageTimer);
  }, [currentUser]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userAuth');
    localStorage.removeItem('userRole');
    navigate('/login');
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <ChildHome childName={childName} />;
      case 'brush':
        return <BrushReminder />;
      case 'games':
        return <ChildGames />;
      case 'videos':
        return <ChildVideos />;
      default:
        return <ChildHome childName={childName} />;
    }
  };
  
  return (
    <div className="child-dashboard">
      <header className="dashboard-header">
        <div className="logo-container">
          <img 
            src={logoImage} 
            alt="لبخند شاد دندان سالم" 
            className="dashboard-logo" 
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
          <li 
            className={`nav-item ${activeTab === 'videos' ? 'active' : ''}`}
            onClick={() => handleTabChange('videos')}
          >
            <span className="nav-icon">🎬</span>
            <span className="nav-text">ویدیوها</span>
          </li>
        </ul>
      </nav>
      
      <main className="dashboard-content">
        {renderContent()}
      </main>
      
      <footer className="dashboard-footer">
        <p>لبخند شاد دندان سالم &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default ChildDashboard;