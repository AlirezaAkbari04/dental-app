import React, { useState, useEffect } from 'react';
import './CaretakerComponents.css';

const MySchools = () => {
  const [schools, setSchools] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentSchool, setCurrentSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'boys',
    activityDays: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Load schools from localStorage
  useEffect(() => {
    const savedSchools = JSON.parse(localStorage.getItem('caretakerSchools') || '[]');
    setSchools(savedSchools);
  }, []);
  
  // Save schools to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('caretakerSchools', JSON.stringify(schools));
  }, [schools]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle checkbox changes for activity days
  const handleDayChange = (day) => {
    const updatedDays = formData.activityDays.includes(day)
      ? formData.activityDays.filter(d => d !== day)
      : [...formData.activityDays, day];
    
    setFormData({
      ...formData,
      activityDays: updatedDays
    });
  };
  
  // Handle adding a new school
  const handleAddSchool = () => {
    // Simple validation
    if (!formData.name) {
      alert('لطفاً نام مدرسه را وارد کنید');
      return;
    }
    
    const newSchool = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      activityDays: formData.activityDays,
      students: []
    };
    
    setSchools([...schools, newSchool]);
    resetForm();
    setShowAddModal(false);
  };
  
  // Handle updating a school
  const handleUpdateSchool = () => {
    if (!formData.name) {
      alert('لطفاً نام مدرسه را وارد کنید');
      return;
    }
    
    const updatedSchools = schools.map(school => 
      school.id === currentSchool.id 
        ? {
            ...school,
            name: formData.name,
            type: formData.type,
            activityDays: formData.activityDays
          }
        : school
    );
    
    setSchools(updatedSchools);
    resetForm();
    setShowEditModal(false);
  };
  
  // Handle deleting a school
  const handleDeleteSchool = (id) => {
    if (window.confirm('آیا از حذف این مدرسه اطمینان دارید؟')) {
      const updatedSchools = schools.filter(school => school.id !== id);
      setSchools(updatedSchools);
    }
  };
  
  // Open the edit modal with school data
  const openEditModal = (school) => {
    setCurrentSchool(school);
    setFormData({
      name: school.name,
      type: school.type,
      activityDays: school.activityDays || []
    });
    setShowEditModal(true);
  };
  
  // Reset the form data
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'boys',
      activityDays: []
    });
    setCurrentSchool(null);
  };
  
  // Get days of week in Persian
  const weekDays = [
    { value: 'saturday', label: 'شنبه' },
    { value: 'sunday', label: 'یکشنبه' },
    { value: 'monday', label: 'دوشنبه' },
    { value: 'tuesday', label: 'سه‌شنبه' },
    { value: 'wednesday', label: 'چهارشنبه' },
    { value: 'thursday', label: 'پنج‌شنبه' }
  ];
  
  // Format activity days for display
  const formatActivityDays = (days) => {
    if (!days || !Array.isArray(days) || days.length === 0) return 'تعیین نشده';
    
    return days
      .map(day => weekDays.find(d => d.value === day)?.label || day)
      .join('، ');
  };
  
  // Filter and search schools
  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.includes(searchTerm);
    const matchesType = filterType === 'all' || school.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  return (
    <div className="my-schools-container">
      <div className="content-header">
        <h2>مدارس تحت پوشش</h2>
        <button className="action-button" onClick={() => setShowAddModal(true)}>
          <span className="action-icon">➕</span>
          افزودن مدرسه جدید
        </button>
      </div>
      
      <div className="filter-container">
        <input
          type="text"
          className="search-input"
          placeholder="جستجوی نام مدرسه..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className="select-filter"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">همه مدارس</option>
          <option value="boys">مدارس پسرانه</option>
          <option value="girls">مدارس دخترانه</option>
        </select>
      </div>
      
      <div className="card">
        {filteredSchools.length === 0 ? (
          <div className="empty-state">
            <p>هیچ مدرسه‌ای یافت نشد. برای افزودن مدرسه جدید روی دکمه «افزودن مدرسه جدید» کلیک کنید.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>نام مدرسه</th>
                <th>نوع مدرسه</th>
                <th>روزهای فعالیت</th>
                <th>تعداد دانش‌آموزان</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchools.map(school => (
                <tr key={school.id}>
                  <td>{school.name}</td>
                  <td>
                    {school.type === 'boys' ? 'پسرانه' : 'دخترانه'}
                  </td>
                  <td>{formatActivityDays(school.activityDays)}</td>
                  <td>{school.students ? school.students.length : 0} نفر</td>
                  <td className="table-action">
                    <span className="action-link edit-link" onClick={() => openEditModal(school)}>
                      ویرایش
                    </span>
                    <span className="action-link delete-link" onClick={() => handleDeleteSchool(school.id)}>
                      حذف
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Add School Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">افزودن مدرسه جدید</h3>
              <button className="close-button" onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">نام مدرسه</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="type">نوع مدرسه</label>
                  <select
                    id="type"
                    name="type"
                    className="form-control"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="boys">پسرانه</option>
                    <option value="girls">دخترانه</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>روزهای فعالیت</label>
                <div className="checkbox-group">
                  {weekDays.map(day => (
                    <label key={day.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.activityDays.includes(day.value)}
                        onChange={() => handleDayChange(day.value)}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}>انصراف</button>
              <button className="confirm-button" onClick={handleAddSchool}>
                افزودن مدرسه
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit School Modal */}
      {showEditModal && currentSchool && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">ویرایش مدرسه</h3>
              <button className="close-button" onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-name">نام مدرسه</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-type">نوع مدرسه</label>
                  <select
                    id="edit-type"
                    name="type"
                    className="form-control"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="boys">پسرانه</option>
                    <option value="girls">دخترانه</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>روزهای فعالیت</label>
                <div className="checkbox-group">
                  {weekDays.map(day => (
                    <label key={day.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.activityDays.includes(day.value)}
                        onChange={() => handleDayChange(day.value)}
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}>انصراف</button>
              <button className="confirm-button" onClick={handleUpdateSchool}>
                به‌روزرسانی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySchools;