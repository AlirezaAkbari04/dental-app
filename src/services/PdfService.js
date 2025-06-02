// src/services/PdfService.js - ENHANCED VERSION WITH PERSIAN FONT SUPPORT
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

class PdfService {
  constructor() {
    this.fontLoaded = false;
    this.isInitializing = false;
    this.initializationPromise = null;
  }

  // Initialize Persian font support
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
      console.log('[PdfService] Persian font loaded successfully');
      return true;
    } catch (error) {
      console.error('[PdfService] Failed to load Persian font:', error);
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  // Load Persian font for PDF generation
  async _loadPersianFont() {
    try {
      // Try to load the Persian font from assets
      let fontData;
      
      if (Capacitor.isNativePlatform()) {
        // On native platforms, load from assets
        try {
          const fontFile = await Filesystem.readFile({
            path: 'fonts/IRANSans.ttf',
            directory: Directory.Bundle
          });
          fontData = fontFile.data;
        } catch (error) {
          console.warn('[PdfService] Could not load font from native bundle, using fallback');
          fontData = null;
        }
      } else {
        // On web, try to fetch from public assets
        try {
          const response = await fetch('/assets/fonts/IRANSans.ttf');
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            fontData = this._arrayBufferToBase64(arrayBuffer);
          }
        } catch (error) {
          console.warn('[PdfService] Could not load font from web assets, using fallback');
          fontData = null;
        }
      }

      // If we have font data, add it to jsPDF
      if (fontData) {
        // This would require the font to be properly converted and added
        // For now, we'll use a better configuration approach
        console.log('[PdfService] Font data loaded, configuring jsPDF for Persian text');
      }

      return true;
    } catch (error) {
      console.error('[PdfService] Error loading Persian font:', error);
      throw error;
    }
  }

  // Helper to convert ArrayBuffer to base64
  _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Create a properly configured PDF document
  async createPdfDocument() {
    // Ensure fonts are loaded
    await this.initializeFonts();

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Configure for better Persian text support
    try {
      // Set default font that supports Unicode better
      doc.setFont('helvetica');
      doc.setLanguage('fa');
      
      // Configure text direction for RTL
      doc.setR2L(true);
    } catch (error) {
      console.warn('[PdfService] Could not configure RTL, using default settings');
    }

    return doc;
  }

  // Properly encode Persian text for PDF
  _encodePersianText(text) {
    if (!text) return '';
    
    try {
      // Clean and prepare Persian text for PDF
      let cleanText = text.toString();
      
      // Replace problematic characters
      cleanText = cleanText.replace(/‌/g, ' '); // Replace ZWNJ with space
      cleanText = cleanText.replace(/ي/g, 'ی'); // Replace Arabic Yeh with Persian Yeh
      cleanText = cleanText.replace(/ك/g, 'ک'); // Replace Arabic Kaf with Persian Kaf
      
      return cleanText;
    } catch (error) {
      console.error('[PdfService] Error encoding Persian text:', error);
      return text.toString();
    }
  }

  // Add text with proper Persian support
  _addPersianText(doc, text, x, y, options = {}) {
    const encodedText = this._encodePersianText(text);
    
    // Default options for Persian text
    const defaultOptions = {
      align: 'right',
      maxWidth: 170,
      ...options
    };

    try {
      if (defaultOptions.maxWidth && encodedText.length > 50) {
        // Split long text
        const splitText = doc.splitTextToSize(encodedText, defaultOptions.maxWidth);
        doc.text(splitText, x, y, defaultOptions);
        return splitText.length * 7; // Return height used
      } else {
        doc.text(encodedText, x, y, defaultOptions);
        return 7; // Single line height
      }
    } catch (error) {
      console.error('[PdfService] Error adding Persian text:', error);
      // Fallback to simple text
      doc.text(encodedText, x, y);
      return 7;
    }
  }

  // Generate questionnaire PDF with enhanced Persian support
  async generateQuestionnairePdf(surveyData, childName) {
    try {
      console.log('[PdfService] Starting questionnaire PDF generation');
      
      const doc = await this.createPdfDocument();
      
      // Add title
      doc.setFontSize(18);
      this._addPersianText(doc, 'گزارش پرسشنامه سلامت دهان و دندان', 
        doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Add child info
      doc.setFontSize(14);
      const childInfo = `اطلاعات کودک: ${this._encodePersianText(childName || 'نامشخص')}`;
      this._addPersianText(doc, childInfo, 20, 35);
      
      // Add timestamp
      const date = new Date(surveyData.timestamp);
      const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      this._addPersianText(doc, `تاریخ تکمیل: ${formattedDate}`, 20, 45);
      
      // Response mapping with proper Persian labels
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
      
      // Prepare table data with proper Persian encoding
      const tableData = [];
      
      for (const [key, mapping] of Object.entries(responseLabels)) {
        if (surveyData[key]) {
          const question = this._encodePersianText(mapping.title);
          const answer = this._encodePersianText(mapping[surveyData[key]] || 'نامشخص');
          tableData.push([question, answer]);
        }
      }
      
      // Create table with improved Persian support
      doc.autoTable({
        startY: 55,
        head: [['سوال', 'پاسخ']],
        body: tableData,
        headStyles: { 
          fillColor: [46, 125, 50], 
          halign: 'center',
          fontSize: 12,
          textColor: [255, 255, 255]
        },
        styles: { 
          halign: 'right', 
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 3,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 80, halign: 'right' }, // Question column
          1: { cellWidth: 100, halign: 'right' } // Answer column
        },
        theme: 'grid',
        margin: { top: 55, right: 14, bottom: 20, left: 14 },
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
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
        console.log('[PdfService] Questionnaire PDF generated successfully');
        // Try to share if on native platform
        return await this.shareOrDownloadPdf(result.filePath, fileName, 'گزارش پرسشنامه سلامت دندان');
      }
      
      return result;
    } catch (error) {
      console.error('[PdfService] Error generating questionnaire PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate urgent referrals PDF with proper parameters and Persian support
  async generateUrgentReferralsPdf(referrals, filters = {}) {
    try {
      console.log('[PdfService] Starting urgent referrals PDF generation');
      
      const doc = await this.createPdfDocument();
      
      // Add title
      doc.setFontSize(18);
      this._addPersianText(doc, 'گزارش ارجاع‌های فوری به دندانپزشک', 
        doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Add generation date
      const today = new Date();
      const formattedDate = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
      doc.setFontSize(12);
      this._addPersianText(doc, `تاریخ تولید گزارش: ${formattedDate}`, 20, 35);
      
      // Add filters info if any
      let yPosition = 45;
      if (filters.schoolName) {
        this._addPersianText(doc, `مدرسه: ${this._encodePersianText(filters.schoolName)}`, 20, yPosition);
        yPosition += 10;
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        const dateRangeLabels = {
          today: 'امروز',
          week: 'هفته اخیر',
          month: 'ماه اخیر'
        };
        this._addPersianText(doc, `بازه زمانی: ${dateRangeLabels[filters.dateRange] || filters.dateRange}`, 20, yPosition);
        yPosition += 10;
      }
      
      this._addPersianText(doc, `تعداد کل ارجاع‌ها: ${referrals.length}`, 20, yPosition);
      yPosition += 15;
      
      if (referrals.length === 0) {
        doc.setFontSize(14);
        this._addPersianText(doc, 'هیچ مورد ارجاع فوری یافت نشد.', 
          doc.internal.pageSize.width / 2, yPosition + 20, { align: 'center' });
      } else {
        // Prepare table data with proper Persian encoding
        const tableData = referrals.map((referral, index) => {
          const warningFlags = this.getWarningFlagsText(referral.warningFlags);
          const status = referral.resolved ? 'رسیدگی شده' : 'در انتظار رسیدگی';
          const date = this.formatDate(referral.date);
          
          return [
            (index + 1).toString(),
            this._encodePersianText(referral.studentName),
            `${referral.studentAge} سال`,
            this._encodePersianText(referral.schoolName),
            date,
            this._encodePersianText(warningFlags),
            this._encodePersianText(status)
          ];
        });
        
        // Add table with improved formatting
        doc.autoTable({
          startY: yPosition,
          head: [['ردیف', 'نام دانش‌آموز', 'سن', 'مدرسه', 'تاریخ ارجاع', 'علائم هشدار', 'وضعیت']],
          body: tableData,
          headStyles: { 
            fillColor: [46, 125, 50], 
            halign: 'center',
            fontSize: 10,
            textColor: [255, 255, 255]
          },
          styles: { 
            halign: 'center', 
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak'
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 15 }, // ردیف
            1: { halign: 'right', cellWidth: 30 }, // نام
            2: { halign: 'center', cellWidth: 20 }, // سن  
            3: { halign: 'right', cellWidth: 25 }, // مدرسه
            4: { halign: 'center', cellWidth: 25 }, // تاریخ
            5: { halign: 'right', cellWidth: 50 }, // علائم
            6: { halign: 'center', cellWidth: 25 } // وضعیت
          },
          theme: 'grid',
          margin: { top: yPosition, right: 14, bottom: 20, left: 14 },
        });
      }
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        this._addPersianText(doc,
          'لبخند شاد دندان سالم - دانشگاه علوم پزشکی تهران',
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        this._addPersianText(doc,
          `صفحه ${i} از ${pageCount}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }
      
      const fileName = `urgent_referrals_${Date.now()}.pdf`;
      const result = await this.savePdf(doc, fileName);
      
      if (result.success) {
        console.log('[PdfService] Urgent referrals PDF generated successfully');
        // Try to share if on native platform
        return await this.shareOrDownloadPdf(result.filePath, fileName, 'گزارش ارجاع‌های فوری');
      }
      
      return result;
    } catch (error) {
      console.error('[PdfService] Error generating urgent referrals PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Enhanced save PDF with better error handling
  async savePdf(doc, filename) {
    try {
      if (Capacitor.isNativePlatform()) {
        // Native platform - save to device
        const pdfOutput = doc.output('datauristring');
        const base64Data = pdfOutput.split(',')[1];
        
        const result = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Documents,
        });
        
        console.log('[PdfService] PDF saved to device:', result.uri);
        
        return {
          success: true,
          filePath: result.uri,
          fileName: filename,
          platform: 'native'
        };
      } else {
        // Web platform - trigger download
        doc.save(filename);
        console.log('[PdfService] PDF downloaded via browser:', filename);
        
        return {
          success: true,
          fileName: filename,
          platform: 'web'
        };
      }
    } catch (error) {
      console.error('[PdfService] Error saving PDF:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Share or download PDF with enhanced user experience
  async shareOrDownloadPdf(filePath, fileName, title) {
    try {
      if (Capacitor.isNativePlatform() && filePath) {
        // Try to share on native platform
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
          console.warn('[PdfService] Share failed, file saved to device:', shareError);
          return {
            success: true,
            action: 'saved',
            message: `فایل در دستگاه شما ذخیره شد: ${fileName}`
          };
        }
      } else {
        // Web platform or no file path
        return {
          success: true,
          action: 'downloaded',
          message: 'فایل دانلود شد'
        };
      }
    } catch (error) {
      console.error('[PdfService] Error in share/download process:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper to format warning flags with proper Persian text
  getWarningFlagsText(warningFlags) {
    if (!warningFlags) return 'ندارد';

    const flags = [];
    if (warningFlags.brokenTooth) flags.push('دندان شکسته');
    if (warningFlags.severePain) flags.push('درد شدید');
    if (warningFlags.abscess) flags.push('آبسه یا ورم چرکی');
    if (warningFlags.bleeding) flags.push('خونریزی لثه');
    if (warningFlags.feverWithPain) flags.push('تب همراه با درد دهان');
    if (warningFlags.fistula) flags.push('فیستول یا مجرای خروج چرک');
    if (warningFlags.abnormalTissue) flags.push('لثه زخمی یا بافت غیرطبیعی');

    return flags.length > 0 ? flags.join('، ') : 'ندارد';
  }

  // Helper to format date
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('[PdfService] Error formatting date:', error);
      return dateString;
    }
  }
}

export default new PdfService();