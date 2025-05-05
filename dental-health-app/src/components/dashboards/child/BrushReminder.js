import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/ChildComponents.css';

const BrushReminder = () => {
  const [alarms, setAlarms] = useState({
    morning: { hour: 7, minute: 30, enabled: true, ringtone: 'ringtone1' },
    evening: { hour: 20, minute: 0, enabled: true, ringtone: 'ringtone1' }
  });
  
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [showCongrats, setShowCongrats] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  const audioRef = useRef(null);
  const congratsAudioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  
  // Available ringtones
  const ringtones = [
    { id: 'ringtone1', name: 'صدای زنگ 1', path: '/assets/sounds/ringtone1.mp3' },
    { id: 'ringtone2', name: 'صدای زنگ 2', path: '/assets/sounds/ringtone2.mp3' },
    { id: 'ringtone3', name: 'صدای زنگ 3', path: '/assets/sounds/ringtone3.mp3' },
  ];
  
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
  
  const handleTimeChange = (alarmType, timeString) => {
    // Parse the time string (format: HH:MM)
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    console.log(`Setting ${alarmType} alarm to ${hour}:${minute}`);
    
    // Update the alarm
    setAlarms(prev => ({
      ...prev,
      [alarmType]: {
        ...prev[alarmType],
        hour,
        minute
      }
    }));
  };
  
  const handleRingtoneChange = (alarmType, ringtoneId) => {
    setAlarms(prev => ({
      ...prev,
      [alarmType]: {
        ...prev[alarmType],
        ringtone: ringtoneId
      }
    }));
  };
  
  const handleEnabledChange = (alarmType, enabled) => {
    setAlarms(prev => ({
      ...prev,
      [alarmType]: {
        ...prev[alarmType],
        enabled
      }
    }));
  };
  
  const startTimer = () => {
    console.log("Starting timer");
    setTimerRunning(true);
    setShowCongrats(false);
    setAudioError(false);
    
    // If the timer is already at 0, reset it first
    if (timeLeft === 0) {
      setTimeLeft(120);
    }
    
    // Start playing music
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error("Error playing audio:", error);
        setAudioError(true);
        // Continue even if audio fails
      });
    }
  };
  
  const stopTimer = () => {
    console.log("Stopping timer");
    setTimerRunning(false);
    
    // Stop music
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
  
  const showCongratulations = () => {
    console.log("Showing congratulations");
    setShowCongrats(true);
    
    // Play congratulations sound
    if (congratsAudioRef.current) {
      congratsAudioRef.current.play().catch(error => {
        console.error("Error playing congratulations audio:", error);
        // Continue even if audio fails
      });
    }
    
    // Add to achievements
    try {
      const achievements = JSON.parse(localStorage.getItem('childAchievements') || '{}');
      
      const updatedAchievements = {
        stars: (achievements.stars || 0) + 1,
        regularBrushing: (achievements.regularBrushing || 0) + 1,
        diamonds: (achievements.diamonds || 0),
        cleanedAreas: (achievements.cleanedAreas || 0),
        healthySnacks: (achievements.healthySnacks || 0)
      };
      
      localStorage.setItem('childAchievements', JSON.stringify(updatedAchievements));
    } catch (error) {
      console.error("Error updating achievements:", error);
    }
  };
  
  // Request notification permission for when we convert to mobile
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
  
  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Format time string for input value (HH:MM)
  const formatTimeForInput = (hour, minute) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };
  
  // Preview ringtone
  const previewRingtone = (ringtoneId) => {
    const ringtone = ringtones.find(r => r.id === ringtoneId);
    // In a real implementation, this would play the ringtone
    alert(`پخش صدای زنگ: ${ringtone?.name || 'نامشخص'}`);
  };
  
  return (
    <div className="brush-reminder-container">
      <div className="brush-section">
        <h2>یادآوری مسواک</h2>
        
        <div className="alarm-cards">
          <div className="alarm-card">
            <div className="alarm-header">
              <h3>مسواک صبح</h3>
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
              <input
                type="time"
                value={formatTimeForInput(alarms.morning.hour, alarms.morning.minute)}
                onChange={(e) => handleTimeChange('morning', e.target.value)}
                disabled={!alarms.morning.enabled}
              />
            </div>
            <div className="alarm-ringtone">
              <label>صدای زنگ</label>
              <select 
                value={alarms.morning.ringtone} 
                onChange={(e) => handleRingtoneChange('morning', e.target.value)}
                disabled={!alarms.morning.enabled}
              >
                {ringtones.map(ringtone => (
                  <option key={ringtone.id} value={ringtone.id}>{ringtone.name}</option>
                ))}
              </select>
              <button 
                className="preview-button" 
                onClick={() => previewRingtone(alarms.morning.ringtone)}
                disabled={!alarms.morning.enabled}
              >
                پخش نمونه
              </button>
            </div>
          </div>
          
          <div className="alarm-card">
            <div className="alarm-header">
              <h3>مسواک شب</h3>
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
              <input
                type="time"
                value={formatTimeForInput(alarms.evening.hour, alarms.evening.minute)}
                onChange={(e) => handleTimeChange('evening', e.target.value)}
                disabled={!alarms.evening.enabled}
              />
            </div>
            <div className="alarm-ringtone">
              <label>صدای زنگ</label>
              <select 
                value={alarms.evening.ringtone} 
                onChange={(e) => handleRingtoneChange('evening', e.target.value)}
                disabled={!alarms.evening.enabled}
              >
                {ringtones.map(ringtone => (
                  <option key={ringtone.id} value={ringtone.id}>{ringtone.name}</option>
                ))}
              </select>
              <button 
                className="preview-button" 
                onClick={() => previewRingtone(alarms.evening.ringtone)}
                disabled={!alarms.evening.enabled}
              >
                پخش نمونه
              </button>
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
        </div>
      </div>
      
      <div className="timer-section">
        <h2>تایمر مسواک</h2>
        
        <div className="timer-display">
          <div className="timer-time">{formatTime(timeLeft)}</div>
          
          <div className="hourglass-container">
            <div className="real-hourglass">
              <div className="hourglass-frame">
                <div className="hourglass-top-chamber">
                  <div className="hourglass-top-sand" style={{ height: `${(timeLeft / 120) * 100}%` }}></div>
                </div>
                <div className="hourglass-neck"></div>
                <div className="hourglass-bottom-chamber">
                  <div className="hourglass-bottom-sand" style={{ height: `${100 - (timeLeft / 120) * 100}%` }}></div>
                </div>
              </div>
            </div>
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
                  <span className="reward-icon" aria-hidden="true">⭐</span> 1 ستاره
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
            <div className="video-placeholder">
              <p>ویدیوی آموزشی ۱</p>
              <span className="play-icon">▶️</span>
            </div>
            <div className="video-caption">نحوه صحیح مسواک زدن</div>
          </div>
          
          <div className="video-item">
            <div className="video-placeholder">
              <p>ویدیوی آموزشی ۲</p>
              <span className="play-icon">▶️</span>
            </div>
            <div className="video-caption">روش مسواک زدن</div>
          </div>
        </div>
      </div>
      
      {/* Audio elements for timer music and congratulations */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/assets/sounds/brushing-music.mp3" type="audio/mpeg" />
        <source src="/assets/sounds/brushing-music.ogg" type="audio/ogg" />
      </audio>
      
      <audio ref={congratsAudioRef} preload="auto">
        <source src="/assets/sounds/applause.mp3" type="audio/mpeg" />
        <source src="/assets/sounds/applause.ogg" type="audio/ogg" />
      </audio>
      
      <style jsx>{`
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
        }
        
        .alarm-time {
          margin-bottom: 15px;
        }
        
        .alarm-time input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
        }
        
        /* Switch Styling */
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
        
        .alarm-ringtone {
          margin-top: 15px;
        }
        
        .alarm-ringtone label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #555;
        }
        
        .alarm-ringtone select {
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #ddd;
          margin-bottom: 10px;
          width: 100%;
          font-size: 14px;
        }
        
        .preview-button {
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.3s;
        }
        
        .preview-button:hover {
          background-color: #e5e5e5;
        }
        
        .preview-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
        
        .educational-video {
          margin-top: 40px;
        }
        
        .educational-video h3 {
          color: #4a6bff;
          margin-bottom: 15px;
        }
        
        .hourglass-container {
          display: flex;
          justify-content: center;
          margin: 15px 0;
          height: 150px;
        }
        
        .real-hourglass {
          position: relative;
          width: 80px;
          height: 150px;
        }
        
        .hourglass-frame {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        .hourglass-top-chamber {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 70px;
          height: 70px;
          border-radius: 10px 10px 35px 35px;
          background-color: rgba(236, 236, 236, 0.7);
          overflow: hidden;
          border: 2px solid #aaa;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
        }
        
        .hourglass-neck {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 15px;
          height: 15px;
          background-color: #aaa;
          border-radius: 50%;
          z-index: 2;
        }
        
        .hourglass-bottom-chamber {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 70px;
          height: 70px;
          border-radius: 35px 35px 10px 10px;
          background-color: rgba(236, 236, 236, 0.7);
          overflow: hidden;
          border: 2px solid #aaa;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
        }
        
        .hourglass-top-sand {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(to bottom, #FFD700, #FFA500);
          transition: height 1s linear;
        }
        
        .hourglass-bottom-sand {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background: linear-gradient(to bottom, #FFD700, #FFA500);
          transition: height 1s linear;
        }
        
        /* Decorative elements to make it look more like glass */
        .hourglass-top-chamber:before,
        .hourglass-bottom-chamber:before {
          content: '';
          position: absolute;
          top: 10%;
          left: 10%;
          width: 20%;
          height: 20%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          z-index: 3;
        }
        
        /* Connecting lines */
        .hourglass-frame:before,
        .hourglass-frame:after {
          content: '';
          position: absolute;
          width: 2px;
          height: 25px;
          background-color: #aaa;
          z-index: 1;
        }
        
        .hourglass-frame:before {
          top: 65px;
          left: 24px;
          transform: rotate(45deg);
        }
        
        .hourglass-frame:after {
          top: 65px;
          right: 24px;
          transform: rotate(-45deg);
        }
        
        .videos-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 20px;
        }
        
        .video-item {
          flex: 1;
          min-width: 250px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .video-placeholder {
          background-color: #f0f0f0;
          height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          cursor: pointer;
        }
        
        .video-placeholder:hover {
          background-color: #e5e5e5;
        }
        
        .play-icon {
          font-size: 48px;
          margin-top: 15px;
        }
        
        .video-caption {
          padding: 10px;
          text-align: center;
          background-color: #fff;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default BrushReminder;