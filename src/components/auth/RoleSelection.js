import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Auth.css';
import logoImage from '../../logo.svg';
import { useUser } from '../../contexts/UserContext';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserRole } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoleChange, setShowRoleChange] = useState(false);

  // Check if user already has a role and has completed profile
  useEffect(() => {
    if (currentUser?.role && currentUser?.profileCompleted) {
      // User already has a role and completed profile, redirect to dashboard
      const dashboardPath = getDashboardPath(currentUser.role);
      navigate(dashboardPath);
    }
  }, [currentUser, navigate]);

  const getDashboardPath = (role) => {
    switch (role) {
      case 'child':
        return '/dashboard/child';
      case 'parent':
        return '/dashboard/parent';
      case 'teacher':
        return '/dashboard/caretaker';
      default:
        return '/role-selection';
    }
  };

  const handleRoleSelect = async (role) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Selecting role:", role, "for user:", currentUser?.username);
      
      if (!currentUser?.id) {
        setError('لطفا ابتدا وارد شوید');
        navigate('/login');
        return;
      }
      
      // Update user role using UserContext
      const success = await updateUserRole(role);
      
      if (success) {
        console.log(`Role updated to ${role}, navigating to profile completion`);
        
        // Navigate to profile completion based on role
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
            console.error(`Unknown role: ${role}`);
            setError('نقش نامعتبر انتخاب شده است');
        }
      } else {
        setError('خطا در انتخاب نقش. لطفا دوباره تلاش کنید.');
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setError('خطا در انتخاب نقش. لطفا دوباره تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = () => {
    setShowRoleChange(true);
  };

  const handleContinueWithCurrentRole = () => {
    if (currentUser?.role) {
      navigate(`/profile/${currentUser.role}`);
    }
  };

  // Don't render if no user is logged in
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // If user already has a role but hasn't completed profile
  if (currentUser.role && !currentUser.profileCompleted && !showRoleChange) {
    const getRoleName = (role) => {
      switch (role) {
        case 'child': return 'کودک';
        case 'parent': return 'والدین';
        case 'teacher': return 'معلم/معلم بهداشت';
        default: return role;
      }
    };

    return (
      <div className="auth-container" dir="rtl">
        <div className="auth-form-container">
          <div className="logo-container">
            <img src={logoImage} alt="لبخند شاد دندان سالم" className="app-logo" />
            <h1 className="app-title">لبخند شاد دندان سالم</h1>
          </div>
          
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2 style={{ marginBottom: '15px', color: '#2c3e50' }}>
              نقش انتخابی شما: {getRoleName(currentUser.role)}
            </h2>
            <p style={{ marginBottom: '20px', color: '#7f8c8d', lineHeight: '1.6' }}>
              شما قبلاً نقش <strong>{getRoleName(currentUser.role)}</strong> را انتخاب کرده‌اید.
              <br />
              می‌توانید پروفایل خود را تکمیل کنید یا نقش خود را تغییر دهید.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
              <button 
                className="auth-button" 
                onClick={handleContinueWithCurrentRole}
                style={{ 
                  backgroundColor: '#27ae60',
                  marginBottom: '10px'
                }}
              >
                ادامه به تکمیل پروفایل {getRoleName(currentUser.role)}
              </button>
              
              <button 
                className="auth-button" 
                onClick={handleChangeRole}
                style={{ 
                  backgroundColor: '#e74c3c'
                }}
              >
                تغییر نقش
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container" dir="rtl">
      <div className="auth-form-container" style={{ maxWidth: '500px' }}>
        <div className="logo-container">
          <img src={logoImage} alt="لبخند شاد دندان سالم" className="app-logo" />
          <h1 className="app-title">لبخند شاد دندان سالم</h1>
        </div>

        <div className="role-selection">
          <h2>
            {showRoleChange ? 'انتخاب نقش جدید' : 'لطفاً نقش خود را انتخاب کنید'}
          </h2>
          <p className="role-instruction">
            {showRoleChange 
              ? 'نقش جدید خود را از گزینه‌های زیر انتخاب کنید'
              : 'برای ادامه، نقش خود را از گزینه‌های زیر انتخاب کنید'
            }
          </p>

          {error && (
            <div style={{ 
              color: '#e74c3c', 
              marginBottom: '15px', 
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#ffeaea',
              borderRadius: '5px',
              border: '1px solid #e74c3c'
            }}>
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
            
            {/* Child Role */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: isLoading ? '#f0f0f0' : 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
              onClick={() => !isLoading && handleRoleSelect('child')}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = '#3498db';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '40px', marginLeft: '20px' }}>👶</span>
              <div>
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  fontSize: '18px',
                  color: '#2c3e50'
                }}>
                  کودک
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#7f8c8d',
                  lineHeight: '1.4'
                }}>
                  آموزش بهداشت دهان و دندان برای کودکان
                </div>
              </div>
            </div>

            {/* Teacher Role */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: isLoading ? '#f0f0f0' : 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
              onClick={() => !isLoading && handleRoleSelect('teacher')}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = '#27ae60';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '40px', marginLeft: '20px' }}>👨‍⚕️</span>
              <div>
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  fontSize: '18px',
                  color: '#2c3e50'
                }}>
                  معلم بهداشت
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#7f8c8d',
                  lineHeight: '1.4'
                }}>
                  مدیریت آموزش بهداشت دهان و دندان برای کودکان
                </div>
              </div>
            </div>

            {/* Parent Role */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '20px',
                backgroundColor: isLoading ? '#f0f0f0' : 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
              onClick={() => !isLoading && handleRoleSelect('parent')}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.borderColor = '#e74c3c';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '40px', marginLeft: '20px' }}>👨‍👩‍👧</span>
              <div>
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px', 
                  fontSize: '18px',
                  color: '#2c3e50'
                }}>
                  والدین
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#7f8c8d',
                  lineHeight: '1.4'
                }}>
                  نظارت بر بهداشت دهان و دندان فرزندان
                </div>
              </div>
            </div>
          </div>

          {isLoading && (
            <div style={{ 
              textAlign: 'center', 
              margin: '20px 0',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              color: '#6c757d'
            }}>
              <div style={{ marginBottom: '10px' }}>در حال پردازش...</div>
              <div style={{ fontSize: '12px' }}>لطفا صبر کنید</div>
            </div>
          )}

          {/* Show cancel button when changing role */}
          {showRoleChange && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={() => setShowRoleChange(false)}
                style={{
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                disabled={isLoading}
              >
                انصراف از تغییر نقش
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;