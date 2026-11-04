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

    const systemInstruction = `أنت خبير ذكاء اصطناعي متخصص في التعرف الضوئي على الحروف (OCR) واستخراج النصوص متعددة اللغات مع تركيز فائق الدقة على اللغة العربية بجميع خطوطها (النسخ، الرقعة، الكوفي، الديواني، والخط اليدوي السريع)، بالإضافة إلى الإنجليزية والرموز والأرقام.
مهمتك استخراج جميع النصوص الموجودة في الصورة المرفقة بدقة 100% دون أي تحريف أو تخمين خاطئ، مع الإشارة الدقيقة إلى التنسيق الأصلي.

قواعد مهمة:
1. استخرج النص كما هو في الصورة تماماً.
2. إذا كانت هناك لغات متعددة (مثل العربية والإنجليزية معاً)، استخرج كليهما في مكانهما الصحيح.
3. التزم بالتعليمات الخاصة بنوع المستند.
4. أخرج النتيجة بتنسيق JSON نظيف وصالح وفق المخطط المطلوب.`;

    const userPrompt = `يرجى تحليل هذه الصورة واستخراج جميع النصوص المكتوبة فيها بدقة عالية جداً.

التعليمات الخاصة:
${modeInstruction}
${diacriticInstruction}
${cleanFormatting ? '- صحح المسافات الزائدة والتنسيق غير المنتظم للفقرات.' : ''}
${translateTo && translateTo !== 'none' ? `- قم أيضاً بترجمة النص المستخرج بالكامل إلى اللغة المحددة ذات الرمز (${translateTo}) بدقة واحترافية.` : ''}
${summarize ? '- قم بإعداد ملخص موجز وشامل لأهم النقاط في النص المستخرج.' : ''}

قم بتوفير الإجابة بتنسيق JSON يحتوي على الحقول التالية:
- "extractedText": النص المستخرج الكامل والمنظم.
- "confidence": نسبة الثقة التقديرية بالدقة من 0 إلى 100.
- "detectedLanguages": مصفوفة بأسماء اللغات المكتشفة في الصورة (مثل "العربية", "الإنجليزية").
- "wordCount": عدد الكلمات التقريبي.
- "charCount": عدد الأحرف.
- "lineCount": عدد الأسطر.
- "modeSpecificData": كائن اختياري يحتوي على بيانات مهيكلة إذا كان نوع المستند (receipt أو business_card أو table) ليسهل عرضها بشكل منظم.
- "summary": الملخص إذا كان مطلوباً، وإلا null.
- "translation": النص المترجم إذا طُلبت الترجمة، وإلا null.
- "notes": أي ملاحظات حول جودة الصورة أو صعوبة قراءة بعض الأجزاء (إن وُجدت).
`;

    const imagePart = {
      inlineData: {
        mimeType: resolvedMime,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: userPrompt,
    };

    // Robust multi-model fallback sequence to gracefully handle 503 high demand spikes
    const fallbackModels: Array<{ model: string; thinkingConfig?: { thinkingLevel: ThinkingLevel } }> = [
      { model: 'gemini-3.8-flash', thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
      { model: 'gemini-flash-latest' },
      { model: 'gemini-3.1-flash-lite' },
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
          await new Promise((resolve) => setTimeout(resolve, 400));
          continue;
        }
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error('تعذر الحصول على استجابة من نموذج الذكاء الاصطناعي.');
    }

    const rawResult = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawResult);
    } catch {
      // If parsing fails for any reason, wrap in standard response
      parsedData = {
        extractedText: rawResult,
        confidence: 90,
        detectedLanguages: ['العربية'],
        wordCount: rawResult.split(/\s+/).filter(Boolean).length,
        charCount: rawResult.length,
        lineCount: rawResult.split('\n').length,
      };
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    return res.json({
      success: true,
      result: response.text || '',
    });
  } catch (error: any) {
    console.error('Error in /api/enhance-text:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ أثناء معالجة النص.',
    });
  }
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
