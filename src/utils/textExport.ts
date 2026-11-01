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

export function printDocument(text: string, title = 'المستند المستخرج') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; line-height: 1.8; direction: rtl; padding: 30px; color: #1e293b; }
        h1 { color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 10px; }
        .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
        .content { white-space: pre-wrap; font-size: 16px; line-height: 1.8; }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">تم الاستخراج بواسطة بصيرة الذكي في: ${new Date().toLocaleString('ar-SA')}</div>
      <div class="content">${escapeHtml(text)}</div>
      <script>
        window.onload = function() { window.print(); window.close(); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
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
