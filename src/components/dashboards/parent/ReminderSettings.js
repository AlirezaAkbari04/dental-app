import React, { useState, useEffect, useRef } from 'react';
import './ParentComponents.css';
import { useUser } from '../../../contexts/UserContext';
import DatabaseService from '../../../services/DatabaseService';

const ReminderSettings = ({ childName }) => {
  const { currentUser } = useUser();

  const [reminders, setReminders] = useState({
    brushMorning: {
      id: null,
      enabled: true,
      time: '07:30',
      message: 'یادآوری مسواک صبح',
    },
    brushEvening: {
      id: null,
      enabled: true,
      time: '20:00',
      message: 'یادآوری مسواک شب',
    },
  });

  // اضافه کردن وضعیت برای انتخاب صدای زنگ هشدار
  const [selectedAlarm, setSelectedAlarm] = useState('default');
  const [alarmOptions, setAlarmOptions] = useState([
    { id: 'default', name: 'آهنگ پیش‌فرض یادآوری', src: '/assets/audios/parent_alarm.mp3' },
    { id: 'alarm2', name: 'آهنگ یادآوری دوم', src: '/assets/audios/parent_alarm2.mp3' },
  ]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentPlayingAlarm, setCurrentPlayingAlarm] = useState(null);
  const audioRef = useRef(null);

  // بارگذاری یادآوری‌ها از پایگاه داده
  useEffect(() => {
    const loadReminders = async () => {
      if (!currentUser?.id) return;

      try {
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }

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
        
        // بارگذاری تنظیمات صدای زنگ از پایگاه داده
        const alarmSetting = await DatabaseService.getUserSetting(currentUser.id, 'selectedAlarm');
        if (alarmSetting) {
          setSelectedAlarm(alarmSetting.value);
        }
      } catch (error) {
        console.error('Error loading reminders from database:', error);
      }
    };

    loadReminders();
  }, [currentUser]);

  // به‌روزرسانی منبع صدا هنگام تغییر انتخاب زنگ هشدار
  useEffect(() => {
    if (audioRef.current) {
      const selectedOption = alarmOptions.find(option => option.id === selectedAlarm);
      if (selectedOption) {
        audioRef.current.src = selectedOption.src;
        audioRef.current.load();
      }
    }
  }, [selectedAlarm, alarmOptions]);

  useEffect(() => {
    const audioElement = audioRef.current;
  
    return () => {
      // پاکسازی صدا هنگام جدا شدن کامپوننت
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, []);
  
  // کنترل فعال/غیرفعال کردن یادآوری
  const handleToggleReminder = (type, checked) => {
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        enabled: checked
      }
    }));
  };
  
  // کنترل تغییر زمان
  const handleTimeChange = (type, value) => {
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        time: value
      }
    }));
  };
  
  // کنترل تغییر متن پیام
  const handleMessageChange = (type, value) => {
    setReminders(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        message: value
      }
    }));
  };
  
  // تغییر انتخاب صدای زنگ هشدار
  const handleAlarmChange = (alarmId) => {
    setSelectedAlarm(alarmId);
    setIsPlayingAudio(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  // به‌روزرسانی تابع ذخیره برای استفاده از پایگاه داده
  const handleSaveReminders = async () => {
    if (!currentUser?.id) return;

    try {
      // تنظیم پایگاه داده در صورت نیاز
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }

      // به‌روزرسانی یا ایجاد یادآوری صبح
      if (reminders.brushMorning.id) {
        // به‌روزرسانی موجود
        await DatabaseService.updateReminder(
          reminders.brushMorning.id,
          'brushMorning',
          reminders.brushMorning.time,
          reminders.brushMorning.message,
          reminders.brushMorning.enabled
        );
      } else {
        // ایجاد جدید
        const newId = await DatabaseService.createReminder(
          currentUser.id,
          'brushMorning',
          reminders.brushMorning.time,
          reminders.brushMorning.message,
          reminders.brushMorning.enabled
        );

        // به‌روزرسانی وضعیت با شناسه جدید
        setReminders((prev) => ({
          ...prev,
          brushMorning: {
            ...prev.brushMorning,
            id: newId,
          },
        }));
      }

      // به‌روزرسانی یا ایجاد یادآوری شب
      if (reminders.brushEvening.id) {
        // به‌روزرسانی موجود
        await DatabaseService.updateReminder(
          reminders.brushEvening.id,
          'brushEvening',
          reminders.brushEvening.time,
          reminders.brushEvening.message,
          reminders.brushEvening.enabled
        );
      } else {
        // ایجاد جدید
        const newId = await DatabaseService.createReminder(
          currentUser.id,
          'brushEvening',
          reminders.brushEvening.time,
          reminders.brushEvening.message,
          reminders.brushEvening.enabled
        );

        // به‌روزرسانی وضعیت با شناسه جدید
        setReminders((prev) => ({
          ...prev,
          brushEvening: {
            ...prev.brushEvening,
            id: newId,
          },
        }));
      }

      // ذخیره‌سازی تنظیمات آهنگ هشدار
      await DatabaseService.saveUserSetting(currentUser.id, 'selectedAlarm', selectedAlarm);

      // نمایش پیام موفقیت
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving reminders to database:', error);
      alert('خطا در ذخیره‌سازی تنظیمات. لطفاً دوباره تلاش کنید.');
    }
  };

  // کنترل آزمایش صدای هشدار
  const handleTestAlarm = (alarmId) => {
    if (isPlayingAudio) {
      // توقف صدا اگر در حال پخش است
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlayingAudio(false);
        setCurrentPlayingAlarm(null);
      }
    } else {
      // پخش صدا
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play()
          .then(() => {
            setIsPlayingAudio(true);
            setCurrentPlayingAlarm(alarmId);
            // تنظیم زمان‌سنج برای توقف صدا پس از 5 ثانیه
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
  
  // کنترل آزمایش یادآوری (برای اهداف نمایشی)
  const handleTestReminder = (type) => {
    // نمایش پیام اعلان
    alert(`آزمایش اعلان برنامه: ${reminders[type].message}`);
    
    // پخش صدای هشدار
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
      
      {/* المان صوتی برای پخش صدای هشدار */}
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
      `}</style>
    </div>
  );
};

export default ReminderSettings;