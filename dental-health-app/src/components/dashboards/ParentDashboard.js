import React, { useState } from 'react';

function ParentDashboard() {
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
          <div className="user-name">خانم/آقای محمدی</div>
        </div>
        
        <div className="notification-bell">
          🔔
          <div className="notification-badge">2</div>
        </div>
      </div>
      
      <div className="stats-overview">
        <div className="stat-box">
          <div className="stat-number">85%</div>
          <div className="stat-label">میانگین مسواک‌زدن</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-number">42</div>
          <div className="stat-label">امتیاز کودک</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-number">2</div>
          <div className="stat-label">جایزه</div>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            گزارش
          </div>
          <div 
            className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            تقویم
          </div>
          <div 
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            پیام‌ها
          </div>
        </div>
        
        <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
          <div className="child-selector">
            <div className="child-item active">سارا</div>
            <div className="child-item">علی</div>
          </div>
          
          <div className="chart-container">
            <div style={{ fontSize: '14px', marginBottom: '10px', color: '#555' }}>وضعیت بهداشت دهان و دندان</div>
            
            <div className="chart-bars">
              <div className="chart-bar" style={{ height: '80%' }}>
                <div className="chart-bar-value">80%</div>
                <div className="chart-bar-label">فروردین</div>
              </div>
              <div className="chart-bar" style={{ height: '65%' }}>
                <div className="chart-bar-value">65%</div>
                <div className="chart-bar-label">اردیبهشت</div>
              </div>
              <div className="chart-bar" style={{ height: '90%' }}>
                <div className="chart-bar-value">90%</div>
                <div className="chart-bar-label">خرداد</div>
              </div>
              <div className="chart-bar" style={{ height: '85%' }}>
                <div className="chart-bar-value">85%</div>
                <div className="chart-bar-label">تیر</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`tab-content ${activeTab === 'schedule' ? 'active' : ''}`}>
          <div className="calendar">
            <div className="calendar-header">
              <div className="month-selector">تیر ۱۴۰۴</div>
              <div className="calendar-nav">
                <button className="calendar-nav-btn">›</button>
                <button className="calendar-nav-btn">‹</button>
              </div>
            </div>
            
            <div className="calendar-body">
              {/* جدول تقویم اینجا قرار می‌گیرد */}
              <div className="calendar-placeholder">تقویم و یادآوری‌های مسواک و چکاپ دندانپزشکی</div>
            </div>
          </div>
        </div>
        
        <div className={`tab-content ${activeTab === 'messages' ? 'active' : ''}`}>
          <div className="message-form">
            <textarea className="message-input" rows="4" placeholder="پیام خود را به مراقب سلامت بنویسید..."></textarea>
            <button className="send-btn">ارسال پیام</button>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>پیام‌های اخیر</div>
          
          <div className="message-item">
            <div className="message-header">
              <div className="message-title">یادآوری مراجعه به دندانپزشک</div>
              <div className="message-date">۱۵ تیر ۱۴۰۴</div>
            </div>
            <div className="message-content">
              والدین گرامی، لطفا جهت معاینه دوره‌ای دندان‌های فرزندتان به دندانپزشک مراجعه نمایید. این معاینه برای پیشگیری از مشکلات دندانی ضروری است.
            </div>
            <div className="message-footer">
              <div className="message-sender">از طرف: مراقب سلامت مدرسه</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="menu">
        <div className="menu-item active">
          <div className="menu-icon">📊</div>
          <div className="menu-label">داشبورد</div>
        </div>
        
        <div className="menu-item">
          <div className="menu-icon">👶</div>
          <div className="menu-label">کودکان</div>
        </div>
        
        <div className="menu-item">
          <div className="menu-icon">🦷</div>
          <div className="menu-label">دندانپزشک</div>
        </div>
        
        <div className="menu-item">
          <div className="menu-icon">👤</div>
          <div className="menu-label">پروفایل</div>
        </div>
      </div>
    </div>
  );
}

export default ParentDashboard;