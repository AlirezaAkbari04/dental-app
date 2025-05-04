import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ParentDashboard.css';
import logoImage from '../logo.svg';
import BrushingReport from './parent/BrushingReport';
import ReminderSettings from './parent/ReminderSettings';
import InfoGraphics from './parent/InfoGraphics';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('report');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  
  // Load user data from localStorage
  useEffect(() => {
    const parentProfile = JSON.parse(localStorage.getItem('parentProfile') || '{}');
    setParentName(parentProfile.fullName || 'والد گرامی');
    
    // For demo purposes, we would normally get the child name from a database
    // or from a specific parent-child relationship in localStorage
    const childProfile = JSON.parse(localStorage.getItem('childProfile') || '{}');
    setChildName(childProfile.fullName || 'فرزند شما');
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
      case 'report':
        return <BrushingReport childName={childName} />;
      case 'reminders':
        return <ReminderSettings childName={childName} />;
      case 'infographics':
        return <InfoGraphics />;
      default:
        return <BrushingReport childName={childName} />;
    }
  };
  
  return (
    <div className="parent-dashboard">
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
          <span className="welcome-text">خوش آمدید {parentName}</span>
          <button onClick={handleLogout} className="logout-button">خروج</button>
        </div>
      </header>
      
      <div className="dashboard-container">
        <nav className="dashboard-sidebar">
          <div className="user-profile">
            <div className="profile-icon">👪</div>
            <div className="profile-name">{parentName}</div>
            <div className="child-name">والد {childName}</div>
          </div>
          
          <ul className="nav-menu">
            <li 
              className={`nav-item ${activeTab === 'report' ? 'active' : ''}`}
              onClick={() => handleTabChange('report')}
            >
              <span className="nav-icon">📊</span>
              <span className="nav-text">گزارش مسواک</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'reminders' ? 'active' : ''}`}
              onClick={() => handleTabChange('reminders')}
            >
              <span className="nav-icon">🔔</span>
              <span className="nav-text">یادآوری‌ها</span>
            </li>
            <li 
              className={`nav-item ${activeTab === 'infographics' ? 'active' : ''}`}
              onClick={() => handleTabChange('infographics')}
            >
              <span className="nav-icon">📚</span>
              <span className="nav-text">اینفوگرافی</span>
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

export default ParentDashboard;