import React, { useState, useEffect } from 'react';
import './CaretakerComponents.css';

const HealthReports = () => {
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    hasBrushed: false,
    hasCavity: false,
    hasHealthyGums: true,
    score: 5,
    notes: '',
    warningFlags: {
      brokenTooth: false,
      severePain: false,
      abscess: false,
      bleeding: false,
      feverWithPain: false
    },
    needsReferral: false,
    referralNotes: ''
  });
  
  // Load data from localStorage
  useEffect(() => {
    const savedSchools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
    setSchools(savedSchools);
    
    // Extract all students from all schools
    const allStudents = [];
    savedSchools.forEach(school => {
      if (school.students && Array.isArray(school.students)) {
        school.students.forEach(student => {
          allStudents.push({
            ...student,
            schoolId: school.id,
            schoolName: school.name
          });
        });
      }
    });
    
    setStudents(allStudents);
  }, []);
  
  // Filter students based on search term and selected school
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm);
    const matchesSchool = selectedSchool ? student.schoolId === selectedSchool : true;
    
    return matchesSearch && matchesSchool;
  });
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name.startsWith('warningFlags.')) {
        const flagName = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          warningFlags: {
            ...prev.warningFlags,
            [flagName]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Check for any warning flags being set
  useEffect(() => {
    const hasAnyWarningFlag = Object.values(formData.warningFlags).some(flag => flag);
    
    if (hasAnyWarningFlag && !formData.needsReferral) {
      setFormData(prev => ({
        ...prev,
        needsReferral: true
      }));
    }
  }, [formData.warningFlags]);
  
  // Open the report modal for a student
  const openReportModal = (student) => {
    setCurrentStudent(student);
    
    // Initialize form with today's date and defaults
    const today = new Date().toISOString().split('T')[0];
    
    // If student has health records, pre-fill with the most recent one
    if (student.healthRecords && student.healthRecords.length > 0) {
      const latestRecord = student.healthRecords[0];
      setFormData({
        date: today,
        hasBrushed: latestRecord.hasBrushed || false,
        hasCavity: latestRecord.hasCavity || false,
        hasHealthyGums: latestRecord.hasHealthyGums !== false, // Default to true if not specifically false
        score: latestRecord.score || 5,
        notes: '',
        warningFlags: latestRecord.warningFlags || {
          brokenTooth: false,
          severePain: false,
          abscess: false,
          bleeding: false,
          feverWithPain: false
        },
        needsReferral: latestRecord.needsReferral || false,
        referralNotes: ''
      });
    } else {
      // Reset to defaults for new record
      setFormData({
        date: today,
        hasBrushed: false,
        hasCavity: false,
        hasHealthyGums: true,
        score: 5,
        notes: '',
        warningFlags: {
          brokenTooth: false,
          severePain: false,
          abscess: false,
          bleeding: false,
          feverWithPain: false
        },
        needsReferral: false,
        referralNotes: ''
      });
    }
    
    setShowReportModal(true);
  };
  
  // Save the health report
  const saveHealthReport = () => {
    if (!formData.date) {
      alert('لطفاً تاریخ بررسی را وارد کنید');
      return;
    }
    
    // Create the health record object
    const healthRecord = {
      id: Date.now().toString(),
      date: formData.date,
      hasBrushed: formData.hasBrushed,
      hasCavity: formData.hasCavity,
      hasHealthyGums: formData.hasHealthyGums,
      score: formData.score,
      notes: formData.notes,
      warningFlags: formData.warningFlags,
      needsReferral: formData.needsReferral,
      referralNotes: formData.referralNotes
    };
    
    // Update schools and students with the new health record
    const updatedSchools = schools.map(school => {
      if (school.id === currentStudent.schoolId) {
        const updatedStudents = school.students.map(student => {
          if (student.id === currentStudent.id) {
            return {
              ...student,
              healthRecords: [healthRecord, ...(student.healthRecords || [])]
            };
          }
          return student;
        });
        
        return {
          ...school,
          students: updatedStudents
        };
      }
      return school;
    });
    
    // Save updated schools to localStorage
    localStorage.setItem('caretakerSchools', JSON.stringify(updatedSchools));
    setSchools(updatedSchools);
    
    // Update students state with the new health record
    const updatedStudents = students.map(student => {
      if (student.id === currentStudent.id) {
        return {
          ...student,
          healthRecords: [healthRecord, ...(student.healthRecords || [])]
        };
      }
      return student;
    });
    setStudents(updatedStudents);
    
    // Close the modal
    setShowReportModal(false);
    setCurrentStudent(null);
  };
  
  // Generate a PDF report
  const generatePDF = (student) => {
    // In a real app, this would generate a PDF report
    alert(`در یک برنامه واقعی، گزارش PDF برای ${student.name} تولید می‌شود.`);
  };
  
  // Get the latest health status for a student
  const getLatestHealthStatus = (student) => {
    if (!student.healthRecords || student.healthRecords.length === 0) {
      return 'بررسی نشده';
    }
    
    const latest = student.healthRecords[0];
    
    if (latest.needsReferral) {
      return 'نیاز به ارجاع';
    } else if (latest.hasCavity) {
      return 'دارای پوسیدگی';
    } else if (!latest.hasHealthyGums) {
      return 'مشکل لثه';
    } else if (!latest.hasBrushed) {
      return 'مسواک نزده';
    } else {
      return 'سالم';
    }
  };
  
  // Get health status class for styling
  const getHealthStatusClass = (status) => {
    switch (status) {
      case 'نیاز به ارجاع':
        return 'status-error';
      case 'دارای پوسیدگی':
      case 'مشکل لثه':
      case 'مسواک نزده':
        return 'status-warning';
      case 'سالم':
        return 'status-success';
      default:
        return 'status-info';
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  return (
    <div className="health-reports-container">
      <div className="content-header">
        <h2>گزارش سلامت دهان و دندان</h2>
      </div>
      
      <div className="filter-container">
        <input
          type="text"
          className="search-input"
          placeholder="جستجوی نام دانش‌آموز..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="select-filter"
          value={selectedSchool}
          onChange={(e) => setSelectedSchool(e.target.value)}
        >
          <option value="">همه مدارس</option>
          {schools.map(school => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="card">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <p>هیچ دانش‌آموزی یافت نشد.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>نام دانش‌آموز</th>
                <th>سن</th>
                <th>کلاس</th>
                <th>مدرسه</th>
                <th>آخرین بررسی</th>
                <th>وضعیت سلامت</th>
                <th>امتیاز (از 10)</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const hasRecords = student.healthRecords && student.healthRecords.length > 0;
                const latestRecord = hasRecords ? student.healthRecords[0] : null;
                const healthStatus = getLatestHealthStatus(student);
                
                return (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.age} سال</td>
                    <td>{student.grade === 'preschool' ? 'پیش دبستانی' : `کلاس ${student.grade}`}</td>
                    <td>{student.schoolName}</td>
                    <td>{hasRecords ? formatDate(latestRecord.date) : '---'}</td>
                    <td>
                      <span className={`status-badge ${getHealthStatusClass(healthStatus)}`}>
                        {healthStatus}
                      </span>
                    </td>
                    <td>{hasRecords ? latestRecord.score : '---'}</td>
                    <td className="table-action">
                      <span 
                        className="action-link view-link" 
                        onClick={() => openReportModal(student)}
                      >
                        ثبت بررسی
                      </span>
                      {hasRecords && (
                        <span 
                          className="action-link edit-link" 
                          onClick={() => generatePDF(student)}
                        >
                          چاپ گزارش
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Health Report Modal */}
      {showReportModal && currentStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">گزارش سلامت دهان و دندان: {currentStudent.name}</h3>
              <button className="close-button" onClick={() => setShowReportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">تاریخ بررسی</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasBrushed"
                      checked={formData.hasBrushed}
                      onChange={handleInputChange}
                    />
                    مسواک زده؟
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasCavity"
                      checked={formData.hasCavity}
                      onChange={handleInputChange}
                    />
                    پوسیدگی دارد؟
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="hasHealthyGums"
                      checked={formData.hasHealthyGums}
                      onChange={handleInputChange}
                    />
                    سلامت لثه؟
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="score">امتیاز سلامت دهان (از 1 تا 10)</label>
                <input
                  type="range"
                  id="score"
                  name="score"
                  min="1"
                  max="10"
                  className="form-control"
                  value={formData.score}
                  onChange={handleInputChange}
                />
                <div className="range-value">{formData.score}</div>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">یادداشت‌های بررسی</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="توضیحات تکمیلی درباره وضعیت دهان و دندان دانش‌آموز..."
                ></textarea>
              </div>
              
              <div className="warning-flags-section">
                <h4>علائم هشداردهنده (ارجاع فوری به دندانپزشک)</h4>
                <div className="checkbox-group warning-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.brokenTooth"
                      checked={formData.warningFlags.brokenTooth}
                      onChange={handleInputChange}
                    />
                    دندان شکسته
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.severePain"
                      checked={formData.warningFlags.severePain}
                      onChange={handleInputChange}
                    />
                    درد شدید
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.abscess"
                      checked={formData.warningFlags.abscess}
                      onChange={handleInputChange}
                    />
                    آبسه یا ورم چرکی
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.bleeding"
                      checked={formData.warningFlags.bleeding}
                      onChange={handleInputChange}
                    />
                    خونریزی لثه
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="warningFlags.feverWithPain"
                      checked={formData.warningFlags.feverWithPain}
                      onChange={handleInputChange}
                    />
                    تب همراه با درد دهان
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="needsReferral"
                    checked={formData.needsReferral}
                    onChange={handleInputChange}
                  />
                  <strong>نیاز به ارجاع فوری به دندانپزشک</strong>
                </label>
              </div>
              
              {formData.needsReferral && (
                <div className="form-group">
                  <label htmlFor="referralNotes">توضیحات ارجاع</label>
                  <textarea
                    id="referralNotes"
                    name="referralNotes"
                    className="form-control"
                    value={formData.referralNotes}
                    onChange={handleInputChange}
                    placeholder="توضیحات درباره دلیل ارجاع به دندانپزشک..."
                  ></textarea>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowReportModal(false)}>انصراف</button>
              <button className="confirm-button" onClick={saveHealthReport}>
                ثبت گزارش
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthReports;