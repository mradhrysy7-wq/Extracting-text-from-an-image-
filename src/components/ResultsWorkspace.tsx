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
  Zap
} from 'lucide-react';
import { OcrResultData, OcrMode } from '../types/ocr';
import {
  copyToClipboard,
  downloadTextFile,
  downloadDocFile,
  printDocument,
  TextSpeechPlayer,
} from '../utils/textExport';

interface ResultsWorkspaceProps {
  imageSrc: string;
  rotation: number;
  contrastFilter: string;
  result: OcrResultData;
  mode: OcrMode;
  onReExtract: () => void;
  onNewImage: () => void;
}

export const ResultsWorkspace: React.FC<ResultsWorkspaceProps> = ({
  imageSrc,
  rotation,
  contrastFilter,
  result,
  mode,
  onReExtract,
  onNewImage,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'structured' | 'translation' | 'summary'>('text');
  const [editableText, setEditableText] = useState(result.extractedText || '');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [viewLayout, setViewLayout] = useState<'split' | 'textOnly'>('split');

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

  const handleSearchReplace = () => {
    if (!searchQuery) return;
    const updated = editableText.replaceAll(searchQuery, replaceQuery);
    setEditableText(updated);
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
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>الدقة المقدرة: {confidence}%</span>
          </div>

          {result.durationSeconds !== undefined && (
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
            title={viewLayout === 'split' ? 'عرض النص فقط' : 'عرض الصورة والنص معاً'}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{viewLayout === 'split' ? 'إخفاء الصورة' : 'مقارنة مع الصورة'}</span>
          </button>

          <button
            onClick={onNewImage}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>صورة جديدة</span>
          </button>
        </div>

      </div>

      {/* Main Dual Workspace */}
      <div className={`grid gap-4 ${viewLayout === 'split' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* Left Column (Image Comparison) */}
        {viewLayout === 'split' && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>الصورة الأصلية المرفوعة</span>
              <span className="text-[11px] text-slate-400">للمقارنة والتحقق</span>
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
        )}

        {/* Right Column (Interactive Results & Editor) */}
        <div className={`${viewLayout === 'split' ? 'lg:col-span-7' : 'col-span-1'} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col overflow-hidden`}>
          
          {/* Workspace Tabs Header */}
          <div className="px-4 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-2">
            
            {/* Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
                  activeTab === 'text'
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>النص المستخرج (قابل للتعديل)</span>
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

          {/* Search & Replace Inline Bar */}
          {showSearch && (
            <div className="p-3 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                placeholder="ابحث عن كلمة أو عبارة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 flex-1 min-w-[140px]"
              />
              <input
                type="text"
                placeholder="استبدال بـ..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 flex-1 min-w-[140px]"
              />
              <button
                onClick={handleSearchReplace}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg"
              >
                استبدال الكل
              </button>
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

            <div className="flex flex-wrap items-center gap-2">
              
              {/* Download TXT */}
              <button
                onClick={() => downloadTextFile(editableText, 'النص_المستخرج.txt')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>ملف نصي (.txt)</span>
              </button>

              {/* Download Word Document */}
              <button
                onClick={() => downloadDocFile(editableText, 'المستند_المستخرج')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>مستند Word (.doc)</span>
              </button>

              {/* Download Markdown */}
              <button
                onClick={() => downloadTextFile(editableText, 'النص_المستخرج.md', 'text/markdown;charset=utf-8')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>ماركداون (.md)</span>
              </button>

              {/* Print Document */}
              <button
                onClick={() => printDocument(editableText)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>طباعة</span>
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
