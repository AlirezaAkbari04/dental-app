import React, { useState, useEffect, useRef } from 'react';
import './ChildComponents.css';

const BrushReminder = () => {
  const [alarms, setAlarms] = useState({
    morning: { hour: 7, minute: 30, enabled: true },
    evening: { hour: 20, minute: 0, enabled: true }
  });
  
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [showCongrats, setShowCongrats] = useState(false);
  const [selectedQuadrants, setSelectedQuadrants] = useState([]);
  
  const audioRef = useRef(null);
  const congratsAudioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  
  // Load saved alarms from localStorage
  useEffect(() => {
    const savedAlarms = JSON.parse(localStorage.getItem('brushAlarms') || '{}');
    if (Object.keys(savedAlarms).length > 0) {
      setAlarms(savedAlarms);
    }
  }, []);
  
  // Save alarms to localStorage when changed
  useEffect(() => {
    localStorage.setItem('brushAlarms', JSON.stringify(alarms));
  }, [alarms]);
  
  // Handle timer countdown
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerRunning && timeLeft === 0) {
      stopTimer();
      showCongratulations();
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerRunning, timeLeft]);
  
  const handleAlarmChange = (time, type, value) => {
    setAlarms(prev => ({
      ...prev,
      [time]: {
        ...prev[time],
        [type]: value
      }
    }));
  };
  
  const startTimer = () => {
    setTimerRunning(true);
    setTimeLeft(120);
    setShowCongrats(false);
    
    // Start playing music
    if (audioRef.current) {
      audioRef.current.play();
    }
  };
  
  const stopTimer = () => {
    setTimerRunning(false);
    
    // Stop music
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };
  
  const resetTimer = () => {
    stopTimer();
    setTimeLeft(120);
  };
  
  const showCongratulations = () => {
    setShowCongrats(true);
    
    // Play congratulations sound
    if (congratsAudioRef.current) {
      congratsAudioRef.current.play();
    }
    
    // Add to achievements
    const achievements = JSON.parse(localStorage.getItem('childAchievements') || '{}');
    
    const updatedAchievements = {
      stars: (achievements.stars || 0) + 1,
      regularBrushing: (achievements.regularBrushing || 0) + 1,
      diamonds: (achievements.diamonds || 0),
      cleanedAreas: (achievements.cleanedAreas || 0) + selectedQuadrants.length,
      healthySnacks: (achievements.healthySnacks || 0)
    };
    
    // Extra diamond for cleaning all 4 quadrants
    if (selectedQuadrants.length === 4) {
      updatedAchievements.diamonds += 1;
    }
    
    localStorage.setItem('childAchievements', JSON.stringify(updatedAchievements));
  };
  
  const toggleQuadrant = (quadrant) => {
    if (selectedQuadrants.includes(quadrant)) {
      setSelectedQuadrants(prev => prev.filter(q => q !== quadrant));
    } else {
      setSelectedQuadrants(prev => [...prev, quadrant]);
    }
  };
  
  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
                  onChange={(e) => handleAlarmChange('morning', 'enabled', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="alarm-time">
              <input
                type="time"
                value={`${alarms.morning.hour.toString().padStart(2, '0')}:${alarms.morning.minute.toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [hour, minute] = e.target.value.split(':').map(Number);
                  handleAlarmChange('morning', 'hour', hour);
                  handleAlarmChange('morning', 'minute', minute);
                }}
                disabled={!alarms.morning.enabled}
              />
            </div>
          </div>
          
          <div className="alarm-card">
            <div className="alarm-header">
              <h3>مسواک شب</h3>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={alarms.evening.enabled}
                  onChange={(e) => handleAlarmChange('evening', 'enabled', e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="alarm-time">
              <input
                type="time"
                value={`${alarms.evening.hour.toString().padStart(2, '0')}:${alarms.evening.minute.toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [hour, minute] = e.target.value.split(':').map(Number);
                  handleAlarmChange('evening', 'hour', hour);
                  handleAlarmChange('evening', 'minute', minute);
                }}
                disabled={!alarms.evening.enabled}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="timer-section">
        <h2>تایمر مسواک</h2>
        
        <div className="teeth-quadrants">
          <div 
            className={`quadrant top-right ${selectedQuadrants.includes('top-right') ? 'selected' : ''}`}
            onClick={() => toggleQuadrant('top-right')}
          >
            بالا راست
          </div>
          <div 
            className={`quadrant top-left ${selectedQuadrants.includes('top-left') ? 'selected' : ''}`}
            onClick={() => toggleQuadrant('top-left')}
          >
            بالا چپ
          </div>
          <div 
            className={`quadrant bottom-right ${selectedQuadrants.includes('bottom-right') ? 'selected' : ''}`}
            onClick={() => toggleQuadrant('bottom-right')}
          >
            پایین راست
          </div>
          <div 
            className={`quadrant bottom-left ${selectedQuadrants.includes('bottom-left') ? 'selected' : ''}`}
            onClick={() => toggleQuadrant('bottom-left')}
          >
            پایین چپ
          </div>
        </div>
        
        <div className="timer-display">
          <div className="timer-time">{formatTime(timeLeft)}</div>
          <div className="hourglass-animation">
            <div 
              className="hourglass-sand" 
              style={{ 
                height: `${(timeLeft / 120) * 100}%`,
                transition: timerRunning ? 'height 1s linear' : 'none'
              }}
            ></div>
          </div>
        </div>
        
        <div className="timer-controls">
          {!timerRunning ? (
            <button className="timer-button start-button" onClick={startTimer}>
              شروع مسواک زدن
            </button>
          ) : (
            <button className="timer-button stop-button" onClick={stopTimer}>
              توقف
            </button>
          )}
          <button className="timer-button reset-button" onClick={resetTimer} disabled={timerRunning}>
            شروع مجدد
          </button>
        </div>
        
        {showCongrats && (
          <div className="congrats-overlay">
            <div className="congrats-content">
              <h3>آفرین!</h3>
              <p>تو مسواک زدن رو با موفقیت به پایان رسوندی</p>
              <div className="reward-info">
                <span className="reward-item">
                  <span className="reward-icon">⭐</span> 1 ستاره
                </span>
                {selectedQuadrants.length === 4 && (
                  <span className="reward-item">
                    <span className="reward-icon">💎</span> 1 الماس
                  </span>
                )}
              </div>
              <button 
                className="congrats-button"
                onClick={() => setShowCongrats(false)}
              >
                بستن
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="educational-video">
        <h3>ویدیوی آموزش مسواک زدن</h3>
        <div className="video-container">
          {/* این قسمت برای نمایش ویدیو است که باید افزوده شود */}
          <div className="video-placeholder">
            <p>ویدیوی آموزشی مسواک زدن در اینجا قرار می‌گیرد</p>
          </div>
        </div>
      </div>
      
      {/* Audio elements for timer music and congratulations */}
      <audio ref={audioRef} loop>
        <source src="/brushing-music.mp3" type="audio/mpeg" />
      </audio>
      
      <audio ref={congratsAudioRef}>
        <source src="/applause.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default BrushReminder;