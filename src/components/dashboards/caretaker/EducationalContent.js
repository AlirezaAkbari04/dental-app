import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import './EducationalContent.css';

const EducationalContent = () => {
  const [selectedContent, setSelectedContent] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfError, setPdfError] = useState(null);
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

  // Check if PDF file exists
  const checkPdfExists = async (pdfPath) => {
    try {
      // For web platform
      if (!Capacitor.isNativePlatform()) {
        const response = await fetch(`/assets/pdfs/${pdfPath}`, { method: 'HEAD' });
        return response.ok;
      }
      
      // For native platform - assume file exists if path is provided
      return true;
    } catch (error) {
      console.error('Error checking PDF existence:', error);
      return false;
    }
  };

  // Helper function to get platform-aware paths
  const getPdfPath = (filename) => {
    if (Capacitor.isNativePlatform()) {
      // For Android, try multiple possible locations
      return `file:///android_asset/www/assets/pdfs/${filename}`;
    } else {
      // For web
      return `/assets/pdfs/${filename}`;
    }
  };

  const handleSelectContent = (content) => {
    setSelectedContent(content);
    setPdfError(null);
    if (content.type === 'pdf') {
      setShowPdfViewer(false);
    }
  };

  const handleViewPDF = async () => {
    if (selectedContent && selectedContent.type === 'pdf') {
      // Check if PDF exists before trying to show it
      const pdfExists = await checkPdfExists(selectedContent.pdfPath);
      
      if (!pdfExists) {
        setPdfError('فایل PDF یافت نشد. لطفاً مطمئن شوید که فایل در مسیر صحیح قرار دارد.');
        return;
      }
      
      setPdfError(null);
      setShowPdfViewer(true);
    }
  };
  
  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
    setPdfError(null);
  };

  const handleBackToList = () => {
    setSelectedContent(null);
    setShowPdfViewer(false);
    setPdfError(null);
  };

  // Handle PDF load error
  const handlePdfError = () => {
    setPdfError('خطا در بارگذاری فایل PDF. ممکن است فایل وجود نداشته باشد یا آسیب دیده باشد.');
  };

  // Full-screen PDF viewer - FIXED for better compatibility
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
          {pdfError ? (
            <div className="pdf-error">
              <div className="error-icon">⚠️</div>
              <h4>خطا در نمایش PDF</h4>
              <p>{pdfError}</p>
              <div className="error-suggestions">
                <h5>راه‌حل‌های پیشنهادی:</h5>
                <ul>
                  <li>مطمئن شوید فایل PDF در مسیر <code>/public/assets/pdfs/{selectedContent.pdfPath}</code> قرار دارد</li>
                  <li>نام فایل را بررسی کنید</li>
                  <li>صفحه را مجدداً بارگذاری کنید</li>
                </ul>
              </div>
              <button className="retry-button" onClick={handleViewPDF}>
                تلاش مجدد
              </button>
            </div>
          ) : (
            <>
              {/* Primary PDF viewer - iframe */}
              <iframe 
                src={pdfPath}
                className="pdf-viewer-iframe"
                title="PDF Viewer"
                style={{ width: '100%', height: '100%', border: 'none' }}
                onError={handlePdfError}
                onLoad={() => {
                  console.log('PDF loaded successfully');
                  setPdfError(null);
                }}
              />
              
              {/* Fallback download option */}
              <div className="pdf-fallback">
                <p>اگر PDF نمایش داده نمی‌شود، می‌توانید آن را دانلود کنید:</p>
                <a 
                  href={pdfPath} 
                  download={selectedContent.pdfPath}
                  className="download-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  دانلود فایل PDF
                </a>
              </div>
            </>
          )}
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
                  {pdfError && (
                    <div className="error-message" style={{ 
                      color: '#e74c3c', 
                      margin: '10px 0',
                      padding: '10px',
                      backgroundColor: '#ffeaea',
                      borderRadius: '4px',
                      border: '1px solid #e74c3c'
                    }}>
                      {pdfError}
                    </div>
                  )}
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

      {/* Enhanced CSS for better PDF viewing experience */}
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
          padding: 15px 20px;
          background-color: #f8f9fa;
          border-bottom: 2px solid #dee2e6;
          direction: rtl;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .pdf-viewer-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 18px;
        }
        
        .close-button {
          background-color: #e74c3c;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          transition: background-color 0.3s;
        }
        
        .close-button:hover {
          background-color: #c0392b;
        }
        
        .pdf-viewer-container-fullscreen {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        
        .pdf-viewer-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        
        .pdf-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px;
          text-align: center;
          direction: rtl;
        }
        
        .error-icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
        
        .pdf-error h4 {
          color: #e74c3c;
          margin-bottom: 15px;
          font-size: 24px;
        }
        
        .pdf-error p {
          color: #7f8c8d;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        
        .error-suggestions {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: right;
        }
        
        .error-suggestions h5 {
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .error-suggestions ul {
          text-align: right;
          padding-right: 20px;
        }
        
        .error-suggestions li {
          margin-bottom: 8px;
          color: #34495e;
        }
        
        .error-suggestions code {
          background-color: #ecf0f1;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          color: #e74c3c;
        }
        
        .retry-button {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
          font-size: 16px;
          transition: background-color 0.3s;
        }
        
        .retry-button:hover {
          background-color: #2980b9;
        }
        
        .pdf-fallback {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background-color: rgba(255, 255, 255, 0.95);
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          direction: rtl;
        }
        
        .download-button {
          display: inline-block;
          background-color: #27ae60;
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 4px;
          margin-top: 8px;
          transition: background-color 0.3s;
        }
        
        .download-button:hover {
          background-color: #219a52;
        }
        
        .error-message {
          font-size: 14px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default EducationalContent;