import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/ProfileForm.css';

const ProfileForm = ({ title, children, onSubmit }) => {
  const navigate = useNavigate();
  
  const handleCancel = () => {
    navigate('/role-selection');
  };
  
  return (
    <div className="profile-container" dir="rtl">
      <div className="profile-form-container">
        <div className="logo-container">
          <img
            src="/assets/images/logo.png"
            alt="لبخند شاد دندان سالم"
            className="dashboard-logo"
            onError={(e) => {
              console.warn('Failed to load logo, trying alternative');
              e.target.src = "/logo.png";
            }}
          />
        </div>       
        <div className="profile-header">
          <h2>{title}</h2>
          <p className="profile-subtitle">لطفاً اطلاعات خود را تکمیل کنید</p>
        </div>
        
        <form onSubmit={onSubmit} className="profile-form">
          {children}
          
          <div className="profile-actions">
            <button type="submit" className="profile-button submit-button">
              ثبت اطلاعات
            </button>
            <button 
              type="button" 
              onClick={handleCancel} 
              className="profile-button cancel-button"
            >
              بازگشت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;