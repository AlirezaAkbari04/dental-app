import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../../styles/ChildComponents.css';
import { useUser } from '../../../contexts/UserContext';
import DatabaseService from '../../../services/DatabaseService';

// Food items array defined outside the component to avoid dependency issues
const FOOD_ITEMS = [
  { id: 1, name: 'سیب', type: 'healthy', emoji: '🍎' },
  { id: 2, name: 'موز', type: 'healthy', emoji: '🍌' },
  { id: 3, name: 'پرتقال', type: 'healthy', emoji: '🍊' },
  { id: 4, name: 'هویج', type: 'healthy', emoji: '🥕' },
  { id: 5, name: 'خیار', type: 'healthy', emoji: '🥒' },
  { id: 6, name: 'شیر', type: 'healthy', emoji: '🥛' },
  { id: 7, name: 'نان و پنیر', type: 'healthy', emoji: '🧀' },
  { id: 8, name: 'آب', type: 'healthy', emoji: '💧' },
  { id: 9, name: 'شکلات', type: 'unhealthy', emoji: '🍫' },
  { id: 10, name: 'چیپس', type: 'unhealthy', emoji: '🍟' },
  { id: 11, name: 'پفک', type: 'unhealthy', emoji: '🍙' },
  { id: 12, name: 'نوشابه', type: 'unhealthy', emoji: '🥤' },
  { id: 13, name: 'آبمیوه صنعتی', type: 'unhealthy', emoji: '🧃' },
  { id: 14, name: 'لواشک', type: 'unhealthy', emoji: '🍬' }
];

const ChildGames = () => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentFoodItems, setCurrentFoodItems] = useState([]);
  const [touchDevice, setTouchDevice] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [feedbackImage, setFeedbackImage] = useState('');

  // Add current user
  const { currentUser } = useUser();

  // Refs for drop zones
  const healthyZoneRef = useRef(null);
  const unhealthyZoneRef = useRef(null);

  // Update the useEffect for loading score
  useEffect(() => {
    const loadScore = async () => {
      try {
        // Initialize database if needed
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }

        if (currentUser?.id) {
          // Get achievements which contain the game score
          const achievements = await DatabaseService.getChildAchievements(currentUser.id);
          if (achievements && achievements.healthySnacks) {
            setScore(achievements.healthySnacks);
          }
        } else {
          // Fallback to localStorage
          const savedScore = localStorage.getItem('healthySnackScore');
          if (savedScore) {
            setScore(parseInt(savedScore, 10));
          }
        }

        // Detect if device supports touch
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        setTouchDevice(isTouchDevice);

        console.log("Game initialized, touch device:", isTouchDevice);
      } catch (error) {
        console.error("Error loading score:", error);

        // Fallback to localStorage
        const savedScore = localStorage.getItem('healthySnackScore');
        if (savedScore) {
          setScore(parseInt(savedScore, 10));
        }
      }
    };

    loadScore();
  }, [currentUser]);

  // Update the useEffect for saving score
  useEffect(() => {
    const saveScore = async () => {
      try {
        if (score > 0) {
          if (currentUser?.id && DatabaseService.initialized) {
            // Save to database
            await DatabaseService.updateAchievement(currentUser.id, 'healthySnacks', 1);
          } else {
            // Fallback to localStorage
            localStorage.setItem('healthySnackScore', score.toString());

            // Update achievements in localStorage
            const achievements = JSON.parse(localStorage.getItem('childAchievements') || '{}');

            const updatedAchievements = {
              ...achievements,
              healthySnacks: score
            };

            localStorage.setItem('childAchievements', JSON.stringify(updatedAchievements));
          }
        }
      } catch (error) {
        console.error("Error saving score:", error);

        // Fallback to localStorage
        localStorage.setItem('healthySnackScore', score.toString());
      }
    };

    saveScore();
  }, [score, currentUser]);

  // Get random food items for the game
  const getRandomFoodItems = useCallback(() => {
    // Get equal number of healthy and unhealthy items
    const healthyItems = FOOD_ITEMS.filter(item => item.type === 'healthy');
    const unhealthyItems = FOOD_ITEMS.filter(item => item.type === 'unhealthy');
    
    const randomHealthy = [...healthyItems].sort(() => 0.5 - Math.random()).slice(0, 2);
    const randomUnhealthy = [...unhealthyItems].sort(() => 0.5 - Math.random()).slice(0, 2);
    
    // Combine and shuffle
    return [...randomHealthy, ...randomUnhealthy].sort(() => 0.5 - Math.random());
  }, []);
  
  // Initialize game with random food items
  useEffect(() => {
    setCurrentFoodItems(getRandomFoodItems());
  }, [getRandomFoodItems]);
  
  // Drag and drop handlers for mouse
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    // Add some ghost image data for better drag visualization
    if (e.dataTransfer && e.dataTransfer.setDragImage) {
      const dragImage = document.createElement('div');
      dragImage.innerHTML = item.emoji;
      dragImage.style.fontSize = '2rem';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 25, 25);
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e, targetType) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    handleAnswerSelection(draggedItem, targetType);
  };
  
  // Touch handlers for mobile
  const handleTouchStart = (item) => {
    setDraggedItem(item);
  };
  
  const handleTouchMove = (e) => {
    if (!draggedItem) return;
    
    e.preventDefault(); // Prevent scrolling while dragging
    
    // Get touch position
    const touch = e.touches[0];
    const healthyZone = healthyZoneRef.current;
    const unhealthyZone = unhealthyZoneRef.current;
    
    // Update visual feedback (optional)
    if (healthyZone && unhealthyZone) {
      // Reset highlight
      healthyZone.classList.remove('highlight-zone');
      unhealthyZone.classList.remove('highlight-zone');
      
      // Check if touch is over a drop zone
      const healthyRect = healthyZone.getBoundingClientRect();
      const unhealthyRect = unhealthyZone.getBoundingClientRect();
      
      if (touch.clientX >= healthyRect.left && 
          touch.clientX <= healthyRect.right && 
          touch.clientY >= healthyRect.top && 
          touch.clientY <= healthyRect.bottom) {
        healthyZone.classList.add('highlight-zone');
      } else if (touch.clientX >= unhealthyRect.left && 
                 touch.clientX <= unhealthyRect.right && 
                 touch.clientY >= unhealthyRect.top && 
                 touch.clientY <= unhealthyRect.bottom) {
        unhealthyZone.classList.add('highlight-zone');
      }
    }
  };
  
  const handleTouchEnd = (e) => {
    if (!draggedItem) return;
    
    // Get touch position
    const touch = e.changedTouches[0];
    const healthyZone = healthyZoneRef.current;
    const unhealthyZone = unhealthyZoneRef.current;
    
    if (healthyZone && unhealthyZone) {
      // Remove highlight
      healthyZone.classList.remove('highlight-zone');
      unhealthyZone.classList.remove('highlight-zone');
      
      // Check if touch ended over a drop zone
      const healthyRect = healthyZone.getBoundingClientRect();
      const unhealthyRect = unhealthyZone.getBoundingClientRect();
      
      if (touch.clientX >= healthyRect.left && 
          touch.clientX <= healthyRect.right && 
          touch.clientY >= healthyRect.top && 
          touch.clientY <= healthyRect.bottom) {
        handleAnswerSelection(draggedItem, 'healthy');
      } else if (touch.clientX >= unhealthyRect.left && 
                 touch.clientX <= unhealthyRect.right && 
                 touch.clientY >= unhealthyRect.top && 
                 touch.clientY <= unhealthyRect.bottom) {
        handleAnswerSelection(draggedItem, 'unhealthy');
      }
    }
    
    setDraggedItem(null);
  };
  
  // Update the handleAnswerSelection function
  const handleAnswerSelection = useCallback(async (item, targetType) => {
    console.log("Answer selected:", item.name, "as", targetType);
    
    if (item.type === targetType) {
      // Correct answer
      setIsCorrect(true);
      
      // Increment score
      const newScore = score + 1;
      setScore(newScore);
      
      // Use executeWithFallback for cleaner error handling
      await DatabaseService.executeWithFallback(
        // Database operation
        async () => {
          if (currentUser?.id && DatabaseService.initialized) {
            // Save increment to database
            await DatabaseService.saveGameScore(currentUser.id, 'healthySnacks', newScore);
            return true;
          }
          throw new Error('Not initialized or no user ID');
        },
        // Fallback operation
        async () => {
          // Update localStorage
          localStorage.setItem('healthySnackScore', newScore.toString());
          
          // Update achievements in localStorage
          const achievements = JSON.parse(localStorage.getItem('childAchievements') || '{}');
          const updatedAchievements = {
            ...achievements,
            healthySnacks: newScore
          };
          localStorage.setItem('childAchievements', JSON.stringify(updatedAchievements));
          return true;
        }
      );
      
      setFeedbackMessage(
        targetType === 'healthy' 
          ? `آفرین! ${item.name} یک میان‌وعده سالم است.` 
          : `درست است! ${item.name} برای دندان‌های شما خوب نیست.`
      );
      
      // Fix for animation feedback - Add DOM manipulation to force animation
      setAnimationClass('');
      setTimeout(() => {
        setAnimationClass('correct-answer-animation');
      }, 10);
      
      setFeedbackImage('✅');
      
      // Force element redraw for animation - Fixed for lint errors
      const foodContainer = document.querySelector('.food-container');
      if (foodContainer) {
        foodContainer.classList.remove('correct-answer-animation');
        // Force reflow
        void foodContainer.getBoundingClientRect();
        foodContainer.classList.add('correct-answer-animation');
      }
      
      // Force pulsing effect on the correct zone
      const targetZone = targetType === 'healthy' 
        ? document.querySelector('.healthy-zone') 
        : document.querySelector('.unhealthy-zone');
        
      if (targetZone) {
        targetZone.classList.remove('pulsing');
        // Force reflow
        void targetZone.getBoundingClientRect();
        targetZone.classList.add('pulsing');
      }
    } else {
      // Wrong answer - same fix for animation
      setIsCorrect(false);
      setFeedbackMessage(
        targetType === 'healthy' 
          ? `اشتباه! ${item.name} یک میان‌وعده ناسالم است.` 
          : `اشتباه! ${item.name} یک میان‌وعده سالم است.`
      );
      
      // Fix for animation feedback - Add DOM manipulation
      setAnimationClass('');
      setTimeout(() => {
        setAnimationClass('wrong-answer-animation');
      }, 10);
      
      setFeedbackImage('❌');
      
      // Force element redraw for animation - Fixed for lint errors
      const foodContainer = document.querySelector('.food-container');
      if (foodContainer) {
        foodContainer.classList.remove('wrong-answer-animation');
        // Force reflow
        void foodContainer.getBoundingClientRect();
        foodContainer.classList.add('wrong-answer-animation');
      }
    }
    
    setShowFeedback(true);
    
    // Load next food items after a delay
    const timer = setTimeout(() => {
      setShowFeedback(false);
      setAnimationClass('');
      setCurrentFoodItems(getRandomFoodItems());
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [getRandomFoodItems, currentUser, score]);
  
  // For direct click/tap on mobile if drag not working
  const handleDirectSelection = useCallback((item, type) => {
    if (touchDevice) {
      handleAnswerSelection(item, type);
    }
  }, [touchDevice, handleAnswerSelection]);
  
  return (
    <div className="games-container">
      {/* Background particles */}
      <div className="background-particles">
        <div className="particle particle-1">🌟</div>
        <div className="particle particle-2">✨</div>
        <div className="particle particle-3">💫</div>
        <div className="particle particle-4">🌈</div>
        <div className="particle particle-5">🎈</div>
        <div className="particle particle-6">🦋</div>
      </div>

      <div className="game-section">
        <div className="game-header">
          <h2>🎮 بازی میان‌وعده سالم و ناسالم</h2>
          <div className="game-score">
            <div className="score-container">
              <span className="score-label">امتیاز شما</span>
              <div className="score-badge">
                <span className="score-value">{score}</span>
                <span className="score-star">⭐</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="game-instruction">
          <div className="instruction-card">
            <p>
              {touchDevice 
                ? "غذاها را به سمت صورت خوشحال یا ناراحت بکشید یا روی صورت‌ها کلیک کنید" 
                : "غذاها را به سمت صورت خوشحال یا ناراحت بکشید"}
            </p>
          </div>
        </div>
        
        <div className={`food-container ${animationClass}`}>
          {currentFoodItems.map(item => (
            <div
              key={item.id}
              className={`food-item ${draggedItem && draggedItem.id === item.id ? 'dragging' : ''}`}
              draggable={!touchDevice}
              onDragStart={(e) => handleDragStart(e, item)}
              onTouchStart={() => handleTouchStart(item)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="food-card">
                <span className="food-emoji" aria-hidden="true">{item.emoji}</span>
                <span className="food-name">{item.name}</span>
                <div className="food-glow"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="drop-zones">
          <div 
            ref={healthyZoneRef}
            className={`drop-zone healthy-zone ${showFeedback && isCorrect && draggedItem?.type === 'healthy' ? 'pulsing' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'healthy')}
            onClick={() => draggedItem && handleDirectSelection(draggedItem, 'healthy')}
          >
            <div className="zone-content">
              <div className="zone-emoji-container">
                <span className="zone-emoji" aria-hidden="true">🦷</span>
                <span className="zone-face" aria-hidden="true">😊</span>
                <div className="emoji-glow healthy-glow"></div>
              </div>
              <span className="zone-label">سالم</span>
              <div className="zone-border"></div>
            </div>
          </div>
          
          <div 
            ref={unhealthyZoneRef}
            className={`drop-zone unhealthy-zone ${showFeedback && isCorrect && draggedItem?.type === 'unhealthy' ? 'pulsing' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'unhealthy')}
            onClick={() => draggedItem && handleDirectSelection(draggedItem, 'unhealthy')}
          >
            <div className="zone-content">
              <div className="zone-emoji-container">
                <span className="zone-emoji" aria-hidden="true">🦷</span>
                <span className="zone-face" aria-hidden="true">😢</span>
                <div className="emoji-glow unhealthy-glow"></div>
              </div>
              <span className="zone-label">ناسالم</span>
              <div className="zone-border"></div>
            </div>
          </div>
        </div>
        
        {showFeedback && (
          <div className={`visual-feedback-container ${isCorrect ? 'correct' : 'incorrect'}`} role="alert">
            <div className="feedback-content">
              <div className="feedback-icon">{feedbackImage}</div>
              <div className="feedback-message">{feedbackMessage}</div>
              {isCorrect && (
                <div className="celebration-effects">
                  <div className="confetti">
                    <div className="confetti-piece">🎉</div>
                    <div className="confetti-piece">🎊</div>
                    <div className="confetti-piece">✨</div>
                    <div className="confetti-piece">🌟</div>
                  </div>
                  <div className="stars-container">
                    <span className="star">⭐</span>
                    <span className="star delayed-1">⭐</span>
                    <span className="star delayed-2">⭐</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="game-info">
        <div className="info-card">
          <h3>🏆 راهنمای بازی</h3>
          <div className="info-content">
            <p>🦷 میان‌وعده‌های سالم به دندان‌های شما کمک می‌کنند، اما میان‌وعده‌های ناسالم باعث پوسیدگی دندان می‌شوند.</p>
            <p>🥕 غذاهای سالم مانند میوه، سبزیجات، شیر و آب را به سمت صورت خندان بکشید.</p>
            <p>🍫 غذاهای ناسالم مانند شکلات، چیپس، پفک و نوشابه را به سمت صورت ناراحت بکشید.</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced CSS for better graphics */}
      <style jsx>{`
        .games-container {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
        }

        .background-particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .particle {
          position: absolute;
          font-size: 2rem;
          animation: float 6s ease-in-out infinite;
          opacity: 0.7;
        }

        .particle-1 { top: 10%; left: 10%; animation-delay: 0s; }
        .particle-2 { top: 20%; right: 15%; animation-delay: 1s; }
        .particle-3 { top: 60%; left: 8%; animation-delay: 2s; }
        .particle-4 { top: 70%; right: 20%; animation-delay: 3s; }
        .particle-5 { top: 30%; left: 85%; animation-delay: 4s; }
        .particle-6 { top: 80%; left: 70%; animation-delay: 5s; }

        .game-section {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 25px;
          margin: 20px;
          padding: 25px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .game-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .game-header h2 {
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1.8rem;
          margin-bottom: 15px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .score-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .score-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .score-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(45deg, #ffd700, #ffed4e);
          padding: 8px 16px;
          border-radius: 25px;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
          border: 2px solid #fff;
        }

        .score-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
        }

        .score-star {
          font-size: 1.2rem;
          animation: rotate 2s linear infinite;
        }

        .instruction-card {
          background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
          padding: 15px;
          border-radius: 15px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(132, 250, 176, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .instruction-card p {
          margin: 0;
          color: #333;
          font-weight: 500;
          text-align: center;
        }

        .food-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin: 25px 0;
          padding: 20px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          border: 2px dashed #ddd;
        }

        .food-item {
          cursor: grab;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .food-item:active {
          cursor: grabbing;
        }

        .food-item.dragging {
          transform: scale(1.1) rotate(5deg);
          z-index: 1000;
          opacity: 0.8;
        }

        .food-card {
          position: relative;
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          border-radius: 15px;
          padding: 15px;
          text-align: center;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border: 2px solid transparent;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .food-card:hover {
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
          border-color: #667eea;
        }

        .food-emoji {
          font-size: 3rem;
          display: block;
          margin-bottom: 8px;
          animation: bounce 2s ease-in-out infinite;
        }

        .food-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          display: block;
        }

        .food-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent, rgba(102, 126, 234, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .food-card:hover .food-glow {
          opacity: 1;
        }

        .drop-zones {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 25px 0;
        }

        .drop-zone {
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border-radius: 20px;
          overflow: hidden;
        }

        .zone-content {
          position: relative;
          padding: 20px;
          text-align: center;
          height: 110px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        .healthy-zone .zone-content {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
        }

        .unhealthy-zone .zone-content {
          background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
          color: white;
        }

        .zone-emoji-container {
          position: relative;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .zone-emoji {
          font-size: 2.5rem;
          animation: pulse-emoji 2s ease-in-out infinite;
        }

        .zone-face {
          font-size: 2rem;
          animation: pulse-emoji 2s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        .emoji-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 40px;
          border-radius: 50%;
          opacity: 0.3;
        }

        .healthy-glow {
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
        }

        .unhealthy-glow {
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
        }

        .zone-label {
          font-size: 1.1rem;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .zone-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          pointer-events: none;
        }

        .drop-zone:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .drop-zone:hover .zone-emoji,
        .drop-zone:hover .zone-face {
          animation: wiggle 0.5s ease-in-out infinite;
        }

        .highlight-zone {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(102, 126, 234, 0.6);
        }

        .visual-feedback-container {
          position: relative;
          display: flex;
          justify-content: center;
          padding: 20px;
          border-radius: 20px;
          margin-top: 20px;
          animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          overflow: hidden;
        }

        .visual-feedback-container.correct {
          background: linear-gradient(135deg, rgba(76, 175, 80, 0.9) 0%, rgba(69, 160, 73, 0.9) 100%);
          border: 3px solid #4CAF50;
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
        }

        .visual-feedback-container.incorrect {
          background: linear-gradient(135deg, rgba(244, 67, 54, 0.9) 0%, rgba(211, 47, 47, 0.9) 100%);
          border: 3px solid #F44336;
          box-shadow: 0 10px 30px rgba(244, 67, 54, 0.3);
        }

        .feedback-content {
          text-align: center;
          color: white;
          position: relative;
          z-index: 2;
        }

        .feedback-icon {
          font-size: 4rem;
          margin-bottom: 10px;
          animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .feedback-message {
          font-size: 1.2rem;
          font-weight: bold;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .celebration-effects {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .confetti {
          position: absolute;
          top: -20px;
          left: 0;
          right: 0;
          height: 100%;
        }

        .confetti-piece {
          position: absolute;
          font-size: 1.5rem;
          animation: confetti-fall 2s ease-out forwards;
        }

        .confetti-piece:nth-child(1) { left: 20%; animation-delay: 0s; }
        .confetti-piece:nth-child(2) { left: 40%; animation-delay: 0.2s; }
        .confetti-piece:nth-child(3) { left: 60%; animation-delay: 0.4s; }
        .confetti-piece:nth-child(4) { left: 80%; animation-delay: 0.6s; }

        .stars-container {
          position: absolute;
          top: -30px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }

        .star {
          font-size: 2rem;
          animation: starFloat 2s ease-in-out infinite, fadeInOut 2s ease-in-out;
          margin: 0 5px;
        }

        .delayed-1 { animation-delay: 0.3s; }
        .delayed-2 { animation-delay: 0.6s; }

        .game-info {
          position: relative;
          z-index: 1;
          margin: 20px;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .info-card h3 {
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 15px;
          text-align: center;
        }

        .info-content p {
          margin-bottom: 10px;
          line-height: 1.6;
          color: #555;
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes pulse-emoji {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes popIn {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(-90deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
        }

        @keyframes starFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }

        .correct-answer-animation {
          animation: success-shake 0.6s ease-in-out;
        }

        .wrong-answer-animation {
          animation: error-shake 0.6s ease-in-out;
        }

        .pulsing {
          animation: pulse-zone 0.8s ease-in-out 3;
        }

        @keyframes success-shake {
          0% { transform: scale(1); }
          25% { transform: scale(1.05) rotate(2deg); }
          50% { transform: scale(1.1) rotate(-2deg); }
          75% { transform: scale(1.05) rotate(1deg); }
          100% { transform: scale(1) rotate(0); }
        }

        @keyframes error-shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-5px); }
          100% { transform: translateX(0); }
        }

        @keyframes pulse-zone {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8); }
          50% { transform: scale(1.15); box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .games-container {
            margin: 0;
          }

          .game-section, .game-info {
            margin: 10px;
            padding: 15px;
          }

          .food-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            padding: 15px;
          }

          .food-emoji {
            font-size: 2.5rem;
          }

          .zone-emoji {
            font-size: 2rem;
          }

          .zone-face {
            font-size: 1.5rem;
          }

          .drop-zones {
            gap: 15px;
          }

          .zone-content {
            padding: 20px;
            height: 100px;
          }

          .particle {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .food-container {
            grid-template-columns: 1fr 1fr;
          }

          .drop-zones {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .zone-content {
            padding: 15px;
            height: 90px;
          }

          .zone-emoji {
            font-size: 2rem;
          }

          .zone-face {
            font-size: 1.5rem;
          }

          .zone-label {
            font-size: 0.9rem;
          }

          .feedback-icon {
            font-size: 3rem;
          }

          .feedback-message {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ChildGames;