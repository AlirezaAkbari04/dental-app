import React, { useState } from 'react';
import DatabaseService from '../../../services/DatabaseService';
import PdfService from '../../../services/PdfService';
import { Toast } from '@capacitor/toast';
import { useUser } from '../../../contexts/UserContext';

const Questionnaire = ({ childName }) => {
  const { currentUser } = useUser();
  const [consent, setConsent] = useState('');
  const [respondent, setRespondent] = useState('');
  const [grade, setGrade] = useState('');
  const [brushingFrequency, setBrushingFrequency] = useState('');
  const [snackFrequency, setSnackFrequency] = useState('');
  const [toothpasteUsage, setToothpasteUsage] = useState('');
  const [brushingHelp, setBrushingHelp] = useState('');
  const [brushingHelper, setBrushingHelper] = useState('');
  const [brushingCheck, setBrushingCheck] = useState('');
  const [brushingChecker, setBrushingChecker] = useState('');
  const [snackLimit, setSnackLimit] = useState('');
  const [snackLimiter, setSnackLimiter] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [savedSurveyData, setSavedSurveyData] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (consent !== 'yes') {
      try {
        await Toast.show({
          text: 'لطفا برای ادامه رضایت خود را اعلام کنید.',
          duration: 'long',
          position: 'center'
        });
      } catch {
        alert('لطفا برای ادامه رضایت خود را اعلام کنید.');
      }
      return;
    }

    try {
      const surveyData = {
        parentId: currentUser?.id || 'anonymous',
        childName,
        timestamp: new Date().toISOString(),
        consent,
        respondent,
        grade,
        brushingFrequency,
        snackFrequency,
        toothpasteUsage,
        brushingHelp,
        brushingHelper,
        brushingCheck,
        brushingChecker,
        snackLimit,
        snackLimiter
      };

      // Save to database if available, otherwise use localStorage
      if (DatabaseService.initialized && currentUser?.id) {
        await DatabaseService.saveSurveyResponse(currentUser.id, surveyData);
      } else {
        // Fallback to localStorage
        const existingResponses = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
        existingResponses.push(surveyData);
        localStorage.setItem('surveyResponses', JSON.stringify(existingResponses));
      }

      setSavedSurveyData(surveyData);
      setIsSubmitted(true);
      setShowForm(false);
      
      try {
        await Toast.show({
          text: 'پاسخ‌های شما با موفقیت ثبت شد.',
          duration: 'short',
          position: 'center'
        });
      } catch {
        // Toast capability not available, continue silently
      }
    } catch (error) {
      console.error('Error saving survey response:', error);
      try {
        await Toast.show({
          text: 'خطا در ثبت پاسخ‌ها. لطفا دوباره تلاش کنید.',
          duration: 'long',
          position: 'center'
        });
      } catch {
        alert('خطا در ثبت پاسخ‌ها. لطفا دوباره تلاش کنید.');
      }
    }
  };

  const handleReset = () => {
    setShowForm(true);
    setIsSubmitted(false);
    setSavedSurveyData(null);
    setConsent('');
    setRespondent('');
    setGrade('');
    setBrushingFrequency('');
    setSnackFrequency('');
    setToothpasteUsage('');
    setBrushingHelp('');
    setBrushingHelper('');
    setBrushingCheck('');
    setBrushingChecker('');
    setSnackLimit('');
    setSnackLimiter('');
  };
  
  const handleGeneratePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const result = await PdfService.generateQuestionnairePdf(savedSurveyData, childName);
      
      if (result.success) {
        try {
          await Toast.show({
            text: 'گزارش PDF با موفقیت ایجاد شد.',
            duration: 'short',
            position: 'bottom'
          });
          
          // If on a native platform, offer to share the PDF
          if (result.filePath) {
            const shareResult = await PdfService.sharePdf(result.filePath, result.fileName);
            if (!shareResult.success) {
              console.error('Error sharing PDF:', shareResult.error);
            }
          }
        } catch {
          alert('گزارش PDF با موفقیت ایجاد شد.');
        }
      } else {
        console.error('Error generating PDF:', result.error);
        try {
          await Toast.show({
            text: 'خطا در ایجاد گزارش PDF. لطفا دوباره تلاش کنید.',
            duration: 'long',
            position: 'center'
          });
        } catch {
          alert('خطا در ایجاد گزارش PDF. لطفا دوباره تلاش کنید.');
        }
      }
    } catch (error) {
      console.error('Error in PDF generation process:', error);
      try {
        await Toast.show({
          text: 'خطا در ایجاد گزارش PDF. لطفا دوباره تلاش کنید.',
          duration: 'long',
          position: 'center'
        });
      } catch {
        alert('خطا در ایجاد گزارش PDF. لطفا دوباره تلاش کنید.');
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Success message after submission
  if (isSubmitted) {
    return (
      <div className="questionnaire-container">
        <h2 className="section-title">پرسشنامه سلامت دهان و دندان</h2>
        <div className="success-message">
          <h3>با تشکر از شما!</h3>
          <p>پاسخ‌های شما با موفقیت ثبت شد.</p>
          <div className="report-actions">
            <button 
              onClick={handleGeneratePdf} 
              className="pdf-button"
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? 'در حال ایجاد گزارش...' : 'دریافت گزارش PDF'}
            </button>
            <button onClick={handleReset} className="reset-button">
              تکمیل مجدد پرسشنامه
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not submitted yet or reset - show form
  if (!showForm) {
    return null;
  }

  return (
    <div className="questionnaire-container">
      <h2 className="section-title">پرسشنامه سلامت دهان و دندان</h2>
      
      <div className="questionnaire-intro">
        <p>
          هدف اصلی این اپلیکیشن کمک به بهبود سلامت دهان و دندان کودکان دبستانی می باشد. این برنامه توسط دانشگاه علوم پزشکی تهران طراحی شده است. این اپلیکیشن شامل مطالب مفید مرتبط با سلامت دهان و دندان و پیشگیری از بیماری می باشد.در ضمن اگر کودک شما به درمان دندانپزشکی ضروری نیاز داشته باشد به شما اطلاع داده میشود و مرکز بهداشتی و درمانی دولتی نزدیک به شما معرفی می شود. لطفا چند دقیقه ای جهت پاسخ گویی به سوالات صرف کنید.
        </p>
        <p>
          لازم به ذکر است که فقط محقق از پاسخ های شما مطلع خواهد شد. نتایج صرفا بدون ذکر نام و برای برنامه ریزی بهتر برای سلامت دهان و دندان فرزندان عزیزمان استفاده می شود. شرکت در این تحقیق اختیاری میباشد لذا لازم است به سوالات صادقانه و در کمال راحتی پاسخ دهید.
        </p>
        <p className="text-center">با تشکر از همکاری شما</p>
      </div>

      <form onSubmit={handleSubmit} className="questionnaire-form">
        <div className="form-group">
          <p>من با پر کردن این پرسشنامه رضایت دارم که در این تحقیق شرکت کنم.</p>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="consent"
                value="yes"
                checked={consent === 'yes'}
                onChange={() => setConsent('yes')}
                required
              />
              آری
            </label>
            <label>
              <input
                type="radio"
                name="consent"
                value="no"
                checked={consent === 'no'}
                onChange={() => setConsent('no')}
              />
              خیر
            </label>
          </div>
        </div>

        <div className="form-group">
          <p>این پرسشنامه را چه کسی پر میکند؟</p>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="respondent"
                value="father"
                checked={respondent === 'father'}
                onChange={() => setRespondent('father')}
                required
              />
              پدر
            </label>
            <label>
              <input
                type="radio"
                name="respondent"
                value="mother"
                checked={respondent === 'mother'}
                onChange={() => setRespondent('mother')}
              />
              مادر
            </label>
            <label>
              <input
                type="radio"
                name="respondent"
                value="other"
                checked={respondent === 'other'}
                onChange={() => setRespondent('other')}
              />
              سایر بستگان
            </label>
          </div>
        </div>

        <div className="questionnaire-section">
          <p className="section-description">
            این قسمت از پرسشنامه در مورد سلامت دهان کودکانتان است که دراین مدرسه درس میخواند. لطفا پاسخ واقعی را انتخاب و علامت بزنید.
          </p>

          <div className="form-group">
            <p>کلاس:</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="preschool"
                  checked={grade === 'preschool'}
                  onChange={() => setGrade('preschool')}
                  required
                />
                پیش دبستانی
              </label>
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="first"
                  checked={grade === 'first'}
                  onChange={() => setGrade('first')}
                />
                اول
              </label>
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="second"
                  checked={grade === 'second'}
                  onChange={() => setGrade('second')}
                />
                دوم
              </label>
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="third"
                  checked={grade === 'third'}
                  onChange={() => setGrade('third')}
                />
                سوم
              </label>
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="fourth"
                  checked={grade === 'fourth'}
                  onChange={() => setGrade('fourth')}
                />
                چهارم
              </label>
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="fifth"
                  checked={grade === 'fifth'}
                  onChange={() => setGrade('fifth')}
                />
                پنجم
              </label>
              <label>
                <input
                  type="radio"
                  name="grade"
                  value="sixth"
                  checked={grade === 'sixth'}
                  onChange={() => setGrade('sixth')}
                />
                ششم
              </label>
            </div>
          </div>

          <div className="form-group">
            <p>1- در طی یک ماه گذشته چند بار کودکتان دندانهایش را مسواک زده است:</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="brushingFrequency"
                  value="irregular"
                  checked={brushingFrequency === 'irregular'}
                  onChange={() => setBrushingFrequency('irregular')}
                  required
                />
                نامنظم مسواک زده است یا اصلا مسواک نزده است
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingFrequency"
                  value="once_week"
                  checked={brushingFrequency === 'once_week'}
                  onChange={() => setBrushingFrequency('once_week')}
                />
                یکبار در هفته
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingFrequency"
                  value="twice_thrice_week"
                  checked={brushingFrequency === 'twice_thrice_week'}
                  onChange={() => setBrushingFrequency('twice_thrice_week')}
                />
                دو تا سه بار در هفته
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingFrequency"
                  value="once_day"
                  checked={brushingFrequency === 'once_day'}
                  onChange={() => setBrushingFrequency('once_day')}
                />
                یک بار در روز
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingFrequency"
                  value="twice_day"
                  checked={brushingFrequency === 'twice_day'}
                  onChange={() => setBrushingFrequency('twice_day')}
                />
                دو بار در روز (یا بیشتر)
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingFrequency"
                  value="unknown"
                  checked={brushingFrequency === 'unknown'}
                  onChange={() => setBrushingFrequency('unknown')}
                />
                نمی دانم
              </label>
            </div>
          </div>

          <div className="form-group">
            <p>2- در طی یک ماه گذشته کودکتان چند دفعه بین وعده های اصلی غذایی (صبحانه ‚ناهار ‚شام) تنقلات و نوشیدنی های شیرین خورده است:</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="snackFrequency"
                  value="three_day"
                  checked={snackFrequency === 'three_day'}
                  onChange={() => setSnackFrequency('three_day')}
                  required
                />
                سه بار در روز
              </label>
              <label>
                <input
                  type="radio"
                  name="snackFrequency"
                  value="twice_day"
                  checked={snackFrequency === 'twice_day'}
                  onChange={() => setSnackFrequency('twice_day')}
                />
                دو بار در روز
              </label>
              <label>
                <input
                  type="radio"
                  name="snackFrequency"
                  value="once_day"
                  checked={snackFrequency === 'once_day'}
                  onChange={() => setSnackFrequency('once_day')}
                />
                یک بار در روز
              </label>
              <label>
                <input
                  type="radio"
                  name="snackFrequency"
                  value="occasionally"
                  checked={snackFrequency === 'occasionally'}
                  onChange={() => setSnackFrequency('occasionally')}
                />
                گهگاهی ‚نه هر روز
              </label>
              <label>
                <input
                  type="radio"
                  name="snackFrequency"
                  value="rarely"
                  checked={snackFrequency === 'rarely'}
                  onChange={() => setSnackFrequency('rarely')}
                />
                به ندرت یا هیچ وقت
              </label>
              <label>
                <input
                  type="radio"
                  name="snackFrequency"
                  value="unknown"
                  checked={snackFrequency === 'unknown'}
                  onChange={() => setSnackFrequency('unknown')}
                />
                نمیدانم
              </label>
            </div>
          </div>

          <div className="form-group">
            <p>3- در طی یک ماه گذسته ‚آیا کودکتان موقع مسواک زدن از خمیر دندان (فلوراید دار) استفاده کرده است:</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="toothpasteUsage"
                  value="never"
                  checked={toothpasteUsage === 'never'}
                  onChange={() => setToothpasteUsage('never')}
                  required
                />
                هیچ وقت
              </label>
              <label>
                <input
                  type="radio"
                  name="toothpasteUsage"
                  value="rarely"
                  checked={toothpasteUsage === 'rarely'}
                  onChange={() => setToothpasteUsage('rarely')}
                />
                بندرت
              </label>
              <label>
                <input
                  type="radio"
                  name="toothpasteUsage"
                  value="mostly"
                  checked={toothpasteUsage === 'mostly'}
                  onChange={() => setToothpasteUsage('mostly')}
                />
                بیشتر اوقات
              </label>
              <label>
                <input
                  type="radio"
                  name="toothpasteUsage"
                  value="always"
                  checked={toothpasteUsage === 'always'}
                  onChange={() => setToothpasteUsage('always')}
                />
                همیشه یا تقریبا همیشه
              </label>
              <label>
                <input
                  type="radio"
                  name="toothpasteUsage"
                  value="unknown"
                  checked={toothpasteUsage === 'unknown'}
                  onChange={() => setToothpasteUsage('unknown')}
                />
                نمیدانم
              </label>
            </div>
          </div>

          <div className="form-group">
            <p>4- آیا کسی موقع مسواک زدن به کودکتان کمک میکند:</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="brushingHelp"
                  value="always"
                  checked={brushingHelp === 'always'}
                  onChange={() => setBrushingHelp('always')}
                  required
                />
                همیشه یا تقریبا همیشه
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingHelp"
                  value="mostly"
                  checked={brushingHelp === 'mostly'}
                  onChange={() => setBrushingHelp('mostly')}
                />
                بیشتر اوقات
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingHelp"
                  value="rarely"
                  checked={brushingHelp === 'rarely'}
                  onChange={() => setBrushingHelp('rarely')}
                />
                بندرت
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingHelp"
                  value="never"
                  checked={brushingHelp === 'never'}
                  onChange={() => setBrushingHelp('never')}
                />
                هیچ وقت
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingHelp"
                  value="unknown"
                  checked={brushingHelp === 'unknown'}
                  onChange={() => setBrushingHelp('unknown')}
                />
                نمی دانم
              </label>
            </div>
          </div>

          <div className="form-group">
            <p>5- اگر کسی در مسواک زدن به او کمک میکند‚معمولا چه کسی این کار را انجام میدهد:</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="brushingHelper"
                  value="father"
                  checked={brushingHelper === 'father'}
                  onChange={() => setBrushingHelper('father')}
                  required
                />
                پدر
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingHelper"
                  value="mother"
                  checked={brushingHelper === 'mother'}
                  onChange={() => setBrushingHelper('mother')}
                />
                مادر
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingHelper"
                  value="sibling"
                  checked={brushingHelper === 'sibling'}
                  onChange={() => setBrushingHelper('sibling')}
                />
                برادر یا خواهر
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingHelper"
                  value="other"
                  checked={brushingHelper === 'other'}
                  onChange={() => setBrushingHelper('other')}
                />
                دیگران
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingHelper"
                  value="unknown"
                  checked={brushingHelper === 'unknown'}
                  onChange={() => setBrushingHelper('unknown')}
                />
                نمیدانم
              </label>
            </div>
          </div>

          <div className="form-group">
            <p>6- اگر کودتان خودش مسواک میزند‚آیا کسی بعد از مسواک زدن دندان های او را نگاه میکند که تمیز شده باشد:</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="brushingCheck"
                  value="always"
                  checked={brushingCheck === 'always'}
                  onChange={() => setBrushingCheck('always')}
                  required
                />
                همیشه یا تقریبا همیشه
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingCheck"
                  value="mostly"
                  checked={brushingCheck === 'mostly'}
                  onChange={() => setBrushingCheck('mostly')}
                />
                بیشتر اوقات
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingCheck"
                  value="rarely"
                  checked={brushingCheck === 'rarely'}
                  onChange={() => setBrushingCheck('rarely')}
                />
                بندرت
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingCheck"
                  value="never"
                  checked={brushingCheck === 'never'}
                  onChange={() => setBrushingCheck('never')}
                />
                هیچ وقت
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingCheck"
                  value="unknown"
                  checked={brushingCheck === 'unknown'}
                  onChange={() => setBrushingCheck('unknown')}
                />
                نمیدانم
              </label>
            </div>
          </div>

          <div className="form-group">
            <p>7- اگر کسی به دندانهای او نگاه میکند‚ معمولا چه کسی این کار را انجام میدهد:</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="brushingChecker"
                  value="father"
                  checked={brushingChecker === 'father'}
                  onChange={() => setBrushingChecker('father')}
                  required
                />
                پدر
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingChecker"
                  value="mother"
                  checked={brushingChecker === 'mother'}
                  onChange={() => setBrushingChecker('mother')}
                />
                مادر
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingChecker"
                  value="sibling"
                  checked={brushingChecker === 'sibling'}
                  onChange={() => setBrushingChecker('sibling')}
                />
                برادر یا خواهر
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingChecker"
                  value="other"
                  checked={brushingChecker === 'other'}
                  onChange={() => setBrushingChecker('other')}
                />
                دیگران
              </label>
              <label>
                <input
                  type="radio"
                  name="brushingChecker"
                  value="unknown"
                  checked={brushingChecker === 'unknown'}
                  onChange={() => setBrushingChecker('unknown')}
                />
                نمیدانم
              </label>
            </div>
          </div>

          <div className="form-group">
            <p>8- آیا کسی دفعات خوردن نوشیدنیها و تنقلات شیرین کودک را محدود میکند:</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="snackLimit"
                  value="always"
                  checked={snackLimit === 'always'}
                  onChange={() => setSnackLimit('always')}
                  required
                />
                همیشه یا تقریبا همیشه
              </label>
              <label>
                <input
                  type="radio"
                  name="snackLimit"
                  value="mostly"
                  checked={snackLimit === 'mostly'}
                  onChange={() => setSnackLimit('mostly')}
                />
                بیشتر اوقات
              </label>
              <label>
                <input
                  type="radio"
                  name="snackLimit"
                  value="rarely"
                  checked={snackLimit === 'rarely'}
                  onChange={() => setSnackLimit('rarely')}
                />
                بندرت
              </label>
              <label>
                <input
                  type="radio"
                  name="snackLimit"
                  value="never"
                  checked={snackLimit === 'never'}
                  onChange={() => setSnackLimit('never')}
                />
                هیچ وقت
              </label>
              <label>
                <input
                  type="radio"
                  name="snackLimit"
                  value="unknown"
                  checked={snackLimit === 'unknown'}
                  onChange={() => setSnackLimit('unknown')}
                />
                نمیدانم
              </label>
            </div>
          </div>

          <div className="form-group">
            <p>9- اگر آری‚ معمولا چه کسی خوردن نوشیدنی ها و تنقلات شیرین کودک را محدود میکند:</p>
            <div className="radio-options">
              <label>
                <input
                  type="radio"
                  name="snackLimiter"
                  value="father"
                  checked={snackLimiter === 'father'}
                  onChange={() => setSnackLimiter('father')}
                  required
                />
                پدر
              </label>
              <label>
                <input
                  type="radio"
                  name="snackLimiter"
                  value="mother"
                  checked={snackLimiter === 'mother'}
                  onChange={() => setSnackLimiter('mother')}
                />
                مادر
              </label>
              <label>
                <input
                  type="radio"
                  name="snackLimiter"
                  value="sibling"
                  checked={snackLimiter === 'sibling'}
                  onChange={() => setSnackLimiter('sibling')}
                />
                برادر یا خواهر
              </label>
              <label>
                <input
                  type="radio"
                  name="snackLimiter"
                  value="other"
                  checked={snackLimiter === 'other'}
                  onChange={() => setSnackLimiter('other')}
                />
                دیگران
              </label>
              <label>
                <input
                  type="radio"
                  name="snackLimiter"
                  value="unknown"
                  checked={snackLimiter === 'unknown'}
                  onChange={() => setSnackLimiter('unknown')}
                />
                نمیدانم
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">
            ثبت پاسخ‌ها
          </button>
          <button type="button" className="reset-button" onClick={handleReset}>
            پاک کردن فرم
          </button>
        </div>
      </form>
    </div>
  );
};

export default Questionnaire;