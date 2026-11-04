// Helper functions for copying, downloading, printing, and direct PDF generation/sharing
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

/**
 * Generates an authentic binary PDF Blob (application/pdf) from a rendered DOM element
 * using high-resolution html2canvas and jsPDF for perfect Arabic typography.
 */
export async function generatePdfBlobFromElement(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2, // 2x DPI for ultra-sharp Arabic letters and diacritics
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  return pdf.output('blob');
}

/**
 * Creates a complete A4 PDF Blob on-the-fly from WhitePagePdfOptions without needing an open modal.
 */
export async function createWhitePagePdfBlob(options: WhitePagePdfOptions): Promise<Blob> {
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
    small: '14px',
    medium: '16px',
    large: '19px',
  };

  const lineHeights = {
    compact: '1.6',
    normal: '1.9',
    relaxed: '2.3',
  };

  // Create temporary container styled identically to an A4 document
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = '794px'; // 210mm @ 96dpi
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#111827';
  container.style.padding = '40px 50px';
  container.style.direction = 'rtl';
  container.style.fontFamily = "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif";
  container.style.boxSizing = 'border-box';

  let headerHtml = '';
  if (includeHeader) {
    headerHtml = `
      <div style="border-bottom: 2px solid #0f766e; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          ${title ? `<h1 style="font-size: 24px; font-weight: 800; color: #0f766e; margin: 0 0 6px 0;">${escapeHtml(title)}</h1>` : ''}
          ${includeDate ? `<div style="font-size: 13px; color: #64748b;">تاريخ الاستخراج: ${new Date().toLocaleDateString('ar-SA')}</div>` : ''}
        </div>
        <div style="font-size: 14px; font-weight: bold; color: #0f766e;">بصيرة OCR</div>
      </div>
    `;
  }

  let thumbnailHtml = '';
  if (imageThumbnail) {
    thumbnailHtml = `
      <div style="margin-bottom: 20px; text-align: center;">
        <img src="${imageThumbnail}" alt="Thumbnail" style="max-height: 160px; max-width: 100%; border: 1px solid #e2e8f0; border-radius: 6px;" />
      </div>
    `;
  }

  container.innerHTML = `
    ${headerHtml}
    ${thumbnailHtml}
    <div style="font-size: ${fontSizes[fontSize]}; line-height: ${lineHeights[lineHeight]}; text-align: ${alignment}; white-space: pre-wrap; word-break: break-word; color: #1e293b; min-height: 400px;">
      ${escapeHtml(text)}
    </div>
    <div style="margin-top: 40px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8;">
      <span>مستند نصي رقمي مستخرج بالذكاء الاصطناعي</span>
      <span>صفحة 1 من 1</span>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const blob = await generatePdfBlobFromElement(container);
    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Converts a Blob to a Base64 string for transmission
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export interface SharePdfResult {
  sharedViaNative: boolean;
  shareUrl?: string;
  downloadUrl?: string;
  blob: Blob;
  fileName: string;
}

/**
 * Uploads PDF to server cache for instant sharing link & optionally triggers Native Web Share
 */
export async function sharePdfDirectly(options: {
  blob: Blob;
  title: string;
  text?: string;
  attemptNativeShare?: boolean;
}): Promise<SharePdfResult> {
  const { blob, title, text = '', attemptNativeShare = true } = options;
  const safeTitle = (title.trim() || 'مستند_مستخرج').replace(/[\/\\?%*:|"<>]/g, '_');
  const fileName = `${safeTitle}.pdf`;

  const pdfFile = new File([blob], fileName, { type: 'application/pdf' });
  let sharedViaNative = false;

  // 1. If requested & supported, trigger OS Native Share Sheet (WhatsApp, Telegram, Mail, AirDrop, etc.)
  if (attemptNativeShare && typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: title || 'مستند PDF مستخرج',
        text: `مستند مستخرج عبر تطبيق بصيرة OCR: ${title}`,
      });
      sharedViaNative = true;
    } catch (e: any) {
      // User cancelled share dialog or dismissed - not a fatal error
      if (e?.name !== 'AbortError') {
        console.warn('Native share error:', e);
      }
    }
  }

  // 2. Upload to server cache to get an instant public view & download link
  let shareUrl: string | undefined;
  let downloadUrl: string | undefined;

  try {
    const base64 = await blobToBase64(blob);
    const res = await fetch('/api/share-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        pdfBase64: base64,
        text,
      }),
    });
    const json = await res.json();
    if (json.success) {
      shareUrl = json.viewUrl;
      downloadUrl = json.downloadUrl;
    }
  } catch (err) {
    console.warn('Could not upload PDF to share cache:', err);
  }

    return {
      sharedViaNative,
      shareUrl,
      downloadUrl,
      blob,
      fileName,
    };
  }

  /**
   * Copies the PDF file or rich shareable document link to clipboard
   */
  export async function copyPdfToClipboard(
    blob: Blob,
    title = 'المستند المستخرج',
    shareUrl?: string
  ): Promise<{ success: boolean; mode: 'file' | 'link' }> {
    const safeTitle = (title.trim() || 'مستند_مستخرج').replace(/[\/\\?%*:|"<>]/g, '_');
    const fileName = `${safeTitle}.pdf`;

    // 1. Try copying binary PDF blob using modern ClipboardItem
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      try {
        const item = new ClipboardItem({
          'application/pdf': blob,
        });
        await navigator.clipboard.write([item]);
        return { success: true, mode: 'file' };
      } catch {
        // Application/pdf in clipboard.write may be restricted by some browser security policies
      }
    }

    // 2. Rich fallback: Copy clean document link and title formatted for pasting anywhere
    const targetUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
    const plainText = `${title}\nرابط ملف الـ PDF المباشر:\n${targetUrl}`;

    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      try {
        const htmlText = `<p><strong>${escapeHtml(title)}</strong></p><p><a href="${targetUrl}">رابط مستند الـ PDF</a></p>`;
        const item = new ClipboardItem({
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
          'text/html': new Blob([htmlText], { type: 'text/html' }),
        });
        await navigator.clipboard.write([item]);
        return { success: true, mode: 'link' };
      } catch {
        // Fall back to standard copy
      }
    }

    const ok = await copyToClipboard(plainText);
    return { success: ok, mode: 'link' };
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
