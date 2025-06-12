import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutUs.css';

const AboutUs = () => {
  const navigate = useNavigate();
  
  // کاربر از کدام داشبورد آمده است
  const userRole = localStorage.getItem('userRole') || 'child';
  
  // برگشت به داشبورد مناسب بر اساس نقش کاربر
  const handleBackToDashboard = () => {
    switch (userRole) {
      case 'parent':
        navigate('/parent-dashboard');
        break;
      case 'teacher':
        navigate('/caretaker-dashboard');
        break;
      default:
        navigate('/child-dashboard');
        break;
    }
  };

  return (
    <div className="about-us-container">
      <header className="about-us-header">
        <div className="logo-container">
          <img 
            src="/assets/images/logo.png" 
            alt="دندان سالم لبخند شاد" 
            className="about-logo"
            onError={(e) => {
              console.warn('Failed to load logo, trying alternative');
              e.target.src = "/logo.png";
            }}
          />
          <span className="app-name">دندان سالم لبخند شاد</span>
        </div>
        <button onClick={handleBackToDashboard} className="back-button">
          بازگشت به داشبورد
        </button>
      </header>

      <main className="about-us-content">
        <section className="about-section">
          <h2 className="section-title">درباره این پروژه</h2>
          <div className="section-content">
            <h3>عنوان پایان نامه:</h3>
            <p>طراحی و ارزیابی برنامه کاربردی مبتنی بر موبایل جهت آموزش سلامت دهان به مربیان، والدین و کودکان</p>
          </div>
        </section>

        <section className="about-section">
          <h2 className="section-title">اطلاعات تحصیلی</h2>
          <div className="section-content">
            <div className="info-grid">
              <div className="info-item">
                <span className="label">مقطع:</span>
                <span className="value">کارشناسی ارشد</span>
              </div>
              <div className="info-item">
                <span className="label">دانشکده:</span>
                <span className="value">پیراپزشکی دانشگاه علوم پزشکی تهران</span>
              </div>
              <div className="info-item">
                <span className="label">رشته:</span>
                <span className="value">فناوری اطلاعات سلامت</span>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <div className="section-content">
            <div className="team-grid">
              <div className="team-member">
                <span className="role">دانشجو:</span>
                <span className="name">معصومه رضایی سارسری</span>
              </div>
              <div className="team-member">
                <span className="role">اساتید راهنما:</span>
                <span className="name">دکتر لیلا شاهمرادی، دکتر افسانه پاکدامن</span>
              </div>
              <div className="team-member">
                <span className="role">اساتید مشاور:</span>
                <span className="name">دکتر گلی ارجی، دکتر جبرئیل فرضی</span>
              </div>
              <div className="team-member">
                <span className="role">مجری طرح:</span>
                <span className="name">دکتر افسانه پاکدامن</span>
              </div>
              <div className="team-member">
                <span className="role">طراح:</span>
                <span className="name">یکتا جامی</span>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="section-title">مشخصات طرح پژوهشی</h2>
          <div className="section-content">
            <div className="research-info">
              <p>طرح پژوهشی مصوب در مرکز تحقیقات پیشگیری پوسیدگی</p>
              <div className="codes-grid">
                <div className="code-item">
                  <span className="code-label">کد طرح:</span>
                  <span className="code-value">1404-1-234-90808</span>
                </div>
                <div className="code-item">
                  <span className="code-label">کد اخلاق:</span>
                  <span className="code-value">IR.TUMS.SPH.REC.1403.063</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2 className="section-title">ارتباط با ما</h2>
          <div className="section-content">
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <span className="contact-text">Coh1.tums@gmail.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span className="contact-text">02188015960</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="about-us-footer">
        <p>دندان سالم لبخند شاد &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default AboutUs;