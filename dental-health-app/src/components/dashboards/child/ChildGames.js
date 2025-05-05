import React, { useState, useEffect, useRef } from 'react';
import '../../../styles/ChildComponents.css';

const ChildGames = () => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentFoodItems, setCurrentFoodItems] = useState([]);
  const [touchDevice, setTouchDevice] = useState(false);
  
  // Refs for drop zones
  const healthyZoneRef = useRef(null);
  const unhealthyZoneRef = useRef(null);
  
  // Food items for the game
  const foodItems = [
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
  
  // Load saved score from localStorage
  useEffect(() => {
    try {
      const savedScore = localStorage.getItem('healthySnackScore');
      if (savedScore) {
        setScore(parseInt(savedScore, 10));
      }
      
      // Detect if device supports touch
      setTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
      
      console.log("Game initialized, touch device:", 'ontouchstart' in window || navigator.maxTouchPoints > 0);
    } catch (error) {
      console.error("Error loading score:", error);
    }
  }, []);
  
  // Save score to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('healthySnackScore', score.toString());
      
      // Update achievements
      if (score > 0) {
        const achievements = JSON.parse(localStorage.getItem('childAchievements') || '{}');
        
        const updatedAchievements = {
          ...achievements,
          healthySnacks: score
        };
        
        localStorage.setItem('childAchievements', JSON.stringify(updatedAchievements));
      }
    } catch (error) {
      console.error("Error saving score:", error);
    }
  }, [score]);

  // Get random food items for the game
  const getRandomFoodItems = () => {
    // Get equal number of healthy and unhealthy items
    const healthyItems = foodItems.filter(item => item.type === 'healthy');
    const unhealthyItems = foodItems.filter(item => item.type === 'unhealthy');
    
    const randomHealthy = [...healthyItems].sort(() => 0.5 - Math.random()).slice(0, 2);
    const randomUnhealthy = [...unhealthyItems].sort(() => 0.5 - Math.random()).slice(0, 2);
    
    // Combine and shuffle
    return [...randomHealthy, ...randomUnhealthy].sort(() => 0.5 - Math.random());
  };
  
  // Initialize game with random food items
  useEffect(() => {
    setCurrentFoodItems(getRandomFoodItems());
  }, []);
  
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
  
  // Common function to handle answer selection
  const handleAnswerSelection = (item, targetType) => {
    console.log("Answer selected:", item.name, "as", targetType);
    
    if (item.type === targetType) {
      // Correct answer
      setIsCorrect(true);
      setScore(prevScore => prevScore + 1);
      setFeedbackMessage(
        targetType === 'healthy' 
          ? `آفرین! ${item.name} یک میان‌وعده سالم است.` 
          : `درست است! ${item.name} برای دندان‌های شما خوب نیست.`
      );
    } else {
      // Wrong answer
      setIsCorrect(false);
      setFeedbackMessage(
        targetType === 'healthy' 
          ? `اشتباه! ${item.name} یک میان‌وعده ناسالم است.` 
          : `اشتباه! ${item.name} یک میان‌وعده سالم است.`
      );
    }
    
    setShowFeedback(true);
    
    // Load next food items after a delay
    setTimeout(() => {
      setShowFeedback(false);
      setCurrentFoodItems(getRandomFoodItems());
    }, 2000);
  };
  
  // For direct click/tap on mobile if drag not working
  const handleDirectSelection = (item, type) => {
    if (touchDevice) {
      handleAnswerSelection(item, type);
    }
  };
  
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
        
        <div className="food-container">
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
            className="drop-zone healthy-zone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'healthy')}
            onClick={() => draggedItem && handleDirectSelection(draggedItem, 'healthy')}
          >
            <span className="zone-emoji" aria-hidden="true">😀</span>
            <span className="zone-label">سالم</span>
          </div>
          
          <div 
            ref={unhealthyZoneRef}
            className="drop-zone unhealthy-zone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'unhealthy')}
            onClick={() => draggedItem && handleDirectSelection(draggedItem, 'unhealthy')}
          >
            <span className="zone-emoji" aria-hidden="true">😫</span>
            <span className="zone-label">ناسالم</span>
          </div>
        </div>
        
        {showFeedback && (
          <div className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`} role="alert">
            {feedbackMessage}
          </div>
        )}
      </div>
      
      <div className="game-info">
        <h3>راهنمای بازی</h3>
        <p>میان‌وعده‌های سالم به دندان‌های شما کمک می‌کنند، اما میان‌وعده‌های ناسالم باعث پوسیدگی دندان می‌شوند.</p>
        <p>غذاهای سالم مانند میوه، سبزیجات، شیر و آب را به سمت صورت خندان بکشید.</p>
        <p>غذاهای ناسالم مانند شکلات، چیپس، پفک و نوشابه را به سمت صورت ناراحت بکشید.</p>
      </div>
    </div>
  );
};

export default ChildGames;