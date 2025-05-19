import React, { useState, useEffect } from 'react';
import './CaretakerComponents.css';
import DatabaseService from '../../../services/DatabaseService';

const StudentsList = () => {
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
    schoolId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from database with localStorage fallback
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize database with built-in fallback
        if (!DatabaseService.initialized) {
          await DatabaseService.ensureInitialized();
        }

        // Get schools from localStorage as fallback
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
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage
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
      }
    };

    fetchData();
  }, []);

  // Filter students based on search term and selected school
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm);
    const matchesSchool = selectedSchool ? student.schoolId === selectedSchool : true;

    return matchesSearch && matchesSchool;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle adding a new student
  const handleAddStudent = async () => {
    // Simple validation
    if (!formData.name || !formData.age || !formData.grade || !formData.schoolId) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    try {
      // Create a unique ID
      const studentId = Date.now().toString();
      
      // Add school information to the student for display
      const schoolName = schools.find(s => s.id === formData.schoolId)?.name || '';

      // Create new student object
      const newStudent = {
        id: studentId,
        name: formData.name,
        age: formData.age,
        grade: formData.grade,
        schoolId: formData.schoolId,
        schoolName
      };

      // Add to students list for display
      setStudents([...students, newStudent]);

      // Add to the appropriate school in localStorage
      const updatedSchools = schools.map(school => {
        if (school.id === formData.schoolId) {
          // Add student to this school
          const updatedStudents = [...(school.students || []), {
            id: studentId,
            name: formData.name,
            age: formData.age,
            grade: formData.grade
          }];
          
          return {
            ...school,
            students: updatedStudents
          };
        }
        return school;
      });
      
      // Update schools state and localStorage
      setSchools(updatedSchools);
      localStorage.setItem('caretakerSchools', JSON.stringify(updatedSchools));

      // Reset form and close modal
      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('خطا در ایجاد دانش‌آموز. لطفاً دوباره تلاش کنید');
    }
  };

  // Handle updating a student
  const handleUpdateStudent = async () => {
    // Simple validation
    if (!formData.name || !formData.age || !formData.grade || !formData.schoolId) {
      alert('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    try {
      let updatedStudents = [...students];
      const newSchoolName = schools.find(s => s.id === formData.schoolId)?.name || '';

      // Update student in the students array
      updatedStudents = updatedStudents.map(student =>
        student.id === currentStudent.id
          ? {
              ...student,
              name: formData.name,
              age: formData.age,
              grade: formData.grade,
              schoolId: formData.schoolId,
              schoolName: newSchoolName
            }
          : student
      );

      // Update students state
      setStudents(updatedStudents);

      // Update the student in the schools array
      let updatedSchools = [...schools];
      
      // If school changed, remove from old school and add to new one
      if (currentStudent.schoolId !== formData.schoolId) {
        // Remove from old school
        updatedSchools = updatedSchools.map(school => {
          if (school.id === currentStudent.schoolId) {
            return {
              ...school,
              students: (school.students || []).filter(s => s.id !== currentStudent.id)
            };
          }
          return school;
        });
        
        // Add to new school
        updatedSchools = updatedSchools.map(school => {
          if (school.id === formData.schoolId) {
            return {
              ...school,
              students: [...(school.students || []), {
                id: currentStudent.id,
                name: formData.name,
                age: formData.age,
                grade: formData.grade
              }]
            };
          }
          return school;
        });
      } else {
        // Just update within the same school
        updatedSchools = updatedSchools.map(school => {
          if (school.id === formData.schoolId) {
            return {
              ...school,
              students: (school.students || []).map(s => 
                s.id === currentStudent.id 
                  ? {
                      ...s, 
                      name: formData.name,
                      age: formData.age,
                      grade: formData.grade
                    }
                  : s
              )
            };
          }
          return school;
        });
      }
      
      // Update schools state and localStorage
      setSchools(updatedSchools);
      localStorage.setItem('caretakerSchools', JSON.stringify(updatedSchools));

      // Reset form and close modal
      resetForm();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating student:', error);
      alert('خطا در به‌روزرسانی دانش‌آموز. لطفاً دوباره تلاش کنید');
    }
  };

  // Handle deleting a student
  const handleDeleteStudent = async (student) => {
    if (window.confirm('آیا از حذف این دانش‌آموز اطمینان دارید؟')) {
      try {
        // Remove student from school
        const updatedSchools = schools.map(school => {
          if (school.id === student.schoolId) {
            return {
              ...school,
              students: (school.students || []).filter(s => s.id !== student.id)
            };
          }
          return school;
        });

        // Update schools in localStorage
        localStorage.setItem('caretakerSchools', JSON.stringify(updatedSchools));
        setSchools(updatedSchools);

        // Remove student from list
        const updatedStudents = students.filter(s => s.id !== student.id);
        setStudents(updatedStudents);
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('خطا در حذف دانش‌آموز. لطفاً دوباره تلاش کنید');
      }
    }
  };

  // Open the edit modal with student data
  const openEditModal = (student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      age: student.age,
      grade: student.grade,
      schoolId: student.schoolId
    });
    setShowEditModal(true);
  };

  // Reset the form data
  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      grade: '',
      schoolId: selectedSchool || ''
    });
    setCurrentStudent(null);
  };

  // Format grade for display
  const formatGrade = (grade) => {
    switch (grade) {
      case 'preschool':
        return 'پیش دبستانی';
      case 'first':
        return 'کلاس اول';
      case 'second':
        return 'کلاس دوم';
      case 'third':
        return 'کلاس سوم';
      case 'fourth':
        return 'کلاس چهارم';
      case 'fifth':
        return 'کلاس پنجم';
      case 'sixth':
        return 'کلاس ششم';
      default:
        return grade;
    }
  };

  return (
    <div className="students-list-container">
      <div className="content-header">
        <h2>لیست دانش‌آموزان</h2>
        <button className="action-button" onClick={() => {
          resetForm();
          setShowAddModal(true);
        }}>
          <span className="action-icon">➕</span>
          افزودن دانش‌آموز جدید
        </button>
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
            <p>هیچ دانش‌آموزی یافت نشد. برای افزودن دانش‌آموز جدید روی دکمه «افزودن دانش‌آموز جدید» کلیک کنید.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>نام دانش‌آموز</th>
                <th>سن</th>
                <th>کلاس</th>
                <th>مدرسه</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.age} سال</td>
                  <td>{formatGrade(student.grade)}</td>
                  <td>{student.schoolName}</td>
                  <td className="table-action">
                    <span 
                      className="action-link edit-link" 
                      onClick={() => openEditModal(student)}
                    >
                      ویرایش
                    </span>
                    <span 
                      className="action-link delete-link" 
                      onClick={() => handleDeleteStudent(student)}
                    >
                      حذف
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">افزودن دانش‌آموز جدید</h3>
              <button className="close-button" onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="schoolId">مدرسه</label>
                <select
                  id="schoolId"
                  name="schoolId"
                  className="form-control"
                  value={formData.schoolId}
                  onChange={handleInputChange}
                >
                  <option value="">انتخاب مدرسه</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">نام و نام خانوادگی</label>
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
                  <label htmlFor="age">سن</label>
                  <select
                    id="age"
                    name="age"
                    className="form-control"
                    value={formData.age}
                    onChange={handleInputChange}
                  >
                    <option value="">انتخاب سن</option>
                    {[6, 7, 8, 9, 10, 11, 12].map(age => (
                      <option key={age} value={age}>
                        {age} سال
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="grade">کلاس</label>
                <select
                  id="grade"
                  name="grade"
                  className="form-control"
                  value={formData.grade}
                  onChange={handleInputChange}
                >
                  <option value="">انتخاب کلاس</option>
                  <option value="preschool">پیش دبستانی</option>
                  <option value="first">کلاس اول</option>
                  <option value="second">کلاس دوم</option>
                  <option value="third">کلاس سوم</option>
                  <option value="fourth">کلاس چهارم</option>
                  <option value="fifth">کلاس پنجم</option>
                  <option value="sixth">کلاس ششم</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}>انصراف</button>
              <button className="confirm-button" onClick={handleAddStudent}>
                افزودن دانش‌آموز
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && currentStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">ویرایش دانش‌آموز</h3>
              <button className="close-button" onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-schoolId">مدرسه</label>
                <select
                  id="edit-schoolId"
                  name="schoolId"
                  className="form-control"
                  value={formData.schoolId}
                  onChange={handleInputChange}
                >
                  <option value="">انتخاب مدرسه</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-name">نام و نام خانوادگی</label>
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
                  <label htmlFor="edit-age">سن</label>
                  <select
                    id="edit-age"
                    name="age"
                    className="form-control"
                    value={formData.age}
                    onChange={handleInputChange}
                  >
                    <option value="">انتخاب سن</option>
                    {[6, 7, 8, 9, 10, 11, 12].map(age => (
                      <option key={age} value={age}>
                        {age} سال
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-grade">کلاس</label>
                <select
                  id="edit-grade"
                  name="grade"
                  className="form-control"
                  value={formData.grade}
                  onChange={handleInputChange}
                >
                  <option value="">انتخاب کلاس</option>
                  <option value="preschool">پیش دبستانی</option>
                  <option value="first">کلاس اول</option>
                  <option value="second">کلاس دوم</option>
                  <option value="third">کلاس سوم</option>
                  <option value="fourth">کلاس چهارم</option>
                  <option value="fifth">کلاس پنجم</option>
                  <option value="sixth">کلاس ششم</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}>انصراف</button>
              <button className="confirm-button" onClick={handleUpdateStudent}>
                به‌روزرسانی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;