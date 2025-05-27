// src/services/PdfService.js - FIXED VERSION
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

class PdfService {
  constructor() {
    this.initFonts();
  }

  // Initialize fonts for proper Farsi rendering
  async initFonts() {
    // For better Farsi support, you might want to add custom fonts
    // For now, we'll use the default ones with proper configuration
  }

  // Generate a questionnaire report PDF
  async generateQuestionnairePdf(surveyData, childName) {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Configure for RTL text
      doc.setLanguage("fa");
      
      // Add title
      doc.setFontSize(18);
      doc.text('گزارش پرسشنامه سلامت دهان و دندان', doc.internal.pageSize.width / 2, 20, { 
        align: 'center',
        lang: 'fa'
      });
      
      // Add child info
      doc.setFontSize(14);
      doc.text(`اطلاعات کودک: ${childName || 'نامشخص'}`, 20, 35);
      
      // Add timestamp
      const date = new Date(surveyData.timestamp);
      const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      doc.text(`تاریخ تکمیل: ${formattedDate}`, 20, 45);
      
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
      
      // Prepare table data
      const tableData = [];
      
      for (const [key, mapping] of Object.entries(responseLabels)) {
        if (surveyData[key]) {
          tableData.push([mapping.title, mapping[surveyData[key]] || 'نامشخص']);
        }
      }
      
      // Add the table
      doc.autoTable({
        startY: 55,
        head: [['سوال', 'پاسخ']],
        body: tableData,
        headStyles: { 
          fillColor: [46, 125, 50], 
          halign: 'right',
          fontSize: 12
        },
        styles: { 
          halign: 'right', 
          font: 'helvetica',
          fontSize: 10
        },
        theme: 'grid',
        margin: { top: 55, right: 14, bottom: 20, left: 14 },
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          'لبخند شاد دندان سالم - دانشگاه علوم پزشکی تهران',
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
      
      return await this.savePdf(doc, `dental_survey_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating questionnaire PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate urgent referrals report PDF - FIXED METHOD
  async generateUrgentReferralsPdf(referrals, filters = {}) {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Add title
      doc.setFontSize(18);
      doc.text('گزارش ارجاع‌های فوری به دندانپزشک', doc.internal.pageSize.width / 2, 20, { 
        align: 'center' 
      });
      
      // Add generation date
      const today = new Date();
      const formattedDate = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
      doc.setFontSize(12);
      doc.text(`تاریخ تولید گزارش: ${formattedDate}`, 20, 35);
      
      // Add filters info if any
      let yPosition = 45;
      if (filters.schoolName) {
        doc.text(`مدرسه: ${filters.schoolName}`, 20, yPosition);
        yPosition += 10;
      }
      if (filters.dateRange && filters.dateRange !== 'all') {
        const dateRangeLabels = {
          today: 'امروز',
          week: 'هفته اخیر',
          month: 'ماه اخیر'
        };
        doc.text(`بازه زمانی: ${dateRangeLabels[filters.dateRange] || filters.dateRange}`, 20, yPosition);
        yPosition += 10;
      }
      
      doc.text(`تعداد کل ارجاع‌ها: ${referrals.length}`, 20, yPosition);
      yPosition += 15;
      
      if (referrals.length === 0) {
        doc.setFontSize(14);
        doc.text('هیچ مورد ارجاع فوری یافت نشد.', doc.internal.pageSize.width / 2, yPosition + 20, { 
          align: 'center' 
        });
      } else {
        // Prepare table data
        const tableData = referrals.map((referral, index) => {
          const warningFlags = this.getWarningFlagsText(referral.warningFlags);
          const status = referral.resolved ? 'رسیدگی شده' : 'در انتظار رسیدگی';
          const date = this.formatDate(referral.date);
          
          return [
            (index + 1).toString(),
            referral.studentName,
            `${referral.studentAge} سال`,
            referral.schoolName,
            date,
            warningFlags,
            status
          ];
        });
        
        // Add table
        doc.autoTable({
          startY: yPosition,
          head: [['ردیف', 'نام دانش‌آموز', 'سن', 'مدرسه', 'تاریخ ارجاع', 'علائم هشدار', 'وضعیت']],
          body: tableData,
          headStyles: { 
            fillColor: [46, 125, 50], 
            halign: 'right',
            fontSize: 10
          },
          styles: { 
            halign: 'right', 
            font: 'helvetica',
            fontSize: 8,
            cellPadding: 2
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 15 }, // ردیف
            1: { cellWidth: 30 }, // نام
            2: { halign: 'center', cellWidth: 20 }, // سن  
            3: { cellWidth: 25 }, // مدرسه
            4: { halign: 'center', cellWidth: 25 }, // تاریخ
            5: { cellWidth: 60 }, // علائم
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
        doc.text(
          'لبخند شاد دندان سالم - دانشگاه علوم پزشکی تهران',
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          `صفحه ${i} از ${pageCount}`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }
      
      return await this.savePdf(doc, `urgent_referrals_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating urgent referrals PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate health report PDF
  async generateHealthReportPdf(healthRecord, studentInfo) {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set RTL mode for Farsi
      doc.setR2L(true);

      // Add title
      doc.setFontSize(18);
      doc.text('گزارش سلامت دهان و دندان', doc.internal.pageSize.width / 2, 20, { align: 'center' });

      // Add student info
      doc.setFontSize(14);
      doc.text(`نام دانش‌آموز: ${studentInfo.name}`, 20, 40);
      doc.text(`سن: ${studentInfo.age} سال`, 20, 50);
      doc.text(`کلاس: ${studentInfo.grade}`, 20, 60);
      doc.text(`مدرسه: ${studentInfo.schoolName}`, 20, 70);
      doc.text(`تاریخ بررسی: ${this.formatDate(healthRecord.date)}`, 20, 80);

      // Add health status
      doc.setFontSize(12);
      let yPos = 100;
      
      doc.text(`وضعیت مسواک زدن: ${healthRecord.hasBrushed ? 'انجام شده' : 'انجام نشده'}`, 20, yPos);
      yPos += 10;
      doc.text(`پوسیدگی دندان: ${healthRecord.hasCavity ? 'دارد' : 'ندارد'}`, 20, yPos);
      yPos += 10;
      doc.text(`سلامت لثه: ${healthRecord.hasHealthyGums ? 'سالم' : 'نیاز به توجه'}`, 20, yPos);
      yPos += 10;
      doc.text(`امتیاز سلامت دهان: ${healthRecord.score} از 10`, 20, yPos);
      yPos += 20;

      // Add warning flags if any
      if (Object.values(healthRecord.warningFlags).some(flag => flag)) {
        doc.text('علائم هشداردهنده:', 20, yPos);
        yPos += 10;
        const warningText = this.getWarningFlagsText(healthRecord.warningFlags);
        const splitWarnings = doc.splitTextToSize(warningText, 170);
        doc.text(splitWarnings, 20, yPos);
        yPos += (splitWarnings.length * 7);
      }

      // Add referral info if needed
      if (healthRecord.needsReferral) {
        yPos += 10;
        doc.text('نیاز به ارجاع فوری به دندانپزشک', 20, yPos, { align: 'left' });
        if (healthRecord.referralNotes) {
          yPos += 10;
          doc.text('توضیحات ارجاع:', 20, yPos);
          yPos += 10;
          const splitNotes = doc.splitTextToSize(healthRecord.referralNotes, 170);
          doc.text(splitNotes, 20, yPos);
        }
      }

      // Add notes if any
      if (healthRecord.notes) {
        yPos += 20;
        doc.text('یادداشت‌های اضافی:', 20, yPos);
        yPos += 10;
        const splitNotes = doc.splitTextToSize(healthRecord.notes, 170);
        doc.text(splitNotes, 20, yPos);
      }

      // Add footer
      doc.setFontSize(10);
      doc.text(
        'لبخند شاد دندان سالم - دانشگاه علوم پزشکی تهران',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );

      // Save the PDF
      return await this.savePdf(doc, `health_report_${studentInfo.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating health report PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate student reports PDF
  async generateStudentReportsPdf(student, reports) {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set RTL mode for Farsi
      doc.setR2L(true);

      // Add title
      doc.setFontSize(18);
      doc.text('سابقه سلامت دهان و دندان', doc.internal.pageSize.width / 2, 20, { align: 'center' });

      // Add student info
      doc.setFontSize(14);
      doc.text(`نام دانش‌آموز: ${student.name}`, 20, 40);
      doc.text(`سن: ${student.age} سال`, 20, 50);
      doc.text(`کلاس: ${student.grade}`, 20, 60);
      doc.text(`مدرسه: ${student.schoolName}`, 20, 70);

      // Add reports table
      const tableData = reports.map(report => [
        this.formatDate(report.date),
        report.hasCavity ? 'دارد' : 'ندارد',
        report.hasHealthyGums ? 'سالم' : 'نیاز به توجه',
        report.score.toString(),
        report.needsReferral ? 'بله' : 'خیر',
        this.getWarningFlagsText(report.warningFlags) || '---'
      ]);

      doc.autoTable({
        startY: 90,
        head: [['تاریخ', 'پوسیدگی', 'لثه', 'امتیاز', 'ارجاع', 'علائم هشدار']],
        body: tableData,
        headStyles: { 
          fillColor: [46, 125, 50],
          halign: 'center',
          fontSize: 10
        },
        styles: {
          halign: 'center',
          fontSize: 9
        },
        theme: 'grid'
      });

      // Add footer
      doc.setFontSize(10);
      doc.text(
        'لبخند شاد دندان سالم - دانشگاه علوم پزشکی تهران',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );

      // Save the PDF
      return await this.savePdf(doc, `dental_history_${student.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating student reports PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper method to save PDF
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
        };
      } else {
        // Browser - trigger download
        doc.save(filename);
        return {
          success: true,
          fileName: filename
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

  // Helper to format warning flags
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
      return dateString;
    }
  }
  
  // Share PDF file
  async sharePdf(filePath, fileName) {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Share } = await import('@capacitor/share');
        
        await Share.share({
          title: 'گزارش سلامت دهان و دندان',
          text: 'گزارش پرسشنامه سلامت دهان و دندان کودک',
          url: filePath,
          dialogTitle: 'اشتراک گذاری گزارش',
        });
        
        return { success: true };
      }
      return { success: false, error: 'امکان اشتراک گذاری در مرورگر وجود ندارد' };
    } catch (error) {
      console.error('Error sharing PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if PDF file exists - for educational content
  async checkPdfExists(filename) {
    try {
      if (Capacitor.isNativePlatform()) {
        // On native platforms, check if file exists in assets
        return true; // Assume it exists, handle errors in display
      } else {
        // On web, try to fetch the file
        const response = await fetch(`/assets/pdfs/${filename}`);
        return response.ok;
      }
    } catch (error) {
      console.error('Error checking PDF existence:', error);
      return false;
    }
  }
}

export default new PdfService();