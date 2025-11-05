import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import '../../styles/ProfileForm.css';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';

const ChildProfile = () => {
  const navigate = useNavigate();
  const { currentUser, markProfileAsCompleted } = useUser();
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    grade: '',
    schoolName: '',
    educationDistrict: '',
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.age) {
      newErrors.age = 'Please select your age';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!formData.grade) {
      newErrors.grade = 'Please select your grade level';
    }

    if (!formData.schoolName) {
      newErrors.schoolName = 'Please enter your school name';
    }

    if (!formData.educationDistrict) {
      newErrors.educationDistrict = 'Please enter your education district';
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
      console.log('[ChildProfile] Starting form submission...');

      // Initialize database if needed
      if (!DatabaseService.initialized) {
        console.log('[ChildProfile] Initializing database...');
        await DatabaseService.ensureInitialized();
      }

      // Prepare profile data
      const profileData = {
        ...formData,
        userId: currentUser.id,
        role: 'child',
        completedAt: new Date().toISOString()
      };

      console.log('[ChildProfile] Saving profile data:', profileData);

      // Save to both database and localStorage for redundancy
      try {
        // Try to save to database first
        if (currentUser?.id) {
          const childId = await DatabaseService.createChild(
            currentUser.id,
            formData.name || 'Child',
            formData.age,
            formData.gender,
            null
          );

          await DatabaseService.initializeChildAchievements(childId);
          console.log('[ChildProfile] Child created and achievements initialized');
        }

        await DatabaseService.updateUserProfile(currentUser.id, profileData);
        console.log('[ChildProfile] Profile saved to database successfully');
      } catch (dbError) {
        console.warn('[ChildProfile] Database save failed, using localStorage fallback:', dbError);
      }

      // Always save to localStorage as backup
      localStorage.setItem('childProfile', JSON.stringify(profileData));
      localStorage.setItem(`childProfile_${currentUser.id}`, JSON.stringify(profileData));
      console.log('[ChildProfile] Profile saved to localStorage');

      // Mark profile as completed - THIS IS THE KEY FIX
      const profileCompleted = await markProfileAsCompleted();

      if (profileCompleted) {
        console.log('[ChildProfile] Profile marked as completed successfully');

        // Navigate to dashboard
        console.log('[ChildProfile] Navigating to child dashboard...');
        navigate('/dashboard/child');
      } else {
        console.error('[ChildProfile] Failed to mark profile as completed');
        // Still navigate to dashboard as fallback
        navigate('/dashboard/child');
      }

    } catch (error) {
      console.error('[ChildProfile] Error saving child profile:', error);

      // Set a user-friendly error message
      setErrors({
        general: 'Error saving information. Your information has been saved and you will be redirected to the dashboard.'
      });

      // Navigate anyway after a short delay to show the message
      setTimeout(() => {
        navigate('/dashboard/child');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ageOptions = [];
  for (let age = 6; age <= 12; age++) {
    ageOptions.push(
      <option key={age} value={age}>
        {age} years old
      </option>
    );
  }

  return (
    <ProfileForm title="Complete Child Profile" onSubmit={handleSubmit}>
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

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <select
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className={errors.age ? 'input-error' : ''}
            disabled={isSubmitting}
          >
            <option value="">Select</option>
            {ageOptions}
          </select>
          {errors.age && <div className="error-message">{errors.age}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="gender"
                value="boy"
                checked={formData.gender === 'boy'}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              Boy
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="gender"
                value="girl"
                checked={formData.gender === 'girl'}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              Girl
            </label>
          </div>
          {errors.gender && <div className="error-message">{errors.gender}</div>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="grade">Grade Level</label>
        <select
          id="grade"
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          className={errors.grade ? 'input-error' : ''}
          disabled={isSubmitting}
        >
          <option value="">Select</option>
          <option value="preschool">Preschool</option>
          <option value="first">First Grade</option>
          <option value="second">Second Grade</option>
          <option value="third">Third Grade</option>
          <option value="fourth">Fourth Grade</option>
          <option value="fifth">Fifth Grade</option>
          <option value="sixth">Sixth Grade</option>
        </select>
        {errors.grade && <div className="error-message">{errors.grade}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="schoolName">School Name</label>
          <input
            type="text"
            id="schoolName"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleChange}
            placeholder="Enter your school name"
            className={errors.schoolName ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.schoolName && <div className="error-message">{errors.schoolName}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="educationDistrict">Education District</label>
          <input
            type="text"
            id="educationDistrict"
            name="educationDistrict"
            value={formData.educationDistrict}
            onChange={handleChange}
            placeholder="Education district"
            className={errors.educationDistrict ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.educationDistrict && <div className="error-message">{errors.educationDistrict}</div>}
        </div>
      </div>

      <div className="achievements-section">
        <h3 className="section-title">Points and Achievements</h3>
        <div className="achievements-display">
          <p>After registration and starting activities in the app, your points and medals will be displayed in this section.</p>
        </div>
      </div>

    </ProfileForm>
  );
};

export default ChildProfile;
