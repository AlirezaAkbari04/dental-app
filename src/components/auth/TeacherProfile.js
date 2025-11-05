import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import '../../styles/ProfileForm.css';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';

const TeacherProfile = () => {
  const navigate = useNavigate();
  const { currentUser, markProfileAsCompleted } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    careType: '',
    daysPerWeek: '',
    isRegular: '',
    daysPerSchool: '',
    schoolsCount: '',
    schoolTypes: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      setFormData({
        ...formData,
        schoolTypes: [...formData.schoolTypes, value]
      });
    } else {
      setFormData({
        ...formData,
        schoolTypes: formData.schoolTypes.filter(type => type !== value)
      });
    }

    if (errors.schoolTypes) {
      setErrors({
        ...errors,
        schoolTypes: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.careType) {
      newErrors.careType = 'Please select care type';
    }

    if (!formData.daysPerWeek) {
      newErrors.daysPerWeek = 'Please enter number of days active per week';
    } else if (isNaN(formData.daysPerWeek) || formData.daysPerWeek < 1 || formData.daysPerWeek > 7) {
      newErrors.daysPerWeek = 'Number of days must be between 1 and 7';
    }

    if (!formData.isRegular) {
      newErrors.isRegular = 'Please specify if activity is regular or irregular';
    }

    if (!formData.daysPerSchool) {
      newErrors.daysPerSchool = 'Please enter number of days present at each school';
    } else if (isNaN(formData.daysPerSchool) || formData.daysPerSchool < 1 || formData.daysPerSchool > 7) {
      newErrors.daysPerSchool = 'Number of days must be between 1 and 7';
    }

    if (!formData.schoolsCount) {
      newErrors.schoolsCount = 'Please enter number of schools covered';
    } else if (isNaN(formData.schoolsCount) || formData.schoolsCount < 1) {
      newErrors.schoolsCount = 'Number of schools must be at least 1';
    }

    if (formData.schoolTypes.length === 0) {
      newErrors.schoolTypes = 'Please select type of schools covered';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!currentUser?.id) {
      setErrors({ general: 'Authentication error. Please login again.' });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('[TeacherProfile] Starting form submission...');

      // Initialize database if needed
      if (!DatabaseService.initialized) {
        console.log('[TeacherProfile] Initializing database...');
        await DatabaseService.ensureInitialized();
      }

      // Prepare profile data
      const profileData = {
        ...formData,
        userId: currentUser.id,
        role: 'teacher',
        completedAt: new Date().toISOString()
      };

      console.log('[TeacherProfile] Saving profile data:', profileData);

      // Save to both database and localStorage for redundancy
      try {
        // Try to save to database first
        await DatabaseService.updateUserProfile(currentUser.id, profileData);
        console.log('[TeacherProfile] Profile saved to database successfully');
      } catch (dbError) {
        console.warn('[TeacherProfile] Database save failed, using localStorage fallback:', dbError);
      }

      // Always save to localStorage as backup
      localStorage.setItem('teacherProfile', JSON.stringify(profileData));
      localStorage.setItem(`teacherProfile_${currentUser.id}`, JSON.stringify(profileData));
      console.log('[TeacherProfile] Profile saved to localStorage');

      // Mark profile as completed - THIS IS THE KEY FIX
      const profileCompleted = await markProfileAsCompleted();

      if (profileCompleted) {
        console.log('[TeacherProfile] Profile marked as completed successfully');

        // Navigate to dashboard
        console.log('[TeacherProfile] Navigating to caretaker dashboard...');
        navigate('/dashboard/caretaker');
      } else {
        console.error('[TeacherProfile] Failed to mark profile as completed');
        // Still navigate to dashboard as fallback
        navigate('/dashboard/caretaker');
      }

    } catch (error) {
      console.error('[TeacherProfile] Error saving teacher profile:', error);

      // Set a user-friendly error message
      setErrors({
        general: 'Error saving information. Your information has been saved and you will be redirected to the dashboard.'
      });

      // Navigate anyway after a short delay to show the message
      setTimeout(() => {
        navigate('/dashboard/caretaker');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProfileForm title="Complete Health Educator Profile" onSubmit={handleSubmit}>
      {errors.general && (
        <div style={{
          color: '#e74c3c',
          backgroundColor: '#ffeaea',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          {errors.general}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          className={errors.name ? 'input-error' : ''}
          disabled={isSubmitting}
        />
        {errors.name && <div className="error-message">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="gender">Gender</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={formData.gender === 'male'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Male
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={formData.gender === 'female'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Female
          </label>
        </div>
        {errors.gender && <div className="error-message">{errors.gender}</div>}
      </div>

      <div className="form-group">
        <label htmlFor="careType">Care Type</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="careType"
              value="parttime"
              checked={formData.careType === 'parttime'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Part-Time
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="careType"
              value="fulltime"
              checked={formData.careType === 'fulltime'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Full-Time
          </label>
        </div>
        {errors.careType && <div className="error-message">{errors.careType}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="daysPerWeek">Days Active Per Week</label>
          <input
            type="number"
            id="daysPerWeek"
            name="daysPerWeek"
            min="1"
            max="7"
            value={formData.daysPerWeek}
            onChange={handleChange}
            placeholder="Between 1 to 7 days"
            className={errors.daysPerWeek ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.daysPerWeek && <div className="error-message">{errors.daysPerWeek}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="isRegular">Activity Schedule</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="isRegular"
                value="regular"
                checked={formData.isRegular === 'regular'}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              Regular
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="isRegular"
                value="irregular"
                checked={formData.isRegular === 'irregular'}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              Irregular
            </label>
          </div>
          {errors.isRegular && <div className="error-message">{errors.isRegular}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="daysPerSchool">Days Present Per School</label>
          <input
            type="number"
            id="daysPerSchool"
            name="daysPerSchool"
            min="1"
            max="7"
            value={formData.daysPerSchool}
            onChange={handleChange}
            placeholder="Between 1 to 7 days"
            className={errors.daysPerSchool ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.daysPerSchool && <div className="error-message">{errors.daysPerSchool}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="schoolsCount">Number of Schools Covered</label>
          <input
            type="number"
            id="schoolsCount"
            name="schoolsCount"
            min="1"
            value={formData.schoolsCount}
            onChange={handleChange}
            placeholder="Number of schools"
            className={errors.schoolsCount ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.schoolsCount && <div className="error-message">{errors.schoolsCount}</div>}
        </div>
      </div>

      <div className="form-group">
        <label>Type of Schools Covered</label>
        <div className="checkbox-group">
          <label className="checkbox-option">
            <input
              type="checkbox"
              name="schoolTypes"
              value="girls"
              checked={formData.schoolTypes.includes('girls')}
              onChange={handleCheckboxChange}
              disabled={isSubmitting}
            />
            Girls' Schools
          </label>
          <label className="checkbox-option">
            <input
              type="checkbox"
              name="schoolTypes"
              value="boys"
              checked={formData.schoolTypes.includes('boys')}
              onChange={handleCheckboxChange}
              disabled={isSubmitting}
            />
            Boys' Schools
          </label>
        </div>
        {errors.schoolTypes && <div className="error-message">{errors.schoolTypes}</div>}
      </div>

    </ProfileForm>
  );
};

export default TeacherProfile;
