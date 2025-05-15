import React, { useState, useEffect, useRef } from 'react';
import './ParentComponents.css';

const ReminderSettings = ({ childName }) => {
  // Simplified reminders state without IDs
  const [reminders, setReminders] = useState({
    brushMorning: {
      enabled: true,
      time: '07:30',
      message: 'یادآوری مسواک صبح',
    },
    brushEvening: {
      enabled: true,
      time: '20:00',
      message: 'یادآوری مسواک شب',
    }
  });

  // Alarm sound settings
  const [selectedAlarm, setSelectedAlarm] = useState('default');
  const [alarmOptions, setAlarmOptions] = useState([
    { id: 'default', name: 'آهنگ پیش‌فرض یادآوری', src: '/assets/audios/parent_alarm.mp3' },
    { id: 'alarm2', name: 'آهنگ یادآوری دوم', src: '/assets/audios/parent_alarm2.mp3' },
  ]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentPlayingAlarm, setCurrentPlayingAlarm] = useState(null);
  const audioRef = useRef(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    try {
      // Load reminders
      const savedReminders = localStorage.getItem('brushReminders');
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }
      
      // Load alarm setting
      const savedAlarm = localStorage.getItem('selectedAlarm');
      if (savedAlarm) {
        setSelectedAlarm(savedAlarm);
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
  }, []);

  // Update audio source when alarm selection changes
  useEffect(() => {
    if (audioRef.current) {
      const selectedOption = alarmOptions.find(option => option.id === selectedAlarm);
      if (selectedOption) {
        audioRef.current.src = selectedOption.src;
        audioRef.current.load();
      }
    }
  }, [selectedAlarm, alarmOptions]);

  // Cleanup audio on unmount
  useEffect(() => {
    const audioElement = audioRef.current;
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, []);
  
  // Toggle reminder enabled/disabled
  const handleToggleReminder = (type, checked) => {
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: checked
      }
    }));
  };
  
  // Handle time change
  const handleTimeChange = (type, value) => {
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        time: value
      }
    }));
  };
  
  // Handle message change
  const handleMessageChange = (type, value) => {
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        message: value
      }
    }));
  };
  
  // Change selected alarm
  const handleAlarmChange = (alarmId) => {
    setSelectedAlarm(alarmId);
    setIsPlayingAudio(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  // Simplified save function - just saves to localStorage
  const handleSaveReminders = () => {
    try {
      // Save reminders
      localStorage.setItem('brushReminders', JSON.stringify(reminders));
      
      // Save alarm setting
      localStorage.setItem('selectedAlarm', selectedAlarm);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
      alert('خطا در ذخیره‌سازی تنظیمات. لطفاً دوباره تلاش کنید.');
    }
  };

  // Test playing the alarm sound
  const handleTestAlarm = (alarmId) => {
    if (isPlayingAudio) {
      // Stop audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingAudio(false);
        setCurrentPlayingAlarm(null);
      }
    } else {
      // Play audio
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play()
          .then(() => {
            setIsPlayingAudio(true);
            setCurrentPlayingAlarm(alarmId);
            // Set timer to stop after 5 seconds
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlayingAudio(false);
                setCurrentPlayingAlarm(null);
              }
            }, 5000);
          })
          .catch(err => {
            console.error("Error playing audio:", err);
            alert("خطا در پخش صدا. لطفاً مطمئن شوید که صدای دستگاه شما روشن است.");
          });
      }
    }
  };
  
  // Test reminder (for demonstration)
  const handleTestReminder = (type) => {
    // Show notification message
    alert(`آزمایش اعلان برنامه: ${reminders[type].message}`);
    
    // Play alarm sound
    handleTestAlarm(selectedAlarm);
  };
  
  return (
    <div className="reminder-settings-container">
      <div className="settings-header">
        <h2>تنظیمات یادآوری برای {childName || "کودک"}</h2>
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
              className={`test-button ${isPlayingAudio ? 'playing' : ''}`}
              onClick={() => handleTestReminder('brushMorning')}
              disabled={!reminders.brushMorning.enabled}
            >
              {isPlayingAudio ? 'توقف صدا' : 'آزمایش اعلان'}
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
              className={`test-button ${isPlayingAudio ? 'playing' : ''}`}
              onClick={() => handleTestReminder('brushEvening')}
              disabled={!reminders.brushEvening.enabled}
            >
              {isPlayingAudio ? 'توقف صدا' : 'آزمایش اعلان'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="alarm-preview">
        <h3>صدای اعلان یادآوری</h3>
        <div className="alarm-options">
          {alarmOptions.map((option) => (
            <div 
              key={option.id}
              className={`alarm-option ${selectedAlarm === option.id ? 'selected' : ''}`}
              onClick={() => handleAlarmChange(option.id)}
            >
              <div className="alarm-option-radio">
                <span className="radio-outer">
                  <span className={`radio-inner ${selectedAlarm === option.id ? 'active' : ''}`}></span>
                </span>
              </div>
              <div className="alarm-info">
                <div className="alarm-name">{option.name}</div>
              </div>
              <button 
                className={`preview-button ${isPlayingAudio && currentPlayingAlarm === option.id ? 'playing' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedAlarm !== option.id) {
                    handleAlarmChange(option.id);
                  }
                  handleTestAlarm(option.id);
                }}
              >
                {isPlayingAudio && currentPlayingAlarm === option.id ? (
                  <>
                    <span className="preview-icon">⏹️</span>
                    <span>توقف پخش</span>
                  </>
                ) : (
                  <>
                    <span className="preview-icon">▶️</span>
                    <span>پخش صدا</span>
                  </>
                )}
              </button>
            </div>
          ))}
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
      
      {/* Audio element for playing alarm sounds */}
      <audio ref={audioRef} preload="auto" src={alarmOptions.find(option => option.id === selectedAlarm)?.src || alarmOptions[0].src} />
      
      <style jsx>{`
        .alarm-preview {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        }
        
        .alarm-preview h3 {
          color: #4a6bff;
          margin-top: 0;
          margin-bottom: 15px;
        }
        
        .alarm-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .alarm-option {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 8px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }
        
        .alarm-option:hover {
          background-color: #f0f0f0;
        }
        
        .alarm-option.selected {
          border-color: #4a6bff;
          background-color: #f5f7ff;
        }
        
        .alarm-option-radio {
          margin-right: 12px;
        }
        
        .radio-outer {
          display: block;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #4a6bff;
          position: relative;
        }
        
        .radio-inner {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: #4a6bff;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .radio-inner.active {
          opacity: 1;
        }
        
        .alarm-info {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        
        .alarm-name {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .preview-button {
          display: flex;
          align-items: center;
          background-color: #4a6bff;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 15px;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-left: 10px;
        }
        
        .preview-button:hover {
          background-color: #3a5aee;
        }
        
        .preview-button.playing {
          background-color: #f44336;
        }
        
        .preview-button.playing:hover {
          background-color: #d32f2f;
        }
        
        .preview-icon {
          font-size: 18px;
          margin-left: 8px;
        }
        
        .test-button.playing {
          background-color: #f44336;
        }
        
        .test-button.playing:hover {
          background-color: #d32f2f;
        }
        
        .settings-header {
          margin-bottom: 20px;
        }
        
        .settings-header h2 {
          color: #333;
          margin-bottom: 10px;
        }
        
        .settings-description {
          color: #666;
          font-size: 0.9rem;
        }
        
        .reminders-section {
          margin-bottom: 30px;
        }
        
        .reminders-section h3 {
          color: #4a6bff;
          margin-bottom: 15px;
        }
        
        .reminder-card {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        }
        
        .reminder-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .reminder-header h4 {
          margin: 0 10px 0 0;
          font-size: 1.1rem;
          color: #333;
        }
        
        .reminder-details {
          margin-bottom: 20px;
        }
        
        .reminder-field {
          display: flex;
          flex-direction: column;
          margin-bottom: 15px;
        }
        
        .reminder-field label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 5px;
        }
        
        .reminder-field input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: inherit;
        }
        
        .reminder-field input:disabled {
          background-color: #f5f5f5;
          color: #999;
        }
        
        .reminder-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .test-button {
          background-color: #4a6bff;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 15px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .test-button:hover {
          background-color: #3a5aee;
        }
        
        .test-button:disabled {
          background-color: #bbb;
          cursor: not-allowed;
        }
        
        .settings-actions {
          margin-top: 20px;
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
        }
        
        .save-button {
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 25px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .save-button:hover {
          background-color: #3e9e41;
        }
        
        .success-message {
          background-color: #e8f5e9;
          color: #2e7d32;
          padding: 15px;
          text-align: center;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: bold;
          animation: fadeIn 0.3s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .reminder-info, .reminder-tips {
          margin-top: 30px;
        }
        
        .info-box {
          background-color: #e3f2fd;
          padding: 15px;
          border-radius: 8px;
        }
        
        .info-box h3 {
          color: #1976d2;
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 1.1rem;
        }
        
        .info-box p {
          margin: 0;
          color: #333;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        
        .reminder-tips h3 {
          color: #4a6bff;
          margin-bottom: 15px;
        }
        
        .reminder-tips ul {
          padding-right: 20px;
          margin: 0;
        }
        
        .reminder-tips li {
          margin-bottom: 10px;
          color: #444;
          line-height: 1.5;
        }
        
        /* Switch styles */
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
        }
        
        input:checked + .slider {
          background-color: #4a6bff;
        }
        
        input:focus + .slider {
          box-shadow: 0 0 1px #4a6bff;
        }
        
        input:checked + .slider:before {
          transform: translateX(26px);
        }
        
        .slider.round {
          border-radius: 24px;
        }
        
        .slider.round:before {
          border-radius: 50%;
        }
        
        @media (max-width: 768px) {
          .reminder-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .reminder-header h4 {
            margin: 10px 0 0 0;
          }
          
          .alarm-option {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .alarm-option-radio {
            margin-right: 0;
            margin-bottom: 10px;
          }
          
          .preview-button {
            margin-top: 10px;
            margin-left: 0;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ReminderSettings;