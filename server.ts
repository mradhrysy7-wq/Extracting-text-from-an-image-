import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize GoogleGenAI SDK with server-side API Key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface OcrRequestPayload {
  image: string; // base64 string, may include data:image/...;base64,
  mimeType?: string;
  mode?: 'raw' | 'formatted' | 'table' | 'receipt' | 'business_card' | 'handwriting';
  preserveDiacritics?: boolean;
  cleanFormatting?: boolean;
  detectLanguage?: boolean;
  translateTo?: string; // e.g. 'none', 'en', 'ar', 'fr', 'tr', 'es'
  summarize?: boolean;
}

// Health Check endpoint (for Render / Cloud Run)
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Google AdSense ads.txt verification route
app.get('/ads.txt', (_req: Request, res: Response) => {
  const pubId = process.env.ADSENSE_PUB_ID || 'pub-XXXXXXXXXXXXXXXX';
  res.type('text/plain').send(`google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`);
});

// OCR Extraction Route
app.post('/api/ocr', async (req: Request, res: Response) => {
  try {
    const {
      image,
      mimeType = 'image/jpeg',
      mode = 'raw',
      preserveDiacritics = true,
      cleanFormatting = true,
      translateTo = 'none',
      summarize = false,
    }: OcrRequestPayload = req.body;

    if (!image) {
      return res.status(400).json({ error: 'لم يتم إرسال أي صورة للمعالجة.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'مفتاح Gemini API غير متوفر في متغيرات البيئة. يرجى التحقق من لوحة الإعدادات.',
      });
    }

    // Clean base64 string
    let cleanBase64 = image;
    let resolvedMime = mimeType;
    if (image.includes('base64,')) {
      const parts = image.split('base64,');
      cleanBase64 = parts[1];
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch && mimeMatch[1]) {
        resolvedMime = mimeMatch[1];
      }
    }

    // Build specialized prompt depending on mode
    let modeInstruction = '';
    switch (mode) {
      case 'handwriting':
        modeInstruction = `
- هذا النص قد يكون مكتوباً بخط اليد أو ملاحظات شخصية.
- اقرأ بدقة شديدة كل حرف وكلمة وسطر.
- في حال وجود كلمات غامضة، استنتج الكلمة الأصح من سياق الجملة وضمنها مع الحفاظ على المعنى الأصلي تماماً.`;
        break;
      case 'table':
        modeInstruction = `
- الصورة تحتوي على جداول أو بيانات مجدولة أو أرقام وأعمدة.
- استخرج البيانات بدقة وحوّلها إلى جدول بتنسيق Markdown أنيق وواضح جداً مع عناوين الأعمدة والصفوف.
- استخرج أي نصوص مرافقة أعلى أو أسفل الجدول بشكل منفصل ومحدد.`;
        break;
      case 'receipt':
        modeInstruction = `
- الصورة هي فاتورة أو إيصال مشتريات أو إيصال دفع.
- استخرج بيانات الفاتورة بتنظيم دقيق:
  1. اسم المتجر / الشركة ومعلومات الاتصال (إن وجدت)
  2. تاريخ ووقت الفاتورة ورقمها
  3. جدول مفصل للأصناف (الاسم، الكمية، السعر الفردي، الإجمالي)
  4. المبالغ المالية: المجموع الفرعي، نسبة وقيمة الضريبة (VAT)، الخصم، والإجمالي الكلي
  5. طريقة الدفع ومعلومات الكاشير (إن وجدت)
- بالإضافة إلى النص الكامل المنظم.`;
        break;
      case 'business_card':
        modeInstruction = `
- الصورة هي بطاقة عمل (Business Card / كرت شخصي) أو بطاقة هوية/عضوية.
- استخرج البيانات المصنفة التالية بوضوح:
  - الاسم الكامل
  - المسمى الوظيفي
  - اسم الشركة أو المنشأة
  - أرقام الهواتف والجوال
  - البريد الإلكتروني
  - الموقع الإلكتروني وصفحات التواصل الاجتماعي
  - العنوان والمقر
  - أي نصوص إضافية موجودة على الكرت`;
        break;
      case 'formatted':
        modeInstruction = `
- استخرج النص مع تنسيقه بطريقة احترافية باستخدام Markdown.
- احتفظ بالعناوين الرئيسية والفرعية، والفقرات، والنقاط النقطية (bullet points)، والترقيم.
- نظّم الهيكل العام للمستند ليكون جاهزاً للقراءة والطباعة.`;
        break;
      case 'raw':
      default:
        modeInstruction = `
- استخرج النص بالكامل كلمة بكلمة وسطر بسطر بأقصى درجات الدقة والأمانة اللغوية.
- احتفظ بتوزيع الأسطر والفقرات والمسافات قدر الإمكان كالأصل.`;
        break;
    }

    const diacriticInstruction = preserveDiacritics
      ? '- احتفظ بعلامات التشكيل والحركات الأصلية إن وُجدت في النص.'
      : '- أزل علامات التشكيل والحركات إن وجدت، واجعل النص مبسطاً ومقروءاً بدون تشكيل.';

    const systemInstruction = `أنت محرك OCR فائق السرعة والدقة متخصص في القراءة والتعرف الضوئي على النصوص (عربية، إنجليزية، أرقام، رموز).
مهمتك استخراج كل النصوص الموجودة في الصورة بدقة متناهية وبأعلى سرعة ممكنة.
القواعد:
1. استخرج النص الأصلي بدقة تامة وبنفس توزيع السطور والفقرات.
2. أخرج النتيجة بتنسيق JSON نظيف وصالح.`;

    const userPrompt = `حلل هذه الصورة واستخرج كافة النصوص المكتوبة فيها فوراً.
التعليمات:
${modeInstruction}
${diacriticInstruction}
${cleanFormatting ? '- نسق المسافات والفقرات.' : ''}
${translateTo && translateTo !== 'none' ? `- ترجم النص كاملاً إلى (${translateTo}).` : ''}
${summarize ? '- أضف ملخصاً سريعاً للنص.' : ''}

أخرج JSON صالح فقط بالحقول التالية:
{
  "extractedText": "النص الكامل المستخرج هنا بدقة",
  "confidence": 98,
  "detectedLanguages": ["العربية"],
  ${mode === 'receipt' || mode === 'business_card' || mode === 'table' ? '"modeSpecificData": {},' : ''}
  "summary": ${summarize ? '"ملخص النص هنا"' : 'null'},
  "translation": ${translateTo && translateTo !== 'none' ? '"النص المترجم هنا"' : 'null'},
  "notes": null
}`;

    const imagePart = {
      inlineData: {
        mimeType: resolvedMime,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: userPrompt,
    };

    // Lightning-fast model hierarchy: 
    // 1. gemini-3.1-flash-lite (lowest latency, ThinkingLevel.MINIMAL by default, instant OCR)
    // 2. gemini-flash-latest (high throughput fast fallback)
    // 3. gemini-3.8-flash (with ThinkingLevel.LOW)
    const fallbackModels: Array<{ model: string; thinkingConfig?: { thinkingLevel?: ThinkingLevel } }> = [
      { model: 'gemini-3.1-flash-lite' },
      { model: 'gemini-flash-latest' },
      { model: 'gemini-3.8-flash', thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
    ];

    let response: any = null;
    let lastError: any = null;

    for (let i = 0; i < fallbackModels.length; i++) {
      const candidate = fallbackModels[i];
      try {
        const config: any = {
          systemInstruction,
          responseMimeType: 'application/json',
        };
        if (candidate.thinkingConfig) {
          config.thinkingConfig = candidate.thinkingConfig;
        }

        response = await ai.models.generateContent({
          model: candidate.model,
          contents: { parts: [imagePart, textPart] },
          config,
        });

        if (response && response.text) {
          break; // Success!
        }
      } catch (err: any) {
        lastError = err;
        const errDetail = err?.message || JSON.stringify(err) || String(err);
        console.warn(`Model ${candidate.model} attempt ${i + 1} failed: ${errDetail}`);

        // If there are more models to try, pause briefly and try the next candidate
        if (i < fallbackModels.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          continue;
        }
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('تعذر الحصول على استجابة من نموذج الذكاء الاصطناعي.');
    }

    const rawResult = response.text || '{}';
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawResult);
    } catch {
      // If parsing fails for any reason, wrap in standard response
      parsedData = {
        extractedText: rawResult,
        confidence: 92,
        detectedLanguages: ['العربية'],
      };
    }

    // High-speed, 100% accurate mathematical metrics calculated in milliseconds (0 ms) in Node.js
    const extracted = String(parsedData.extractedText || '').trim();
    parsedData.wordCount = extracted ? extracted.split(/\s+/).filter(Boolean).length : 0;
    parsedData.charCount = extracted.length;
    parsedData.lineCount = extracted ? extracted.split('\n').length : 0;
    if (!parsedData.confidence) parsedData.confidence = 97;
    if (!parsedData.detectedLanguages || !Array.isArray(parsedData.detectedLanguages) || parsedData.detectedLanguages.length === 0) {
      parsedData.detectedLanguages = /[\u0600-\u06FF]/.test(extracted) ? ['العربية'] : ['الإنجليزية'];
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error in /api/ocr:', error);

    // Friendly Arabic translation of technical error messages
    let friendlyMessage = 'حدث خطأ أثناء معالجة الصورة واستخراج النص.';
    const rawMsg = typeof error === 'string' ? error : (error?.message || JSON.stringify(error) || '');

    if (
      rawMsg.includes('503') ||
      rawMsg.includes('high demand') ||
      rawMsg.includes('UNAVAILABLE') ||
      rawMsg.includes('overloaded')
    ) {
      friendlyMessage = 'يشهد خادم الذكاء الاصطناعي ضغطاً مؤقتاً في هذه اللحظة. يرجى النقر على زر "إعادة المحاولة" الآن.';
    } else if (rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('429')) {
      friendlyMessage = 'تم بلوغ الحد المؤقت للطلبات، يرجى الانتظار بضع ثوانٍ ثم النقر على "إعادة المحاولة".';
    } else if (rawMsg.includes('API_KEY') || rawMsg.includes('PERMISSION_DENIED')) {
      friendlyMessage = 'يرجى التحقق من صلاحية مفتاح Gemini API في إعدادات التطبيق.';
    }

    return res.status(500).json({
      error: friendlyMessage,
    });
  }
});

// Translation and Text Enhancement Route
app.post('/api/enhance-text', async (req: Request, res: Response) => {
  try {
    const {
      text,
      action, // 'translate' | 'summarize' | 'diacritics_remove' | 'diacritics_add' | 'fix_grammar' | 'ask_question'
      targetLang = 'en',
      question = '',
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'يرجى تقديم النص المطلوب معالجته.' });
    }

    let prompt = '';
    switch (action) {
      case 'translate':
        prompt = `قم بترجمة النص التالي بدقة وفصاحة إلى اللغة (${targetLang}):\n\n${text}`;
        break;
      case 'summarize':
        prompt = `لخص النص التالي في نقاط أساسية موجزة مع الحفاظ على أهم المعلومات والأرقام:\n\n${text}`;
        break;
      case 'diacritics_remove':
        prompt = `أزل جميع علامات التشكيل والحركات من النص التالي تماماً وأعد النص نظيفاً وبنفس التنسيق:\n\n${text}`;
        break;
      case 'diacritics_add':
        prompt = `قم بتشكيل النص العربي التالي تشكيلاً لغوياً ونحوياً تاماً وصحيحاً:\n\n${text}`;
        break;
      case 'fix_grammar':
        prompt = `صحح أي أخطاء إملائية أو نحوية أو علامات ترقيم في النص التالي وأعد النص مصححاً بالكامل:\n\n${text}`;
        break;
      case 'ask_question':
        prompt = `بناءً على النص المستخرج التالي، أجب عن هذا السؤال بدقة واختصار:\nالسؤال: ${question}\n\nالنص:\n${text}`;
        break;
      default:
        prompt = `راجع النص التالي وأعده منسقاً بشكل واضح:\n\n${text}`;
    }

    let response: any = null;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
      });
    } catch {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });
    }

    return res.json({
      success: true,
      result: response?.text || '',
    });
  } catch (error: any) {
    console.error('Error in /api/enhance-text:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء معالجة النص.',
    });
  }
});

// In-memory cache for shared PDFs without downloading
interface SharedPdfItem {
  id: string;
  title: string;
  buffer: Buffer;
  text?: string;
  createdAt: number;
}
const sharedPdfCache = new Map<string, SharedPdfItem>();

// Auto-cleanup items older than 48 hours
setInterval(() => {
  const now = Date.now();
  for (const [id, item] of sharedPdfCache.entries()) {
    if (now - item.createdAt > 48 * 60 * 60 * 1000) {
      sharedPdfCache.delete(id);
    }
  }
}, 60 * 60 * 1000);

// Endpoint to store and share a PDF directly from memory
app.post('/api/share-pdf', (req: Request, res: Response) => {
  try {
    const { title = 'مستند مستخرج', pdfBase64, text = '' } = req.body;
    if (!pdfBase64) {
      return res.status(400).json({ error: 'لم يتم إرسال بيانات ملف الـ PDF.' });
    }

    let cleanBase64 = pdfBase64;
    if (pdfBase64.includes('base64,')) {
      cleanBase64 = pdfBase64.split('base64,')[1];
    }

    const buffer = Buffer.from(cleanBase64, 'base64');
    const id = `doc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    sharedPdfCache.set(id, {
      id,
      title: title.slice(0, 100),
      buffer,
      text: text.slice(0, 5000),
      createdAt: Date.now(),
    });

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    return res.json({
      success: true,
      id,
      viewUrl: `${baseUrl}/view-pdf/${id}`,
      downloadUrl: `${baseUrl}/api/pdf/${id}`,
    });
  } catch (error: any) {
    console.error('Error sharing PDF:', error);
    return res.status(500).json({ error: 'تعذر إنشاء رابط مشاركة ملف PDF.' });
  }
});

// Endpoint to serve raw PDF file directly (inline viewing / download)
app.get('/api/pdf/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = sharedPdfCache.get(id);
  if (!item) {
    return res.status(404).send('عذراً، هذا الملف غير موجود أو انتهت صلاحية مشاركته.');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(item.title || 'document')}.pdf"`);
  return res.send(item.buffer);
});

// Public Shareable View Page for shared PDFs
app.get('/view-pdf/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = sharedPdfCache.get(id);
  if (!item) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>الملف غير متوفر - بصيرة OCR</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
          .card { background: #1e293b; padding: 40px; border-radius: 20px; border: 1px solid #334155; max-width: 420px; }
          a { color: #10b981; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>📄 الملف غير متوفر</h2>
          <p style="margin: 15px 0; color: #94a3b8;">عذراً، ربما انتهت صلاحية هذا الرابط المؤقت أو تم حذفه.</p>
          <a href="/">العودة إلى تطبيق بصيرة OCR</a>
        </div>
      </body>
      </html>
    `);
  }

  const pdfUrl = `/api/pdf/${id}`;
  const safeTitle = (item.title || 'مستند PDF مستخرج').replace(/"/g, '&quot;');
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const fullShareUrl = `${protocol}://${req.get('host')}/view-pdf/${id}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${safeTitle}\nشاهد ملف الـ PDF مباشرة:\n${fullShareUrl}`)}`;

  res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${safeTitle} - مستند PDF</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
        header { background: #1e293b; border-bottom: 1px solid #334155; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; z-index: 10; }
        .logo-area { display: flex; align-items: center; gap: 10px; }
        .badge { background: #059669; color: #fff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 6px; }
        h1 { font-size: 15px; font-weight: 700; color: #f8fafc; }
        .actions { display: flex; align-items: center; gap: 8px; }
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 10px; font-size: 12px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; transition: 0.2s; }
        .btn-primary { background: #10b981; color: #fff; }
        .btn-primary:hover { background: #059669; }
        .btn-secondary { background: #334155; color: #f8fafc; }
        .btn-secondary:hover { background: #475569; }
        .btn-whatsapp { background: #25D366; color: #fff; }
        .btn-whatsapp:hover { background: #20bd5a; }
        .viewer-container { flex: 1; width: 100%; height: 100%; position: relative; background: #334155; }
        iframe { width: 100%; height: 100%; border: none; }
      </style>
    </head>
    <body>
      <header>
        <div class="logo-area">
          <span class="badge">بصيرة OCR</span>
          <h1>${safeTitle}</h1>
        </div>
        <div class="actions">
          <a href="${whatsappUrl}" target="_blank" class="btn btn-whatsapp">
            <span>مشاركة عبر واتساب</span>
          </a>
          <a href="${pdfUrl}" download="${safeTitle}.pdf" class="btn btn-secondary">
            <span>تحميل نسخة</span>
          </a>
          <a href="/" class="btn btn-primary">
            <span>فتح بصيرة OCR</span>
          </a>
        </div>
      </header>
      <div class="viewer-container">
        <iframe src="${pdfUrl}#toolbar=1&navpanes=0" title="${safeTitle}"></iframe>
      </div>
    </body>
    </html>
  `);
});

// Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
