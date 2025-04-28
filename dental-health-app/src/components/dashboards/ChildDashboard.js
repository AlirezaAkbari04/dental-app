import React, { useState } from 'react';

function ChildDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container">
      <div className="header">
        <div className="user-info">
          <div className="avatar">
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="40" r="30" fill="#4a6bff"/>
              <circle cx="50" cy="110" r="50" fill="#4a6bff"/>
              <circle cx="35" cy="35" r="5" fill="white"/>
              <circle cx="65" cy="35" r="5" fill="white"/>
              <path d="M40 45 Q50 55 60 45" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="user-name">سارا جان</div>
        </div>
        
        <div className="points">
          <div className="points-icon">💎</div>
          <div className="points-value">42</div>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">یادآوری مسواک</div>
          <div className="badge">امروز</div>
        </div>
        
        <div className="brushing-times">
          <div className="brushing-time morning done">
            <div className="brushing-icon">🌞</div>
            <div className="brushing-label">صبح</div>
          </div>
          
          <div className="brushing-time night">
            <div className="brushing-icon">🌙</div>
            <div className="brushing-label">شب</div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="card-header">
          <div className="card-title">بازی انتخاب میان‌وعده</div>
          <div className="badge">امتیاز: +5</div>
        </div>
        
        <div>غذاها را به دسته مناسب بکشید</div>
      </div>
      
      <div className="menu">
        <div className="menu-item active">
          <div className="menu-icon">🏠</div>
          <div className="menu-label">خانه</div>
        </div>
        
        <div className="menu-item">
          <div className="menu-icon">🎮</div>
          <div className="menu-label">بازی‌ها</div>
        </div>
        
        <div className="menu-item">
          <div className="menu-icon">📚</div>
          <div className="menu-label">آموزش</div>
        </div>
        
        <div className="menu-item">
          <div className="menu-icon">👤</div>
          <div className="menu-label">پروفایل</div>
        </div>
      </div>
    </div>
  );
}

export default ChildDashboard;