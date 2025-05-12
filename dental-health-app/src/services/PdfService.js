import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

class PdfService {
  constructor() {
    // Add Farsi font support
    this.initFonts();
  }

  // Initialize fonts for proper Farsi rendering
  async initFonts() {
    // This would normally load custom fonts
    // For now, we'll use the default ones
  }

  // Generate a questionnaire report PDF
  async generateQuestionnairePdf(surveyData, childName) {
    try {
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Set RTL mode for Farsi
      doc.setR2L(true);
      
      // Add title
      doc.setFontSize(18);
      doc.text('گزارش پرسشنامه سلامت دهان و دندان', doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Add child info
      doc.setFontSize(14);
      doc.text(`اطلاعات کودک: ${childName || 'نامشخص'}`, 20, 35);
      
      // Add timestamp
      const date = new Date(surveyData.timestamp);
      const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
      doc.text(`تاریخ تکمیل: ${formattedDate}`, 20, 45);
      
      // Create response mapping for easier reporting
      const responseLabels = {
        // Respondent
        respondent: {
          title: 'تکمیل کننده پرسشنامه',
          father: 'پدر',
          mother: 'مادر',
          other: 'سایر بستگان',
        },
        // Grade
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
        // Brushing frequency
        brushingFrequency: {
          title: 'دفعات مسواک زدن در ماه گذشته',
          irregular: 'نامنظم مسواک زده است یا اصلا مسواک نزده است',
          once_week: 'یکبار در هفته',
          twice_thrice_week: 'دو تا سه بار در هفته',
          once_day: 'یک بار در روز',
          twice_day: 'دو بار در روز (یا بیشتر)',
          unknown: 'نمی دانم',
        },
        // Snack frequency
        snackFrequency: {
          title: 'دفعات مصرف تنقلات و نوشیدنی های شیرین',
          three_day: 'سه بار در روز',
          twice_day: 'دو بار در روز',
          once_day: 'یک بار در روز',
          occasionally: 'گهگاهی ‚نه هر روز',
          rarely: 'به ندرت یا هیچ وقت',
          unknown: 'نمیدانم',
        },
        // Toothpaste usage
        toothpasteUsage: {
          title: 'استفاده از خمیر دندان (فلوراید دار)',
          never: 'هیچ وقت',
          rarely: 'بندرت',
          mostly: 'بیشتر اوقات',
          always: 'همیشه یا تقریبا همیشه',
          unknown: 'نمیدانم',
        },
        // Brushing help
        brushingHelp: {
          title: 'کمک در مسواک زدن',
          always: 'همیشه یا تقریبا همیشه',
          mostly: 'بیشتر اوقات',
          rarely: 'بندرت',
          never: 'هیچ وقت',
          unknown: 'نمی دانم',
        },
        // Brushing helper
        brushingHelper: {
          title: 'کمک کننده در مسواک زدن',
          father: 'پدر',
          mother: 'مادر',
          sibling: 'برادر یا خواهر',
          other: 'دیگران',
          unknown: 'نمیدانم',
        },
        // Brushing check
        brushingCheck: {
          title: 'بررسی تمیزی دندان ها پس از مسواک',
          always: 'همیشه یا تقریبا همیشه',
          mostly: 'بیشتر اوقات',
          rarely: 'بندرت',
          never: 'هیچ وقت',
          unknown: 'نمیدانم',
        },
        // Brushing checker
        brushingChecker: {
          title: 'بررسی کننده تمیزی دندان ها',
          father: 'پدر',
          mother: 'مادر',
          sibling: 'برادر یا خواهر',
          other: 'دیگران',
          unknown: 'نمیدانم',
        },
        // Snack limit
        snackLimit: {
          title: 'محدود کردن مصرف تنقلات و نوشیدنی های شیرین',
          always: 'همیشه یا تقریبا همیشه',
          mostly: 'بیشتر اوقات',
          rarely: 'بندرت',
          never: 'هیچ وقت',
          unknown: 'نمیدانم',
        },
        // Snack limiter
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
      
      // Add all responses to the table
      for (const [key, mapping] of Object.entries(responseLabels)) {
        if (surveyData[key]) {
          tableData.push([mapping.title, mapping[surveyData[key]] || 'نامشخص']);
        }
      }
      
      // Add the table to the PDF
      doc.autoTable({
        startY: 55,
        head: [['سوال', 'پاسخ']],
        body: tableData,
        headStyles: { fillColor: [46, 125, 50], halign: 'right' },
        styles: { halign: 'right', font: 'helvetica' },
        theme: 'grid',
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
      
      // When running on a device, save the file
      if (Capacitor.isNativePlatform()) {
        const pdfOutput = doc.output('datauristring');
        const fileName = `dental_report_${Date.now()}.pdf`;
        
        // Save to device file system using Capacitor
        const result = await Filesystem.writeFile({
          path: fileName,
          data: pdfOutput.split(',')[1], // Remove the data URI prefix
          directory: Directory.Documents,
        });
        
        return {
          success: true,
          filePath: result.uri,
          fileName: fileName,
        };
      } else {
        // In browser environment, trigger download
        doc.save(`dental_report_${Date.now()}.pdf`);
        return {
          success: true,
        };
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  // Share the PDF file
  async sharePdf(filePath, fileName) {
    try {
      if (Capacitor.isNativePlatform()) {
        // If Social Sharing plugin is available
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
}

export default new PdfService();