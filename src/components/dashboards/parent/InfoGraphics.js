import React, { useState, useEffect } from 'react';
import './ParentComponents.css';
import DatabaseService from '../../../services/DatabaseService';
import { Capacitor } from '@capacitor/core';

const InfoGraphics = () => {
  const [selectedInfoGraphic, setSelectedInfoGraphic] = useState(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  
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

  // Simple path functions - direct paths like your working alarm code
  const getImagePath = (filename) => `/assets/images/${filename}`;
  const getAudioPath = (filename) => `/assets/audios/${filename}`;
  const getVideoPath = (filename) => `/assets/videos/${filename}`;
  const getPdfPath = (filename) => `/assets/pdfs/${filename}`;

  // Format time for display (MM:SS)
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return '00:00';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Load and play audio file - using direct paths like alarm
  const initAudio = (audioFilename) => {
    // Clean up any existing audio
    if (audioState.audioRef) {
      audioState.audioRef.pause();
    }
    
    // Create direct path like your working alarm code
    const audioPath = `/assets/audios/${audioFilename}`;
    console.log('Loading audio with direct path:', audioPath);
    
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

  // Helper to process content paths - simplified for direct paths
  const processContent = (content) => {
    // Content now uses direct paths, so minimal processing needed
    return content;
  };

  // List of available infographics with direct paths like alarm code
  const infographics = [
    {
      id: 1,
      title: 'اهمیت دندان شیری',
      description: 'چرا دندان‌های شیری مهم هستند و چگونه از آنها مراقبت کنیم؟',
      imageUrl: '/assets/images/baby-teeth.jpg',
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
      imageUrl: '/assets/images/fluoride.jpg',
      audioPath: 'fluoride-audio.mp3',
      content: `
        <h2>فلوراید</h2>
        <div class="fluoride-brochure-container">
          <img 
            src="/assets/images/fluoride-brochure-1.PNG" 
            alt="بروشور فلوراید - قسمت اول" 
            class="fluoride-brochure-image"
          />
          <img 
            src="/assets/images/fluoride-brochure-2.PNG" 
            alt="بروشور فلوراید - قسمت دوم" 
            class="fluoride-brochure-image"
          />
        </div>
      `
    },
    {
      id: 3,
      title: 'راهنمای جامع بهداشت دهان و دندان',
      description: 'مجموعه کاملی از اطلاعات و آموزش‌های مربوط به سلامت دهان و دندان برای دانش‌آموزان و والدین',
      imageUrl: '/assets/images/dental-guide.jpg',
      content: `
        <div class="content-container">
          <div class="document-header">
            <h1>سلامت دهان و دندان</h1>
            <h2>والدین/ معلمین کودکان دبستانی</h2>
            <div class="author-info">
              <p><strong>تهیه کننده:</strong></p>
              <p>دکتر افسانه پاکدامن</p>
              <p>عضو هیئت علمی دانشکده دندانپزشکی دانشگاه علوم پزشکی تهران</p>
            </div>
          </div>

          <section class="content-section">
            <h3>روند ایجاد پوسیدگی</h3>
            <ul>
              <li>پس از مصرف غذا خصوصا غذاهای حاوی قند، ذرات باقی مانده در لابه لای سطوح و بین دندانها جمع شده توسط میکروبهای موجود در دهان مصرف و تجزیه میشوند.</li>
              <li>این موجودات میکروسکوپی بطور معمول در دهان هر فردی وجود دارند و در صورتی که غذاهای حاوی قند به آنها نرسد برای دندانها مضر نمی باشند.</li>
              <li>این موجودات ریز پس از مصرف قند اسید تولید می کنند که باعث تخریب دندان وایجاد پوسیدگی می شود.</li>
            </ul>

            <div class="explanation-box">
              <p>تصور کنید که به سفر رفته اید و مسواکتان را فراموش کرده اید، بر روی دندانها لایه ای تشکیل می شود که ابتدا با چشم غیر مسلح قابل رویت نیست.</p>
              <p><strong>بعد از چند روز چه احساسی دارید؟</strong></p>
              <p>لایه ای روی دندانها را پوشانده است که از تجمع خرده های مواد غذایی، سلولهای متفلس شده دهان و میکربهای داخل دهان تشکیل شده است.</p>
            </div>

            <div class="definitions">
              <div class="definition-item">
                <strong>پلاک دندانی:</strong> لایه بیرنگ/سفید مایل به زرد که به سطوح دندانی و سایر نسوج سخت داخل دهان شامل دندانهای مصنوعی ثابت و متحرک می چسبد.
              </div>
              <div class="definition-item">
                <strong>ماتریال آلبا:</strong> لایه سفید و بیرنگ که با چشم دیده می شود.
              </div>
              <div class="definition-item">
                <strong>جرم:</strong> پلاک دندانی آهکی شده می باشد.
              </div>
            </div>

            <div class="image-placeholder">
              <img src="/assets/images/1.jpg" class="content-image" alt="نمایش تشکیل پلاک دندانی" />
              <p class="image-caption">نمایش تشکیل پلاک دندانی و جرم روی دندان</p>
            </div>
          </section>

          <section class="content-section">
            <h3>آموزش بهداشت دهان و دندان جهت کودکان 3 تا 6 ساله</h3>
            
            <ul>
              <li>لکه های سفید روی سطح بیرونی دندانها ممکن است از علائم اولیه پوسیدگی باشد.</li>
              <li>دندانهای شیری نقش مهمی در زیبایی و تکلم کودک خردسال دارد. بنابراین با دقت و حوصله بر مسواک زدن کودک نظارت کنید.</li>
              <li>مسواک مناسب با توجه به ابعاد دهان کودک انتخاب کنید.</li>
              <li>هزینه اقدامات پیشگیری و رعایت اصول بهداشت دهان و دندان در مقابل هزینه درمانهای دندان پزشکی اندک می باشد. مضافا بر اینکه بدین ترتیب دندانهای شیری حفظ شده و عمل تغذیه کودک دچار مشکل نخواهد شد.</li>
            </ul>

            <div class="method-box">
              <h4>روش توصیه شده جهت کودکان 3-6 ساله:</h4>
              <p>مسواک روی دندانها طوری قرار داده میشود که هر بار 3 تا 4 دندان شسته شود. مسواک در فک بالا با حرکت جلو و عقب حرکت میکند. در فک پایین بطور مشابه این حرکت انجام میشود.</p>
            </div>

            <div class="image-placeholder">
              <img src="/assets/images/2.jpg" class="content-image" alt="نحوه مسواک زدن کودکان" />
              <p class="image-caption">نحوه صحیح مسواک زدن برای کودکان 3-6 ساله</p>
            </div>

            <div class="tips">
              <ul>
                <li>از خمیر دندان مخصوص کودکان استفاده کنید.</li>
                <li>سلیقه کودک را از نظر طعم و رنگ خمیر دندان در نظر بگیرید.</li>
              </ul>
            </div>
          </section>

          <section class="content-section">
            <h3>مسواک زدن تحت نظارت</h3>
            
            <ul>
              <li>در صورتی که کودک شما قادر به مسواک زدن بصورت صحیح نمیباشد انجام مسواک زدن میتواند توسط والدین/مربیان برای کودک انجام شود.</li>
              <li>بهترین حالت برای آموزش مسواک زدن به کودکان این صورت می باشد که مربی/والدین در پشت سر کودک قرار گرفته و برای وی مسواک بزنند.</li>
              <li>قرار گرفتن در مقابل کودک باعث اضطراب وی می گردد. استفاده از نخ دندان برای کودک لازم و عادت به انجام آن ضروری است و از آنجاییکه این عمل برای وی دشوار می باشد مربی/والدین این عمل را برای وی می توانند انجام دهند.</li>
            </ul>
          </section>

          <section class="content-section">
            <h3>فلوراید تراپی در کودکان</h3>
            
            <p>فلوراید عنصری است که باعث استحکام دندان می شود و دندان را در مقابل عوامل پوسیدگی زا مقاوم می نماید. پس انجام فلوراید تراپی در دوران دندانهای شیری و بعد از آن لازم و ضروری است.</p>
            
            <p>استفاده از فلوراید بصورت موضعی توصیه میشود. فلوراید تراپی موضعی توسط دندان پزشک در مطب بصورت استفاده از ژل میباشد. همچنین مصرف وارنیش حاوی فلوراید توسط دندانپزشک و استفاده از خمیر دندان حاوی فلوراید در منزل طبق توصیه دندانپزشک باید صورت گیرد.</p>

            <div class="warning-box">
              <h4>نکات مهم:</h4>
              <ul>
                <li>از بلع دهانشویه حاوی فلوراید خودداری شود.</li>
                <li>در صورت قورت دادن توسط کودک نگران نباشید چون مقدار فلوراید آن اندک میباشد.</li>
                <li>مصرف شیر در صورت بلع فلوراید مفید میباشد.</li>
                <li>مصرف دهانشویه قبل از 6 سالگی توصیه نمی شود.</li>
              </ul>
            </div>
          </section>

          <section class="content-section">
            <h3>تغذیه و عادات غذایی</h3>
            
            <ul>
              <li>عنصر کلسیم و فسفر که در شیر و فراورده های آن موجود است منجر به تقویت ساختمان دندان می شود و گاه پوسیدگی های جزئی را هم متوقف کرده و از روند تشدید آن جلوگیری می نماید.</li>
              <li>مصرف مقادیر کافی لبنیات بخصوص در دوران بارداری توصیه میشود.</li>
              <li>با توجه به موارد گفته شده و از آنجاییکه الگوی غذایی کودک از همین سنین پایین شکل می گیرد و بصورت عادت در می آید در صورت تغذیه مناسب و صحیح در دوران کودکی این روند تا سنین بالا ادامه پیدا خواهد کرد و منجر به حفظ دندانها و جلوگیری از دست دادن آنها خواهد شد.</li>
              <li>پس کودک را به مصرف شیر و فراورده های آن تشویق کرده و از مصرف مواد قندی مثل شکلات منع کنید. مصرف مواد قندی بخصوص در دفعات کمتر و در زمان وعده های اصلی غذا باید صورت گیرد و حتی المقدور بلافاصله دهان شسته و مسواک زده شود.</li>
            </ul>
          </section>

          <section class="content-section">
            <h3>مراجعه منظم به دندان پزشک</h3>
            
            <p>کودک را هر 6 ماه یکبار به مطب دندان پزشکی برده و در صورت لزوم جهت فلوراید تراپی وی اقدام کنید.</p>
            
            <p>این مورد را در نظر داشته باشید پرکردگی ها و اعمال دندان پزشکی جزئی از تبدیل شدن آن به مشکل حاد و پر هزینه جلوگیری خواهد کرد.</p>
            
            <div class="highlight-box">
              <p><strong>کشیدن دندانهای شیری موجب بهم ریختگی قوس فکی می شود لذا حفظ دندانهای شیری مهم است.</strong></p>
            </div>

            <div class="image-placeholder">
              <img src="/assets/images/3.jpg" class="content-image" alt="اهمیت حفظ دندان‌های شیری" />
              <p class="image-caption">اهمیت حفظ دندان‌های شیری و قوس فکی</p>
            </div>
          </section>

          <section class="content-section">
            <h3>نحوه مسواک زدن جهت بزرگسالان</h3>
            
            <ol>
              <li>مسواک اندازه مناسب با موهای نرم یا متوسط انتخاب کنید.</li>
              <li>به اندازه یک نخود فرنگی خمیر دندان (حاوی فلوراید) بر روی آن بگذارید.</li>
              <li>از یک سمت شروع کنید و تمام سطوح دندانها را مسواک بزنید (نحوه صحیح قرار گیری مسواک در شکل بعد نشان داده شده است).</li>
              <li>پس از اتمام، مقدار اضافه خمیر دندان را با مقدار کمی آب از دهان خارج کنید.</li>
              <li>بهتر است آب نمک ساده (یک لیوان آب جوشیده سرد و کمی نمک) را دهانشویه کنید.</li>
            </ol>

            <div class="image-placeholder">
              <img src="/assets/images/4.jpg" class="content-image" alt="نحوه مسواک زدن بزرگسالان" />
              <p class="image-caption">نحوه صحیح مسواک زدن برای بزرگسالان</p>
            </div>
          </section>

          <section class="content-section references">
            <h3>منابع</h3>
            <ul class="reference-list">
              <li>Caries incidence of the first permanent molars according to the Caries Assessment Spectrum and Treatment (CAST) index and its determinants in children: a cohort study. Z Mahboobi, A Pakdaman, R Yazdani, L Azadbakht, AR Shamshiri, ... BMC Oral Health 21 (1), 259, 2021</li>
              <li>Effect of an Oral Health Promotion Program Including Supervised Toothbrushing on 6 to 7-Year-Old School Children: A Randomized Controlled Trial. A Babaei, A Pakdaman, H Hessari. Frontiers in dentistry 17, 19, 2020</li>
              <li>One-year oral health outcome of a community-based trial in schoolchildren aged 6–7 years old in Tehran, Iran. A Babaei, A Pakdaman, AR Shamshiri, P Khazaei, H Hessari. Plos one 18 (4), e0284366</li>
            </ul>
          </section>
        </div>
      `
    },
    {
      id: 4,
      title: 'فیشورسیلنت (شیارپوش)',
      description: 'آشنایی با شیارپوش دندان و مزایای آن برای پیشگیری از پوسیدگی',
      imageUrl: '/assets/images/fissure-sealant.jpg',
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
      imageUrl: '/assets/images/toothbrushing-kids.jpg',
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

  // Setup audio player when infographic changes - using direct filename
  useEffect(() => {
    if (selectedInfoGraphic?.audioPath) {
      console.log('Setting up audio for infographic:', selectedInfoGraphic.id, 'Audio file:', selectedInfoGraphic.audioPath);
      initAudio(selectedInfoGraphic.audioPath); // Pass filename directly
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

  const handleSelectInfoGraphic = (infographic) => {
    setSelectedInfoGraphic(infographic);
  };

  const handleBackToList = () => {
    // Stop any playing audio
    if (audioState.audioRef) {
      audioState.audioRef.pause();
    }
    
    setSelectedInfoGraphic(null);
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
              <button className="back-button" onClick={handleBackToList}>
                بازگشت به لیست
              </button>
            </div>
          </div>
          
          <div className="infographic-content">
            {/* Display tooth anatomy images for Baby Teeth section - using direct paths */}
            {selectedInfoGraphic.id === 1 && (
              <div className="side-by-side-images">
                <div className="tooth-image">
                  <img 
                    src="/assets/images/tooth-anatomy-english.jpg"
                    alt="آناتومی دندان - انگلیسی" 
                    className="anatomy-image"
                    onError={(e) => {
                      console.warn('Failed to load tooth anatomy english image');
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                
                <div className="tooth-image">
                  <img 
                    src="/assets/images/tooth-anatomy-persian.jpg"
                    alt="آناتومی دندان - فارسی" 
                    className="anatomy-image"
                    onError={(e) => {
                      console.warn('Failed to load tooth anatomy persian image');
                      e.target.style.display = 'none';
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
            
            {/* Display video player if infographic has video - using direct paths */}
            {selectedInfoGraphic.videoPath && (
              <div className="integrated-video-player">
                <h4>ویدیوی آموزشی</h4>
                <video 
                  controls 
                  preload="metadata"
                  className={`video-player ${selectedInfoGraphic.id === 5 ? 'toothbrushing-video' : 'fissure-sealant-video'}`}
                  poster="/assets/images/video-thumbnail-1.jpg"
                  onError={(e) => {
                    console.error('Video failed to load:', selectedInfoGraphic.videoPath, e);
                  }}
                  onLoadStart={() => {
                    console.log('Video loading started:', selectedInfoGraphic.videoPath);
                  }}
                >
                  <source src={`/assets/videos/${selectedInfoGraphic.videoPath}`} type="video/mp4" />
                  <p className="video-error">مرورگر شما قادر به نمایش ویدیو نیست.</p>
                </video>
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
                {infographic.videoPath ? (
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
          <li>ویدیوهای آموزشی را می‌توانید همراه با کودک خود تماشا کنید و به او کمک کنید تا مهارت‌های بهداشت دهان و دندان را بیاموزد.</li>
        </ul>
      </div>
      
      <style jsx>{`
        .document-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        
        .document-header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
          font-size: 28px;
        }
        
        .document-header h2 {
          color: #34495e;
          margin-bottom: 15px;
          font-size: 20px;
        }
        
        .author-info {
          background-color: #e8f4f8;
          padding: 15px;
          border-radius: 6px;
          margin-top: 15px;
        }
        
        .content-section {
          margin-bottom: 40px;
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .content-section h3 {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .explanation-box {
          background-color: #f0f8ff;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3498db;
          margin: 20px 0;
        }
        
        .definitions {
          background-color: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        
        .definition-item {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #fff;
          border-radius: 4px;
          border-left: 3px solid #27ae60;
        }
        
        .method-box {
          background-color: #e8f5e8;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #27ae60;
          margin: 20px 0;
        }
        
        .tips {
          background-color: #f0f8ff;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
        }
        
        .warning-box {
          background-color: #ffeaea;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e74c3c;
          margin: 20px 0;
        }
        
        .warning-box h4 {
          color: #e74c3c;
          margin-bottom: 15px;
        }
        
        .highlight-box {
          background-color: #fff9e6;
          padding: 20px;
          border-radius: 8px;
          border: 2px solid #f39c12;
          margin: 20px 0;
          text-align: center;
        }
        
        .image-placeholder {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #dee2e6;
        }
        
        .content-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .image-caption {
          margin-top: 10px;
          font-style: italic;
          color: #6c757d;
          font-size: 14px;
        }
        
        .references {
          background-color: #f8f9fa;
          border-top: 3px solid #6c757d;
        }
        
        .reference-list {
          font-size: 14px;
          line-height: 1.6;
        }
        
        .reference-list li {
          margin-bottom: 15px;
          padding: 10px;
          background-color: #fff;
          border-radius: 4px;
        }
        
        .content-container {
          direction: rtl;
          text-align: right;
        }
        
        .content-container ul, .content-container ol {
          padding-right: 20px;
          padding-left: 0;
        }
        
        .content-container li {
          margin-bottom: 8px;
          line-height: 1.6;
        }

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
        
        .video-thumbnail {
          background-color: #e8f5e9;
        }
        
        .placeholder-text {
          font-size: 0.8rem;
          color: #666;
        }
        
        .detail-actions {
          display: flex;
          gap: 10px;
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
        
        .toothbrushing-video {
          aspect-ratio: 9/16;
        }
        
        .fissure-sealant-video {
          aspect-ratio: 1/1;
        }
        
        .video-error {
          background-color: #ffebee;
          color: #f44336;
          padding: 20px;
          text-align: center;
          border-radius: 4px;
          margin: 10px 0;
        }
        
        /* Main container styles */
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
          
          .back-button {
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