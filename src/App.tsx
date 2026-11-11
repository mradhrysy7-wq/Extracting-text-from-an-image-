/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Feather, 
  Receipt, 
  Languages, 
  RotateCw, 
  RefreshCw,
  X, 
  ZoomIn,
  ShieldCheck,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ImageTools } from './components/ImageTools';
import { OcrOptionsBar } from './components/OcrOptionsBar';
import { ScanProgress } from './components/ScanProgress';
import { ResultsWorkspace } from './components/ResultsWorkspace';
import { CameraModal } from './components/CameraModal';
import { HelpModal } from './components/HelpModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { LegalModals, LegalModalType } from './components/LegalModals';
import { CookieBanner } from './components/CookieBanner';
import { AdBannerSlot } from './components/AdBannerSlot';
import { AdsenseInfoSections } from './components/AdsenseInfoSections';
import { Footer } from './components/Footer';
import { NewTextDocumentModal } from './components/NewTextDocumentModal';
import { ImageToPdfModal } from './components/ImageToPdfModal';
import { OcrMode, OcrOptions, OcrResultData, ExtractionHistoryItem } from './types/ocr';
import { optimizeImageForOcr } from './utils/imageOptimizer';

const HISTORY_STORAGE_KEY = 'baseera_ocr_history_v1';
const THEME_STORAGE_KEY = 'baseera_theme_v1';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Current Image State
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | undefined>();
  const [rotation, setRotation] = useState<number>(0);
  const [contrastFilter, setContrastFilter] = useState<'normal' | 'high_contrast' | 'grayscale' | 'invert'>('normal');

  // OCR Configuration Options
  const [ocrOptions, setOcrOptions] = useState<OcrOptions>({
    mode: 'raw',
    preserveDiacritics: true,
    cleanFormatting: true,
    translateTo: 'none',
    summarize: false,
  });

  // Processing & Results State
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrResultData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Drawers
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isNewTextDocOpen, setIsNewTextDocOpen] = useState(false);
  const [isImageToPdfOpen, setIsImageToPdfOpen] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);

  // Local Extraction History
  const [history, setHistory] = useState<ExtractionHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Image load & dimension calculator
  const handleImageSelected = (dataUrl: string, fileName?: string, recommendedMode?: OcrMode) => {
    setImageDataUrl(dataUrl);
    setImageFileName(fileName || 'مستند_مرفوع.png');
    setRotation(0);
    setContrastFilter('normal');
    setOcrResult(null);
    setErrorMessage(null);

    if (recommendedMode) {
      setOcrOptions((prev) => ({ ...prev, mode: recommendedMode }));
    }

    // Inspect image natural dimensions
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = dataUrl;
  };

  const handleSelectImageForPdf = (dataUrl: string, fileName?: string) => {
    handleImageSelected(dataUrl, fileName);
    setIsImageToPdfOpen(true);
  };

  // Execute OCR Request to server endpoint
  const handleStartOcr = async () => {
    if (!imageDataUrl) return;

    setIsProcessing(true);
    setErrorMessage(null);
    const startTime = Date.now();

    try {
      // If rotation is applied, bake it into a fresh canvas dataUrl for Gemini
      let finalDataUrl = imageDataUrl;
      if (rotation !== 0) {
        finalDataUrl = await bakeImageRotation(imageDataUrl, rotation);
      }

      // Fast image compression & resolution optimization for lightning speed
      finalDataUrl = await optimizeImageForOcr(finalDataUrl);

      const payload = {
        image: finalDataUrl,
        mode: ocrOptions.mode,
        preserveDiacritics: ocrOptions.preserveDiacritics,
        cleanFormatting: ocrOptions.cleanFormatting,
        translateTo: ocrOptions.translateTo,
        summarize: ocrOptions.summarize,
      };

      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'فشلت معالجة الصورة واستخراج النص.');
      }

      const duration = parseFloat(((Date.now() - startTime) / 1000).toFixed(1));
      const resultData: OcrResultData = {
        ...json.data,
        durationSeconds: duration,
      };
      setOcrResult(resultData);

      // Save to local history
      const newHistoryItem: ExtractionHistoryItem = {
        id: `ocr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        title: imageFileName || 'مستند مستخرج',
        thumbnail: imageDataUrl,
        mode: ocrOptions.mode,
        result: resultData,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]); // keep last 50
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      let raw = err?.message || '';
      if (
        raw.includes('503') ||
        raw.includes('high demand') ||
        raw.includes('UNAVAILABLE') ||
        raw.includes('overloaded')
      ) {
        raw = 'يشهد خادم الذكاء الاصطناعي ضغطاً مؤقتاً في هذه اللحظة. يرجى النقر على زر "إعادة المحاولة" الآن.';
      } else if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
        raw = 'تم بلوغ الحد المؤقت للطلبات، يرجى الانتظار بضع ثوانٍ ثم النقر على "إعادة المحاولة".';
      }
      setErrorMessage(raw || 'حدث خطأ غير متوقع أثناء استخراج النص.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Rotate canvas helper to permanently rotate pixels if needed
  const bakeImageRotation = (dataUrl: string, degrees: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);

        const rads = (degrees * Math.PI) / 180;
        const isOrthogonal = Math.abs(degrees % 180) === 90;

        canvas.width = isOrthogonal ? img.height : img.width;
        canvas.height = isOrthogonal ? img.width : img.height;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rads);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = dataUrl;
    });
  };

  const handleReset = () => {
    setImageDataUrl(null);
    setImageFileName('');
    setImageDimensions(undefined);
    setRotation(0);
    setContrastFilter('normal');
    setOcrResult(null);
    setErrorMessage(null);
  };

  const handleCreateDocumentFromText = (text: string, title: string) => {
    setImageDataUrl('text_document');
    setImageFileName(title || 'مستند_نصي.txt');
    setRotation(0);
    setContrastFilter('normal');
    setErrorMessage(null);

    const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const lines = text ? text.split('\n').length : 0;

    const resultData: OcrResultData = {
      extractedText: text,
      confidence: 100,
      detectedLanguages: ['العربية'],
      lineCount: lines,
      wordCount: words,
      charCount: chars,
      durationSeconds: 0,
    };
    setOcrResult(resultData);

    // Save to extraction history
    const newHistoryItem: ExtractionHistoryItem = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      title: title || 'مستند نصي جاهز',
      thumbnail: 'text_document',
      mode: 'raw',
      result: resultData,
    };
    setHistory((prev) => [newHistoryItem, ...prev.slice(0, 49)]);
  };

  const handleSelectHistoryItem = (item: ExtractionHistoryItem) => {
    setImageDataUrl(item.thumbnail);
    setImageFileName(item.title);
    setOcrOptions((prev) => ({ ...prev, mode: item.mode }));
    setOcrResult(item.result);
    setErrorMessage(null);
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm('هل أنت متأكد من رغبتك في مسح سجل الاستخراجات بالكامل؟')) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Navbar Header */}
      <Header
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenHelp={() => setIsHelpOpen(true)}
        onReset={handleReset}
        onOpenNewTextDocument={() => setIsNewTextDocOpen(true)}
        onOpenImageToPdf={() => setIsImageToPdfOpen(true)}
        hasActiveImage={!!imageDataUrl}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Hero Banner when no image is loaded */}
        {!imageDataUrl && (
          <div className="text-center max-w-3xl mx-auto space-y-3 py-4 animate-in fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800/80 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>تقنية OCR مدعومة بنماذج Gemini 3.8 الفائقة</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              استخراج وقراءة النصوص من الصور{' '}
              <span className="bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                بدقة واحترافية
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              حوّل أي صورة، وثيقة، فاتورة، أو ملاحظة مكتوبة بخط اليد إلى نص رقمي فوري قابل للنسخ والتعديل والترجمة والنطق الصوتي والتصدير.
            </p>

            {/* Capability highlights pill list */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                دقة فائقة للغة العربية مع الحركات
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                التعرف على الخط اليدوي
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                تحويل الجداول والفواتير
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                تصدير إلى Word و TXT وماركداون
              </span>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">تعذر استخراج النص</p>
                <p className="text-xs leading-relaxed">{errorMessage}</p>
                {imageDataUrl && (
                  <button
                    onClick={handleStartOcr}
                    disabled={isProcessing}
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                    إعادة المحاولة الآن
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 text-rose-400 hover:text-rose-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* AdSense Top Standard Banner Slot */}
        <AdBannerSlot slotId="top_banner_slot" />

        {/* Upload Zone (shown when no image selected) */}
        {!imageDataUrl && (
          <ImageUploader
            onImageSelected={handleImageSelected}
            onOpenCamera={() => setIsCameraOpen(true)}
            onOpenNewTextDocument={() => setIsNewTextDocOpen(true)}
            onSelectImageForPdf={handleSelectImageForPdf}
          />
        )}

        {/* Active Workspace when an image or document is loaded */}
        {imageDataUrl && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Image Adjustment Toolbar (Only when working with a real image) */}
            {imageDataUrl !== 'text_document' && (
              <ImageTools
                rotation={rotation}
                onRotateClockwise={() => setRotation((prev) => (prev + 90) % 360)}
                onRotateCounterClockwise={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                contrastFilter={contrastFilter}
                onChangeFilter={setContrastFilter}
                onResetAdjustments={() => {
                  setRotation(0);
                  setContrastFilter('normal');
                }}
                onTriggerZoom={() => setIsZoomOpen(true)}
                onConvertToPdf={() => setIsImageToPdfOpen(true)}
                imageFileName={imageFileName}
                imageDimensions={imageDimensions}
              />
            )}

            {/* OCR Options Bar (Mode selection, toggles, execute button) */}
            {!ocrResult && !isProcessing && (
              <OcrOptionsBar
                options={ocrOptions}
                onChangeOptions={(updated) => setOcrOptions((prev) => ({ ...prev, ...updated }))}
                onStartOcr={handleStartOcr}
                isProcessing={isProcessing}
              />
            )}

            {/* Scanning Laser Animation State */}
            {isProcessing && (
              <ScanProgress
                imageSrc={imageDataUrl}
                rotation={rotation}
                contrastFilter={contrastFilter}
              />
            )}

            {/* Results Workspace (Dual view, editor, export, AI tools) */}
            {ocrResult && !isProcessing && (
              <ResultsWorkspace
                imageSrc={imageDataUrl}
                rotation={rotation}
                contrastFilter={contrastFilter}
                result={ocrResult}
                mode={ocrOptions.mode}
                onReExtract={handleStartOcr}
                onNewImage={handleReset}
                onOpenImageToPdf={() => setIsImageToPdfOpen(true)}
              />
            )}

          </div>
        )}

        {/* Rich Informational & Educational Sections (Prevents AdSense 'Thin Content' rejection) */}
        <AdsenseInfoSections />

        {/* AdSense Bottom Standard Banner Slot */}
        <AdBannerSlot slotId="bottom_banner_slot" />

      </main>

      {/* Comprehensive Legal & Policy Compliant Footer */}
      <Footer onOpenLegal={(type) => setActiveLegalModal(type)} />

      {/* Live Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(capturedDataUrl) => handleImageSelected(capturedDataUrl, 'صورة_الكاميرا.jpg')}
      />

      {/* Help & Tips Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={handleSelectHistoryItem}
        onClear={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* High-Resolution Zoom Modal */}
      {isZoomOpen && imageDataUrl && imageDataUrl !== 'text_document' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-10 left-0 p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={imageDataUrl}
              alt="Zoomed document"
              style={{
                transform: `rotate(${rotation}deg)`,
                filter:
                  contrastFilter === 'high_contrast'
                    ? 'contrast(160%) brightness(105%)'
                    : contrastFilter === 'grayscale'
                    ? 'grayscale(100%) contrast(120%)'
                    : 'none',
              }}
              className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* New Text Document & Character Modifier Modal */}
      <NewTextDocumentModal
        isOpen={isNewTextDocOpen}
        onClose={() => setIsNewTextDocOpen(false)}
        onCreateDocument={handleCreateDocumentFromText}
      />

      {/* Image to PDF Direct Converter Modal */}
      {imageDataUrl && imageDataUrl !== 'text_document' && (
        <ImageToPdfModal
          isOpen={isImageToPdfOpen}
          onClose={() => setIsImageToPdfOpen(false)}
          imageSrc={imageDataUrl}
          rotation={rotation}
          contrastFilter={contrastFilter}
          defaultTitle={imageFileName}
        />
      )}

      {/* Mandatory Google AdSense Legal Modals (Privacy, Terms, About, Contact) */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

      {/* Cookie & Advertising Consent Banner */}
      <CookieBanner
        onOpenPrivacy={() => setActiveLegalModal('privacy')}
      />

    </div>
  );
}
