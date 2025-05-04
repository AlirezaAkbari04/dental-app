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
    },
    dentistVisit: {
      enabled: true,
      interval: '6',
      message: 'یادآوری مراجعه به دندانپزشک'
    },
    toothbrushChange: {
      enabled: true,
      interval: '3',
      message: 'یادآوری تعویض مسواک'
    }
  });
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Load reminders from localStorage
  useEffect(() => {
    const savedReminders = JSON.parse(localStorage.getItem('parentReminders') || '{}');
    if (Object.keys(savedReminders).length > 0) {
      setReminders(savedReminders);
    }
    
    const parentProfile = JSON.parse(localStorage.getItem('parentProfile') || '{}');
    setPhoneNumber(parentProfile.phoneNumber || '');
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
  
  // Handle changing reminder interval
  const handleIntervalChange = (type, value) => {
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        interval: value
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
  
  // Handle phone number change
  const handlePhoneChange = (e) => {
    setPhoneNumber(e.target.value);
  };
  
  // Handle saving all reminders
  const handleSaveReminders = () => {
    // In a real app, would send to server/API
    localStorage.setItem('parentReminders', JSON.stringify(reminders));
    
    // Update parent profile with phone number
    const parentProfile = JSON.parse(localStorage.getItem('parentProfile') || '{}');
    parentProfile.phoneNumber = phoneNumber;
    localStorage.setItem('parentProfile', JSON.stringify(parentProfile));
    
    // Show success message
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };
  
  // Handle testing a reminder (for demo purposes)
  const handleTestReminder = (type) => {
    // In a real app, would send test SMS
    alert(`آزمایش پیامک برای ${reminders[type].message}`);
  };
  
  return (
    <div className="reminder-settings-container">
      <div className="settings-header">
        <h2>تنظیمات یادآوری برای {childName}</h2>
        <p className="settings-description">
          یادآوری‌های متنی به شماره موبایل شما ارسال خواهند شد.
        </p>
      </div>
      
      <div className="phone-number-section">
        <label htmlFor="phoneNumber">شماره موبایل:</label>
        <div className="phone-input-container">
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="09123456789"
            className="phone-input"
            dir="ltr"
          />
        </div>
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
              <label>متن پیامک:</label>
              <input
                type="text"
                value={reminders.brushMorning.message}
                onChange={(e) => handleMessageChange('brushMorning', e.target.value)}
                disabled={!reminders.brushMorning.enabled}
                placeholder="متن پیامک یادآوری"
              />
            </div>
          </div>
          
          <div className="reminder-actions">
            <button 
              className="test-button"
              onClick={() => handleTestReminder('brushMorning')}
              disabled={!reminders.brushMorning.enabled}
            >
              آزمایش پیامک
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
              <label>متن پیامک:</label>
              <input
                type="text"
                value={reminders.brushEvening.message}
                onChange={(e) => handleMessageChange('brushEvening', e.target.value)}
                disabled={!reminders.brushEvening.enabled}
                placeholder="متن پیامک یادآوری"
              />
            </div>
          </div>
          
          <div className="reminder-actions">
            <button 
              className="test-button"
              onClick={() => handleTestReminder('brushEvening')}
              disabled={!reminders.brushEvening.enabled}
            >
              آزمایش پیامک
            </button>
          </div>
        </div>
        
        <h3>یادآوری‌های دوره‌ای</h3>
        
        <div className="reminder-card">
          <div className="reminder-header">
            <label className="switch">
              <input
                type="checkbox"
                checked={reminders.dentistVisit.enabled}
                onChange={(e) => handleToggleReminder('dentistVisit', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <h4>یادآوری مراجعه به دندانپزشک</h4>
          </div>
          
          <div className="reminder-details">
            <div className="reminder-field">
              <label>دوره (ماه):</label>
              <select
                value={reminders.dentistVisit.interval}
                onChange={(e) => handleIntervalChange('dentistVisit', e.target.value)}
                disabled={!reminders.dentistVisit.enabled}
              >
                <option value="3">3 ماه</option>
                <option value="6">6 ماه</option>
                <option value="12">12 ماه</option>
              </select>
            </div>
            
            <div className="reminder-field">
              <label>متن پیامک:</label>
              <input
                type="text"
                value={reminders.dentistVisit.message}
                onChange={(e) => handleMessageChange('dentistVisit', e.target.value)}
                disabled={!reminders.dentistVisit.enabled}
                placeholder="متن پیامک یادآوری"
              />
            </div>
          </div>
          
          <div className="reminder-actions">
            <button 
              className="test-button"
              onClick={() => handleTestReminder('dentistVisit')}
              disabled={!reminders.dentistVisit.enabled}
            >
              آزمایش پیامک
            </button>
          </div>
        </div>
        
        <div className="reminder-card">
          <div className="reminder-header">
            <label className="switch">
              <input
                type="checkbox"
                checked={reminders.toothbrushChange.enabled}
                onChange={(e) => handleToggleReminder('toothbrushChange', e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
            <h4>یادآوری تعویض مسواک</h4>
          </div>
          
          <div className="reminder-details">
            <div className="reminder-field">
              <label>دوره (ماه):</label>
              <select
                value={reminders.toothbrushChange.interval}
                onChange={(e) => handleIntervalChange('toothbrushChange', e.target.value)}
                disabled={!reminders.toothbrushChange.enabled}
              >
                <option value="2">2 ماه</option>
                <option value="3">3 ماه</option>
                <option value="4">4 ماه</option>
              </select>
            </div>
            
            <div className="reminder-field">
              <label>متن پیامک:</label>
              <input
                type="text"
                value={reminders.toothbrushChange.message}
                onChange={(e) => handleMessageChange('toothbrushChange', e.target.value)}
                disabled={!reminders.toothbrushChange.enabled}
                placeholder="متن پیامک یادآوری"
              />
            </div>
          </div>
          
          <div className="reminder-actions">
            <button 
              className="test-button"
              onClick={() => handleTestReminder('toothbrushChange')}
              disabled={!reminders.toothbrushChange.enabled}
            >
              آزمایش پیامک
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
      
      <div className="reminder-tips">
        <h3>نکات مفید</h3>
        <ul>
          <li>یادآوری مسواک صبح و شب به تنظیم عادت مسواک زدن منظم کمک می‌کند.</li>
          <li>مراجعه به دندانپزشک هر 6 ماه یکبار برای بررسی سلامت دهان و دندان ضروری است.</li>
          <li>تعویض مسواک هر 3 ماه یکبار برای بهداشت دهان و اثربخشی مسواک زدن توصیه می‌شود.</li>
        </ul>
      </div>
    </div>
  );
};

export default ReminderSettings;