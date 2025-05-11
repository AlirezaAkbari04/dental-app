import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';
import logoImage from '../../logo.svg';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();

  const handleRoleSelect = async (role) => {
    try {
      // Initialize the database if not already done
      if (!DatabaseService.initialized) {
        await DatabaseService.init();
      }

      if (currentUser?.id) {
        // Update the user's role in the database
        await DatabaseService.updateUserRole(currentUser.id, role); // Ensure this method exists in DatabaseService
        localStorage.setItem('userRole', role); // Save the role in localStorage
      }

      // Navigate to the appropriate profile or dashboard based on the selected role
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
          navigate('/profile/child'); // Default to child profile
      }
    } catch (error) {
      console.error("Error updating role:", error);
      navigate(`/profile/${role}`);
    }
  };

  return (
    <div className="auth-container" dir="rtl">
      <div className="auth-form-container" style={{ maxWidth: '500px' }}>
        <div className="logo-container">
          <img src={logoImage} alt="لبخند شاد دندان سالم" className="app-logo" />
          <h1 className="app-title">لبخند شاد دندان سالم</h1>
        </div>

        <div className="role-selection">
          <h2>لطفاً نقش خود را انتخاب کنید</h2>
          <p className="role-instruction">برای ادامه، نقش خود را از گزینه‌های زیر انتخاب کنید</p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            width: '100%',
            margin: '20px 0'
          }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer'
              }}
              onClick={() => handleRoleSelect('child')}
            >
              <span style={{ fontSize: '30px', marginLeft: '15px' }}>👶</span>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>کودک</div>
                <div style={{ fontSize: '13px', color: '#666' }}>آموزش بهداشت دهان و دندان برای کودکان</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer'
              }}
              onClick={() => handleRoleSelect('teacher')}
            >
              <span style={{ fontSize: '30px', marginLeft: '15px' }}>👨‍⚕️</span>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>معلم بهداشت</div>
                <div style={{ fontSize: '13px', color: '#666' }}>مدیریت آموزش بهداشت دهان و دندان برای کودکان</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer'
              }}
              onClick={() => handleRoleSelect('parent')}
            >
              <span style={{ fontSize: '30px', marginLeft: '15px' }}>👪</span>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>والدین</div>
                <div style={{ fontSize: '13px', color: '#666' }}>نظارت بر بهداشت دهان و دندان فرزندان</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
