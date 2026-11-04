// Helper functions for copying, downloading, and printing text

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string): boolean {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed', err);
    return false;
  }
}

export function downloadTextFile(text: string, filename: string, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadDocFile(text: string, title = 'المستند المستخرج') {
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Arial', 'Segoe UI', Tahoma, sans-serif; line-height: 1.8; direction: rtl; padding: 40px; font-size: 15pt; }
        h1, h2, h3 { color: #0f766e; }
        pre { white-space: pre-wrap; font-family: inherit; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
        th { background-color: #f1f5f9; }
      </style>
    </head>
    <body>
      <h2>${title}</h2>
      <hr style="border: 1px solid #0f766e; margin-bottom: 20px;"/>
      <div style="white-space: pre-wrap;">${escapeHtml(text)}</div>
    </body>
    </html>
  `;
  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface WhitePagePdfOptions {
  title?: string;
  text: string;
  fontSize?: 'small' | 'medium' | 'large';
  lineHeight?: 'compact' | 'normal' | 'relaxed';
  alignment?: 'right' | 'center' | 'justify';
  includeDate?: boolean;
  includeHeader?: boolean;
  imageThumbnail?: string | null;
}

export function exportWhitePagePdf(options: WhitePagePdfOptions) {
  const {
    title = 'المستند المستخرج',
    text,
    fontSize = 'medium',
    lineHeight = 'normal',
    alignment = 'right',
    includeDate = true,
    includeHeader = true,
    imageThumbnail = null,
  } = options;

  const fontSizes = {
    small: '13pt',
    medium: '15pt',
    large: '18pt',
  };

  const lineHeights = {
    compact: '1.6',
    normal: '1.9',
    relaxed: '2.3',
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>${title || 'مستند PDF صفحة بيضاء'}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 portrait;
          margin: 20mm 18mm 20mm 18mm;
        }
        @media print {
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .page-container {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
        * {
          box-sizing: border-box;
        }
        body {
          background-color: #ffffff;
          color: #111827;
          font-family: 'Cairo', 'IBM Plex Sans Arabic', 'Segoe UI', Tahoma, Arial, sans-serif;
          margin: 0;
          padding: 30px;
          direction: rtl;
          -webkit-font-smoothing: antialiased;
        }
        .page-container {
          max-width: 800px;
          margin: 0 auto;
          background: #ffffff;
        }
        .header {
          border-bottom: 2px solid #0f766e;
          padding-bottom: 12px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .doc-title {
          font-size: 22pt;
          font-weight: 800;
          color: #0f766e;
          margin: 0 0 6px 0;
        }
        .meta-date {
          font-size: 10pt;
          color: #64748b;
          font-family: sans-serif;
        }
        .thumbnail-container {
          margin-bottom: 20px;
          text-align: center;
        }
        .thumbnail-img {
          max-height: 160px;
          max-width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }
        .content {
          font-size: ${fontSizes[fontSize]};
          line-height: ${lineHeights[lineHeight]};
          text-align: ${alignment};
          white-space: pre-wrap;
          word-break: break-word;
          color: #1e293b;
        }
        .footer {
          margin-top: 40px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 9pt;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="page-container">
        ${
          includeHeader
            ? `
          <div class="header">
            <div>
              ${title ? `<h1 class="doc-title">${escapeHtml(title)}</h1>` : ''}
              ${includeDate ? `<div class="meta-date">تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-SA')}</div>` : ''}
            </div>
            <div style="font-size: 10pt; font-weight: bold; color: #0f766e;">بصيرة OCR</div>
          </div>
        `
            : ''
        }

        ${
          imageThumbnail
            ? `
          <div class="thumbnail-container">
            <img src="${imageThumbnail}" alt="المستند الأصلي" class="thumbnail-img" />
          </div>
        `
            : ''
        }

        <div class="content">${escapeHtml(text)}</div>

        <div class="footer">
          <span>مستند نصي مستخرج بدقة عالية</span>
          <span>صفحة 1</span>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 350);
        };
      </script>
    </body>
    </html>
  `;

  // Use hidden iframe or print window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // Fallback if popup blocked: create temporary hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    iframe.contentDocument?.write(htmlContent);
    iframe.contentDocument?.close();
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 500);
  }
}

export function printDocument(text: string, title = 'المستند المستخرج') {
  exportWhitePagePdf({
    title,
    text,
    fontSize: 'medium',
    lineHeight: 'normal',
    alignment: 'right',
    includeDate: true,
    includeHeader: true,
  });
}

// Speech synthesis helper
export class TextSpeechPlayer {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;

  public static speak(
    text: string,
    onEnd?: () => void,
    onError?: () => void
  ) {
    if (!this.synth) return;
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find Arabic voice if text contains Arabic
    const isArabic = /[\u0600-\u06FF]/.test(text);
    const voices = this.synth.getVoices();
    if (isArabic) {
      const arVoice = voices.find(v => v.lang.startsWith('ar') || v.lang.includes('SA') || v.lang.includes('EG'));
      if (arVoice) {
        utterance.voice = arVoice;
      }
      utterance.lang = 'ar-SA';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.95; // slightly deliberate for clarity
    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      this.currentUtterance = null;
      if (onError) onError();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public static stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public static isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}
