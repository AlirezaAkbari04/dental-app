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
        setError('Please login first');
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
            setError('Invalid role selected');
        }
      } else {
        setError('Error selecting role. Please try again.');
      }
    } catch (error) {
      console.error("Error updating role:", error);
      setError('Error selecting role. Please try again.');
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
        case 'child': return 'Child';
        case 'parent': return 'Parent';
        case 'teacher': return 'Teacher/Health Educator';
        default: return role;
      }
    };

    return (
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="logo-container">
            <img src={logoImage} alt="Healthy Teeth Happy Smile" className="app-logo" />
            <h1 className="app-title">Healthy Teeth Happy Smile</h1>
          </div>

          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2 style={{ marginBottom: '15px', color: '#2c3e50' }}>
              Your Selected Role: {getRoleName(currentUser.role)}
            </h2>
            <p style={{ marginBottom: '20px', color: '#7f8c8d', lineHeight: '1.6' }}>
              You have already selected the <strong>{getRoleName(currentUser.role)}</strong> role.
              <br />
              You can complete your profile or change your role.
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
                Continue to Complete {getRoleName(currentUser.role)} Profile
              </button>

              <button
                className="auth-button"
                onClick={handleChangeRole}
                style={{
                  backgroundColor: '#e74c3c'
                }}
              >
                Change Role
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container" style={{ maxWidth: '500px' }}>
        <div className="logo-container">
          <img src={logoImage} alt="Healthy Teeth Happy Smile" className="app-logo" />
          <h1 className="app-title">Healthy Teeth Happy Smile</h1>
        </div>

        <div className="role-selection">
          <h2>
            {showRoleChange ? 'Select New Role' : 'Please Select Your Role'}
          </h2>
          <p className="role-instruction">
            {showRoleChange
              ? 'Choose your new role from the options below'
              : 'To continue, select your role from the options below'
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
              <span style={{ fontSize: '40px', marginRight: '20px' }}>👶</span>
              <div>
                <div style={{
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  fontSize: '18px',
                  color: '#2c3e50'
                }}>
                  Child
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#7f8c8d',
                  lineHeight: '1.4'
                }}>
                  Learn about oral health and dental care
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
              <span style={{ fontSize: '40px', marginRight: '20px' }}>👨‍⚕️</span>
              <div>
                <div style={{
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  fontSize: '18px',
                  color: '#2c3e50'
                }}>
                  Health Educator
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#7f8c8d',
                  lineHeight: '1.4'
                }}>
                  Manage oral health education for children
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
              <span style={{ fontSize: '40px', marginRight: '20px' }}>👨‍👩‍👧</span>
              <div>
                <div style={{
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  fontSize: '18px',
                  color: '#2c3e50'
                }}>
                  Parent
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#7f8c8d',
                  lineHeight: '1.4'
                }}>
                  Monitor your children's oral health
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
              <div style={{ marginBottom: '10px' }}>Processing...</div>
              <div style={{ fontSize: '12px' }}>Please wait</div>
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
                Cancel Role Change
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
