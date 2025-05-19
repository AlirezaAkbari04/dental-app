import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import './EducationalContent.css';

const EducationalContent = () => {
  const [selectedContent, setSelectedContent] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [contentList] = useState([
    {
      id: 1,
      title: 'راهنمای جامع بهداشت دهان و دندان',
      description: 'مجموعه کاملی از اطلاعات و آموزش‌های مربوط به سلامت دهان و دندان برای دانش‌آموزان و والدین',
      type: 'pdf',
      pdfPath: 'dental-guide.pdf',
      icon: '📄'
    },
    {
      id: 2,
      title: 'اهمیت دندان شیری',
      description: 'چرا دندان‌های شیری مهم هستند و چگونه باید از آنها مراقبت کرد',
      type: 'html',
      content: `
        <div class="content-container">
          <h2>اهمیت دندان‌های شیری</h2>
          <p>دندان‌های شیری نقش بسیار مهمی در رشد و سلامت کودکان دارند. این دندان‌ها نه تنها برای جویدن غذا استفاده می‌شوند، بلکه فضای لازم برای رویش صحیح دندان‌های دائمی را نیز حفظ می‌کنند.</p>
          
          <div class="tooth-stages">
            <div class="tooth-stage">
              <div class="stage-icon">👶</div>
              <div class="stage-title">تولد تا 3 سالگی</div>
              <div class="stage-description">رویش دندان‌های شیری شروع می‌شود</div>
            </div>
            <div class="tooth-stage">
              <div class="stage-icon">🧒</div>
              <div class="stage-title">6 تا 12 سالگی</div>
              <div class="stage-description">دندان‌های شیری به تدریج می‌افتند و دندان‌های دائمی رشد می‌کنند</div>
            </div>
            <div class="tooth-stage">
              <div class="stage-icon">👦</div>
              <div class="stage-title">12 سالگی به بعد</div>
              <div class="stage-description">بیشتر دندان‌های دائمی رویش پیدا کرده‌اند</div>
            </div>
          </div>
          
          <h3>دلایل اهمیت مراقبت از دندان‌های شیری:</h3>
          <ul>
            <li>کمک به رشد صحیح فک و صورت</li>
            <li>حفظ فضا برای دندان‌های دائمی</li>
            <li>کمک به تغذیه مناسب و جویدن غذا</li>
            <li>کمک به رشد گفتاری صحیح</li>
            <li>حفظ زیبایی و اعتماد به نفس کودک</li>
          </ul>
        </div>
      `,
      icon: '🦷'
    },
    {
      id: 3,
      title: 'نحوه صحیح مسواک زدن',
      description: 'آموزش مرحله به مرحله مسواک زدن صحیح برای دانش‌آموزان',
      type: 'html',
      content: `
        <div class="content-container">
          <h2>نحوه صحیح مسواک زدن</h2>
          <p>مسواک زدن صحیح یکی از مهمترین اقدامات برای حفظ سلامت دهان و دندان است. با رعایت این نکات، به دانش‌آموزان کمک کنید تا عادت‌های صحیح بهداشت دهان را فرا بگیرند.</p>
          
          <div class="brushing-steps">
            <div class="step">
              <div class="step-number">1</div>
              <div class="step-title">آماده سازی</div>
              <div class="step-description">مسواک را خیس کنید و به اندازه یک نخود خمیردندان روی آن قرار دهید.</div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div class="step-title">زاویه مناسب</div>
              <div class="step-description">مسواک را با زاویه 45 درجه نسبت به لثه قرار دهید.</div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-title">حرکت دورانی</div>
              <div class="step-description">با حرکات دورانی ملایم، سطح دندان‌ها را تمیز کنید.</div>
            </div>
            <div class="step">
              <div class="step-number">4</div>
              <div class="step-title">سطوح جونده</div>
              <div class="step-description">سطوح جونده را با حرکات رفت و برگشتی تمیز کنید.</div>
            </div>
            <div class="step">
              <div class="step-number">5</div>
              <div class="step-title">سطوح داخلی</div>
              <div class="step-description">سطوح داخلی دندان‌ها را نیز به همان روش تمیز کنید.</div>
            </div>
            <div class="step">
              <div class="step-number">6</div>
              <div class="step-title">مدت زمان</div>
              <div class="step-description">حداقل 2 دقیقه برای مسواک زدن کامل زمان صرف کنید.</div>
            </div>
          </div>
          
          <div class="important-note">
            <h3>نکات مهم:</h3>
            <ul>
              <li>روزی دو بار مسواک بزنید: صبح و شب قبل از خواب</li>
              <li>بعد از مسواک زدن، دهان را با آب نشویید، فقط خمیردندان اضافی را بیرون بریزید</li>
              <li>هر 3 ماه یکبار مسواک خود را تعویض کنید</li>
              <li>از نخ دندان نیز استفاده کنید</li>
            </ul>
          </div>
        </div>
      `,
      icon: '🪥'
    }
  ]);

  // Helper function to get platform-aware paths
  const getPdfPath = (filename) => {
    return Capacitor.isNativePlatform()
      ? `file:///android_asset/assets/pdfs/${filename}`
      : `/assets/pdfs/${filename}`;
  };

  const handleSelectContent = (content) => {
    setSelectedContent(content);
    if (content.type === 'pdf') {
      setShowPdfViewer(false);
    }
  };

  const handleViewPDF = () => {
    if (selectedContent && selectedContent.type === 'pdf') {
      setShowPdfViewer(true);
    }
  };
  
  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
  };

  const handleBackToList = () => {
    setSelectedContent(null);
    setShowPdfViewer(false);
  };

  // Full-screen PDF viewer - FIXED for Android compatibility
  if (showPdfViewer && selectedContent && selectedContent.type === 'pdf') {
    const pdfPath = getPdfPath(selectedContent.pdfPath);

    return (
      <div className="pdf-viewer-fullscreen">
        <div className="pdf-viewer-header">
          <h3>{selectedContent.title}</h3>
          <button className="close-button" onClick={handleClosePdfViewer}>
            بازگشت
          </button>
        </div>
        
        <div className="pdf-viewer-container-fullscreen">
          <iframe 
            src={pdfPath}
            className="pdf-viewer-iframe"
            title="PDF Viewer"
            style={{ width: '100%', height: '100%', border: 'none' }}
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="educational-content">
      <div className="content-header">
        <h2>محتوای آموزشی سلامت دهان و دندان</h2>
        <p>در این بخش می‌توانید به محتوای آموزشی در مورد سلامت دهان و دندان دسترسی داشته باشید.</p>
      </div>

      {selectedContent ? (
        <div className="content-detail">
          <div className="detail-header">
            <h3 className="detail-title">{selectedContent.title}</h3>
            <div className="detail-actions">
              {selectedContent.type === 'pdf' && (
                <button className="view-button" onClick={handleViewPDF}>
                  مشاهده PDF
                </button>
              )}
              <button className="back-button" onClick={handleBackToList}>
                بازگشت به لیست
              </button>
            </div>
          </div>
          
          <div className="content-body">
            {selectedContent.type === 'html' ? (
              <div dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
            ) : (
              <div className="pdf-preview">
                <div className="pdf-icon">{selectedContent.icon}</div>
                <div className="pdf-info">
                  <h4>{selectedContent.title}</h4>
                  <p>{selectedContent.description}</p>
                  <button className="pdf-view-button" onClick={handleViewPDF}>
                    مشاهده PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="content-list">
          {contentList.map(content => (
            <div 
              key={content.id} 
              className="content-card" 
              onClick={() => handleSelectContent(content)}
            >
              <div className="content-icon">{content.icon}</div>
              <div className="content-info">
                <h3 className="content-title">{content.title}</h3>
                <p className="content-description">{content.description}</p>
                <div className="content-type">
                  {content.type === 'pdf' ? 'فایل PDF' : 'محتوای متنی'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add any missing CSS that might not be in your CSS file */}
      <style jsx>{`
        .pdf-viewer-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #fff;
          z-index: 1000;
          display: flex;
          flex-direction: column;
        }
        
        .pdf-viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
          background-color: #f5f5f5;
          border-bottom: 1px solid #ddd;
          direction: rtl;
        }
        
        .pdf-viewer-header h3 {
          margin: 0;
        }
        
        .close-button {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
        }
        
        .pdf-viewer-container-fullscreen {
          flex: 1;
          overflow: hidden;
        }
        
        .pdf-viewer-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default EducationalContent;