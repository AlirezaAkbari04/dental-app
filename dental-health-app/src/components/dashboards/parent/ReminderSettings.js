import React, { useState, useEffect } from 'react';
import './ParentComponents.css';

const ReminderSettings = ({ childName }) => {
  const [reminders, setReminders] = useState({
    brushMorning: {
      enabled: true,
      time: '07:30',
      message: 'یادآوری مسواک صبح'
    },
    brushEvening: {
      enabled: true,
      time: '20:00',
      message: 'یادآوری مسواک شب'
    }
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Load reminders from localStorage
  useEffect(() => {
    const savedReminders = JSON.parse(localStorage.getItem('parentReminders') || '{}');
    if (Object.keys(savedReminders).length > 0) {
      setReminders(savedReminders);
    }
  }, []);
  
  // Handle toggling reminder on/off
  const handleToggleReminder = (type, checked) => {
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: checked
      }
    }));
  };
  
  // Handle changing reminder time
  const handleTimeChange = (type, value) => {
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        time: value
      }
    }));
  };
  
  // Handle changing reminder message
  const handleMessageChange = (type, value) => {
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        message: value
      }
    }));
  };
  
  // Handle saving all reminders
  const handleSaveReminders = () => {
    // In a real app, would save to local storage or database
    localStorage.setItem('parentReminders', JSON.stringify(reminders));
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };
  
  // Handle testing a reminder (for demo purposes)
  const handleTestReminder = (type) => {
    // In a real app, would show notification in the app
    alert(`آزمایش اعلان برنامه: ${reminders[type].message}`);
  };
  
  return (
    <div className="reminder-settings-container">
      <div className="settings-header">
        <h2>تنظیمات یادآوری برای {childName}</h2>
        <p className="settings-description">
          یادآوری‌ها از طریق برنامه به شما نمایش داده خواهند شد.
        </p>
      </div>
      
      <div className="reminders-section">
        <h3>یادآوری‌های مسواک</h3>
        
        <div className="reminder-card">
          <div className="reminder-header">
            <label className="switch">
              <input
                type="checkbox"
                checked={reminders.brushMorning.enabled}
                onChange={(e) => handleToggleReminder('brushMorning', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <h4>یادآوری مسواک صبح</h4>
          </div>
          
          <div className="reminder-details">
            <div className="reminder-field">
              <label>زمان یادآوری:</label>
              <input
                type="time"
                value={reminders.brushMorning.time}
                onChange={(e) => handleTimeChange('brushMorning', e.target.value)}
                disabled={!reminders.brushMorning.enabled}
              />
            </div>
            
            <div className="reminder-field">
              <label>متن اعلان:</label>
              <input
                type="text"
                value={reminders.brushMorning.message}
                onChange={(e) => handleMessageChange('brushMorning', e.target.value)}
                disabled={!reminders.brushMorning.enabled}
                placeholder="متن اعلان یادآوری"
              />
            </div>
          </div>
          
          <div className="reminder-actions">
            <button 
              className="test-button"
              onClick={() => handleTestReminder('brushMorning')}
              disabled={!reminders.brushMorning.enabled}
            >
              آزمایش اعلان
            </button>
          </div>
        </div>
        
        <div className="reminder-card">
          <div className="reminder-header">
            <label className="switch">
              <input
                type="checkbox"
                checked={reminders.brushEvening.enabled}
                onChange={(e) => handleToggleReminder('brushEvening', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <h4>یادآوری مسواک شب</h4>
          </div>
          
          <div className="reminder-details">
            <div className="reminder-field">
              <label>زمان یادآوری:</label>
              <input
                type="time"
                value={reminders.brushEvening.time}
                onChange={(e) => handleTimeChange('brushEvening', e.target.value)}
                disabled={!reminders.brushEvening.enabled}
              />
            </div>
            
            <div className="reminder-field">
              <label>متن اعلان:</label>
              <input
                type="text"
                value={reminders.brushEvening.message}
                onChange={(e) => handleMessageChange('brushEvening', e.target.value)}
                disabled={!reminders.brushEvening.enabled}
                placeholder="متن اعلان یادآوری"
              />
            </div>
          </div>
          
          <div className="reminder-actions">
            <button 
              className="test-button"
              onClick={() => handleTestReminder('brushEvening')}
              disabled={!reminders.brushEvening.enabled}
            >
              آزمایش اعلان
            </button>
          </div>
        </div>
      </div>
      
      <div className="settings-actions">
        <button 
          className="save-button"
          onClick={handleSaveReminders}
        >
          ذخیره تنظیمات
        </button>
      </div>
      
      {showSuccess && (
        <div className="success-message">
          تنظیمات یادآوری با موفقیت ذخیره شد.
        </div>
      )}
      
      <div className="reminder-info">
        <div className="info-box">
          <h3>نحوه دریافت یادآوری‌ها</h3>
          <p>یادآوری‌ها در زمان‌های تنظیم شده به صورت اعلان در برنامه نمایش داده می‌شوند. برای دریافت یادآوری‌ها، لطفاً اعلان‌های برنامه را فعال نگه دارید.</p>
        </div>
      </div>
      
      <div className="reminder-tips">
        <h3>نکات مفید</h3>
        <ul>
          <li>یادآوری مسواک صبح و شب به تنظیم عادت مسواک زدن منظم کمک می‌کند.</li>
          <li>هر 6 ماه یک بار به دندانپزشک مراجعه کنید.</li>
          <li>برای دریافت بهترین نتیجه، گوشی خود را هنگام خواب در حالت بی‌صدا قرار ندهید تا اعلان‌های یادآوری را از دست ندهید.</li>
        </ul>
      </div>
    </div>
  );
};

export default ReminderSettings;