import React, { useState, useEffect } from 'react';
import './CaretakerComponents.css';

const ParentMessages = () => {
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sentMessages, setSentMessages] = useState([]);
  
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
    
    // Load sent messages history
    const savedMessages = JSON.parse(localStorage.getItem('sentMessages') || '[]');
    setSentMessages(savedMessages);
  }, []);
  
  // Filter students based on search term and selected school
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.includes(searchTerm);
    const matchesSchool = selectedSchool ? student.schoolId === selectedSchool : true;
    
    return matchesSearch && matchesSchool;
  });
  
  // Predefined message templates
  const messageTemplates = [
    {
      id: 'toothbrush',
      title: 'توصیه تعویض مسواک',
      text: 'والد گرامی، توصیه می‌شود که مسواک کودک هر 3 ماه یکبار تعویض شود. لطفاً بررسی کنید که آیا زمان تعویض مسواک فرزندتان فرا رسیده است.'
    },
    {
      id: 'dental_visit',
      title: 'ضرورت مراجعه دوره‌ای',
      text: 'والد گرامی، مراجعه به دندانپزشک هر 6 ماه یکبار برای معاینه دوره‌ای دندان‌های کودک ضروری است. لطفاً جهت هماهنگی وقت معاینه اقدام نمایید.'
    },
    {
      id: 'healthy_food',
      title: 'تغذیه سالم برای دندان',
      text: 'والد گرامی، برای سلامت دندان‌های کودک، استفاده از میوه و سبزیجات تازه، محدود کردن مصرف شیرینی‌جات و نوشابه‌ها، و مصرف منظم لبنیات توصیه می‌شود.'
    },
    {
      id: 'brushing_reminder',
      title: 'یادآوری مسواک زدن',
      text: 'والد گرامی، لطفاً نظارت کنید که فرزندتان روزی دو بار (صبح و شب) و هر بار به مدت حداقل 2 دقیقه مسواک بزند و از نخ دندان استفاده کند.'
    },
    {
      id: 'fluoride',
      title: 'استفاده از فلوراید',
      text: 'والد گرامی، استفاده از خمیردندان حاوی فلوراید برای پیشگیری از پوسیدگی دندان بسیار مؤثر است. لطفاً از خمیردندان مناسب سن کودک و حاوی فلوراید استفاده کنید.'
    },
    {
      id: 'custom',
      title: 'پیام سفارشی',
      text: ''
    }
  ];
  
  // Handle checkbox selection change
  const handleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };
  
  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };
  
  // Open send message modal
  const openSendModal = () => {
    if (selectedStudents.length === 0) {
      alert('لطفاً حداقل یک دانش‌آموز را انتخاب کنید.');
      return;
    }
    
    setSelectedMessage(messageTemplates[0].id);
    setCustomMessage('');
    setShowSendModal(true);
  };
  
  // Handle message template selection
  const handleMessageSelection = (e) => {
    setSelectedMessage(e.target.value);
    
    // If not custom message, clear custom message field
    if (e.target.value !== 'custom') {
      setCustomMessage('');
    }
  };
  
  // Handle custom message input
  const handleCustomMessageChange = (e) => {
    setCustomMessage(e.target.value);
  };
  
  // Send messages to selected students' parents
  const handleSendMessages = () => {
    // Get the message text
    let messageText = '';
    if (selectedMessage === 'custom') {
      messageText = customMessage;
      if (!messageText.trim()) {
        alert('لطفاً متن پیام سفارشی را وارد کنید.');
        return;
      }
    } else {
      const template = messageTemplates.find(template => template.id === selectedMessage);
      messageText = template ? template.text : '';
    }
    
    // Get selected students data
    const recipientStudents = students.filter(student => selectedStudents.includes(student.id));
    
    // Create message record
    const newMessage = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      messageType: selectedMessage,
      messageText: messageText,
      recipients: recipientStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        schoolId: student.schoolId,
        schoolName: student.schoolName
      }))
    };
    
    // Add to sent messages history
    const updatedMessages = [newMessage, ...sentMessages];
    setSentMessages(updatedMessages);
    localStorage.setItem('sentMessages', JSON.stringify(updatedMessages));
    
    // In a real app, this would send messages to parents
    alert(`پیام به والدین ${recipientStudents.length} دانش‌آموز ارسال شد.`);
    
    // Close modal and reset selections
    setShowSendModal(false);
    setSelectedStudents([]);
  };
  
  // Get message title by ID
  const getMessageTitle = (messageId) => {
    const template = messageTemplates.find(template => template.id === messageId);
    return template ? template.title : 'پیام سفارشی';
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  return (
    <div className="parent-messages-container">
      <div className="content-header">
        <h2>ارسال پیام آموزشی به والدین</h2>
        <button 
          className="action-button"
          onClick={openSendModal}
          disabled={selectedStudents.length === 0}
        >
          <span className="action-icon">✉️</span>
          ارسال پیام
        </button>
      </div>
      
      <div className="messages-section">
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
          <div className="students-selection">
            <div className="select-all-container">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                انتخاب همه
              </label>
              <span className="selected-count">
                {selectedStudents.length} دانش‌آموز انتخاب شده
              </span>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th className="checkbox-column"></th>
                  <th>نام دانش‌آموز</th>
                  <th>سن</th>
                  <th>کلاس</th>
                  <th>مدرسه</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table-message">هیچ دانش‌آموزی یافت نشد.</td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentSelection(student.id)}
                        />
                      </td>
                      <td>{student.name}</td>
                      <td>{student.age} سال</td>
                      <td>{student.grade === 'preschool' ? 'پیش دبستانی' : `کلاس ${student.grade}`}</td>
                      <td>{student.schoolName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="message-templates-section">
        <h3 className="section-title">قالب‌های پیام آماده</h3>
        <div className="templates-container">
          {messageTemplates.filter(template => template.id !== 'custom').map(template => (
            <div key={template.id} className="template-card" onClick={() => {
              setSelectedMessage(template.id);
              setShowSendModal(true);
            }}>
              <h4 className="template-title">{template.title}</h4>
              <p className="template-text">{template.text}</p>
              <div className="template-actions">
                <button className="copy-button" onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(template.text)
                    .then(() => alert('متن پیام کپی شد'))
                    .catch(err => console.error('خطا در کپی متن:', err));
                }}>
                  کپی متن
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {sentMessages.length > 0 && (
        <div className="sent-messages-section">
          <h3 className="section-title">تاریخچه پیام‌های ارسال شده</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>تاریخ ارسال</th>
                <th>نوع پیام</th>
                <th>تعداد گیرندگان</th>
                <th>مدارس</th>
              </tr>
            </thead>
            <tbody>
              {sentMessages.map(message => (
                <tr key={message.id}>
                  <td>{formatDate(message.date)}</td>
                  <td>{getMessageTitle(message.messageType)}</td>
                  <td>{message.recipients.length} نفر</td>
                  <td>
                    {Array.from(new Set(message.recipients.map(r => r.schoolName))).join('، ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Send Message Modal */}
      {showSendModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">ارسال پیام به والدین</h3>
              <button className="close-button" onClick={() => setShowSendModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="recipients-count">
                این پیام برای والدین {selectedStudents.length} دانش‌آموز ارسال خواهد شد.
              </p>
              
              <div className="form-group">
                <label htmlFor="messageType">انتخاب نوع پیام</label>
                <select
                  id="messageType"
                  className="form-control"
                  value={selectedMessage}
                  onChange={handleMessageSelection}
                >
                  {messageTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.title}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedMessage === 'custom' ? (
                <div className="form-group">
                  <label htmlFor="customMessage">متن پیام سفارشی</label>
                  <textarea
                    id="customMessage"
                    className="form-control"
                    value={customMessage}
                    onChange={handleCustomMessageChange}
                    placeholder="متن پیام خود را وارد کنید..."
                    rows="5"
                  ></textarea>
                </div>
              ) : (
                <div className="form-group">
                  <label>پیش‌نمایش پیام</label>
                  <div className="message-preview">
                    {messageTemplates.find(template => template.id === selectedMessage)?.text || ''}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowSendModal(false)}>انصراف</button>
              <button className="confirm-button" onClick={handleSendMessages}>
                ارسال پیام
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentMessages;