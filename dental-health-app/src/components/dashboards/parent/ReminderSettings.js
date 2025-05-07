import React, { useState, useEffect, useRef } from 'react';
import './ParentComponents.css';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';

const ReminderSettings = ({ childName }) => {
  const { currentUser } = useUser(); // Get current user

  const [reminders, setReminders] = useState({
    brushMorning: {
      id: null, // Add ID field
      enabled: true,
      time: '07:30',
      message: 'یادآوری مسواک صبح',
    },
    brushEvening: {
      id: null, // Add ID field
      enabled: true,
      time: '20:00',
      message: 'یادآوری مسواک شب',
    },
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // Load reminders from database
  useEffect(() => {
    const loadReminders = async () => {
      if (!currentUser?.id) return;

      try {
        // Initialize database if needed
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }

        // Get reminders for the parent
        const dbReminders = await DatabaseService.getRemindersByUserId(currentUser.id);

        if (dbReminders && dbReminders.length > 0) {
          const updatedReminders = { ...reminders };

          for (const reminder of dbReminders) {
            if (reminder.type === 'brushMorning') {
              updatedReminders.brushMorning = {
                id: reminder.id,
                enabled: reminder.enabled === 1,
                time: reminder.time,
                message: reminder.message,
              };
            } else if (reminder.type === 'brushEvening') {
              updatedReminders.brushEvening = {
                id: reminder.id,
                enabled: reminder.enabled === 1,
                time: reminder.time,
                message: reminder.message,
              };
            }
          }

          setReminders(updatedReminders);
        }
      } catch (error) {
        console.error('Error loading reminders from database:', error);
      }
    };

    loadReminders();
  }, [currentUser]);

  useEffect(() => {
    const audioElement = audioRef.current;
  
    return () => {
      // Clean up audio when component unmounts
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
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
  
  // Update the save function to use the database
  const handleSaveReminders = async () => {
    if (!currentUser?.id) return;

    try {
      // Initialize database if needed
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }

      // Update or create morning reminder
      if (reminders.brushMorning.id) {
        // Update existing
        await DatabaseService.updateReminder(
          reminders.brushMorning.id,
          'brushMorning',
          reminders.brushMorning.time,
          reminders.brushMorning.message,
          reminders.brushMorning.enabled
        );
      } else {
        // Create new
        const newId = await DatabaseService.createReminder(
          currentUser.id,
          'brushMorning',
          reminders.brushMorning.time,
          reminders.brushMorning.message,
          reminders.brushMorning.enabled
        );

        // Update state with new ID
        setReminders((prev) => ({
          ...prev,
          brushMorning: {
            ...prev.brushMorning,
            id: newId,
          },
        }));
      }

      // Update or create evening reminder
      if (reminders.brushEvening.id) {
        // Update existing
        await DatabaseService.updateReminder(
          reminders.brushEvening.id,
          'brushEvening',
          reminders.brushEvening.time,
          reminders.brushEvening.message,
          reminders.brushEvening.enabled
        );
      } else {
        // Create new
        const newId = await DatabaseService.createReminder(
          currentUser.id,
          'brushEvening',
          reminders.brushEvening.time,
          reminders.brushEvening.message,
          reminders.brushEvening.enabled
        );

        // Update state with new ID
        setReminders((prev) => ({
          ...prev,
          brushEvening: {
            ...prev.brushEvening,
            id: newId,
          },
        }));
      }

      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving reminders to database:', error);
      alert('خطا در ذخیره‌سازی تنظیمات. لطفاً دوباره تلاش کنید.');
    }
  };
  
  // Handle testing a reminder alarm sound
  const handleTestAlarm = () => {
    if (isPlayingAudio) {
      // Stop audio if already playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingAudio(false);
      }
    } else {
      // Play audio
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play()
          .then(() => {
            setIsPlayingAudio(true);
            // Set a timeout to stop audio after 5 seconds
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setIsPlayingAudio(false);
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
  
  // Handle testing a reminder (for demo purposes)
  const handleTestReminder = (type) => {
    // Show a notification message
    alert(`آزمایش اعلان برنامه: ${reminders[type].message}`);
    
    // Play the alarm sound
    handleTestAlarm();
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
        <div className="alarm-preview-container">
          <div className="alarm-info">
            <div className="alarm-name">آهنگ پیش‌فرض یادآوری</div>
          </div>
          <button 
            className={`preview-button ${isPlayingAudio ? 'playing' : ''}`}
            onClick={handleTestAlarm}
          >
            {isPlayingAudio ? (
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
      
      {/* Audio element for alarm sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/assets/audios/parent_alarm.mp3" type="audio/mpeg" />
        <source src="/assets/audios/parent_alarm.ogg" type="audio/ogg" />
      </audio>
      
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
        
        .alarm-preview-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        
        .alarm-info {
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
      `}</style>
    </div>
  );
};

export default ReminderSettings;