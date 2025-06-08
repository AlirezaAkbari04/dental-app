import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/ChildComponents.css';
import { useUser } from '../../../contexts/UserContext';
import DatabaseService from '../../../services/DatabaseService';

const BrushReminder = () => {
  const { currentUser } = useUser();
  const [childId, setChildId] = useState(null);

  const [alarms, setAlarms] = useState({
    morning: { hour: 7, minute: 30, enabled: true },
    evening: { hour: 20, minute: 0, enabled: true }
  });
  
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [showCongrats, setShowCongrats] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  
  const audioRef = useRef(null);
  const alarmAudioRef = useRef(null);
  const congratsAudioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const alarmCheckIntervalRef = useRef(null);
  
  // Function to convert English numbers to Persian
  const toPersianNumber = (num) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    return num.toString().replace(/\d/g, (digit) => persianDigits[digit]);
  };

  // Function to convert Persian numbers to English
  const toEnglishNumber = (str) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';
    return str.replace(/[۰-۹]/g, (digit) => englishDigits[persianDigits.indexOf(digit)]);
  };

  // Function to format time in Persian format
  const formatPersianTime = (hour, minute) => {
    const persianHour = toPersianNumber(hour.toString().padStart(2, '0'));
    const persianMinute = toPersianNumber(minute.toString().padStart(2, '0'));
    return `${persianHour}:${persianMinute}`;
  };

  // Load saved alarms from localStorage
  useEffect(() => {
    try {
      const savedAlarms = JSON.parse(localStorage.getItem('brushAlarms') || '{}');
      if (Object.keys(savedAlarms).length > 0) {
        setAlarms(savedAlarms);
      }
    } catch (error) {
      console.error("Error loading alarms from localStorage:", error);
    }
  }, []);
  
  // Save alarms to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('brushAlarms', JSON.stringify(alarms));
    } catch (error) {
      console.error("Error saving alarms to localStorage:", error);
    }
  }, [alarms]);
  
  // Load reminders from database
  useEffect(() => {
    const fetchReminders = async () => {
      if (!currentUser?.id) return;

      try {
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }

        if (currentUser.role === 'parent') {
          const children = await DatabaseService.getChildrenByParentId(currentUser.id);
          if (children.length > 0) {
            setChildId(children[0].id);
          }
        } else if (currentUser.role === 'child') {
          setChildId(currentUser.id);
        }

        const reminders = await DatabaseService.getRemindersByUserId(currentUser.id);

        if (reminders && reminders.length > 0) {
          const updatedAlarms = { ...alarms };

          for (const reminder of reminders) {
            if (reminder.type === 'brushMorning') {
              const [hour, minute] = reminder.time.split(':');
              updatedAlarms.morning = {
                hour: parseInt(hour, 10),
                minute: parseInt(minute, 10),
                enabled: reminder.enabled === 1,
              };
            } else if (reminder.type === 'brushEvening') {
              const [hour, minute] = reminder.time.split(':');
              updatedAlarms.evening = {
                hour: parseInt(hour, 10),
                minute: parseInt(minute, 10),
                enabled: reminder.enabled === 1,
              };
            }
          }

          setAlarms(updatedAlarms);
        }
      } catch (error) {
        console.error('Error loading reminders:', error);
      }
    };

    fetchReminders();
  }, [currentUser]);

  // Check if alarm should be triggered
  useEffect(() => {
    alarmCheckIntervalRef.current = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      if (alarms.morning.enabled && 
          currentHour === alarms.morning.hour && 
          currentMinute === alarms.morning.minute && 
          !alarmActive) {
        triggerAlarm('صبح');
      }
      
      if (alarms.evening.enabled && 
          currentHour === alarms.evening.hour && 
          currentMinute === alarms.evening.minute && 
          !alarmActive) {
        triggerAlarm('شب');
      }
    }, 10000);
    
    return () => {
      if (alarmCheckIntervalRef.current) {
        clearInterval(alarmCheckIntervalRef.current);
      }
    };
  }, [alarms, alarmActive]);
  
  // Function to trigger alarm
  const triggerAlarm = (timeOfDay) => {
    setAlarmActive(true);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`یادآوری مسواک ${timeOfDay}`, {
        body: `زمان مسواک زدن ${timeOfDay} رسیده است!`,
        icon: '/logo192.png'
      });
    }
    
    if (alarmAudioRef.current) {
      alarmAudioRef.current.currentTime = 0;
      alarmAudioRef.current.play().catch(error => {
        console.error("Error playing alarm audio:", error);
      });
      
      setTimeout(() => {
        stopAlarm();
      }, 30000);
    }
  };
  
  // Function to stop alarm
  const stopAlarm = () => {
    setAlarmActive(false);
    
    if (alarmAudioRef.current) {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
    }
  };
  
  // Handle timer countdown
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      
      console.log("Timer running, time left:", timeLeft);
    } else if (timerRunning && timeLeft === 0) {
      console.log("Timer finished");
      stopTimer();
      showCongratulations();
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerRunning, timeLeft]);
  
  const handleTimeChange = async (alarmType, timeString) => {
    const englishTimeString = toEnglishNumber(timeString);
    
    const [hourStr, minuteStr] = englishTimeString.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    console.log(`Setting ${alarmType} alarm to ${hour}:${minute}`);
    
    const updatedAlarms = {
      ...alarms,
      [alarmType]: {
        ...alarms[alarmType],
        hour,
        minute
      }
    };
    
    setAlarms(updatedAlarms);
    
    if (childId && DatabaseService.initialized) {
      try {
        await DatabaseService.saveChildAlarms(childId, updatedAlarms);
      } catch (error) {
        console.error(`Error saving ${alarmType} alarm:`, error);
      }
    }
  };

  const handleEnabledChange = async (alarmType, enabled) => {
    const updatedAlarms = {
      ...alarms,
      [alarmType]: {
        ...alarms[alarmType],
        enabled
      }
    };
    
    setAlarms(updatedAlarms);
    
    if (childId && DatabaseService.initialized) {
      try {
        await DatabaseService.saveChildAlarms(childId, updatedAlarms);
      } catch (error) {
        console.error(`Error saving ${alarmType} alarm enabled state:`, error);
      }
    }
  };
  
  const startTimer = () => {
    console.log("Starting timer");
    setTimerRunning(true);
    setShowCongrats(false);
    setAudioError(false);
    
    if (timeLeft === 0) {
      setTimeLeft(120);
    }
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setAudioError(true);
      });
    }
  };
  
  const stopTimer = () => {
    console.log("Stopping timer");
    setTimerRunning(false);
    
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    }
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };
  
  const resetTimer = () => {
    console.log("Resetting timer");
    stopTimer();
    setTimeLeft(120);
  };
  
  const saveBrushingState = async (isCompleted, timeOfDay, durationMinutes) => {
    if (!childId) return;
    
    try {
      const currentDate = DatabaseService.formatDate(new Date());
      
      await DatabaseService.createBrushingRecord(
        childId,
        currentDate,
        timeOfDay,
        durationMinutes.toString(),
        isCompleted
      );
      
      if (isCompleted) {
        await DatabaseService.updateAchievement(childId, 'regularBrushing', 1);
        await DatabaseService.updateAchievement(childId, 'stars', 1);
        
        console.log('Brushing record and achievements saved');
      }
    } catch (error) {
      console.error('Error saving brushing state:', error);
    }
  };

  const showCongratulations = async () => {
    console.log("Showing congratulations");
    setShowCongrats(true);

    if (congratsAudioRef.current) {
      congratsAudioRef.current.play().catch((error) => {
        console.error('Error playing congratulations audio:', error);
      });
    }

    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : 'evening';

    await saveBrushingState(true, timeOfDay, timeLeft);
  };
  
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log(`Notification permission: ${permission}`);
        alert(`وضعیت دسترسی به اعلان‌ها: ${permission === 'granted' ? 'تأیید شد' : 'رد شد'}`);
      });
    } else {
      alert('این مرورگر از اعلان‌ها پشتیبانی نمی‌کند');
      console.log('This browser does not support notifications');
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    return toPersianNumber(formattedTime);
  };
  
  const formatTimeForInput = (hour, minute) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };
  
  const testAlarm = () => {
    triggerAlarm('تست');
  };
  
  // Direct path
  const hourglassImage = {
    imageUrl: '/assets/images/hourglass.png', // Direct path
  };
  
  return (
    <div className="brush-reminder-container">
      <div className="brush-section">
        <h2>یادآوری مسواک</h2>
        
        <div className="alarm-cards">
          <div className="alarm-card">
            <div className="alarm-header">
              <h3><span className="sun-icon">☀️</span> مسواک صبح</h3>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={alarms.morning.enabled}
                  onChange={(e) => handleEnabledChange('morning', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="alarm-time">
              <div className="persian-time-display">
                ساعت: {formatPersianTime(alarms.morning.hour, alarms.morning.minute)}
              </div>
              <input
                type="time"
                value={formatTimeForInput(alarms.morning.hour, alarms.morning.minute)}
                onChange={(e) => handleTimeChange('morning', e.target.value)}
                disabled={!alarms.morning.enabled}
                className="time-input"
              />
            </div>
          </div>
          
          <div className="alarm-card">
            <div className="alarm-header">
              <h3><span className="moon-icon">🌙</span> مسواک شب</h3>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={alarms.evening.enabled}
                  onChange={(e) => handleEnabledChange('evening', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="alarm-time">
              <div className="persian-time-display">
                ساعت: {formatPersianTime(alarms.evening.hour, alarms.evening.minute)}
              </div>
              <input
                type="time"
                value={formatTimeForInput(alarms.evening.hour, alarms.evening.minute)}
                onChange={(e) => handleTimeChange('evening', e.target.value)}
                disabled={!alarms.evening.enabled}
                className="time-input"
              />
            </div>
          </div>
        </div>
        
        <div className="notification-permission">
          <button 
            className="permission-button" 
            onClick={requestNotificationPermission}
          >
            درخواست مجوز اعلان‌ها
          </button>
          <p className="permission-info">
            برای دریافت یادآوری مسواک، لطفاً مجوز اعلان‌ها را تأیید کنید.
          </p>
          
          <button 
            className="test-button" 
            onClick={testAlarm}
            style={{ marginTop: '10px', backgroundColor: '#666' }}
          >
            تست آلارم
          </button>
        </div>
        
        {alarmActive && (
          <div className="alarm-notification">
            <div className="alarm-message">
              <p>زمان مسواک زدن رسیده است!</p>
              <button 
                className="dismiss-button"
                onClick={stopAlarm}
              >
                متوجه شدم
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="timer-section">
        <h2>تایمر مسواک</h2>
        
        <div className="timer-display">
          <div className="timer-time">{formatTime(timeLeft)}</div>
          
          <div className="timer-icon-container">
            <img 
              src='/assets/images/hourglass.png' // Direct path
              alt="توثبرش آیکون" 
              className="timer-icon"
              onError={(e) => {
                // Fallback to emoji if image doesn't load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="timer-emoji-fallback" style={{display: 'none'}}>🦷</div>
          </div>
        </div>
        
        <div className="timer-controls">
          {!timerRunning ? (
            <button 
              className="timer-button start-button" 
              onClick={startTimer}
              aria-label="شروع مسواک زدن"
            >
              {timeLeft === 120 || timeLeft === 0 ? "شروع مسواک زدن" : "ادامه"}
            </button>
          ) : (
            <button 
              className="timer-button stop-button" 
              onClick={stopTimer}
              aria-label="توقف"
            >
              توقف
            </button>
          )}
          <button 
            className="timer-button reset-button" 
            onClick={resetTimer} 
            disabled={timerRunning}
            aria-label="شروع مجدد"
            style={{ opacity: timerRunning ? 0.5 : 1 }}
          >
            شروع مجدد
          </button>
        </div>
        
        {audioError && (
          <div className="audio-error-message">
            خطا در پخش موسیقی. تایمر بدون موسیقی ادامه می‌دهد.
          </div>
        )}
        
        {showCongrats && (
          <div className="congrats-overlay" role="dialog" aria-labelledby="congrats-title">
            <div className="congrats-content">
              <h3 id="congrats-title">آفرین!</h3>
              <p>تو مسواک زدن رو با موفقیت به پایان رسوندی</p>
              <div className="reward-info">
                <span className="reward-item">
                  <span className="reward-icon" aria-hidden="true">⭐</span> ۱ ستاره
                </span>
              </div>
              <button 
                className="congrats-button"
                onClick={() => setShowCongrats(false)}
                aria-label="بستن"
              >
                بستن
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="educational-video">
        <h3>آموزش مسواک زدن</h3>
        <div className="videos-container">
          <div className="video-item">
            <div className="video-wrapper">
              <video 
                controls 
                preload="metadata"
                className="video-player"
                poster="/assets/images/video-thumbnail-1.jpg"
              >
                <source src="/assets/videos/how_to_brush.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <p>ویدیوی مسواک</p>
          </div>
        </div>
      </div>

      <audio ref={audioRef} loop preload="auto">
        <source src="/assets/audios/brushing_music.mp3" type="audio/mpeg" />
        <source src="/assets/audios/brushing_music.ogg" type="audio/ogg" />
      </audio>
      
      <audio ref={alarmAudioRef} loop preload="auto">
        <source src="/assets/audios/brushing_music.mp3" type="audio/mpeg" />
        <source src="/assets/audios/brushing_music.ogg" type="audio/ogg" />
      </audio>
      
      <audio ref={congratsAudioRef} preload="auto">
        <source src="/assets/audios/applause.mp3" type="audio/mpeg" />
        <source src="/assets/audios/applause.ogg" type="audio/ogg" />
      </audio>

      <style jsx>{`
        .educational-video {
          margin-top: 40px;
        }
        
        .educational-video h3 {
          color: #4a6bff;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .videos-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 20px;
        }
        
        .video-item {
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .video-wrapper {
          position: relative;
          width: 100%;
          padding-top: 56.25%;
          overflow: hidden;
        }
        
        .video-player {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .video-item p {
          padding: 10px;
          margin: 0;
          text-align: center;
          font-size: 14px;
          color: #555;
        }
        
        .persian-time-display {
          background-color: #f5f8ff;
          border: 2px solid #4a6bff;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          color: #4a6bff;
          margin-bottom: 10px;
          font-family: 'Vazir', 'Tahoma', sans-serif;
          direction: rtl;
        }
        
        .time-input {
          width: 100%;
          padding: 10px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          text-align: center;
          direction: ltr;
          background-color: white;
        }
        
        .time-input:focus {
          outline: none;
          border-color: #4a6bff;
          box-shadow: 0 0 0 3px rgba(74, 107, 255, 0.1);
        }
        
        .time-input:disabled {
          background-color: #f5f5f5;
          color: #999;
          cursor: not-allowed;
        }
        
        .alarm-time {
          position: relative;
        }
        
        @media (min-width: 768px) {
          .videos-container {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .video-item {
            width: calc(50% - 10px);
          }
        }
        
        .alarm-notification {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .alarm-message {
          background-color: white;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          max-width: 90%;
          width: 350px;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .alarm-message p {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        
        .dismiss-button {
          background-color: #4a6bff;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 25px;
          font-size: 16px;
          cursor: pointer;
        }
        
        .alarm-card {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        }
        
        .alarm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .alarm-header h3 {
          margin: 0;
          color: #4a6bff;
          display: flex;
          align-items: center;
        }
        
        .sun-icon, .moon-icon {
          margin-left: 8px;
        }
        
        .alarm-time {
          margin-bottom: 15px;
        }
        
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
        
        .notification-permission {
          margin-top: 30px;
          text-align: center;
        }
        
        .permission-button {
          background-color: #4a6bff;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 12px 20px;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 10px;
          transition: background-color 0.3s;
        }
        
        .permission-button:hover {
          background-color: #3a5aee;
        }
        
        .permission-info {
          font-size: 13px;
          color: #777;
        }
        
        .timer-section {
          margin-top: 40px;
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        }
        
        .timer-section h2 {
          color: #4a6bff;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .timer-display {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .timer-time {
          font-size: 36px;
          font-weight: bold;
          color: #333;
          font-family: 'Vazir', 'Tahoma', sans-serif;
        }
        
        /* EXTRA LARGE HOURGLASS - DOUBLED FROM PREVIOUS SIZE */
        .timer-icon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 30px 0; /* INCREASED MARGIN */
          height: 300px; /* DOUBLED FROM 150px */
        }
        
        .timer-icon {
          width: 240px; /* DOUBLED FROM 120px */
          height: 240px; /* DOUBLED FROM 120px */
          object-fit: contain;
          filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.15)); /* ENHANCED SHADOW */
        }
        
        .timer-emoji-fallback {
          font-size: 240px; /* DOUBLED FROM 120px */
          text-align: center;
          filter: drop-shadow(4px 4px 8px rgba(0,0,0,0.15)); /* ENHANCED SHADOW */
        }
        
        .timer-controls {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 20px;
        }
        
        .timer-button {
          padding: 12px 25px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .start-button {
          background-color: #4caf50;
          color: white;
        }
        
        .start-button:hover {
          background-color: #3e9e41;
        }
        
        .stop-button {
          background-color: #f44336;
          color: white;
        }
        
        .stop-button:hover {
          background-color: #d32f2f;
        }
        
        .reset-button {
          background-color: #f0f0f0;
          color: #555;
        }
        
        .reset-button:hover {
          background-color: #e0e0e0;
        }
        
        .reset-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .audio-error-message {
          text-align: center;
          color: #f44336;
          font-size: 13px;
          margin-top: 15px;
        }
        
        .congrats-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .congrats-content {
          background-color: white;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          max-width: 90%;
          width: 350px;
        }
        
        .congrats-content h3 {
          color: #4caf50;
          font-size: 24px;
          margin-bottom: 15px;
        }
        
        .reward-info {
          margin: 20px 0;
        }
        
        .reward-item {
          display: inline-block;
          background-color: #f0f5ff;
          padding: 10px 15px;
          border-radius: 8px;
          font-weight: bold;
          font-family: 'Vazir', 'Tahoma', sans-serif;
        }
        
        .reward-icon {
          font-size: 18px;
          margin-left: 5px;
        }
        
        .congrats-button {
          background-color: #4a6bff;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 25px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .congrats-button:hover {
          background-color: #3a5aee;
        }
        
        /* MOBILE RESPONSIVE - STILL VERY LARGE */
        @media (max-width: 768px) {
          .timer-controls {
            flex-direction: column;
            width: 100%;
          }
          
          .timer-button {
            width: 100%;
            margin-bottom: 10px;
          }
          
          .timer-icon-container {
            height: 240px; /* STILL VERY LARGE ON MOBILE */
            margin: 25px 0;
          }
          
          .timer-icon {
            width: 180px; /* STILL VERY LARGE ON MOBILE */
            height: 180px; /* STILL VERY LARGE ON MOBILE */
          }
          
          .timer-emoji-fallback {
            font-size: 180px; /* STILL VERY LARGE ON MOBILE */
          }
          
          .timer-time {
            font-size: 28px;
          }
          
          .persian-time-display {
            font-size: 16px;
          }
        }
        
        @media (max-width: 480px) {
          .timer-icon-container {
            height: 200px; /* LARGE EVEN ON VERY SMALL SCREENS */
            margin: 20px 0;
          }
          
          .timer-icon {
            width: 160px; /* STILL MUCH BIGGER THAN ORIGINAL */
            height: 160px; /* STILL MUCH BIGGER THAN ORIGINAL */
          }
          
          .timer-emoji-fallback {
            font-size: 160px; /* STILL MUCH BIGGER THAN ORIGINAL */
          }
        }
        
        /* EXTRA SMALL SCREENS */
        @media (max-width: 360px) {
          .timer-icon-container {
            height: 180px;
            margin: 15px 0;
          }
          
          .timer-icon {
            width: 140px; /* STILL SIGNIFICANTLY LARGER */
            height: 140px; /* STILL SIGNIFICANTLY LARGER */
          }
          
          .timer-emoji-fallback {
            font-size: 140px; /* STILL SIGNIFICANTLY LARGER */
          }
        }
      `}</style>
    </div>
  );
};

export default BrushReminder;