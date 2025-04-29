import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/RoleSelection.css';

function RoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      // Navigate to the appropriate registration page based on role
      navigate(`/register/${selectedRole}`);
    }
  };

  return (
    <div className="container">
      <div className="role-card">
        <svg className="logo" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10C33.4 10 20 23.4 20 40v30c0 11 9 20 20 20s20-9 20-20V50h-10v20c0 5.5-4.5 10-10 10s-10-4.5-10-10V40c0-11 9-20 20-20s20 9 20 20v5h10v-5c0-16.6-13.4-30-30-30z" fill="#4a6bff"/>
          <circle cx="35" cy="35" r="5" fill="#ffcc00"/>
          <circle cx="65" cy="35" r="5" fill="#ffcc00"/>
        </svg>
        
        <h1>شما چه کسی هستید؟</h1>
        
        <div className="roles">
          <div 
            className={`role ${selectedRole === 'child' ? 'selected' : ''}`} 
            onClick={() => handleRoleSelect('child')}
          >
            <div className="role-icon">👶</div>
            <div className="role-title">کودک</div>
            <div className="role-description">
              بازی های جذاب و آموزشی برای سلامت دندان
            </div>
          </div>
          
          <div 
            className={`role ${selectedRole === 'parent' ? 'selected' : ''}`} 
            onClick={() => handleRoleSelect('parent')}
          >
            <div className="role-icon">👪</div>
            <div className="role-title">والدین</div>
            <div className="role-description">
              نظارت بر عملکرد و پیشرفت کودک
            </div>
          </div>
          
          <div 
            className={`role ${selectedRole === 'caretaker' ? 'selected' : ''}`} 
            onClick={() => handleRoleSelect('caretaker')}
          >
            <div className="role-icon">👨‍⚕️</div>
            <div className="role-title">مراقب سلامت</div>
            <div className="role-description">
              مدیریت چندین کودک و گزارش‌گیری
            </div>
          </div>
        </div>
        
        <button 
          className={`btn ${selectedRole ? 'btn-primary' : 'btn-disabled'}`}
          disabled={!selectedRole}
          onClick={handleContinue}
        >
          تایید و ادامه
        </button>
      </div>
    </div>
  );
}

export default RoleSelection;