import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FAQ.css';

const FAQ = () => {
  const navigate = useNavigate();
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  
  // کاربر از کدام داشبورد آمده است
  const userRole = localStorage.getItem('userRole') || 'child';
  
  // بررسی اینکه آیا سوال باز است یا خیر
  const isQuestionExpanded = (id) => expandedQuestions.includes(id);
  
  // باز و بسته کردن سوالات
  const toggleQuestion = (id) => {
    if (isQuestionExpanded(id)) {
      setExpandedQuestions(expandedQuestions.filter(qId => qId !== id));
    } else {
      setExpandedQuestions([...expandedQuestions, id]);
    }
  };
  
  // برگشت به داشبورد مناسب بر اساس نقش کاربر
  const handleBack = () => {
    switch (userRole) {
      case 'parent':
        navigate('/dashboard/parent');
        break;
      case 'teacher':
        navigate('/dashboard/caretaker');
        break;
      default:
        navigate('/dashboard/child');
        break;
    }
  };

  return (
    <div className="faq-container">
      <header className="faq-header">
        <div className="logo-container">
          <img 
            src="/assets/images/logo.png" 
            alt="لبخند شاد دندان سالم" 
            className="faq-logo"
            onError={(e) => {
              console.warn('Failed to load logo, trying alternative');
              e.target.src = "/logo.png";
            }}
          />
          <span className="app-name">لبخند شاد دندان سالم</span>
        </div>
        <button onClick={handleBack} className="back-button">
          بازگشت به داشبورد
        </button>
      </header>

      <main className="faq-content">
        <section className="guide-section">
          <h2 className="section-title">راهنمای استفاده از اپلیکیشن</h2>
          
          <div className="guide-steps">
            <div className="guide-step">
              <h3>۱. شروع کار با اپلیکیشن</h3>
              <p>با شماره موبایل یا ایمیل ثبت‌نام کنید و نقش خود را به‌عنوان کودک، والد یا مربی سلامت انتخاب کنید.</p>
            </div>
            
            <div className="guide-step">
              <h3>۲. تکمیل اطلاعات کاربری</h3>
              <p>با توجه به نقش انتخاب‌شده، اطلاعات لازم مثل نام، سن، جنسیت، شغل، نوع مراقبت و مشخصات مدرسه را وارد کنید.</p>
            </div>
            
            <div className="guide-step">
              <h3>۳. یادآوری‌ها برای مسواک زدن</h3>
              <p>هشدارهای صبح و شب را فعال کنید تا کودک زمان مسواک زدن را فراموش نکند.</p>
            </div>
            
            <div className="guide-step">
              <h3>۴. محتوای آموزشی</h3>
              <p>ویدیوها و اینفوگرافی‌های مربوط به دندان‌های شیری، تغذیه سالم، نحوه صحیح مسواک زدن و فواید فلوراید را مشاهده کنید.</p>
            </div>
            
            <div className="guide-step">
              <h3>۵. تشویق کودک با امتیاز و بازی</h3>
              <p>کودک با مسواک زدن منظم و انتخاب خوراکی‌های سالم، امتیاز یا ستاره می‌گیرد و تجربه‌ای شادتر خواهد داشت.</p>
            </div>
            
            <div className="guide-step">
              <h3>۶. پرسشنامه‌ها</h3>
              <p>والدین یا سرپرست می‌توانند پرسشنامه‌های مربوط به عادات غذایی و دانش بهداشتی را تکمیل کنند.</p>
            </div>
            
            <div className="guide-step">
              <h3>۷. بخش ارجاع فوری</h3>
              <p>مربی سلامت در صورت مشاهده علائم هشداردهنده، مانند پوسیدگی یا درد دندان، کودک را به دندانپزشک ارجاع می‌دهد.</p>
            </div>
            
            <div className="guide-step">
              <h3>۸. بررسی وضعیت کودک</h3>
              <ul>
                <li><strong>والدین</strong> می‌توانند عادت‌های غذایی و بهداشت کودک را ثبت و گزارش دریافت کنند.</li>
                <li><strong>مربی سلامت</strong> وضعیت دندان‌های کودک را بررسی می‌کند، امتیاز بهداشتی می‌دهد و در صورت نیاز ارجاع ثبت می‌کند.</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section className="faq-section">
          <h2 className="section-title">سؤالات متداول</h2>
          
          <div className="faq-list">
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(1) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(1)}
              >
                <h3>۱. این اپلیکیشن برای چه کسانی طراحی شده؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(1) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(1) && (
                <div className="faq-answer">
                  <p>برای کودکان، والدین و مربیان سلامت جهت آموزش و پیگیری سلامت دهان.</p>
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(2) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(2)}
              >
                <h3>۲. آیا نیاز به اینترنت دارد؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(2) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(2) && (
                <div className="faq-answer">
                  <p>خیر، اپلیکیشن به‌صورت آفلاین کار می‌کند.</p>
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(3) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(3)}
              >
                <h3>۳. چگونه می‌توانم روند مسواک زدن کودک را پیگیری کنم؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(3) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(3) && (
                <div className="faq-answer">
                  <p>والدین می‌توانند فعالیت‌های روزانه کودک را ثبت کرده و گزارش تهیه کنند.</p>
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(4) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(4)}
              >
                <h3>۴. آیا ویدیوها و فایل‌های آموزشی موجود در اپلیکیشن معتبر هستند؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(4) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(4) && (
                <div className="faq-answer">
                  <p>بله، تمام ویدیوهای آموزشی و فایل‌های PDF اپلیکیشن از منابع معتبر علمی و دانشگاهی تهیه شده‌اند و اطلاعات دقیق درباره پوسیدگی دندان، اهمیت دندان‌های شیری، تغذیه و مراقبت‌های لازم را ارائه می‌دهند.</p>
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(5) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(5)}
              >
                <h3>۵. چرا اهمیت مراقبت از دندان‌های کودک من مهم است؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(5) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(5) && (
                <div className="faq-answer">
                  <p>مراقبت صحیح از دندان‌های کودک شما کمک می‌کند از پوسیدگی، بیماری‌های لثه و مشکلات دهانی جلوگیری کنید و در نتیجه دهان سالم و لبخندی زیبا برای کودک‌تان داشته باشید.</p>
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(6) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(6)}
              >
                <h3>۶. چگونه باید دندان‌های کودک خود را مسواک بزنم؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(6) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(6) && (
                <div className="faq-answer">
                  <p>از مسواک نرم و کوچک برای کودک استفاده کنید و با مقدار کمی خمیر دندان حاوی فلوراید (مقدار کم) دندان‌ها را دو بار در روز مسواک بزنید. بهتر است این کار را زیر نظر بزرگسال انجام دهید تا کامل و صحیح باشد.</p>
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(7) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(7)}
              >
                <h3>۷. چه نوع خمیردندان برای کودک مناسب است؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(7) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(7) && (
                <div className="faq-answer">
                  <p>از خمیردندان مخصوص کودکان با فلوراید کم استفاده کنید. این خمیردندان‌ها طعم خوبی دارند و برای سلامت دندان‌های شیری مناسب هستند.</p>
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(8) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(8)}
              >
                <h3>۸. آیا باید غذاهای شیرین را محدود کنم؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(8) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(8) && (
                <div className="faq-answer">
                  <p>بله، مصرف زیاد مواد شیرین باعث پوسیدگی و ترمیم سخت دندان می‌شود. سعی کنید تغذیه سالم و متنوع داشته باشید و از مصرف زیاد تنقلات شیرین پرهیز کنید.</p>
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(9) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(9)}
              >
                <h3>۹. چه نکاتی هنگام استفاده از مسواک باید رعایت کرد؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(9) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(9) && (
                <div className="faq-answer">
                  <p>مسواک باید تمیز و خشک نگه داشته شود. مسواک کودک را حداقل هر ۳ ماه تعویض کنید و پس از بیماری یا سرماخوردگی، آن را ضدعفونی کنید.</p>
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(10) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(10)}
              >
                <h3>۱۰. آیا مصرف فلوراید مفید است؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(10) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(10) && (
                <div className="faq-answer">
                  <p>بله، فلوراید کمک می‌کند تا دندان‌های کودک مقاوم‌تر شوند و پوسیدگی کاهش پیدا کند. اما باید طبق توصیه دندان‌پزشک مصرف شود.</p>
                </div>
              )}
            </div>
            
            <div className="faq-item">
              <div 
                className={`faq-question ${isQuestionExpanded(11) ? 'expanded' : ''}`}
                onClick={() => toggleQuestion(11)}
              >
                <h3>۱۱. چگونه می‌توانم به کودکم آموزش دهم دهان و دندان خود را به درستی مراقبت کند؟</h3>
                <span className="toggle-icon">{isQuestionExpanded(11) ? '−' : '+'}</span>
              </div>
              {isQuestionExpanded(11) && (
                <div className="faq-answer">
                  <p>از طریق بازی، داستان و تشویق، به کودک آموزش دهید که باید دندان‌هایش را مرتبا و صحیح مسواک بزند. می‌توانید این کار را با هم انجام دهید تا برایش سرگرم‌کننده باشد.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="faq-footer">
        <p>لبخند شاد دندان سالم &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default FAQ;