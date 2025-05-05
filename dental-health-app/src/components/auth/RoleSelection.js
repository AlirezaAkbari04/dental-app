import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css'; // Changed from '../styles/Auth.css'
import logoImage from '../../logo.svg'; // Changed from '../logo.svg'

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // Store selected role in localStorage or state management system
    localStorage.setItem('userRole', role);
    
    // Navigate to the appropriate profile completion page based on role
    switch (role) {
      case 'child':
        navigate('/profile/child');
        break;
      case 'teacher':
        navigate('/profile/teacher');
        break;
      case 'parent':
        navigate('/profile/parent');
        break;
      default:
        navigate('/profile/child');
    }
  };

  return (
    <div className="auth-container" dir="rtl">
      <div className="auth-form-container">
        <div className="logo-container">
          <img src={logoImage} alt="لبخند شاد دندان سالم" className="app-logo" />
          <h1 className="app-title">لبخند شاد دندان سالم</h1>
        </div>
        
        <div className="role-selection">
          <h2>لطفاً نقش خود را انتخاب کنید</h2>
          <p className="role-instruction">برای ادامه، نقش خود را از گزینه‌های زیر انتخاب کنید</p>
          
          <div className="role-options">
            <div 
              className="role-option" 
              onClick={() => handleRoleSelect('child')}
            >
              <span className="role-icon">👶</span>
              <div className="role-info">
                <div className="role-title">کودک</div>
                <div className="role-description">آموزش بهداشت دهان و دندان برای کودکان</div>
              </div>
            </div>
            
            <div 
              className="role-option" 
              onClick={() => handleRoleSelect('teacher')}
            >
              <span className="role-icon">👨‍⚕️</span>
              <div className="role-info">
                <div className="role-title">معلم بهداشت</div>
                <div className="role-description">مدیریت آموزش بهداشت دهان و دندان برای کودکان</div>
              </div>
            </div>
            
            <div 
              className="role-option" 
              onClick={() => handleRoleSelect('parent')}
            >
              <span className="role-icon">👪</span>
              <div className="role-info">
                <div className="role-title">والدین</div>
                <div className="role-description">نظارت بر بهداشت دهان و دندان فرزندان</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;