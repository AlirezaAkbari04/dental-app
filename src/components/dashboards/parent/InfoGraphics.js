import React, { useState, useEffect } from 'react';
import './ParentComponents.css';
import DatabaseService from '../../../services/DatabaseService';
import { Capacitor } from '@capacitor/core';

const InfoGraphics = () => {
  const [selectedInfoGraphic, setSelectedInfoGraphic] = useState(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // تابع کمکی برای تعیین مسیر فایل‌ها بر اساس پلتفرم
  const getAssetPath = (path) => {
    // مسیر ساده برای همه پلتفرم‌ها استفاده می‌شود
    return path;
  };

  // پردازش مسیرهای فایل در محتوای HTML
  const processContent = (content) => {
    // پردازش خاصی نیاز نیست، مسیرها به همان شکل باقی می‌مانند
    return content;
  };

  // List of available infographics
  const infographics = [
    {
      id: 1,
      title: 'اهمیت دندان شیری',
      description: 'چرا دندان‌های شیری مهم هستند و چگونه از آنها مراقبت کنیم؟',
      imageUrl: getAssetPath('/infographics/baby-teeth.jpg'),
      content: `
        <h2>اهمیت دندان‌های شیری</h2>
        <p>دندان‌های شیری نقش مهمی در رشد و سلامت کودک دارند. این دندان‌ها فضا را برای دندان‌های دائمی حفظ می‌کنند و به رشد صحیح فک و صورت کمک می‌کنند.</p>
        
        <div class="audio-container">
          <div class="audio-placeholder">
            <span class="placeholder-icon">🔊</span>
            <span class="placeholder-text">فایل صوتی: توضیحات تکمیلی درباره اهمیت دندان‌های شیری</span>
            <button class="play-audio-button" onclick="playBabyTeethAudio()">پخش صدا</button>
          </div>
        </div>
        
        <script>
          function playBabyTeethAudio() {
            // کد جاوااسکریپت برای پخش صدا
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.className = 'baby-teeth-audio';
            const source = document.createElement('source');
            source.src = '${Capacitor.isNativePlatform() ? 'file:///android_asset/assets/audio/baby-teeth-audio.mp3' : '/assets/audio/baby-teeth-audio.mp3'}';
            source.type = 'audio/mp3';
            audioElement.appendChild(source);
            
            const container = document.querySelector('.audio-container');
            container.innerHTML = '';
            container.appendChild(audioElement);
            audioElement.play();
          }
        </script>
      `
    },
    {
      id: 2,
      title: 'فلوراید',
      description: 'فواید فلوراید برای سلامت دندان‌ها و چگونگی استفاده صحیح از آن',
      imageUrl: getAssetPath('/infographics/fluoride.jpg'),
      content: `
        <h2>فلوراید</h2>
        <div class="fluoride-brochure-container">
          <img 
            src="/assets/images/fluoride-brochure-1.png" 
            alt="" 
            class="fluoride-brochure-image"
          />
          <img 
            src="/assets/images/fluoride-brochure-2.png" 
            alt="" 
            class="fluoride-brochure-image"
          />
        </div>
        
        <div class="audio-container">
          <div class="audio-placeholder">
            <span class="placeholder-icon">🔊</span>
            <span class="placeholder-text">فایل صوتی: اطلاعات تکمیلی درباره فلوراید و فواید آن</span>
            <button class="play-audio-button" onclick="playFluorideAudio()">پخش صدا</button>
          </div>
        </div>
        
        <script>
          function playFluorideAudio() {
            // کد جاوااسکریپت برای پخش صدا
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.className = 'fluoride-audio';
            const source = document.createElement('source');
            source.src = '${Capacitor.isNativePlatform() ? 'file:///android_asset/assets/audio/fluoride-audio.mp3' : '/assets/audio/fluoride-audio.mp3'}';
            source.type = 'audio/mp3';
            audioElement.appendChild(source);
            
            const container = document.querySelector('.audio-container');
            container.innerHTML = '';
            container.appendChild(audioElement);
            audioElement.play();
          }
        </script>
      `
    },
    {
      id: 3,
      title: 'راهنمای جامع بهداشت دهان و دندان',
      description: 'فایل PDF آموزشی کامل برای والدین و کودکان',
      imageUrl: getAssetPath('/infographics/dental-guide.jpg'),
      type: 'pdf',
      pdfPath: 'dental-guide.pdf',
      content: `
        <h2>راهنمای جامع بهداشت دهان و دندان</h2>
        <p>این راهنما شامل اطلاعات کاملی در مورد نحوه مراقبت از دندان‌ها، 
        تکنیک‌های صحیح مسواک زدن، استفاده از نخ دندان و سایر نکات مهم بهداشتی است.</p>
      `
    },
    {
      id: 4,
      title: 'فیشورسیلنت (شیارپوش)',
      description: 'آشنایی با شیارپوش دندان و مزایای آن برای پیشگیری از پوسیدگی',
      imageUrl: getAssetPath('/infographics/fissure-sealant.jpg'),
      content: `
        <h2>فیشورسیلنت (شیارپوش)</h2>
        <p>شیارپوش یا فیشورسیلنت لایه‌ای محافظ است که روی شیارهای دندان‌های آسیاب قرار می‌گیرد تا از پوسیدگی جلوگیری کند. این روش ساده و بدون درد برای کودکان بسیار مؤثر است.</p>
        
        <div class="important-note">
          <p>بهتر است از شیارپوش (فیشورسیلنت) برای محافظت از دندان‌های آسیاب اول دائمی استفاده شود. این روش پیشگیرانه، با بستن شیارهای عمیق دندان‌های آسیاب اول دائمی توسط دندانپزشک، از ورود خرده‌های مواد غذایی و میکروارگانیسم‌ها به داخل این شیارها جلوگیری می‌کند. استفاده از شیارپوش به‌شدت توصیه می‌شود.</p>
        </div>
        
        <div class="video-container">
          <div class="video-placeholder">
            <span class="placeholder-icon">🎬</span>
            <span class="placeholder-text">ویدیوی آموزشی فیشورسیلنت</span>
            <p class="placeholder-description">برای مشاهده ویدیو، لطفاً روی دکمه پخش کلیک کنید.</p>
            <button class="play-video-button" onclick="playFissureSealantVideo()">پخش ویدیو</button>
          </div>
        </div>
        
        <script>
          function playFissureSealantVideo() {
            // کد جاوااسکریپت برای پخش ویدیو
            const videoElement = document.createElement('video');
            videoElement.controls = true;
            videoElement.className = 'fissure-sealant-video';
            const source = document.createElement('source');
            source.src = '${Capacitor.isNativePlatform() ? 'file:///android_asset/assets/videos/fissure-sealant-video.mp4' : '/assets/videos/fissure-sealant-video.mp4'}';
            source.type = 'video/mp4';
            videoElement.appendChild(source);
            
            const container = document.querySelector('.video-container');
            container.innerHTML = '';
            container.appendChild(videoElement);
            videoElement.play();
          }
        </script>
      `
    },
    {
      id: 5,
      title: 'آموزش مسواک زدن برای کودکان',
      description: 'راهنمای والدین برای مسواک زدن صحیح دندان‌های کودکان',
      imageUrl: getAssetPath('/infographics/toothbrushing-kids.jpg'),
      content: `
        <h2>آموزش مسواک زدن برای کودکان</h2>
        <p>در این بخش، نحوه صحیح مسواک زدن دندان‌های کودکان توسط والدین آموزش داده می‌شود. این تکنیک‌ها به شما کمک می‌کند تا به عنوان والدین، دندان‌های فرزند خود را به درستی و بدون آسیب تمیز کنید.</p>
        
        <div class="video-container">
          <div class="video-placeholder">
            <span class="placeholder-icon">🎬</span>
            <span class="placeholder-text">ویدیوی آموزشی مسواک زدن برای کودکان توسط والدین</span>
            <p class="placeholder-description">برای مشاهده ویدیو، لطفاً روی دکمه پخش کلیک کنید.</p>
            <button class="play-video-button" onclick="playToothbrushingVideo()">پخش ویدیو</button>
          </div>
        </div>
        
        <script>
          function playToothbrushingVideo() {
            // کد جاوااسکریپت برای پخش ویدیو
            const videoElement = document.createElement('video');
            videoElement.controls = true;
            videoElement.className = 'toothbrushing-video';
            const source = document.createElement('source');
            source.src = '${Capacitor.isNativePlatform() ? 'file:///android_asset/assets/videos/toothbrushing-kids-video.mp4' : '/assets/videos/toothbrushing-kids-video.mp4'}';
            source.type = 'video/mp4';
            videoElement.appendChild(source);
            
            const container = document.querySelector('.video-container');
            container.innerHTML = '';
            container.appendChild(videoElement);
            videoElement.play();
          }
        </script>
      `
    }
  ];

  // useEffect for database initialization
  useEffect(() => {
    const initDatabase = async () => {
      try {
        // Initialize database if needed
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }
        // Mark assets as loaded
        setAssetsLoaded(true);
      } catch (error) {
        console.error('Error initializing database:', error);
        // Still mark assets as loaded even if there's an error
        setAssetsLoaded(true);
      }
    };

    initDatabase();
  }, []);

  // Handle opening PDF file
  const handleViewPDF = () => {
    if (selectedInfoGraphic && selectedInfoGraphic.type === 'pdf') {
      setShowPdfViewer(true);
    }
  };
  
  // Handle closing PDF viewer
  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
  };

  const handleSelectInfoGraphic = (infographic) => {
    setSelectedInfoGraphic(infographic);
    if (infographic.type === 'pdf') {
      setShowPdfViewer(false);
    }
  };

  const handleBackToList = () => {
    setSelectedInfoGraphic(null);
    setShowPdfViewer(false);
  };

  // Show loading state while assets are loading
  if (!assetsLoaded) {
    return (
      <div className="infographics-container">
        <div className="loading-indicator">
          <p>در حال بارگذاری اینفوگرافی‌ها...</p>
        </div>
      </div>
    );
  }

  // Full-screen PDF viewer 
  if (showPdfViewer && selectedInfoGraphic && selectedInfoGraphic.type === 'pdf') {
    // For Capacitor/Android, we use the asset path structure
    const pdfPath = Capacitor.isNativePlatform()
      ? `file:///android_asset/assets/pdfs/${selectedInfoGraphic.pdfPath}`
      : `assets/pdfs/${selectedInfoGraphic.pdfPath}`;

    return (
      <div className="pdf-viewer-fullscreen">
        <div className="pdf-viewer-header">
          <h3>{selectedInfoGraphic.title}</h3>
          <button className="close-button" onClick={handleClosePdfViewer}>
            بازگشت
          </button>
        </div>
        
        <div className="pdf-viewer-container-fullscreen">
          <iframe 
            src={pdfPath}
            className="pdf-viewer-iframe"
            title="PDF Viewer"
          ></iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="infographics-container">
      <div className="infographics-header">
        <h2>اینفوگرافی‌های دندانپزشکی</h2>
        <p className="infographics-description">
          در این بخش می‌توانید به اینفوگرافی‌های آموزشی در مورد سلامت دهان و دندان دسترسی داشته باشید.
        </p>
      </div>
      
      {selectedInfoGraphic ? (
        <div className="infographic-detail">
          <div className="detail-header">
            <h3 className="detail-title">{selectedInfoGraphic.title}</h3>
            <div className="detail-actions">
              {selectedInfoGraphic.type === 'pdf' && (
                <button className="view-button" onClick={handleViewPDF}>
                  مشاهده PDF
                </button>
              )}
              <button className="back-button" onClick={handleBackToList}>
                بازگشت به لیست
              </button>
            </div>
          </div>
          
          <div className="infographic-content">
            {/* Only show tooth anatomy images for the Baby Teeth section (id: 1) */}
            {selectedInfoGraphic.id === 1 && (
              <div className="side-by-side-images">
                <div className="tooth-image">
                  <img 
                    src={getAssetPath('/assets/images/tooth-anatomy-english.png')}
                    alt="" 
                    className="anatomy-image"
                  />
                </div>
                
                <div className="tooth-image">
                  <img 
                    src={getAssetPath('/assets/images/tooth-anatomy-persian.png')}
                    alt="" 
                    className="anatomy-image"
                  />
                </div>
              </div>
            )}
            
            <div 
              className="infographic-text"
              dangerouslySetInnerHTML={{ __html: processContent(selectedInfoGraphic.content) }}
            />
            
            {/* PDF preview icon for PDF type */}
            {selectedInfoGraphic.type === 'pdf' && (
              <div className="pdf-preview-container">
                <div className="pdf-icon">
                  <span className="pdf-icon-symbol">📄</span>
                </div>
                <p className="pdf-instructions">برای مشاهده فایل PDF کامل، روی دکمه "مشاهده PDF" کلیک کنید.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="infographics-list">
          {infographics.map(infographic => (
            <div 
              key={infographic.id} 
              className="infographic-card" 
              onClick={() => handleSelectInfoGraphic(infographic)}
            >
              <div className="infographic-thumbnail">
                {infographic.type === 'pdf' ? (
                  <div className="thumbnail-placeholder pdf-thumbnail">
                    <span className="placeholder-icon">📄</span>
                    <span className="placeholder-text">PDF</span>
                  </div>
                ) : (
                  <div className="thumbnail-placeholder">
                    <span className="placeholder-icon">🖼️</span>
                  </div>
                )}
              </div>
              <div className="infographic-info">
                <h3 className="infographic-title">{infographic.title}</h3>
                <p className="infographic-description">{infographic.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="infographics-tips">
        <h3>چگونه از این اطلاعات استفاده کنیم؟</h3>
        <ul>
          <li>اینفوگرافی‌ها را با کودک خود مرور کنید و مفاهیم را به زبان ساده برای او توضیح دهید.</li>
          <li>می‌توانید این اینفوگرافی‌ها را چاپ کرده و در محیطی که کودک مسواک می‌زند نصب کنید.</li>
          <li>با اشتراک‌گذاری این اطلاعات با دیگر والدین، به ارتقای سطح آگاهی درباره بهداشت دهان و دندان کمک کنید.</li>
          <li>فایل‌های PDF را می‌توانید برای مطالعه بیشتر مشاهده کنید.</li>
          <li>ویدیوهای آموزشی را می‌توانید همراه با کودک خود تماشا کنید و به او کمک کنید تا مهارت‌های بهداشت دهان و دندان را بیاموزد.</li>
        </ul>
      </div>
      
      <style jsx>{`
        .important-note {
          background-color: #fffde7;
          border-right: 4px solid #fbc02d;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .important-note p {
          margin: 0;
          line-height: 1.5;
          color: #5d4037;
        }

        .loading-indicator {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
        
        .pdf-thumbnail {
          background-color: #f0f0f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .pdf-thumbnail .placeholder-icon {
          font-size: 2rem;
          margin-bottom: 5px;
        }
        
        .placeholder-text {
          font-size: 0.8rem;
          color: #666;
        }
        
        .pdf-preview-container {
          margin: 20px 0;
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 8px;
          display: flex;
          align-items: center;
          border: 1px dashed #ccc;
        }
        
        .pdf-icon {
          font-size: 2rem;
          margin-left: 20px;
          color: #e74c3c;
          background-color: white;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .pdf-icon-symbol {
          font-size: 2.5rem;
        }
        
        .pdf-instructions {
          flex: 1;
          margin: 0;
          color: #555;
        }
        
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
        
        .detail-actions {
          display: flex;
          gap: 10px;
        }
        
        .view-button {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.9rem;
        }
        
        .view-button:hover {
          background-color: #0b7dda;
        }
        
        .back-button {
          background-color: #f0f0f0;
          color: #333;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.9rem;
        }
        
        .back-button:hover {
          background-color: #ddd;
        }
        
        /* استایل‌های برای ویدیو و صوت */
        .video-container {
          margin: 20px 0;
          background-color: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .fissure-sealant-video, .toothbrushing-video {
          width: 100%;
          max-width: 400px;
          display: block;
          margin: 0 auto;
        }
        
        /* تنظیم ابعاد ویدیو مسواک زدن به صورت 16:9 عمودی */
        .toothbrushing-video {
          aspect-ratio: 9/16;
        }
        
        /* حفظ نسبت مربعی برای ویدیو فیشورسیلنت */
        .fissure-sealant-video {
          aspect-ratio: 1/1;
        }
        
        .audio-container {
          margin: 20px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        
        .baby-teeth-audio, .fluoride-audio {
          width: 100%;
          margin-bottom: 10px;
        }
        
        .audio-caption {
          font-size: 0.9rem;
          color: #555;
          text-align: center;
        }
        
        .play-video-button, .play-audio-button {
          background-color: #2196f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          font-size: 1rem;
          margin-top: 15px;
          display: block;
          margin-left: auto;
          margin-right: auto;
        }
        
        .play-video-button:hover, .play-audio-button:hover {
          background-color: #0b7dda;
        }
        
        .video-placeholder, .audio-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
          text-align: center;
        }
        
        .placeholder-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }
        
        .placeholder-text {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .placeholder-description {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 15px;
        }
      `}</style>
    </div>
  );
};

export default InfoGraphics;