import React, { useState, useEffect, useRef } from 'react';
import './ParentComponents.css';
import DatabaseService from '../../../services/DatabaseService';
import { Capacitor } from '@capacitor/core';

const InfoGraphics = () => {
  const [selectedInfoGraphic, setSelectedInfoGraphic] = useState(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  
  // Audio player state
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    loading: false,
    error: null,
    audioRef: null,
    audioSource: ''
  });

  // Platform-aware path functions
  const getImagePath = (filename) => Capacitor.isNativePlatform() 
    ? `file:///android_asset/assets/images/${filename}`
    : `/assets/images/${filename}`;
  
  const getAudioPath = (filename) => Capacitor.isNativePlatform() 
    ? `file:///android_asset/assets/audios/${filename}`
    : `/assets/audios/${filename}`;
  
  const getVideoPath = (filename) => Capacitor.isNativePlatform() 
    ? `file:///android_asset/assets/videos/${filename}`
    : `/assets/videos/${filename}`;
  
  const getPdfPath = (filename) => Capacitor.isNativePlatform() 
    ? `file:///android_asset/assets/pdfs/${filename}`
    : `/assets/pdfs/${filename}`;

  // Format time for display (MM:SS)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return '00:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Load and play audio file
  const initAudio = (audioPath) => {
    // Clean up any existing audio
    if (audioState.audioRef) {
      audioState.audioRef.pause();
    }
    
    // Reset the audio state
    setAudioState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      loading: true,
      error: null,
      audioRef: null,
      audioSource: audioPath
    });
    
    // Create a short timeout to ensure state is updated
    setTimeout(() => {
      const audio = new Audio(audioPath);
      
      // Set up event listeners
      audio.addEventListener('timeupdate', () => {
        setAudioState(prev => ({
          ...prev,
          currentTime: audio.currentTime,
        }));
      });
      
      audio.addEventListener('loadedmetadata', () => {
        console.log('Audio metadata loaded', {
          duration: audio.duration,
          src: audio.src
        });
        setAudioState(prev => ({
          ...prev,
          duration: audio.duration,
          loading: false
        }));
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio error', e);
        let errorMessage = 'خطا در بارگذاری فایل صوتی';
        if (e.target.error) {
          if (e.target.error.code === 2) {
            errorMessage = 'فایل صوتی یافت نشد';
          } else if (e.target.error.code === 3) {
            errorMessage = 'خطا در رمزگشایی فایل صوتی';
          } else if (e.target.error.code === 4) {
            errorMessage = 'فرمت فایل صوتی پشتیبانی نمی‌شود';
          }
        }
        
        setAudioState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false
        }));
      });
      
      audio.addEventListener('ended', () => {
        setAudioState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: 0
        }));
      });
      
      setAudioState(prev => ({
        ...prev,
        audioRef: audio,
        loading: true
      }));
      
      // Start loading the audio
      audio.load();
    }, 100);
  };
  
  // Play or pause current audio
  const togglePlayPause = () => {
    if (!audioState.audioRef) return;
    
    if (audioState.isPlaying) {
      audioState.audioRef.pause();
      setAudioState(prev => ({
        ...prev,
        isPlaying: false
      }));
    } else {
      const playPromise = audioState.audioRef.play();
      if (playPromise !== undefined) {
        setAudioState(prev => ({
          ...prev,
          loading: true
        }));
        
        playPromise.then(() => {
          console.log('Audio started playing successfully');
          setAudioState(prev => ({
            ...prev,
            isPlaying: true,
            loading: false,
            error: null
          }));
        }).catch(err => {
          console.error('Error playing audio:', err);
          
          // Provide better error messages
          let errorMessage = 'خطا در پخش صدا';
          if (err.name === 'NotAllowedError') {
            errorMessage = 'اجازه پخش صدا داده نشد. لطفاً با کلیک روی صفحه دوباره تلاش کنید.';
          }
          
          setAudioState(prev => ({
            ...prev,
            error: errorMessage,
            loading: false
          }));
        });
      }
    }
  };
  
  // Handle seeking in the audio timeline
  const handleSeek = (e) => {
    if (!audioState.audioRef) return;
    
    const clickPosition = e.nativeEvent.offsetX;
    const progressBarWidth = e.currentTarget.clientWidth;
    const seekTime = (clickPosition / progressBarWidth) * audioState.duration;
    
    audioState.audioRef.currentTime = seekTime;
    setAudioState(prev => ({
      ...prev,
      currentTime: seekTime
    }));
  };

  // Helper to process content paths - Updated for platform awareness
  const processContent = (content) => {
    let processedContent = content;
    
    if (Capacitor.isNativePlatform()) {
      // Fix paths for Android
      processedContent = processedContent.replace(
        /\/assets\/audios\/([^'\"]+)/g, 
        (match, filename) => `file:///android_asset/assets/audios/${filename}`
      );
      
      processedContent = processedContent.replace(
        /\/assets\/videos\/([^'\"]+)/g, 
        (match, filename) => `file:///android_asset/assets/videos/${filename}`
      );
      
      processedContent = processedContent.replace(
        /\/assets\/images\/([^'\"]+)/g, 
        (match, filename) => `file:///android_asset/assets/images/${filename}`
      );
      
      processedContent = processedContent.replace(
        /\/assets\/pdfs\/([^'\"]+)/g, 
        (match, filename) => `file:///android_asset/assets/pdfs/${filename}`
      );
    } else {
      // Fix regular paths for web
      processedContent = processedContent.replace(
        /file:\/\/\/android_asset\/.*?\/assets\/audios\/([^'\"]+)/g, 
        (match, filename) => `/assets/audios/${filename}`
      );
      
      processedContent = processedContent.replace(
        /file:\/\/\/android_asset\/.*?\/assets\/videos\/([^'\"]+)/g, 
        (match, filename) => `/assets/videos/${filename}`
      );
      
      processedContent = processedContent.replace(
        /file:\/\/\/android_asset\/.*?\/assets\/images\/([^'\"]+)/g, 
        (match, filename) => `/assets/images/${filename}`
      );
      
      processedContent = processedContent.replace(
        /file:\/\/\/android_asset\/.*?\/assets\/pdfs\/([^'\"]+)/g, 
        (match, filename) => `/assets/pdfs/${filename}`
      );
    }
    
    return processedContent;
  };

  // List of available infographics with fixed asset paths
  const infographics = [
    {
      id: 1,
      title: 'اهمیت دندان شیری',
      description: 'چرا دندان‌های شیری مهم هستند و چگونه از آنها مراقبت کنیم؟',
      imageUrl: getImagePath('infographics/baby-teeth.jpg'),
      audioPath: 'baby-teeth-audio.mp3',
      content: `
        <h2>اهمیت دندان‌های شیری</h2>
        <p>دندان‌های شیری نقش مهمی در رشد و سلامت کودک دارند. این دندان‌ها فضا را برای دندان‌های دائمی حفظ می‌کنند و به رشد صحیح فک و صورت کمک می‌کنند.</p>
      `
    },
    {
      id: 2,
      title: 'فلوراید',
      description: 'فواید فلوراید برای سلامت دندان‌ها و چگونگی استفاده صحیح از آن',
      imageUrl: getImagePath('infographics/fluoride.jpg'),
      audioPath: 'fluoride-audio.mp3',
      content: `
        <h2>فلوراید</h2>
        <div class="fluoride-brochure-container">
          <img 
            src="/assets/images/fluoride-brochure-1.PNG" 
            alt="" 
            class="fluoride-brochure-image"
          />
          <img 
            src="/assets/images/fluoride-brochure-2.PNG" 
            alt="" 
            class="fluoride-brochure-image"
          />
        </div>
      `
    },
    {
      id: 3,
      title: 'راهنمای جامع بهداشت دهان و دندان',
      description: 'فایل PDF آموزشی کامل برای والدین و کودکان',
      imageUrl: getImagePath('infographics/dental-guide.jpg'),
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
      imageUrl: getImagePath('infographics/fissure-sealant.jpg'),
      videoPath: 'fissure-sealant-video.MP4',
      content: `
        <h2>فیشورسیلنت (شیارپوش)</h2>
        <p>شیارپوش یا فیشورسیلنت لایه‌ای محافظ است که روی شیارهای دندان‌های آسیاب قرار می‌گیرد تا از پوسیدگی جلوگیری کند. این روش ساده و بدون درد برای کودکان بسیار مؤثر است.</p>
        
        <div class="important-note">
          <p>بهتر است از شیارپوش (فیشورسیلنت) برای محافظت از دندان‌های آسیاب اول دائمی استفاده شود. این روش پیشگیرانه، با بستن شیارهای عمیق دندان‌های آسیاب اول دائمی توسط دندانپزشک، از ورود خرده‌های مواد غذایی و میکروارگانیسم‌ها به داخل این شیارها جلوگیری می‌کند. استفاده از شیارپوش به‌شدت توصیه می‌شود.</p>
        </div>
      `
    },
    {
      id: 5,
      title: 'آموزش مسواک زدن برای کودکان',
      description: 'راهنمای والدین برای مسواک زدن صحیح دندان‌های کودکان',
      imageUrl: getImagePath('infographics/toothbrushing-kids.jpg'),
      videoPath: 'toothbrushing-kids-video.mp4',
      content: `
        <h2>آموزش مسواک زدن برای کودکان</h2>
        <p>در این بخش، نحوه صحیح مسواک زدن دندان‌های کودکان توسط والدین آموزش داده می‌شود. این تکنیک‌ها به شما کمک می‌کند تا به عنوان والدین، دندان‌های فرزند خود را به درستی و بدون آسیب تمیز کنید.</p>
      `
    }
  ];

  // Initialize database and resources
  useEffect(() => {
    const initResources = async () => {
      try {
        // Initialize database if needed
        if (!DatabaseService.initialized) {
          await DatabaseService.init();
        }
        
        // Mark assets as loaded
        setAssetsLoaded(true);
      } catch (error) {
        console.error('Error initializing resources:', error);
        // Set assets as loaded even on error to prevent loading screen from getting stuck
        setAssetsLoaded(true);
      }
    };

    initResources();
  }, []);

  // Setup audio player when infographic changes
  useEffect(() => {
    if (selectedInfoGraphic?.audioPath) {
      // Update to use platform-aware path
      const audioPath = Capacitor.isNativePlatform() 
        ? `file:///android_asset/assets/audios/${selectedInfoGraphic.audioPath}`
        : `/assets/audios/${selectedInfoGraphic.audioPath}`;
      
      initAudio(audioPath);
    }
  }, [selectedInfoGraphic]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioState.audioRef) {
        audioState.audioRef.pause();
        setAudioState(prev => ({
          ...prev,
          audioRef: null,
          isPlaying: false
        }));
      }
    };
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
    // Stop any playing audio
    if (audioState.audioRef) {
      audioState.audioRef.pause();
    }
    
    setSelectedInfoGraphic(null);
    setShowPdfViewer(false);
    setAudioState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      loading: false,
      error: null,
      audioRef: null,
      audioSource: ''
    });
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

  // Display PDF viewer in full screen - FIXED for Android compatibility
  if (showPdfViewer && selectedInfoGraphic && selectedInfoGraphic.type === 'pdf') {
    const pdfPath = Capacitor.isNativePlatform()
      ? `file:///android_asset/assets/pdfs/${selectedInfoGraphic.pdfPath}`
      : `/assets/pdfs/${selectedInfoGraphic.pdfPath}`;

    return (
      <div className="pdf-viewer-fullscreen">
        <div className="pdf-viewer-header">
          <h3>{selectedInfoGraphic.title}</h3>
          <button className="close-button" onClick={handleClosePdfViewer}>
            بازگشت
          </button>
        </div>
        
        <div className="pdf-viewer-container-fullscreen">
          {/* Changed from object to iframe for better Android compatibility */}
          <iframe 
            src={pdfPath}
            className="pdf-viewer-iframe"
            title="PDF Viewer"
            style={{ width: '100%', height: '100%', border: 'none' }}
          >
            <p>مرورگر شما قادر به نمایش PDF نیست. برای مشاهده <a href={pdfPath} target="_blank" rel="noopener noreferrer">اینجا کلیک کنید</a>.</p>
          </iframe>
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
            {/* Display tooth anatomy images for Baby Teeth section */}
            {selectedInfoGraphic.id === 1 && (
              <div className="side-by-side-images">
                <div className="tooth-image">
                  <img 
                    src={getImagePath('tooth-anatomy-english.jpg')}
                    alt="" 
                    className="anatomy-image"
                    onError={(e) => {
                      console.warn('Failed to load tooth anatomy image, trying alternate');
                      e.target.src = getImagePath('tooth-anatomy-english.png');
                    }}
                  />
                </div>
                
                <div className="tooth-image">
                  <img 
                    src={getImagePath('tooth-anatomy-persian.jpg')}
                    alt="" 
                    className="anatomy-image"
                    onError={(e) => {
                      console.warn('Failed to load tooth anatomy image, trying alternate');
                      e.target.src = getImagePath('tooth-anatomy-persian.png');
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Display infographic content */}
            <div 
              className="infographic-text"
              dangerouslySetInnerHTML={{ __html: processContent(selectedInfoGraphic.content) }}
            />
            
            {/* Display audio player if infographic has audio */}
            {selectedInfoGraphic.audioPath && (
              <div className="integrated-audio-player">
                <h4>صدای توضیحات</h4>
                <div className="player-controls">
                  <button 
                    className={`play-pause-button ${audioState.isPlaying ? 'playing' : ''}`}
                    onClick={togglePlayPause}
                    disabled={audioState.loading || !audioState.audioRef}
                  >
                    {audioState.loading ? '⏳' : audioState.isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <div className="time-display current-time">{formatTime(audioState.currentTime)}</div>
                  <div 
                    className="progress-bar-container"
                    onClick={handleSeek}
                  >
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${audioState.duration > 0 ? (audioState.currentTime / audioState.duration) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                  <div className="time-display duration">{formatTime(audioState.duration)}</div>
                </div>
                {audioState.error && (
                  <div className="audio-error">
                    {audioState.error}
                  </div>
                )}
              </div>
            )}
            
            {/* Display video player if infographic has video */}
            {selectedInfoGraphic.videoPath && (
              <div className="integrated-video-player">
                <h4>ویدیوی آموزشی</h4>
                <video 
                  controls 
                  preload="metadata"
                  className={`video-player ${selectedInfoGraphic.id === 5 ? 'toothbrushing-video' : 'fissure-sealant-video'}`}
                  poster={getImagePath('video-thumbnail-1.jpg')}
                >
                  <source src={getVideoPath(selectedInfoGraphic.videoPath)} type="video/mp4" />
                  مرورگر شما قادر به نمایش ویدیو نیست.
                </video>
              </div>
            )}
            
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
                ) : infographic.videoPath ? (
                  <div className="thumbnail-placeholder video-thumbnail">
                    <span className="placeholder-icon">🎬</span>
                    <span className="placeholder-text">ویدیو</span>
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
        
        .pdf-thumbnail, .video-thumbnail {
          background-color: #f0f0f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .pdf-thumbnail .placeholder-icon, .video-thumbnail .placeholder-icon {
          font-size: 2rem;
          margin-bottom: 5px;
        }
        
        .video-thumbnail {
          background-color: #e8f5e9;
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
        
        /* Integrated audio player styles */
        .integrated-audio-player {
          margin: 20px 0;
          padding: 15px;
          background-color: #f5f7ff;
          border-radius: 8px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
        }
        
        .integrated-audio-player h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #2196f3;
        }
        
        .player-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .play-pause-button {
          background-color: #2196f3;
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .play-pause-button:hover {
          background-color: #1976d2;
        }
        
        .play-pause-button.playing {
          background-color: #ff5722;
        }
        
        .play-pause-button:disabled {
          background-color: #bdbdbd;
          cursor: not-allowed;
        }
        
        .time-display {
          font-family: monospace;
          font-size: 14px;
          color: #555;
          min-width: 45px;
          text-align: center;
        }
        
        .progress-bar-container {
          flex: 1;
          height: 10px;
          background-color: #e0e0e0;
          border-radius: 5px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #2196f3;
          border-radius: 5px;
          transition: width 0.1s linear;
        }
        
        .audio-error {
          color: #f44336;
          padding: 10px;
          background-color: #ffebee;
          border-radius: 4px;
          font-size: 14px;
          margin: 10px 0;
        }
        
        /* Integrated video player styles */
        .integrated-video-player {
          margin: 20px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .integrated-video-player h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #2196f3;
        }
        
        .video-player {
          width: 100%;
          max-width: 550px;
          display: block;
          margin: 0 auto;
          border-radius: 4px;
          background-color: #000;
        }
        
        /* تنظیم ابعاد ویدیو مسواک زدن به صورت 16:9 عمودی */
        .toothbrushing-video {
          aspect-ratio: 9/16;
        }
        
        /* حفظ نسبت مربعی برای ویدیو فیشورسیلنت */
        .fissure-sealant-video {
          aspect-ratio: 1/1;
        }
        
        /* Additional styles for thumbnails and layout */
        .infographics-container {
          padding: 15px;
          max-width: 1200px;
          margin: 0 auto;
          direction: rtl;
        }
        
        .infographics-header {
          margin-bottom: 20px;
          text-align: right;
        }
        
        .infographics-description {
          color: #666;
          line-height: 1.5;
        }
        
        .infographics-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .infographic-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          background-color: white;
        }
        
        .infographic-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .infographic-thumbnail {
          height: 160px;
          background-color: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #eee;
        }
        
        .thumbnail-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        .infographic-info {
          padding: 15px;
        }
        
        .infographic-title {
          margin: 0 0 10px 0;
          font-size: 1.1rem;
        }
        
        .infographic-description {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .infographic-detail {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
        }
        
        .detail-title {
          margin: 0;
          font-size: 1.5rem;
        }
        
        .infographic-content {
          line-height: 1.6;
        }
        
        .infographic-text {
          margin-top: 20px;
        }
        
        .infographic-text h2 {
          color: #2196f3;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .infographics-tips {
          background-color: #e8f5e9;
          padding: 20px;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .infographics-tips h3 {
          color: #2e7d32;
          margin-top: 0;
          margin-bottom: 15px;
        }
        
        .infographics-tips ul {
          padding-right: 20px;
          margin: 0;
        }
        
        .infographics-tips li {
          margin-bottom: 10px;
          line-height: 1.5;
        }
        
        .infographics-tips li:last-child {
          margin-bottom: 0;
        }
        
        .side-by-side-images {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
          margin: 20px 0;
        }
        
        .tooth-image {
          flex: 1;
          min-width: 280px;
          max-width: 400px;
          text-align: center;
        }
        
        .anatomy-image {
          max-width: 100%;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .fluoride-brochure-container {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          justify-content: center;
          margin: 20px 0;
        }
        
        .fluoride-brochure-image {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .detail-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .detail-actions {
            margin-top: 15px;
            width: 100%;
          }
          
          .view-button, .back-button {
            flex: 1;
            text-align: center;
          }
          
          .side-by-side-images {
            flex-direction: column;
            align-items: center;
          }
          
          .tooth-image {
            max-width: 100%;
          }
        }
        
        @media (max-width: 480px) {
          .infographics-list {
            grid-template-columns: 1fr;
          }
          
          .infographic-detail {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default InfoGraphics;