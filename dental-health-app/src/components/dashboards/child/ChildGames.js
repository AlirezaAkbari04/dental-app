import React, { useState, useEffect } from 'react';
import './ChildComponents.css';

const ChildGames = () => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  
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
  // Drag and drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  
  const handleDrop = (e, targetType) => {
    e.preventDefault();
    
    if (draggedItem.type === targetType) {
      // Correct answer
      setIsCorrect(true);
      setScore(prevScore => prevScore + 1);
      setFeedbackMessage(
        targetType === 'healthy' 
          ? `آفرین! ${draggedItem.name} یک میان‌وعده سالم است.` 
          : `درست است! ${draggedItem.name} برای دندان‌های شما خوب نیست.`
      );
    } else {
      // Wrong answer
      setIsCorrect(false);
      setFeedbackMessage(
        targetType === 'healthy' 
          ? `اشتباه! ${draggedItem.name} یک میان‌وعده ناسالم است.` 
          : `اشتباه! ${draggedItem.name} یک میان‌وعده سالم است.`
      );
    }
    
    setShowFeedback(true);
    
    // Load next food items after a delay
    setTimeout(() => {
      setShowFeedback(false);
      setCurrentFoodItems(getRandomFoodItems());
    }, 2000);
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
          <p>غذاها را به سمت صورت خوشحال یا ناراحت بکشید</p>
        </div>
        
        <div className="food-container">
          {currentFoodItems.map(item => (
            <div
              key={item.id}
              className="food-item"
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
            >
              <span className="food-emoji">{item.emoji}</span>
              <span className="food-name">{item.name}</span>
            </div>
          ))}
        </div>
        
        <div className="drop-zones">
          <div 
            className="drop-zone healthy-zone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'healthy')}
          >
            <span className="zone-emoji">😀</span>
            <span className="zone-label">سالم</span>
          </div>
          
          <div 
            className="drop-zone unhealthy-zone"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'unhealthy')}
          >
            <span className="zone-emoji">😫</span>
            <span className="zone-label">ناسالم</span>
          </div>
        </div>
        
        {showFeedback && (
          <div className={`feedback-message ${isCorrect ? 'correct' : 'incorrect'}`}>
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