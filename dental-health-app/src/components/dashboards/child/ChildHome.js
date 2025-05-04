import React, { useState, useEffect } from 'react';
import './ChildComponents.css';

const ChildHome = ({ childName }) => {
  const [achievements, setAchievements] = useState({
    stars: 0,
    diamonds: 0,
    regularBrushing: 0,
    cleanedAreas: 0,
    healthySnacks: 0
  });
  
  // Load achievements from localStorage
  useEffect(() => {
    const savedAchievements = JSON.parse(localStorage.getItem('childAchievements') || '{}');
    if (Object.keys(savedAchievements).length > 0) {
      setAchievements(savedAchievements);
    }
  }, []);
  
  // Medals based on achievements
  const medals = [
    {
      name: 'مسواک طلایی',
      icon: '🏆',
      earned: achievements.regularBrushing >= 7,
      description: 'مسواک زدن منظم به مدت یک هفته'
    },
    {
      name: 'دندان درخشان',
      icon: '⭐',
      earned: achievements.stars >= 10,
      description: '10 ستاره کسب کردی'
    },
    {
      name: 'قهرمان بهداشت',
      icon: '🦷',
      earned: achievements.cleanedAreas >= 20,
      description: 'تمیز کردن کامل هر 4 ناحیه دندان 20 بار'
    },
    {
      name: 'خوراکی سالم',
      icon: '🍎',
      earned: achievements.healthySnacks >= 15,
      description: 'انتخاب 15 میان‌وعده سالم'
    },
    {
      name: 'جواهر خوش‌اخلاق',
      icon: '💎',
      earned: achievements.diamonds >= 5,
      description: 'کسب 5 الماس'
    }
  ];
  
  return (
    <div className="child-home-container">
      <div className="welcome-banner">
        <h1>سلام {childName}!</h1>
        <p>به برنامه لبخند شاد دندان سالم خوش آمدی</p>
      </div>
      
      <div className="achievement-summary">
        <div className="achievement-card">
          <div className="achievement-icon">⭐</div>
          <div className="achievement-value">{achievements.stars}</div>
          <div className="achievement-label">ستاره</div>
        </div>
        
        <div className="achievement-card">
          <div className="achievement-icon">💎</div>
          <div className="achievement-value">{achievements.diamonds}</div>
          <div className="achievement-label">الماس</div>
        </div>
        
        <div className="achievement-card">
          <div className="achievement-icon">🪥</div>
          <div className="achievement-value">{achievements.regularBrushing}</div>
          <div className="achievement-label">مسواک منظم</div>
        </div>
      </div>
      
      <div className="medals-section">
        <h2>مدال‌های من</h2>
        <div className="medals-container">
          {medals.map((medal, index) => (
            <div key={index} className={`medal-card ${medal.earned ? 'earned' : 'not-earned'}`}>
              <div className="medal-icon">{medal.icon}</div>
              <div className="medal-info">
                <h3 className="medal-name">{medal.name}</h3>
                <p className="medal-description">{medal.description}</p>
              </div>
              {medal.earned && <div className="earned-badge">کسب شده</div>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="tip-of-day">
        <h3>نکته امروز</h3>
        <div className="tip-content">
          <p>روزی دو بار مسواک بزن، صبح و شب!</p>
          <p>دندان‌هایت را با آرامی و به خوبی مسواک کن.</p>
        </div>
      </div>
    </div>
  );
};

export default ChildHome;