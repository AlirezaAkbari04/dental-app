import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';
import logoImage from '../../logo.svg';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserRole } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = async (role) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Selecting role:", role);
      
      if (currentUser?.id) {
        // Update localStorage first
        localStorage.setItem('userRole', role);
        
        // Then update in database
        await DatabaseService.updateUserRole(currentUser.id, role);
        
        // Try to update context if available
        if (typeof updateUserRole === 'function') {
          try {
            await updateUserRole(role);
          } catch (e) {
            console.warn("Error updating role in context:", e);
          }
        }
        
        // Redirect based on role
        switch (role) {
          case 'child':
            navigate('/profile/child');
            break;
          case 'parent':
            navigate('/profile/parent');
            break;
          case 'teacher':
            navigate('/profile/teacher');
            break;
          default:
            navigate('/profile/parent');
        }
      } else {
        setError('لطفا ابتدا وارد شوید');
        navigate('/login');
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setError('خطا در انتخاب نقش');
    } finally {
      setIsLoading(false);
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

          {error && (
            <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
              {error}
            </div>
          )}

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
                backgroundColor: isLoading ? '#f0f0f0' : 'white',
                borderRadius: '10px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
              onClick={() => !isLoading && handleRoleSelect('child')}
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
                backgroundColor: isLoading ? '#f0f0f0' : 'white',
                borderRadius: '10px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
              onClick={() => !isLoading && handleRoleSelect('teacher')}
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
                backgroundColor: isLoading ? '#f0f0f0' : 'white',
                borderRadius: '10px',
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
              onClick={() => !isLoading && handleRoleSelect('parent')}
            >
              <span style={{ fontSize: '30px', marginLeft: '15px' }}>👪</span>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>والدین</div>
                <div style={{ fontSize: '13px', color: '#666' }}>نظارت بر بهداشت دهان و دندان فرزندان</div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              در حال پردازش...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;