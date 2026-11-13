import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Printer,
  Volume2,
  VolumeX,
  FileText,
  Search,
  Sparkles,
  RefreshCw,
  Languages,
  Maximize2,
  CheckCircle2,
  Table as TableIcon,
  HelpCircle,
  Edit3,
  Columns,
  MessageSquare,
  FileDown,
  Zap,
  Share2,
  Loader2,
  FileEdit,
  ArrowLeftRight,
  Type,
  CheckCheck,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { OcrResultData, OcrMode } from '../types/ocr';
import {
  copyToClipboard,
  downloadTextFile,
  downloadDocFile,
  printDocument,
  TextSpeechPlayer,
  createWhitePagePdfBlob,
  sharePdfDirectly,
  copyPdfToClipboard,
} from '../utils/textExport';
import { WhitePagePdfModal } from './WhitePagePdfModal';
import { SharePdfModal } from './SharePdfModal';


interface ResultsWorkspaceProps {
  imageSrc: string;
  rotation: number;
  contrastFilter: string;
  result: OcrResultData;
  mode: OcrMode;
  onReExtract: () => void;
  onNewImage: () => void;
  onOpenImageToPdf?: () => void;
}

export const ResultsWorkspace: React.FC<ResultsWorkspaceProps> = ({
  imageSrc,
  rotation,
  contrastFilter,
  result,
  mode,
  onReExtract,
  onNewImage,
  onOpenImageToPdf,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'structured' | 'translation' | 'summary'>('text');
  const [editableText, setEditableText] = useState(result.extractedText || '');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'split' | 'textOnly'>('split');
  const [isWhitePdfModalOpen, setIsWhitePdfModalOpen] = useState(false);
  const [isDirectSharingPdf, setIsDirectSharingPdf] = useState(false);
  const [isDirectCopyingPdf, setIsDirectCopyingPdf] = useState(false);
  const [copiedPdfDirect, setCopiedPdfDirect] = useState(false);
  const [directShareData, setDirectShareData] = useState<{
    blob: Blob | null;
    fileName: string;
    shareUrl?: string;
    downloadUrl?: string;
    title: string;
  } | null>(null);

  // AI interactive question state
  const [questionInput, setQuestionInput] = useState('');
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionAnswer, setQuestionAnswer] = useState<string | null>(null);

  // Quick enhancement processing state
  const [enhancingAction, setEnhancingAction] = useState<string | null>(null);
  const [activeTranslation, setActiveTranslation] = useState<string | null>(result.translation || null);
  const [activeSummary, setActiveSummary] = useState<string | null>(result.summary || null);

  useEffect(() => {
    setEditableText(result.extractedText || '');
    setActiveTranslation(result.translation || null);
    setActiveSummary(result.summary || null);
  }, [result]);

  useEffect(() => {
    return () => {
      TextSpeechPlayer.stop();
    };
  }, []);

  const handleCopy = async (textToCopy: string) => {
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      TextSpeechPlayer.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToRead = activeTab === 'translation' && activeTranslation ? activeTranslation : editableText;
      TextSpeechPlayer.speak(
        textToRead,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const [charSwapToast, setCharSwapToast] = useState<string | null>(null);

  const isTextDoc = imageSrc === 'text_document';

  const showCharToast = (msg: string) => {
    setCharSwapToast(msg);
    setTimeout(() => setCharSwapToast(null), 3000);
  };

  const handleQuickCharSwap = (findChar: string, replaceWithChar: string) => {
    if (!editableText) return;
    const count = (editableText.match(new RegExp(findChar, 'g')) || []).length;
    if (count === 0) {
      showCharToast(`لم يتم العثور على حرف (${findChar}) في النص`);
      return;
    }
    const updated = editableText.replaceAll(findChar, replaceWithChar);
    setEditableText(updated);
    showCharToast(`تم استبدال (${count}) من حرف [${findChar}] إلى [${replaceWithChar}]`);
  };

  const handleUnifyHamzas = () => {
    if (!editableText) return;
    const count = (editableText.match(/[أإآ]/g) || []).length;
    if (count === 0) {
      showCharToast('لا توجد همزات (أ، إ، آ) في النص');
      return;
    }
    const updated = editableText.replace(/[أإآ]/g, 'ا');
    setEditableText(updated);
    showCharToast(`تم توحيد (${count}) همزة إلى ألف عادية (ا)`);
  };

  const handleRemoveDiacritics = () => {
    if (!editableText) return;
    const count = (editableText.match(/[\u064B-\u065F\u0670]/g) || []).length;
    if (count === 0) {
      showCharToast('النص خالي من علامات التشكيل والحركات');
      return;
    }
    const updated = editableText.replace(/[\u064B-\u065F\u0670]/g, '');
    setEditableText(updated);
    showCharToast(`تمت إزالة (${count}) حركة تشكيل بنجاح`);
  };

  const handleCleanSpaces = () => {
    if (!editableText) return;
    const updated = editableText
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
    setEditableText(updated);
    showCharToast('تم ضبط وتنسيق المسافات والأسطر الزائدة');
  };

  const handleSearchReplace = () => {
    if (!searchQuery) return;
    const count = (editableText.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count === 0) {
      showCharToast(`لم يتم العثور على أي تطابق لـ "${searchQuery}"`);
      return;
    }
    const updated = editableText.replaceAll(searchQuery, replaceQuery);
    setEditableText(updated);
    showCharToast(`تم استبدال (${count}) تطابق لـ "${searchQuery}" إلى "${replaceQuery}"`);
  };

  // Perform on-demand AI enhancement (diacritics, grammar, summarize, translate)
  const handleEnhance = async (action: string, param?: string) => {
    setEnhancingAction(action);
    try {
      const response = await fetch('/api/enhance-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: editableText,
          action,
          targetLang: param || 'en',
          question: param || '',
        }),
      });
      const data = await response.json();
      if (data.success && data.result) {
        if (action === 'translate') {
          setActiveTranslation(data.result);
          setActiveTab('translation');
        } else if (action === 'summarize') {
          setActiveSummary(data.result);
          setActiveTab('summary');
        } else if (action === 'ask_question') {
          setQuestionAnswer(data.result);
        } else {
          // diacritics_remove, diacritics_add, fix_grammar
          setEditableText(data.result);
        }
      }
    } catch (err) {
      console.error('Enhancement error:', err);
    } finally {
      setEnhancingAction(null);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    setIsAskingQuestion(true);
    handleEnhance('ask_question', questionInput).finally(() => setIsAskingQuestion(false));
  };

  const handleDirectSharePdf = async () => {
    const textToShare = activeTab === 'translation' && activeTranslation ? activeTranslation : editableText;
    if (!textToShare.trim()) return;

    setIsDirectSharingPdf(true);
    try {
      const docTitle = 'المستند المستخرج';
      const blob = await createWhitePagePdfBlob({
        title: docTitle,
        text: textToShare,
        imageThumbnail: imageSrc,
        includeDate: true,
        includeHeader: true,
      });

      const result = await sharePdfDirectly({
        blob,
        title: docTitle,
        text: textToShare,
        attemptNativeShare: true,
      });

      setDirectShareData({
        blob: result.blob,
        fileName: result.fileName,
        shareUrl: result.shareUrl,
        downloadUrl: result.downloadUrl,
        title: docTitle,
      });
    } catch (err) {
      console.error('Failed to create and share PDF directly:', err);
    } finally {
      setIsDirectSharingPdf(false);
    }
  };

  const handleDirectCopyPdf = async () => {
    const textToShare = activeTab === 'translation' && activeTranslation ? activeTranslation : editableText;
    if (!textToShare.trim()) return;

    setIsDirectCopyingPdf(true);
    try {
      const docTitle = 'المستند المستخرج';
      const blob = await createWhitePagePdfBlob({
        title: docTitle,
        text: textToShare,
        imageThumbnail: imageSrc,
        includeDate: true,
        includeHeader: true,
      });

      const shareRes = await sharePdfDirectly({
        blob,
        title: docTitle,
        text: textToShare,
        attemptNativeShare: false,
      });

      await copyPdfToClipboard(blob, docTitle, shareRes.shareUrl || shareRes.downloadUrl);
      setCopiedPdfDirect(true);
      setTimeout(() => setCopiedPdfDirect(false), 3000);
    } catch (err) {
      console.error('Failed to copy PDF file:', err);
    } finally {
      setIsDirectCopyingPdf(false);
    }
  };

  const getFilterStyle = () => {
    switch (contrastFilter) {
      case 'high_contrast':
        return 'contrast(160%) brightness(105%)';
      case 'grayscale':
        return 'grayscale(100%) contrast(120%)';
      default:
        return 'none';
    }
  };

  const wordCount = editableText.trim() ? editableText.trim().split(/\s+/).length : 0;
  const charCount = editableText.length;
  const lineCount = editableText ? editableText.split('\n').length : 0;
  const confidence = result.confidence || 98;

  return (
    <div className="space-y-4 animate-in fade-in">
      
      {/* Top Overview & Stats Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Metrics & Status */}
        <div className="flex items-center gap-3 flex-wrap">
          {isTextDoc ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 font-bold text-xs border border-purple-300 dark:border-purple-800">
              <FileEdit className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>مستند نصي رقمي (100% دقة)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>الدقة المقدرة: {confidence}%</span>
            </div>
          )}

          {!isTextDoc && result.durationSeconds !== undefined && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200 dark:border-amber-900/60 shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>استُخرج في {result.durationSeconds} ثوانٍ</span>
            </div>
          )}

          {result.detectedLanguages && result.detectedLanguages.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-medium">اللغات:</span>
              <div className="flex gap-1">
                {result.detectedLanguages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

          {/* Quick Counters */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span><strong>{wordCount}</strong> كلمة</span>
            <span>•</span>
            <span><strong>{charCount}</strong> حرف</span>
            <span>•</span>
            <span><strong>{lineCount}</strong> سطر</span>
          </div>
        </div>

        {/* Right: Layout Switcher & New */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewLayout((prev) => (prev === 'split' ? 'textOnly' : 'split'))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={viewLayout === 'split' ? (isTextDoc ? 'إخفاء الإحصائيات' : 'عرض النص فقط') : (isTextDoc ? 'عرض تحليل الحروف' : 'عرض الصورة والنص معاً')}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{viewLayout === 'split' ? (isTextDoc ? 'إخفاء التحليل' : 'إخفاء الصورة') : (isTextDoc ? 'تحليل الحروف' : 'مقارنة مع الصورة')}</span>
          </button>

          <button
            onClick={onNewImage}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isTextDoc
                ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800'
                : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            {isTextDoc ? <FileEdit className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isTextDoc ? 'مستند جديد' : 'صورة جديدة'}</span>
          </button>
        </div>

      </div>

      {/* Main Dual Workspace */}
      <div className={`grid gap-4 ${viewLayout === 'split' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* Left Column (Document Character Diagnostics OR Image Comparison) */}
        {viewLayout === 'split' && (
          isTextDoc ? (
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">تحليل الحروف وتعديلها</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">إحصاءات الحروف وتبديلها فورياً</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  محرر المستند
                </span>
              </div>

              {/* Toast alert if triggered */}
              {charSwapToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{charSwapToast}</span>
                </div>
              )}

              {/* Letter Diagnostics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">إجمالي الحروف</span>
                  <span className="font-mono font-bold text-base text-slate-800 dark:text-white">{charCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">حروف بدون مسافات</span>
                  <span className="font-mono font-bold text-base text-slate-800 dark:text-white">{editableText.replace(/\s/g, '').length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">عدد الكلمات</span>
                  <span className="font-mono font-bold text-base text-slate-800 dark:text-white">{wordCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">عدد الأسطر</span>
                  <span className="font-mono font-bold text-base text-slate-800 dark:text-white">{lineCount}</span>
                </div>
              </div>

              {/* Arabic Character Quick Modification Buttons */}
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  تبديل وتعديل الحروف الشائعة بنقرة واحدة:
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleQuickCharSwap('ى', 'ي')}
                    className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/80 text-right flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-purple-900 dark:text-purple-200 block text-xs">تبديل ى ➔ ي</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                        {(editableText.match(/ى/g) || []).length} حرف (ى)
                      </span>
                    </div>
                    <ArrowLeftRight className="w-3.5 h-3.5 text-purple-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickCharSwap('ي', 'ى')}
                    className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/80 text-right flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-purple-900 dark:text-purple-200 block text-xs">تبديل ي ➔ ى</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                        {(editableText.match(/ي/g) || []).length} حرف (ي)
                      </span>
                    </div>
                    <ArrowLeftRight className="w-3.5 h-3.5 text-purple-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickCharSwap('ه', 'ة')}
                    className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/80 text-right flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-purple-900 dark:text-purple-200 block text-xs">تبديل ه ➔ ة</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                        {(editableText.match(/ه/g) || []).length} حرف (ه)
                      </span>
                    </div>
                    <ArrowLeftRight className="w-3.5 h-3.5 text-purple-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickCharSwap('ة', 'ه')}
                    className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/80 text-right flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-purple-900 dark:text-purple-200 block text-xs">تبديل ة ➔ ه</span>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                        {(editableText.match(/ة/g) || []).length} حرف (ة)
                      </span>
                    </div>
                    <ArrowLeftRight className="w-3.5 h-3.5 text-purple-500" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleUnifyHamzas}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-right flex items-center justify-between cursor-pointer font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>توحيد الهمزات (أ، إ، آ ➔ ا)</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {(editableText.match(/[أإآ]/g) || []).length} همزة
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveDiacritics}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-right flex items-center justify-between cursor-pointer font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>حذف علامات التشكيل والحركات</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {(editableText.match(/[\u064B-\u065F\u0670]/g) || []).length} حركة
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCleanSpaces}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-right flex items-center justify-between cursor-pointer font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>ضبط وتنسيق المسافات والأسطر الزائدة</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">تنسيق فوري</span>
                  </button>
                </div>
              </div>

              {/* Tip info box */}
              <div className="mt-auto p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30 text-[11px] text-purple-950 dark:text-purple-300 leading-relaxed">
                💡 يمكنك تعديل أي حرف أو كلمة مباشرة داخل محرر النصوص في الجهة اليسرى، أو استخدام ميزة البحث والاستبدال لتغيير كلمات كاملة.
              </div>
            </div>
          ) : (
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span>الصورة الأصلية المرفوعة</span>
                  <span className="text-[10px] text-slate-400 font-normal">للمقارنة</span>
                </div>
                {onOpenImageToPdf && (
                  <button
                    onClick={onOpenImageToPdf}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-bold transition-colors cursor-pointer"
                    title="تحويل الصورة الأصلية مباشرة إلى ملف PDF"
                  >
                    <FileDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>تحويل لـ PDF</span>
                  </button>
                )}
              </div>

              <div className="relative flex-1 min-h-[350px] max-h-[550px] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 border border-slate-200 dark:border-slate-800">
                <img
                  src={imageSrc}
                  alt="Source OCR"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: getFilterStyle(),
                  }}
                  className="max-h-[500px] w-auto max-w-full object-contain transition-all"
                />
              </div>
            </div>
          )
        )}

        {/* Right Column (Interactive Results & Editor) */}
        <div className={`${viewLayout === 'split' ? 'lg:col-span-7' : 'col-span-1'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col overflow-hidden`}>
          
          {/* Workspace Tabs Header */}
          <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-2">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer shrink-0 ${
                  activeTab === 'text'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>النص المستخرج<span className="hidden sm:inline"> (قابل للتعديل)</span></span>
              </button>

              {result.modeSpecificData && (
                <button
                  onClick={() => setActiveTab('structured')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
                    activeTab === 'structured'
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>بيانات منظمة</span>
                </button>
              )}

              {activeTranslation && (
                <button
                  onClick={() => setActiveTab('translation')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
                    activeTab === 'translation'
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>الترجمة</span>
                </button>
              )}

              {activeSummary && (
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
                    activeTab === 'summary'
                      ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>الملخص</span>
                </button>
              )}
            </div>

            {/* Top Editor Quick Action Buttons */}
            <div className="flex items-center gap-1.5 pb-2">
              
              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch((prev) => !prev)}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  showSearch
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="بحث واستبدال داخل النص"
              >
                <Search className="w-3.5 h-3.5" />
              </button>

              {/* Text-to-Speech Toggle */}
              <button
                onClick={handleToggleSpeak}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                  isSpeaking
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title={isSpeaking ? 'إيقاف القراءة الصوتية' : 'استماع صوتي للنص'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="text-[11px] font-medium hidden sm:inline">
                  {isSpeaking ? 'إيقاف' : 'استماع'}
                </span>
              </button>

              {/* Copy Button */}
              <button
                onClick={() => handleCopy(activeTab === 'translation' && activeTranslation ? activeTranslation : editableText)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800'
                }`}
                title="نسخ النص إلى الحافظة"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>

            </div>

          </div>

          {/* Search & Replace & Character Swapping Inline Bar */}
          {showSearch && (
            <div className="p-3 bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 space-y-2.5 text-xs animate-in fade-in">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[150px]">
                  <input
                    type="text"
                    placeholder="ابحث عن كلمة أو حرف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 pl-16 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                  {searchQuery && (
                    <span
                      className={`absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        (editableText.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length > 0
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {(editableText.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length} تطابق
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-[150px]">
                  <input
                    type="text"
                    placeholder="استبدال بـ (كلمة أو حرف)..."
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearchReplace}
                  disabled={!searchQuery}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  استبدال الكل
                </button>
              </div>

              {/* Quick Character Replacer Buttons Strip */}
              <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  استبدال سريع للحروف:
                </span>

                <button
                  type="button"
                  onClick={() => handleQuickCharSwap('ى', 'ي')}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-medium text-[11px] transition-colors cursor-pointer"
                  title="استبدال حرف ى بـ ي"
                >
                  ى ➔ ي
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickCharSwap('ي', 'ى')}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-medium text-[11px] transition-colors cursor-pointer"
                  title="استبدال حرف ي بـ ى"
                >
                  ي ➔ ى
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickCharSwap('ه', 'ة')}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-medium text-[11px] transition-colors cursor-pointer"
                  title="استبدال حرف ه بـ ة"
                >
                  ه ➔ ة
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickCharSwap('ة', 'ه')}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-medium text-[11px] transition-colors cursor-pointer"
                  title="استبدال حرف ة بـ ه"
                >
                  ة ➔ ه
                </button>

                <button
                  type="button"
                  onClick={handleUnifyHamzas}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-medium text-[11px] transition-colors cursor-pointer"
                  title="توحيد الهمزات أ، إ، آ إلى ألف عادية"
                >
                  أ/إ ➔ ا
                </button>

                <button
                  type="button"
                  onClick={handleRemoveDiacritics}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-medium text-[11px] transition-colors cursor-pointer"
                  title="حذف جميع علامات التشكيل والحركات"
                >
                  حذف التشكيل
                </button>

                <button
                  type="button"
                  onClick={handleCleanSpaces}
                  className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-medium text-[11px] transition-colors cursor-pointer"
                  title="تنظيف وضبط المسافات والأسطر"
                >
                  ضبط المسافات
                </button>
              </div>

              {/* Feedback toast in search bar */}
              {charSwapToast && (
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{charSwapToast}</span>
                </div>
              )}
            </div>
          )}

          {/* Tab Contents */}
          <div className="flex-1 p-4 min-h-[380px] flex flex-col">
            
            {activeTab === 'text' && (
              <div className="flex-1 flex flex-col">
                <textarea
                  value={editableText}
                  onChange={(e) => setEditableText(e.target.value)}
                  dir="auto"
                  className="w-full flex-1 min-h-[320px] p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-sans text-sm sm:text-base leading-relaxed resize-y focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="النص المستخرج سيظهر هنا..."
                />
              </div>
            )}

            {activeTab === 'structured' && result.modeSpecificData && (
              <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <pre className="whitespace-pre-wrap font-mono text-slate-800 dark:text-slate-200">
                  {JSON.stringify(result.modeSpecificData, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === 'translation' && (
              <div className="flex-1 flex flex-col">
                <textarea
                  value={activeTranslation || ''}
                  onChange={(e) => setActiveTranslation(e.target.value)}
                  dir="auto"
                  className="w-full flex-1 min-h-[320px] p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-sans text-sm leading-relaxed resize-y focus:outline-hidden"
                  placeholder="النص المترجم..."
                />
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="flex-1 flex flex-col">
                <div className="w-full flex-1 min-h-[320px] p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {activeSummary || 'لا يوجد ملخص متاح.'}
                </div>
              </div>
            )}

            {/* Smart AI Actions Toolkit Bar */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  تحسينات الذكاء:
                </span>

                {/* Strip diacritics */}
                <button
                  onClick={() => handleEnhance('diacritics_remove')}
                  disabled={!!enhancingAction}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  إزالة التشكيل
                </button>

                {/* Add full diacritics */}
                <button
                  onClick={() => handleEnhance('diacritics_add')}
                  disabled={!!enhancingAction}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  تشكيل النص كاملاً
                </button>

                {/* Fix grammar/spelling */}
                <button
                  onClick={() => handleEnhance('fix_grammar')}
                  disabled={!!enhancingAction}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  تدقيق إملائي ونحوي
                </button>

                {/* Summarize on demand */}
                {!activeSummary && (
                  <button
                    onClick={() => handleEnhance('summarize')}
                    disabled={!!enhancingAction}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    تلخيص المحتوى
                  </button>
                )}

                {/* Translate to English on demand if not already */}
                {!activeTranslation && (
                  <button
                    onClick={() => handleEnhance('translate', 'en')}
                    disabled={!!enhancingAction}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    ترجمة إلى الإنجليزية
                  </button>
                )}
              </div>

              {enhancingAction && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري تطبيق التحسين الذكي...</span>
                </div>
              )}

            </div>

            {/* Ask AI about this document */}
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl">
              <form onSubmit={handleAskQuestion} className="flex gap-2">
                <input
                  type="text"
                  placeholder="اسأل سؤالاً حول النص المستخرج (مثال: ما هو التاريخ المذكور؟ كم الإجمالي؟)..."
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  className="flex-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={isAskingQuestion || !questionInput.trim()}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  {isAskingQuestion ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  <span>اسأل</span>
                </button>
              </form>

              {questionAnswer && (
                <div className="mt-2.5 p-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  <span className="font-bold block mb-1">إجابة الذكاء الاصطناعي:</span>
                  {questionAnswer}
                </div>
              )}
            </div>

          </div>

          {/* Export Actions Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              خيارات التصدير والحفظ:
            </span>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
              
              {/* Direct Share PDF Button (Without Downloading) */}
              <button
                onClick={handleDirectSharePdf}
                disabled={isDirectSharingPdf}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                title="وضع النص في ملف PDF ومشاركته فوراً بدون تحميل مسبق"
              >
                {isDirectSharingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{isDirectSharingPdf ? 'جاري التجهيز...' : 'مشاركة PDF'}</span>
              </button>

              {/* Copy PDF File Directly Button */}
              <button
                onClick={handleDirectCopyPdf}
                disabled={isDirectCopyingPdf}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  copiedPdfDirect
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-2xs'
                }`}
                title="نسخ ملف الـ PDF ورابطه المباشر إلى الحافظة للصقه فوراً في أي مكان (Ctrl+V)"
              >
                {isDirectCopyingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : copiedPdfDirect ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span>{isDirectCopyingPdf ? 'جاري النسخ...' : copiedPdfDirect ? 'تم النسخ!' : 'نسخ ملف الـ PDF'}</span>
              </button>

              {/* Export to Clean White Page PDF (Optional) */}
              <button
                onClick={() => setIsWhitePdfModalOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-900/60 shadow-2xs transition-colors cursor-pointer"
                title="تخصيص شكل ولون الصفحة وتصديرها كـ PDF"
              >
                <FileDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>تخصيص PDF</span>
              </button>

              {/* Convert Original Image to PDF */}
              {!isTextDoc && onOpenImageToPdf && (
                <button
                  onClick={onOpenImageToPdf}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                  title="تحويل الصورة الأصلية مباشرة إلى ملف PDF مع خيارات التنسيق والمشاركة"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>الصورة لـ PDF</span>
                </button>
              )}

              {/* Download TXT */}
              <button
                onClick={() => downloadTextFile(editableText, 'النص_المستخرج.txt')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>ملف نصي (.txt)</span>
              </button>

              {/* Download Word Document */}
              <button
                onClick={() => downloadDocFile(editableText, 'المستند_المستخرج')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Word (.doc)</span>
              </button>

              {/* Download Markdown */}
              <button
                onClick={() => downloadTextFile(editableText, 'النص_المستخرج.md', 'text/markdown;charset=utf-8')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>ماركداون (.md)</span>
              </button>

              {/* Print Document */}
              <button
                onClick={() => printDocument(editableText)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>طباعة</span>
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Clean White Page PDF Export Modal */}
      <WhitePagePdfModal
        isOpen={isWhitePdfModalOpen}
        onClose={() => setIsWhitePdfModalOpen(false)}
        extractedText={activeTab === 'translation' && activeTranslation ? activeTranslation : editableText}
        imageThumbnail={imageSrc}
      />

      {/* Standalone Direct Share PDF Modal */}
      {directShareData && (
        <SharePdfModal
          isOpen={true}
          onClose={() => setDirectShareData(null)}
          pdfBlob={directShareData.blob}
          fileName={directShareData.fileName}
          shareUrl={directShareData.shareUrl}
          downloadUrl={directShareData.downloadUrl}
          title={directShareData.title}
        />
      )}

    </div>
  );
};

