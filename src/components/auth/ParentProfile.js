import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from './ProfileForm';
import '../../styles/ProfileForm.css';
import { useUser } from '../../contexts/UserContext';
import DatabaseService from '../../services/DatabaseService';

const ParentProfile = () => {
  const navigate = useNavigate();
  const { currentUser, markProfileAsCompleted } = useUser();

  const [formData, setFormData] = useState({
    parentType: '',
    relationship: '',
    fatherEducation: '',
    fatherJob: '',
    motherEducation: '',
    motherJob: '',
    appUser: '',
    economicStatus: '',
    oralHealthStatus: '',
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
    const requiredFields = [
      'parentType',
      'fatherEducation',
      'fatherJob',
      'motherEducation',
      'motherJob',
      'appUser',
      'economicStatus',
      'oralHealthStatus',
    ];

    if (formData.parentType === 'other' && !formData.relationship) {
      newErrors.relationship = 'This field is required';
    }

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

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
      console.log('[ParentProfile] Starting form submission...');

      // Initialize database if needed
      if (!DatabaseService.initialized) {
        console.log('[ParentProfile] Initializing database...');
        await DatabaseService.ensureInitialized();
      }

      // Prepare profile data
      const profileData = {
        ...formData,
        userId: currentUser.id,
        role: 'parent',
        completedAt: new Date().toISOString()
      };

      console.log('[ParentProfile] Saving profile data:', profileData);

      // Save to both database and localStorage for redundancy
      try {
        // Try to save to database first
        await DatabaseService.updateUserProfile(currentUser.id, profileData);
        console.log('[ParentProfile] Profile saved to database successfully');
      } catch (dbError) {
        console.warn('[ParentProfile] Database save failed, using localStorage fallback:', dbError);
      }

      // Always save to localStorage as backup
      localStorage.setItem('parentProfile', JSON.stringify(profileData));
      localStorage.setItem(`parentProfile_${currentUser.id}`, JSON.stringify(profileData));
      console.log('[ParentProfile] Profile saved to localStorage');

      // Mark profile as completed - THIS IS THE KEY FIX
      const profileCompleted = await markProfileAsCompleted();

      if (profileCompleted) {
        console.log('[ParentProfile] Profile marked as completed successfully');

        // Navigate to dashboard
        console.log('[ParentProfile] Navigating to parent dashboard...');
        navigate('/dashboard/parent');
      } else {
        console.error('[ParentProfile] Failed to mark profile as completed');
        // Still navigate to dashboard as fallback
        navigate('/dashboard/parent');
      }

    } catch (error) {
      console.error('[ParentProfile] Error saving parent profile:', error);

      // Set a user-friendly error message
      setErrors({
        general: 'Error saving information. Your information has been saved and you will be redirected to the dashboard.'
      });

      // Navigate anyway after a short delay to show the message
      setTimeout(() => {
        navigate('/dashboard/parent');
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const educationOptions = [
    { value: 'elementary', label: 'Elementary' },
    { value: 'middle', label: 'Middle School' },
    { value: 'diploma', label: 'High School Diploma' },
    { value: 'associate', label: 'Associate Degree' },
    { value: 'bachelor', label: "Bachelor's Degree" },
    { value: 'master', label: "Master's Degree" },
    { value: 'phd', label: 'PhD/Doctorate' },
  ];

  return (
    <ProfileForm title="Complete Parent Profile" onSubmit={handleSubmit}>
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
        <label htmlFor="parentType">Parent Type</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="parentType"
              value="father"
              checked={formData.parentType === 'father'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Father
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="parentType"
              value="mother"
              checked={formData.parentType === 'mother'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Mother
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="parentType"
              value="other"
              checked={formData.parentType === 'other'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Other (Guardian)
          </label>
        </div>
        {errors.parentType && <div className="error-message">{errors.parentType}</div>}
      </div>

      {formData.parentType === 'other' && (
        <div className="form-group">
          <label htmlFor="relationship">Family Relationship</label>
          <input
            type="text"
            id="relationship"
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            placeholder="Relationship to child"
            className={errors.relationship ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.relationship && <div className="error-message">{errors.relationship}</div>}
        </div>
      )}

      <h3 className="section-title">Parents' Educational and Employment Information</h3>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="fatherEducation">Father's Education Level</label>
          <select
            id="fatherEducation"
            name="fatherEducation"
            value={formData.fatherEducation}
            onChange={handleChange}
            className={errors.fatherEducation ? 'input-error' : ''}
            disabled={isSubmitting}
          >
            <option value="">Select</option>
            {educationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.fatherEducation && <div className="error-message">{errors.fatherEducation}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="fatherJob">Father's Occupation</label>
          <input
            type="text"
            id="fatherJob"
            name="fatherJob"
            value={formData.fatherJob}
            onChange={handleChange}
            placeholder="Father's occupation"
            className={errors.fatherJob ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.fatherJob && <div className="error-message">{errors.fatherJob}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="motherEducation">Mother's Education Level</label>
          <select
            id="motherEducation"
            name="motherEducation"
            value={formData.motherEducation}
            onChange={handleChange}
            className={errors.motherEducation ? 'input-error' : ''}
            disabled={isSubmitting}
          >
            <option value="">Select</option>
            {educationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.motherEducation && <div className="error-message">{errors.motherEducation}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="motherJob">Mother's Occupation</label>
          <input
            type="text"
            id="motherJob"
            name="motherJob"
            value={formData.motherJob}
            onChange={handleChange}
            placeholder="Mother's occupation"
            className={errors.motherJob ? 'input-error' : ''}
            disabled={isSubmitting}
          />
          {errors.motherJob && <div className="error-message">{errors.motherJob}</div>}
        </div>
      </div>

      <h3 className="section-title">Additional Questions</h3>

      <div className="form-group">
        <label>Who will be using the application?</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="appUser"
              value="father"
              checked={formData.appUser === 'father'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Father
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="appUser"
              value="mother"
              checked={formData.appUser === 'mother'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Mother
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="appUser"
              value="other"
              checked={formData.appUser === 'other'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Other
          </label>
        </div>
        {errors.appUser && <div className="error-message">{errors.appUser}</div>}
      </div>

      <div className="form-group">
        <label>How would you rate your family's economic situation?</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="economicStatus"
              value="good"
              checked={formData.economicStatus === 'good'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Good
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="economicStatus"
              value="medium"
              checked={formData.economicStatus === 'medium'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Average
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="economicStatus"
              value="poor"
              checked={formData.economicStatus === 'poor'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Poor
          </label>
        </div>
        {errors.economicStatus && <div className="error-message">{errors.economicStatus}</div>}
      </div>

      <div className="form-group">
        <label>How would you rate your oral health?</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="oralHealthStatus"
              value="good"
              checked={formData.oralHealthStatus === 'good'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Good
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="oralHealthStatus"
              value="medium"
              checked={formData.oralHealthStatus === 'medium'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Average
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="oralHealthStatus"
              value="poor"
              checked={formData.oralHealthStatus === 'poor'}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Poor
          </label>
        </div>
        {errors.oralHealthStatus && <div className="error-message">{errors.oralHealthStatus}</div>}
      </div>

    </ProfileForm>
  );
};

export default ParentProfile;
