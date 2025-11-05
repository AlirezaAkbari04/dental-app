import React, { useState, useEffect } from 'react';
import '../../../styles/ChildComponents.css';
import { useUser } from '../../../contexts/UserContext';
import DatabaseService from '../../../services/DatabaseService';

const ChildHome = ({ childName }) => {
  const [achievements, setAchievements] = useState({
    stars: 0,
    diamonds: 0,
    regularBrushing: 0,
    cleanedAreas: 0,
    healthySnacks: 0
  });
  
  // Add current user
  const { currentUser } = useUser();
  
  // Update useEffect to use database
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        // Use executeWithFallback for cleaner error handling
        const achievementsData = await DatabaseService.executeWithFallback(
          // Database operation
          async () => {
            if (currentUser?.id) {
              return await DatabaseService.getChildAchievements(currentUser.id);
            }
            throw new Error('No user ID');
          },
          // Fallback operation
          async () => {
            return JSON.parse(localStorage.getItem('childAchievements') || '{}');
          }
        );
        
        setAchievements(achievementsData);
      } catch (error) {
        console.error('Error loading achievements:', error);
      }
    };
    
    fetchAchievements();
  }, [currentUser]);
  
  // Medals based on achievements
  const medals = [
    {
      name: 'Golden Toothbrush',
      icon: '🏆',
      earned: achievements.regularBrushing >= 7,
      description: 'Brushed regularly for one week'
    },
    {
      name: 'Shining Smile',
      icon: '⭐',
      earned: achievements.stars >= 10,
      description: 'Earned 10 stars'
    },
    {
      name: 'Healthy Eater',
      icon: '🍎',
      earned: achievements.healthySnacks >= 15,
      description: 'Chose 15 healthy snacks'
    },
    {
      name: 'Diamond Champion',
      icon: '💎',
      earned: achievements.diamonds >= 5,
      description: 'Earned 5 diamonds'
    }
  ];
  
  return (
    <div className="child-home-container">
      {/* Floating particles for kids */}
      <div className="floating-elements">
        <div className="float-star">⭐</div>
        <div className="float-heart">💖</div>
        <div className="float-rainbow">🌈</div>
        <div className="float-smile">😊</div>
        <div className="float-tooth">🦷</div>
      </div>

      <div className="welcome-banner">
        <div className="welcome-content">
          <h1>Hello {childName}! 👋</h1>
          <p>Welcome to Healthy Teeth Happy Smile</p>
          <div className="welcome-decoration">
            <span className="deco-item">🎉</span>
            <span className="deco-item">🦷</span>
            <span className="deco-item">✨</span>
          </div>
        </div>
      </div>
      
      <div className="achievement-summary">
        <div className="achievement-card stars-card">
          <div className="achievement-icon">⭐</div>
          <div className="achievement-value">{achievements.stars}</div>
          <div className="achievement-label">Stars</div>
          <div className="card-sparkle"></div>
        </div>

        <div className="achievement-card diamonds-card">
          <div className="achievement-icon">💎</div>
          <div className="achievement-value">{achievements.diamonds}</div>
          <div className="achievement-label">Diamonds</div>
          <div className="card-sparkle"></div>
        </div>

        <div className="achievement-card brush-card">
          <div className="achievement-icon">🪥</div>
          <div className="achievement-value">{achievements.regularBrushing}</div>
          <div className="achievement-label">Regular Brushing</div>
          <div className="card-sparkle"></div>
        </div>
      </div>
      
      <div className="medals-section">
        <h2>🏆 My Medals</h2>
        <div className="medals-container">
          {medals.map((medal, index) => (
            <div key={index} className={`medal-card ${medal.earned ? 'earned' : 'not-earned'}`}>
              <div className="medal-icon">{medal.icon}</div>
              <div className="medal-info">
                <h3 className="medal-name">{medal.name}</h3>
                <p className="medal-description">{medal.description}</p>
              </div>
              {medal.earned && (
                <div className="earned-badge">
                  <span>Earned</span>
                  <div className="badge-glow"></div>
                </div>
              )}
              {!medal.earned && <div className="medal-lock">🔒</div>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="tip-of-day">
        <h3>💡 Tip of the Day</h3>
        <div className="tip-content">
          <div className="tip-item">
            <span className="tip-emoji">🌅</span>
            <p>Brush your teeth twice a day, morning and night!</p>
          </div>
          <div className="tip-item">
            <span className="tip-emoji">😌</span>
            <p>Brush gently and thoroughly for healthy teeth.</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .child-home-container {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, #ffeef8 0%, #f0f8ff 50%, #fff5ee 100%);
          padding: 20px;
          overflow: hidden;
        }

        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 0;
        }

        .floating-elements > div {
          position: absolute;
          font-size: 1.5rem;
          animation: gentleFloat 8s ease-in-out infinite;
          opacity: 0.6;
        }

        .float-star { top: 10%; left: 5%; animation-delay: 0s; }
        .float-heart { top: 20%; right: 10%; animation-delay: 2s; }
        .float-rainbow { top: 60%; left: 3%; animation-delay: 4s; }
        .float-smile { top: 70%; right: 5%; animation-delay: 6s; }
        .float-tooth { top: 40%; right: 85%; animation-delay: 1s; }

        .welcome-banner {
          position: relative;
          z-index: 1;
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
          border-radius: 25px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 10px 30px rgba(255, 154, 158, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.5);
          overflow: hidden;
        }

        .welcome-content {
          text-align: center;
          color: white;
          position: relative;
        }

        .welcome-banner h1 {
          font-size: 1.8rem;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          animation: welcomePulse 3s ease-in-out infinite;
        }

        .welcome-banner p {
          font-size: 1rem;
          margin-bottom: 15px;
          opacity: 0.95;
        }

        .welcome-decoration {
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .deco-item {
          font-size: 1.5rem;
          animation: bounce 2s ease-in-out infinite;
        }

        .deco-item:nth-child(2) { animation-delay: 0.3s; }
        .deco-item:nth-child(3) { animation-delay: 0.6s; }

        .achievement-summary {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .achievement-card {
          position: relative;
          background: white;
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border: 2px solid transparent;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          overflow: hidden;
        }

        .achievement-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
        }

        .stars-card {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          border-color: #ffd700;
        }

        .diamonds-card {
          background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%);
          border-color: #03a9f4;
        }

        .brush-card {
          background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
          border-color: #4caf50;
        }

        .achievement-icon {
          font-size: 2.5rem;
          margin-bottom: 8px;
          animation: iconBounce 2s ease-in-out infinite;
        }

        .achievement-value {
          font-size: 1.8rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .achievement-label {
          font-size: 0.9rem;
          color: #555;
          font-weight: 600;
        }

        .card-sparkle {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
          border-radius: 50%;
          animation: sparkle 3s ease-in-out infinite;
        }

        .medals-section {
          position: relative;
          z-index: 1;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 25px;
          padding: 25px;
          margin-bottom: 25px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .medals-section h2 {
          text-align: center;
          color: #333;
          margin-bottom: 20px;
          font-size: 1.4rem;
        }

        .medals-container {
          display: grid;
          gap: 15px;
        }

        .medal-card {
          position: relative;
          display: flex;
          align-items: center;
          background: white;
          border-radius: 15px;
          padding: 15px;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .medal-card.earned {
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
          border: 2px solid #ff9800;
          box-shadow: 0 5px 20px rgba(255, 152, 0, 0.3);
          animation: earnedGlow 3s ease-in-out infinite;
        }

        .medal-card.not-earned {
          background: #f5f5f5;
          border: 2px solid #ddd;
          opacity: 0.7;
        }

        .medal-card:hover {
          transform: translateX(5px);
        }

        .medal-icon {
          font-size: 2.5rem;
          margin-left: 15px;
          animation: medalRotate 4s ease-in-out infinite;
        }

        .medal-info {
          flex: 1;
        }

        .medal-name {
          font-size: 1.1rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }

        .medal-description {
          font-size: 0.9rem;
          color: #666;
          margin: 0;
        }

        .earned-badge {
          position: relative;
          background: linear-gradient(45deg, #4caf50, #66bb6a);
          color: white;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .badge-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 15px;
          animation: badgeShine 2s ease-in-out infinite;
        }

        .medal-lock {
          font-size: 1.5rem;
          opacity: 0.5;
        }

        .tip-of-day {
          position: relative;
          z-index: 1;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 8px 25px rgba(33, 150, 243, 0.2);
          border: 2px solid rgba(33, 150, 243, 0.3);
        }

        .tip-of-day h3 {
          text-align: center;
          color: #1976d2;
          margin-bottom: 15px;
          font-size: 1.2rem;
        }

        .tip-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .tip-item {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          padding: 12px;
          transition: all 0.3s ease;
        }

        .tip-item:hover {
          transform: scale(1.02);
          background: rgba(255, 255, 255, 0.9);
        }

        .tip-emoji {
          font-size: 1.5rem;
          margin-left: 10px;
          animation: tipWiggle 3s ease-in-out infinite;
        }

        .tip-item p {
          margin: 0;
          color: #333;
          font-weight: 500;
        }

        /* Animations */
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(180deg); }
        }

        @keyframes welcomePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes iconBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @keyframes earnedGlow {
          0%, 100% { box-shadow: 0 5px 20px rgba(255, 152, 0, 0.3); }
          50% { box-shadow: 0 8px 30px rgba(255, 152, 0, 0.5); }
        }

        @keyframes medalRotate {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }

        @keyframes badgeShine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }

        @keyframes tipWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .child-home-container {
            padding: 15px;
          }

          .welcome-banner {
            padding: 20px;
          }

          .welcome-banner h1 {
            font-size: 1.5rem;
          }

          .achievement-summary {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }

          .achievement-card {
            padding: 15px;
          }

          .achievement-icon {
            font-size: 2rem;
          }

          .achievement-value {
            font-size: 1.5rem;
          }

          .medals-section, .tip-of-day {
            padding: 20px;
          }

          .floating-elements > div {
            font-size: 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .achievement-summary {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .medal-card {
            flex-direction: column;
            text-align: center;
            padding: 12px;
          }

          .medal-icon {
            margin: 0 0 8px 0;
            font-size: 2rem;
          }

          .tip-item {
            flex-direction: column;
            text-align: center;
          }

          .tip-emoji {
            margin: 0 0 5px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ChildHome;