import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../../../styles/ChildComponents.css';
import { useUser } from '../../../contexts/UserContext'; // Added this import
import DatabaseService from '../../../services/DatabaseService'; // Added this import

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
      <div className="game-section">
        <h2>بازی میان‌وعده سالم و ناسالم</h2>
        <div className="game-score">
          <span className="score-label">امتیاز شما:</span>
          <span className="score-value">{score}</span>
        </div>
        
        <div className="game-instruction">
          <p>
            {touchDevice 
              ? "غذاها را به سمت صورت خوشحال یا ناراحت بکشید یا روی صورت‌ها کلیک کنید" 
              : "غذاها را به سمت صورت خوشحال یا ناراحت بکشید"}
          </p>
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
              <span className="food-emoji" aria-hidden="true">{item.emoji}</span>
              <span className="food-name">{item.name}</span>
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
            <span className="zone-emoji" aria-hidden="true">😀</span>
            <span className="zone-label">سالم</span>
          </div>
          
          <div 
            ref={unhealthyZoneRef}
            className={`drop-zone unhealthy-zone ${showFeedback && isCorrect && draggedItem?.type === 'unhealthy' ? 'pulsing' : ''}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'unhealthy')}
            onClick={() => draggedItem && handleDirectSelection(draggedItem, 'unhealthy')}
          >
            <span className="zone-emoji" aria-hidden="true">😫</span>
            <span className="zone-label">ناسالم</span>
          </div>
        </div>
        
        {showFeedback && (
          <div className={`visual-feedback-container ${isCorrect ? 'correct' : 'incorrect'}`} role="alert">
            <div className="feedback-icon">{feedbackImage}</div>
            <div className="feedback-message">{feedbackMessage}</div>
            {isCorrect && (
              <div className="stars-container">
                <span className="star">⭐</span>
                <span className="star delayed-1">⭐</span>
                <span className="star delayed-2">⭐</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="game-info">
        <h3>راهنمای بازی</h3>
        <p>میان‌وعده‌های سالم به دندان‌های شما کمک می‌کنند، اما میان‌وعده‌های ناسالم باعث پوسیدگی دندان می‌شوند.</p>
        <p>غذاهای سالم مانند میوه، سبزیجات، شیر و آب را به سمت صورت خندان بکشید.</p>
        <p>غذاهای ناسالم مانند شکلات، چیپس، پفک و نوشابه را به سمت صورت ناراحت بکشید.</p>
      </div>
      
      {/* Add CSS for visual feedback */}
      <style jsx>{`
        .visual-feedback-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 15px;
          border-radius: 10px;
          margin-top: 20px;
          animation: fadeIn 0.3s ease-in-out;
          position: relative;
        }
        
        .visual-feedback-container.correct {
          background-color: rgba(76, 175, 80, 0.2);
          border: 2px solid #4CAF50;
        }
        
        .visual-feedback-container.incorrect {
          background-color: rgba(244, 67, 54, 0.2);
          border: 2px solid #F44336;
        }
        
        .feedback-icon {
          font-size: 3rem;
          margin-bottom: 10px;
          animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .feedback-message {
          font-size: 1.2rem;
          font-weight: bold;
        }
        
        .stars-container {
          position: absolute;
          top: -20px;
          right: 0;
          left: 0;
          display: flex;
          justify-content: center;
          pointer-events: none;
        }
        
        .star {
          font-size: 2rem;
          animation: float 1.5s ease-in-out infinite, fadeInOut 2s ease-in-out;
          margin: 0 5px;
        }
        
        .delayed-1 {
          animation-delay: 0.3s;
        }
        
        .delayed-2 {
          animation-delay: 0.6s;
        }
        
        .correct-answer-animation {
          animation: success-shake 0.5s ease-in-out;
        }
        
        .wrong-answer-animation {
          animation: error-shake 0.5s ease-in-out;
        }
        
        .pulsing {
          animation: pulse 0.5s ease-in-out 2;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes pop {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
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
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
          100% { transform: translateX(0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          50% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
      `}</style>
    </div>
  );
};

export default ChildGames;