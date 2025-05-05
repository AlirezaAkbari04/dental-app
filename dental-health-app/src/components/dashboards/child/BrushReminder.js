import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/ChildComponents.css';

const BrushReminder = () => {
  const [alarms, setAlarms] = useState({
    morning: { hour: 7, minute: 30, enabled: true },
    evening: { hour: 20, minute: 0, enabled: true }
  });
  
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds
  const [showCongrats, setShowCongrats] = useState(false);
  const [audioError, setAudioError] = useState(false);
  
  const audioRef = useRef(null);
  const congratsAudioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  
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
    console.log("Starting timer");
    setTimerRunning(true);
    setTimeLeft(120);
    setShowCongrats(false);
    setAudioError(false);
    
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
              شروع مسواک زدن
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