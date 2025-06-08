// src/services/PdfService.js - Production Version for Urgent Referrals
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import bidi from 'bidi-js';

class PdfService {
  constructor() {
    this.fontLoaded = false;
    this.isInitializing = false;
    this.initializationPromise = null;
    this.persianFontData = null;
  }

  async initializeFonts() {
    if (this.fontLoaded) {
      return true;
    }

    if (this.isInitializing) {
      return this.initializationPromise;
    }

    this.isInitializing = true;
    this.initializationPromise = this._loadPersianFont();
    
    try {
      await this.initializationPromise;
      this.fontLoaded = true;
      return true;
    } catch (error) {
      console.error('Font initialization failed:', error);
      this.fontLoaded = true;
      return true;
    } finally {
      this.isInitializing = false;
    }
  }

  async _loadPersianFont() {
    try {
      const response = await fetch('/assets/fonts/IRANSans.ttf');
      
      if (!response.ok) {
        throw new Error(`Font file not found: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      this.persianFontData = this._arrayBufferToBase64(arrayBuffer);
      
      return true;
    } catch (error) {
      console.warn('Could not load Persian font:', error);
      this.persianFontData = null;
      return true;
    }
  }

  _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }

  async createPdfDocument() {
    await this.initializeFonts();

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    try {
      if (this.persianFontData) {
        doc.addFileToVFS('IRANSans.ttf', this.persianFontData);
        doc.addFont('IRANSans.ttf', 'IRANSans', 'normal');
        doc.setFont('IRANSans');
      } else {
        doc.setFont('helvetica');
      }
    } catch (fontError) {
      console.warn('Font setup failed, using helvetica:', fontError);
      doc.setFont('helvetica');
    }

    return doc;
  }

  _encodePersianText(text) {
    if (!text) return '';
    
    try {
      let cleanText = text.toString();
      
      // Basic cleanup
      cleanText = cleanText.replace(/‌/g, ' ');
      cleanText = cleanText.replace(/ي/g, 'ی');
      cleanText = cleanText.replace(/ك/g, 'ک');
      
      // Apply bidi processing and ensure string output
      try {
        const processedText = bidi(cleanText, { dir: 'rtl' });
        const resultText = typeof processedText === 'string' ? processedText : cleanText;
        return resultText;
      } catch (bidiError) {
        console.warn('Bidi processing failed:', bidiError);
        return cleanText;
      }
      
    } catch (error) {
      console.error('Text processing error:', error);
      return text.toString();
    }
  }

  _addPersianText(doc, text, x, y, options = {}) {
    try {
      const processedText = this._encodePersianText(text);
      const finalText = typeof processedText === 'string' ? processedText : (text ? text.toString() : '');
      
      const defaultOptions = {
        align: 'right',
        maxWidth: 170,
        ...options
      };

      if (defaultOptions.maxWidth && finalText.length > 50) {
        const splitText = doc.splitTextToSize(finalText, defaultOptions.maxWidth);
        doc.text(splitText, x, y, defaultOptions);
        return Array.isArray(splitText) ? splitText.length * 7 : 7;
      } else {
        doc.text(finalText, x, y, defaultOptions);
        return 7;
      }
    } catch (error) {
      console.error('Error adding Persian text:', error);
      try {
        const fallbackText = text ? text.toString() : 'خطا در متن';
        doc.text(fallbackText, x, y);
        return 7;
      } catch (fallbackError) {
        console.error('Fallback text failed:', fallbackError);
        return 7;
      }
    }
  }

  // Working questionnaire PDF (keeping existing working version)
  async generateQuestionnairePdf(surveyData, childName) {
    try {
      const doc = await this.createPdfDocument();
      
      // Title
      doc.setFontSize(18);
      this._addPersianText(doc, 'گزارش پرسشنامه سلامت دهان و دندان', 
        doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Child info
      doc.setFontSize(14);
      const childInfo = `اطلاعات کودک: ${this._encodePersianText(childName || 'نامشخص')}`;
      this._addPersianText(doc, childInfo, 180, 35);
      
      // Date
      const date = new Date(surveyData.timestamp);
      const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      this._addPersianText(doc, `تاریخ تکمیل: ${formattedDate}`, 180, 45);
      
      // Response mapping
      const responseLabels = {
        respondent: {
          title: 'تکمیل کننده پرسشنامه',
          father: 'پدر',
          mother: 'مادر',
          other: 'سایر بستگان',
        },
        grade: {
          title: 'کلاس تحصیلی',
          preschool: 'پیش دبستانی',
          first: 'اول',
          second: 'دوم',
          third: 'سوم',
          fourth: 'چهارم',
          fifth: 'پنجم',
          sixth: 'ششم',
        },
        brushingFrequency: {
          title: 'دفعات مسواک زدن در ماه گذشته',
          irregular: 'نامنظم مسواک زده است یا اصلا مسواک نزده است',
          once_week: 'یکبار در هفته',
          twice_thrice_week: 'دو تا سه بار در هفته',
          once_day: 'یک بار در روز',
          twice_day: 'دو بار در روز (یا بیشتر)',
          unknown: 'نمی دانم',
        },
        snackFrequency: {
          title: 'دفعات مصرف تنقلات و نوشیدنی های شیرین',
          three_day: 'سه بار در روز',
          twice_day: 'دو بار در روز',
          once_day: 'یک بار در روز',
          occasionally: 'گهگاهی، نه هر روز',
          rarely: 'به ندرت یا هیچ وقت',
          unknown: 'نمیدانم',
        },
        toothpasteUsage: {
          title: 'استفاده از خمیر دندان (فلوراید دار)',
          never: 'هیچ وقت',
          rarely: 'بندرت',
          mostly: 'بیشتر اوقات',
          always: 'همیشه یا تقریبا همیشه',
          unknown: 'نمیدانم',
        },
        brushingHelp: {
          title: 'کمک در مسواک زدن',
          always: 'همیشه یا تقریبا همیشه',
          mostly: 'بیشتر اوقات',
          rarely: 'بندرت',
          never: 'هیچ وقت',
          unknown: 'نمی دانم',
        },
        brushingHelper: {
          title: 'کمک کننده در مسواک زدن',
          father: 'پدر',
          mother: 'مادر',
          sibling: 'برادر یا خواهر',
          other: 'دیگران',
          unknown: 'نمیدانم',
        },
        brushingCheck: {
          title: 'بررسی تمیزی دندان ها پس از مسواک',
          always: 'همیشه یا تقریبا همیشه',
          mostly: 'بیشتر اوقات',
          rarely: 'بندرت',
          never: 'هیچ وقت',
          unknown: 'نمیدانم',
        },
        brushingChecker: {
          title: 'بررسی کننده تمیزی دندان ها',
          father: 'پدر',
          mother: 'مادر',
          sibling: 'برادر یا خواهر',
          other: 'دیگران',
          unknown: 'نمیدانم',
        },
        snackLimit: {
          title: 'محدود کردن مصرف تنقلات و نوشیدنی های شیرین',
          always: 'همیشه یا تقریبا همیشه',
          mostly: 'بیشتر اوقات',
          rarely: 'بندرت',
          never: 'هیچ وقت',
          unknown: 'نمیدانم',
        },
        snackLimiter: {
          title: 'محدود کننده مصرف تنقلات و نوشیدنی های شیرین',
          father: 'پدر',
          mother: 'مادر',
          sibling: 'برادر یا خواهر',
          other: 'دیگران',
          unknown: 'نمیدانم',
        },
      };
      
      // Add survey data as formatted text (no table)
      let yPosition = 65;
      doc.setFontSize(12);
      
      // Add section header
      this._addPersianText(doc, 'پاسخ‌های پرسشنامه:', 180, yPosition);
      yPosition += 15;
      
      // Add each question and answer
      doc.setFontSize(10);
      
      for (const [key, mapping] of Object.entries(responseLabels)) {
        if (surveyData[key]) {
          // Question
          const question = this._encodePersianText(mapping.title);
          this._addPersianText(doc, question + ':', 180, yPosition);
          yPosition += 7;
          
          // Answer (indented)
          const answer = this._encodePersianText(mapping[surveyData[key]] || 'نامشخص');
          this._addPersianText(doc, '• ' + answer, 170, yPosition);
          yPosition += 10;
          
          // Check if we need a new page
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
          }
        }
      }
      
      // Add footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        this._addPersianText(doc,
          'لبخند شاد دندان سالم - دانشگاه علوم پزشکی تهران',
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      const fileName = `dental_survey_${Date.now()}.pdf`;
      const result = await this.savePdf(doc, fileName);
      
      if (result.success) {
        return await this.shareOrDownloadPdf(result.filePath, fileName, 'گزارش پرسشنامه سلامت دندان');
      }
      
      return result;
    } catch (error) {
      console.error('Error generating questionnaire PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Production version: Urgent referrals PDF
  async generateUrgentReferralsPdf(referrals, filters = {}) {
    try {
      const doc = await this.createPdfDocument();
      
      // Title
      doc.setFontSize(18);
      this._addPersianText(doc, 'گزارش ارجاع‌های فوری به دندانپزشک', 
        doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Generation date
      const today = new Date();
      const formattedDate = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
      doc.setFontSize(12);
      this._addPersianText(doc, `تاریخ تولید گزارش: ${formattedDate}`, 180, 35);
      
      // Add filters info if any
      let yPosition = 50;
      
      if (filters.schoolName) {
        this._addPersianText(doc, `مدرسه: ${this._encodePersianText(filters.schoolName)}`, 180, yPosition);
        yPosition += 10;
      }
      
      if (filters.dateRange && filters.dateRange !== 'all') {
        const dateRangeLabels = {
          today: 'امروز',
          week: 'هفته اخیر',
          month: 'ماه اخیر'
        };
        this._addPersianText(doc, `بازه زمانی: ${dateRangeLabels[filters.dateRange] || filters.dateRange}`, 180, yPosition);
        yPosition += 10;
      }
      
      // Summary statistics
      if (!referrals || !Array.isArray(referrals)) {
        console.error('Invalid referrals data:', referrals);
        this._addPersianText(doc, 'خطا: داده‌های ارجاع معتبر نیست', 180, yPosition);
        yPosition += 20;
      } else {
        const resolvedCount = referrals.filter(r => r && r.resolved).length;
        const pendingCount = referrals.filter(r => r && !r.resolved).length;
        
        this._addPersianText(doc, `تعداد کل ارجاع‌ها: ${referrals.length}`, 180, yPosition);
        yPosition += 7;
        this._addPersianText(doc, `رسیدگی شده: ${resolvedCount}`, 180, yPosition);
        yPosition += 7;
        this._addPersianText(doc, `در انتظار رسیدگی: ${pendingCount}`, 180, yPosition);
        yPosition += 20;
        
        if (referrals.length === 0) {
          doc.setFontSize(14);
          this._addPersianText(doc, 'هیچ مورد ارجاع فوری یافت نشد.', 
            doc.internal.pageSize.width / 2, yPosition + 20, { align: 'center' });
        } else {
          // Add detailed referrals information
          doc.setFontSize(12);
          this._addPersianText(doc, 'فهرست ارجاع‌های فوری:', 180, yPosition);
          yPosition += 15;
          
          // Process each referral
          doc.setFontSize(10);
          
          for (let index = 0; index < referrals.length; index++) {
            const referral = referrals[index];
            
            try {
              // Check if we need a new page
              if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
              }
              
              // Referral number and basic info
              const studentName = referral.studentName || 'نامشخص';
              const studentNameText = `${index + 1}. نام دانش‌آموز: ${studentName}`;
              this._addPersianText(doc, studentNameText, 180, yPosition);
              yPosition += 7;
              
              const studentAge = referral.studentAge || 'نامشخص';
              const ageText = `   سن: ${studentAge} سال`;
              this._addPersianText(doc, ageText, 170, yPosition);
              yPosition += 7;
              
              if (referral.studentGrade) {
                const gradeText = referral.studentGrade === 'preschool' ? 'پیش دبستانی' : `کلاس ${referral.studentGrade}`;
                this._addPersianText(doc, `   کلاس: ${gradeText}`, 170, yPosition);
                yPosition += 7;
              }
              
              const schoolName = referral.schoolName || 'نامشخص';
              const schoolText = `   مدرسه: ${schoolName}`;
              this._addPersianText(doc, schoolText, 170, yPosition);
              yPosition += 7;
              
              const referralDate = referral.date ? this.formatDate(referral.date) : 'نامشخص';
              const dateText = `   تاریخ ارجاع: ${referralDate}`;
              this._addPersianText(doc, dateText, 170, yPosition);
              yPosition += 7;
              
              // Status
              const statusText = referral.resolved ? 'رسیدگی شده' : 'در انتظار رسیدگی';
              this._addPersianText(doc, `   وضعیت: ${statusText}`, 170, yPosition);
              yPosition += 7;
              
              // Warning flags
              const warningFlags = this.getWarningFlagsText(referral.warningFlags);
              
              if (warningFlags && warningFlags !== 'ندارد' && warningFlags.trim() !== '') {
                this._addPersianText(doc, `   علائم هشدار: ${warningFlags}`, 170, yPosition, { maxWidth: 150 });
                // Calculate how many lines this took
                const flagsLines = Math.ceil(warningFlags.length / 80);
                yPosition += (flagsLines * 7);
              } else {
                this._addPersianText(doc, `   علائم هشدار: ندارد`, 170, yPosition);
                yPosition += 7;
              }
              
              // Referral notes if available
              if (referral.referralNotes && referral.referralNotes.trim()) {
                this._addPersianText(doc, `   توضیحات: ${referral.referralNotes}`, 170, yPosition, { maxWidth: 150 });
                const notesLines = Math.ceil(referral.referralNotes.length / 80);
                yPosition += (notesLines * 7);
              }
              
              // Add some space between referrals
              yPosition += 10;
              
            } catch (referralError) {
              console.error(`Error processing referral ${index + 1}:`, referralError);
              this._addPersianText(doc, `   خطا در پردازش ارجاع ${index + 1}`, 170, yPosition);
              yPosition += 10;
            }
          }
        }
      }
      
      // Add footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        this._addPersianText(doc,
          'لبخند شاد دندان سالم - دانشگاه علوم پزشکی تهران',
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 15,
          { align: 'center' }
        );
        this._addPersianText(doc,
          `صفحه ${i} از ${pageCount}`,
          180,
          doc.internal.pageSize.height - 8,
          { align: 'right' }
        );
      }
      
      const fileName = `urgent_referrals_${Date.now()}.pdf`;
      const result = await this.savePdf(doc, fileName);
      
      if (result.success) {
        return await this.shareOrDownloadPdf(result.filePath, fileName, 'گزارش ارجاع‌های فوری');
      }
      
      return result;
    } catch (error) {
      console.error('Error generating urgent referrals PDF:', error);
      return { 
        success: false, 
        error: error.message,
        userMessage: 'خطا در ایجاد گزارش ارجاع‌ها'
      };
    }
  }

  async savePdf(doc, filename) {
    try {
      if (Capacitor.isNativePlatform()) {
        const pdfOutput = doc.output('datauristring');
        const base64Data = pdfOutput.split(',')[1];
        
        const result = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Documents,
        });
        
        return {
          success: true,
          filePath: result.uri,
          fileName: filename,
          platform: 'native'
        };
      } else {
        doc.save(filename);
        
        return {
          success: true,
          fileName: filename,
          platform: 'web'
        };
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async shareOrDownloadPdf(filePath, fileName, title) {
    try {
      if (Capacitor.isNativePlatform() && filePath) {
        try {
          await Share.share({
            title: title,
            text: 'گزارش تولید شده از برنامه سلامت دندان',
            url: filePath,
            dialogTitle: 'اشتراک‌گذاری گزارش',
          });
          
          return {
            success: true,
            action: 'shared',
            message: 'گزارش با موفقیت اشتراک‌گذاری شد'
          };
        } catch (shareError) {
          console.warn('Share failed, file saved to device:', shareError);
          return {
            success: true,
            action: 'saved',
            message: `فایل در دستگاه شما ذخیره شد: ${fileName}`
          };
        }
      } else {
        return {
          success: true,
          action: 'downloaded',
          message: 'فایل دانلود شد'
        };
      }
    } catch (error) {
      console.error('Error in share/download process:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getWarningFlagsText(warningFlags) {
    if (!warningFlags || typeof warningFlags !== 'object') {
      return 'ندارد';
    }

    const flags = [];
    if (warningFlags.brokenTooth) flags.push('دندان شکسته');
    if (warningFlags.severePain) flags.push('درد شدید');
    if (warningFlags.abscess) flags.push('آبسه یا ورم چرکی');
    if (warningFlags.bleeding) flags.push('خونریزی لثه');
    if (warningFlags.feverWithPain) flags.push('تب همراه با درد دهان');
    if (warningFlags.fistula) flags.push('فیستول یا مجرای خروج چرک');
    if (warningFlags.abnormalTissue) flags.push('لثه زخمی یا بافت غیرطبیعی');
    if (warningFlags.extensiveCaries) flags.push('پوسیدگی وسیع دندان');
    if (warningFlags.spontaneousPain) flags.push('درد خود به خود دندان');

    return flags.length > 0 ? flags.join('، ') : 'ندارد';
  }

  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  }
}

export default new PdfService();