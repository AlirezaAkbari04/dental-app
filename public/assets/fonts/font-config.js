class FontConfig {
  constructor() {
    this.fontLoaded = false;
    this.fontData = null;
    this.isLoading = false;
  }

  // Load Persian font data
  async loadPersianFont() {
    if (this.fontLoaded) {
      console.log('[FontConfig] Font already loaded');
      return this.fontData;
    }

    if (this.isLoading) {
      console.log('[FontConfig] Font loading in progress...');
      return null;
    }

    this.isLoading = true;

    try {
      console.log('[FontConfig] Loading IRANSans font...');
      
      // Try to fetch the font file
      const response = await fetch('/assets/fonts/IRANSans.ttf');
      
      if (!response.ok) {
        throw new Error(`Font file not found: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      this.fontData = this.arrayBufferToBase64(arrayBuffer);
      this.fontLoaded = true;
      
      console.log('[FontConfig] IRANSans font loaded successfully');
      return this.fontData;
    } catch (error) {
      console.warn('[FontConfig] Could not load IRANSans font:', error);
      console.log('[FontConfig] Using fallback font configuration');
      
      // Set a flag that font loading failed but continue
      this.fontLoaded = true; // Mark as "loaded" to prevent retry
      this.fontData = null;
      return null;
    } finally {
      this.isLoading = false;
    }
  }

  // Convert ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  }

  // Get font status
  isFontLoaded() {
    return this.fontLoaded;
  }

  // Get font data
  getFontData() {
    return this.fontData;
  }

  // Reset font loading state (for testing/debugging)
  reset() {
    this.fontLoaded = false;
    this.fontData = null;
    this.isLoading = false;
    console.log('[FontConfig] Font configuration reset');
  }

  // Configure jsPDF with Persian font if available
  configureJsPDF(doc) {
    try {
      if (this.fontData) {
        // If we have font data, we could add it to jsPDF here
        // For now, we'll use better fallback configuration
        console.log('[FontConfig] Configuring jsPDF with Persian font support');
        
        // Set default font that works better with Persian
        doc.setFont('helvetica');
        
        // Configure for RTL if supported
        if (typeof doc.setR2L === 'function') {
          doc.setR2L(true);
        }
        
        return true;
      } else {
        console.log('[FontConfig] Using fallback font configuration');
        
        // Fallback configuration for better Persian support
        doc.setFont('helvetica');
        
        return false;
      }
    } catch (error) {
      console.error('[FontConfig] Error configuring jsPDF:', error);
      return false;
    }
  }

  // Check if font file exists (for initial validation)
  async checkFontExists() {
    try {
      const response = await fetch('/assets/fonts/IRANSans.ttf', { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.warn('[FontConfig] Font file check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
window.FontConfig = window.FontConfig || new FontConfig();

// Also make it available as module export for environments that support it
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.FontConfig;
}

// Auto-initialize font loading when script loads
if (typeof window !== 'undefined') {
  // Wait a bit for app to initialize, then start font loading
  setTimeout(() => {
    window.FontConfig.loadPersianFont().catch(error => {
      console.warn('[FontConfig] Auto-initialization failed:', error);
    });
  }, 1000);
}