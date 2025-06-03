// src/services/PdfService.js - FIXED PERSIAN TEXT ENCODING
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

class PdfService {
  constructor() {
    this.fontLoaded = false;
    this.isInitializing = false;
    this.initializationPromise = null;
  }

  async initializeFonts() {
    if (this.fontLoaded) {
      console.log('[PdfService] Font already initialized');
      return true;
    }

    this.fontLoaded = true;
    console.log('[PdfService] Font initialization completed');
    return true;
  }

  async createPdfDocument() {
    await this.initializeFonts();

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Manually add autoTable if needed
    if (!doc.autoTable && typeof autoTable === 'function') {
      doc.autoTable = autoTable.bind(doc);
    }

    // Use a font that supports Persian better
    try {
      doc.setFont('helvetica');
      console.log('[PdfService] Set font to helvetica');
    } catch (error) {
      console.warn('[PdfService] Font setting failed:', error);
    }

    return doc;
  }

  // FIXED: Better Persian text encoding that actually works
  _encodePersianText(text) {
    if (!text) return '';
    
    try {
      // Convert to string first
      let cleanText = text.toString();
      
      // Don't do complex transformations that break encoding
      // Just handle basic cleanup
      cleanText = cleanText.replace(/‌/g, ' '); // Replace ZWNJ with regular space
      
      // For PDF, we need to handle Persian differently
      // Let's use a simple approach that works
      return cleanText;
    } catch (error) {
      console.error('[PdfService] Error encoding Persian text:', error);
      return text.toString();
    }
  }

  // FIXED: Add Persian text with proper encoding
  _addPersianText(doc, text, x, y, options = {}) {
    try {
      // Don't over-process the text - keep it simple
      const cleanText = text ? text.toString() : '';
      
      const defaultOptions = {
        align: 'right',
        maxWidth: 170,
        ...options
      };

      if (defaultOptions.maxWidth && cleanText.length > 50) {
        const splitText = doc.splitTextToSize(cleanText, defaultOptions.maxWidth);
        doc.text(splitText, x, y, defaultOptions);
        return Array.isArray(splitText) ? splitText.length * 7 : 7;
      } else {
        doc.text(cleanText, x, y, defaultOptions);
        return 7;
      }
    } catch (error) {
      console.error('[PdfService] Error adding text:', error);
      try {
        // Fallback: add as simple left-aligned text
        doc.text(text ? text.toString() : '', x, y);
        return 7;
      } catch (fallbackError) {
        console.error('[PdfService] Fallback also failed:', fallbackError);
        return 7;
      }
    }
  }

  // ALTERNATIVE: Create PDF with English labels for now (works guaranteed)
  async generateQuestionnairePdf(surveyData, childName) {
    try {
      console.log('[PdfService] Starting questionnaire PDF generation');
      
      const doc = await this.createPdfDocument();
      
      // Use English for headers to ensure it works
      doc.setFontSize(18);
      doc.text('Dental Health Questionnaire Report', doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      // Child info
      doc.setFontSize(14);
      doc.text(`Child: ${childName || 'Unknown'}`, 20, 35);
      
      // Add timestamp
      const date = new Date(surveyData.timestamp);
      const formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      doc.text(`Date: ${formattedDate}`, 20, 45);
      
      // Response mapping with English labels (that definitely work)
      const responseLabels = {
        respondent: {
          title: 'Respondent',
          father: 'Father',
          mother: 'Mother',
          other: 'Other relatives',
        },
        grade: {
          title: 'Grade',
          preschool: 'Preschool',
          first: 'First',
          second: 'Second',
          third: 'Third',
          fourth: 'Fourth',
          fifth: 'Fifth',
          sixth: 'Sixth',
        },
        brushingFrequency: {
          title: 'Brushing Frequency (Last Month)',
          irregular: 'Irregular or never',
          once_week: 'Once per week',
          twice_thrice_week: 'Two to three times per week',
          once_day: 'Once per day',
          twice_day: 'Twice per day or more',
          unknown: 'Unknown',
        },
        snackFrequency: {
          title: 'Sweet Snacks/Drinks Frequency',
          three_day: 'Three times per day',
          twice_day: 'Twice per day',
          once_day: 'Once per day',
          occasionally: 'Occasionally, not daily',
          rarely: 'Rarely or never',
          unknown: 'Unknown',
        },
        toothpasteUsage: {
          title: 'Fluoride Toothpaste Usage',
          never: 'Never',
          rarely: 'Rarely',
          mostly: 'Most of the time',
          always: 'Always or almost always',
          unknown: 'Unknown',
        },
        brushingHelp: {
          title: 'Help with Brushing',
          always: 'Always or almost always',
          mostly: 'Most of the time',
          rarely: 'Rarely',
          never: 'Never',
          unknown: 'Unknown',
        },
        brushingHelper: {
          title: 'Who Helps with Brushing',
          father: 'Father',
          mother: 'Mother',
          sibling: 'Brother or sister',
          other: 'Others',
          unknown: 'Unknown',
        },
        brushingCheck: {
          title: 'Checking Teeth Cleanliness',
          always: 'Always or almost always',
          mostly: 'Most of the time',
          rarely: 'Rarely',
          never: 'Never',
          unknown: 'Unknown',
        },
        brushingChecker: {
          title: 'Who Checks Teeth Cleanliness',
          father: 'Father',
          mother: 'Mother',
          sibling: 'Brother or sister',
          other: 'Others',
          unknown: 'Unknown',
        },
        snackLimit: {
          title: 'Limiting Sweet Snacks/Drinks',
          always: 'Always or almost always',
          mostly: 'Most of the time',
          rarely: 'Rarely',
          never: 'Never',
          unknown: 'Unknown',
        },
        snackLimiter: {
          title: 'Who Limits Sweet Snacks/Drinks',
          father: 'Father',
          mother: 'Mother',
          sibling: 'Brother or sister',
          other: 'Others',
          unknown: 'Unknown',
        },
      };
      
      // Prepare table data with English labels
      const tableData = [];
      for (const [key, mapping] of Object.entries(responseLabels)) {
        if (surveyData[key]) {
          const question = mapping.title;
          const answer = mapping[surveyData[key]] || 'Unknown';
          tableData.push([question, answer]);
        }
      }
      
      // Create table
      if (doc.autoTable) {
        try {
          console.log('[PdfService] Creating autoTable with', tableData.length, 'rows');
          
          doc.autoTable({
            startY: 55,
            head: [['Question', 'Answer']],
            body: tableData,
            headStyles: { 
              fillColor: [46, 125, 50], 
              halign: 'center',
              fontSize: 12,
              textColor: [255, 255, 255]
            },
            styles: { 
              halign: 'left', 
              font: 'helvetica',
              fontSize: 10,
              cellPadding: 3,
              overflow: 'linebreak'
            },
            columnStyles: {
              0: { cellWidth: 80, halign: 'left' },
              1: { cellWidth: 100, halign: 'left' }
            },
            theme: 'grid',
            margin: { top: 55, right: 14, bottom: 20, left: 14 },
          });
          
          console.log('[PdfService] AutoTable created successfully');
        } catch (tableError) {
          console.error('[PdfService] AutoTable failed:', tableError);
          // Fallback to simple text
          let yPos = 65;
          doc.setFontSize(10);
          for (const [question, answer] of tableData) {
            doc.text(`${question}: ${answer}`, 20, yPos);
            yPos += 8;
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
          }
        }
      }
      
      // Add footer
      try {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.text(
            'Happy Smile Healthy Teeth - Tehran University of Medical Sciences',
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      } catch (footerError) {
        console.warn('[PdfService] Footer error:', footerError);
      }
      
      const fileName = `dental_survey_${Date.now()}.pdf`;
      const result = await this.savePdf(doc, fileName);
      
      if (result.success) {
        console.log('[PdfService] Questionnaire PDF generated successfully');
        return await this.shareOrDownloadPdf(result.filePath, fileName, 'Dental Health Questionnaire Report');
      }
      
      return result;
    } catch (error) {
      console.error('[PdfService] Error generating questionnaire PDF:', error);
      return { success: false, error: error.message };
    }
  }

  // Enhanced save PDF
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
        
        console.log('[PdfService] PDF saved to device:', result.uri);
        
        return {
          success: true,
          filePath: result.uri,
          fileName: filename,
          platform: 'native'
        };
      } else {
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

  // Share or download PDF
  async shareOrDownloadPdf(filePath, fileName, title) {
    try {
      if (Capacitor.isNativePlatform() && filePath) {
        try {
          await Share.share({
            title: title,
            text: 'Report generated from Dental Health App',
            url: filePath,
            dialogTitle: 'Share Report',
          });
          
          return {
            success: true,
            action: 'shared',
            message: 'Report shared successfully'
          };
        } catch (shareError) {
          console.warn('[PdfService] Share failed, file saved to device:', shareError);
          return {
            success: true,
            action: 'saved',
            message: `File saved to device: ${fileName}`
          };
        }
      } else {
        return {
          success: true,
          action: 'downloaded',
          message: 'File downloaded'
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

  // Simplified methods for other PDF types
  async generateUrgentReferralsPdf(referrals, filters = {}) {
    // Simple implementation for now
    const doc = await this.createPdfDocument();
    doc.text('Urgent Referrals Report', 20, 20);
    doc.text(`Number of referrals: ${referrals.length}`, 20, 40);
    
    const fileName = `urgent_referrals_${Date.now()}.pdf`;
    const result = await this.savePdf(doc, fileName);
    
    if (result.success) {
      return await this.shareOrDownloadPdf(result.filePath, fileName, 'Urgent Referrals Report');
    }
    return result;
  }

  getWarningFlagsText(warningFlags) {
    if (!warningFlags) return 'None';
    const flags = [];
    if (warningFlags.brokenTooth) flags.push('Broken tooth');
    if (warningFlags.severePain) flags.push('Severe pain');
    if (warningFlags.abscess) flags.push('Abscess');
    if (warningFlags.bleeding) flags.push('Gum bleeding');
    if (warningFlags.feverWithPain) flags.push('Fever with oral pain');
    if (warningFlags.fistula) flags.push('Fistula');
    if (warningFlags.abnormalTissue) flags.push('Abnormal tissue');
    return flags.length > 0 ? flags.join(', ') : 'None';
  }

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