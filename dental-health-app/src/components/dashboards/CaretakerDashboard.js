import React, { useState } from 'react';

function CaretakerDashboard() {
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
          <div className="user-name">دکتر امینی</div>
        </div>
        
        <div className="notification-bell">
          🔔
          <div className="notification-badge">5</div>
        </div>
      </div>
      
      <div className="stats-overview">
        <div className="stat-box">
          <div className="stat-number">8</div>
          <div className="stat-label">مدارس تحت پوشش</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-number">412</div>
          <div className="stat-label">دانش‌آموزان</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-number">67%</div>
          <div className="stat-label">میانگین مسواک‌زدن</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-number">25</div>
          <div className="stat-label">موارد نیازمند توجه</div>
        </div>
      </div>
      
      <div className="dashboard-card">
        <div className="tabs">
          <div 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            کلی
          </div>
          <div 
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            دانش‌آموزان
          </div>
          <div 
            className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            گزارش‌ها
          </div>
          <div 
            className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            پیام‌ها
          </div>
        </div>
        
        <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
          <div className="school-selector">
            <div className="school-item active">همه مدارس</div>
            <div className="school-item">دبستان شهید رجایی</div>
            <div className="school-item">دبستان امام خمینی</div>
            <div className="school-item">دبستان الزهرا</div>
          </div>
          
          <div className="chart-container">
            <div style={{ fontSize: '14px', marginBottom: '10px', color: '#555' }}>وضعیت بهداشت دهان و دندان</div>
            
            <div className="chart-bars">
              <div className="chart-bar" style={{ height: '80%' }}>
                <div className="chart-bar-value">80%</div>
                <div className="chart-bar-label">رجایی</div>
              </div>
              <div className="chart-bar" style={{ height: '65%' }}>
                <div className="chart-bar-value">65%</div>
                <div className="chart-bar-label">خمینی</div>
              </div>
              <div className="chart-bar" style={{ height: '75%' }}>
                <div className="chart-bar-value">75%</div>
                <div className="chart-bar-label">الزهرا</div>
              </div>
              <div className="chart-bar" style={{ height: '50%' }}>
                <div className="chart-bar-value">50%</div>
                <div className="chart-bar-label">بهشتی</div>
              </div>
            </div>
          </div>
          
          <div className="export-options">
            <div className="export-option">
              <div className="export-icon">📊</div>
              <div className="export-label">گزارش آماری</div>
            </div>
            <div className="export-option">
              <div className="export-icon">📝</div>
              <div className="export-label">گزارش جزئیات</div>
            </div>
            <div className="export-option">
              <div className="export-icon">📱</div>
              <div className="export-label">ارسال پیامک</div>
            </div>
            <div className="export-option">
              <div className="export-icon">📧</div>
              <div className="export-label">ارسال ایمیل</div>
            </div>
          </div>
        </div>
        
        <div className={`tab-content ${activeTab === 'students' ? 'active' : ''}`}>
          <div className="search-bar">
            <input type="text" className="search-input" placeholder="جستجوی نام دانش‌آموز..." />
            <button className="search-btn">🔍</button>
          </div>
          
          <div className="filters">
            <div className="filter active">
              <span className="filter-icon">👦👧</span>
              <span>همه</span>
            </div>
            <div className="filter">
              <span className="filter-icon">👦</span>
              <span>پسر</span>
            </div>
            <div className="filter">
              <span className="filter-icon">👧</span>
              <span>دختر</span>
            </div>
            <div className="filter">
              <span className="filter-icon">⚠️</span>
              <span>نیازمند توجه</span>
            </div>
          </div>
          
          <div className="class-selector">
            <div className="class-item active">همه</div>
            <div className="class-item">کلاس اول</div>
            <div className="class-item">کلاس دوم</div>
            <div className="class-item">کلاس سوم</div>
            <div className="class-item">کلاس چهارم</div>
            <div className="class-item">کلاس پنجم</div>
            <div className="class-item">کلاس ششم</div>
          </div>
          
          <div className="student-list">
            <div className="student-item">
              <div className="student-avatar">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" fill="#ffccaa"/>
                  <circle cx="35" cy="40" r="5" fill="#333"/>
                  <circle cx="65" cy="40" r="5" fill="#333"/>
                  <path d="M40 65 Q50 75 60 65" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M30 30 Q50 10 70 30" fill="none" stroke="#ff7700" strokeWidth="8" strokeLinecap="round"/>
                </svg>
              </div>
              
              <div className="student-info">
                <div className="student-name">سارا محمدی</div>
                <div className="student-details">کلاس سوم - دبستان الزهرا</div>
              </div>
              
              <div className="student-status">
                <div className="status-indicator status-good"></div>
              </div>
              
              <div className="student-action">›</div>
            </div>
            
            <div className="student-item">
              <div className="student-avatar">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" fill="#ffccaa"/>
                  <circle cx="35" cy="40" r="5" fill="#333"/>
                  <circle cx="65" cy="40" r="5" fill="#333"/>
                  <path d="M40 60 Q50 55 60 60" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
                  <rect x="25" y="15" width="50" height="10" rx="5" fill="#333"/>
                </svg>
              </div>
              
              <div className="student-info">
                <div className="student-name">علی رضایی</div>
                <div className="student-details">کلاس دوم - دبستان شهید رجایی</div>
              </div>
              
              <div className="student-status">
                <div className="status-indicator status-warning"></div>
              </div>
              
              <div className="student-action">›</div>
            </div>
            
            <div className="student-item">
              <div className="student-avatar">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="40" fill="#ffccaa"/>
                  <circle cx="35" cy="40" r="5" fill="#333"/>
                  <circle cx="65" cy="40" r="5" fill="#333"/>
                  <path d="M35 65 Q50 70 65 65" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round"/>
                  <rect x="30" y="15" width="40" height="15" rx="7" fill="#4a6bff"/>
                </svg>
              </div>
              
              <div className="student-info">
                <div className="student-name">امیر حسینی</div>
                <div className="student-details">کلاس پنجم - دبستان امام خمینی</div>
              </div>
              
              <div className="student-status">
                <div className="status-indicator status-alert"></div>
              </div>
              
              <div className="student-action">›</div>
            </div>
          </div>
        </div>
        
        <div className={`tab-content ${activeTab === 'reports' ? 'active' : ''}`}>
          <div className="report-item">
            <div className="report-header">
              <div className="report-title">گزارش ماهانه - اردیبهشت ۱۴۰۴</div>
              <div className="report-date">۱۸ اردیبهشت ۱۴۰۴</div>
            </div>
            <div className="report-content">
              در این ماه، ۸۵٪ دانش‌آموزان دبستان شهید رجایی عملکرد خوبی در زمینه بهداشت دهان و دندان داشته‌اند. ۱۰ مورد نیازمند پیگیری شناسایی شده است.
            </div>
            <div className="report-footer">
              <button className="report-btn">مشاهده کامل</button>
              <button className="report-btn">دانلود PDF</button>
              <button className="report-btn">اشتراک‌گذاری</button>
            </div>
          </div>
          
          <div className="report-item">
            <div className="report-header">
              <div className="report-title">گزارش وضعیت فیشور سیلنت ها</div>
              <div className="report-date">۱۰ فروردین ۱۴۰۴</div>
            </div>
            <div className="report-content">
              برنامه فیشور سیلنت برای دانش‌آموزان ۶-۷ ساله با موفقیت اجرا شد. ۸۵ دانش‌آموز در این برنامه شرکت کردند و نیاز به پیگیری در ۶ ماه آینده دارند.
            </div>
            <div className="report-footer">
              <button className="report-btn">مشاهده کامل</button>
              <button className="report-btn">دانلود PDF</button>
              <button className="report-btn">اشتراک‌گذاری</button>
            </div>
          </div>
        </div>
        
        <div className={`tab-content ${activeTab === 'messages' ? 'active' : ''}`}>
          <div className="class-selector">
            <div className="class-item active">همه</div>
            <div className="class-item">دبستان شهید رجایی</div>
            <div className="class-item">دبستان امام خمینی</div>
            <div className="class-item">دبستان الزهرا</div>
          </div>
          
          <div className="message-form">
            <textarea className="message-input" rows="4" placeholder="پیام خود را وارد کنید..."></textarea>
            
            <div className="message-options">
              <label className="message-option">
                <input type="checkbox" checked />
                <span>ارسال به والدین</span>
              </label>
              <label className="message-option">
                <input type="checkbox" />
                <span>ارسال به مدیران مدرسه</span>
              </label>
            </div>
            
            <button className="send-btn">ارسال پیام</button>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#555' }}>پیام‌های اخیر</div>
          
          <div className="report-item" style={{ backgroundColor: '#f0f5ff', marginTop: '10px' }}>
            <div className="report-header">
              <div className="report-title">یادآوری مراجعه به دندانپزشک</div>
              <div className="report-date">۱۵ اردیبهشت ۱۴۰۴</div>
            </div>
            <div className="report-content">
              والدین گرامی، لطفا جهت معاینه دوره‌ای دندان‌های فرزندتان به دندانپزشک مراجعه نمایید. این معاینه برای پیشگیری از مشکلات دندانی ضروری است.
            </div>
            <div className="report-footer">
              <div style={{ flex: 1, textAlign: 'left', color: '#777', fontSize: '12px' }}>ارسال شده به: ۱۲۵ والد</div>
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
          <div className="menu-icon">👥</div>
          <div className="menu-label">دانش‌آموزان</div>
        </div>
        
        <div className="menu-item">
          <div className="menu-icon">📝</div>
          <div className="menu-label">گزارش‌ها</div>
        </div>
        
        <div className="menu-item">
          <div className="menu-icon">👤</div>
          <div className="menu-label">پروفایل</div>
        </div>
      </div>
    </div>
  );
}

export default CaretakerDashboard;
