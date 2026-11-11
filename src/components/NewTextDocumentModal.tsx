import React, { useState } from 'react';
import { 
  X, 
  FileEdit, 
  Clipboard, 
  Type, 
  Sparkles, 
  ArrowLeft, 
  Sliders, 
  Check, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface NewTextDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDocument: (text: string, title: string) => void;
}

export const NewTextDocumentModal: React.FC<NewTextDocumentModalProps> = ({
  isOpen,
  onClose,
  onCreateDocument,
}) => {
  const [docTitle, setDocTitle] = useState('');
  const [textInput, setTextInput] = useState('');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setTextInput(text);
          showNotification('تم لصق النص من الحافظة بنجاح!');
          return;
        }
      }
      showNotification('يرجى استخدام اختصار اللصق (Ctrl + V) داخل المربع.');
    } catch {
      showNotification('اضغط داخل المربع واستخدم (Ctrl + V) للصق النص.');
    }
  };

  const showNotification = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Quick character modification helpers
  const handleQuickCharSwap = (findChar: string, replaceWithChar: string, label: string) => {
    if (!textInput) return;
    const count = (textInput.match(new RegExp(findChar, 'g')) || []).length;
    if (count === 0) {
      showNotification(`لم يتم العثور على أي حرف (${findChar}) في النص.`);
      return;
    }
    const updated = textInput.replaceAll(findChar, replaceWithChar);
    setTextInput(updated);
    showNotification(`تم استبدال (${count}) من حرف [${findChar}] إلى [${replaceWithChar}] بنجاح!`);
  };

  const handleRemoveDiacritics = () => {
    if (!textInput) return;
    // Strip Arabic tashkeel diacritics
    const cleaned = textInput.replace(/[\u064B-\u065F\u0670]/g, '');
    setTextInput(cleaned);
    showNotification('تمت إزالة علامات التشكيل والحركات بالكامل!');
  };

  const handleCleanSpaces = () => {
    if (!textInput) return;
    const cleaned = textInput
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
    setTextInput(cleaned);
    showNotification('تم ضبط وتنسيق المسافات والأسطر الزائدة!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) {
      showNotification('يرجى كتابة أو لصق نص أولاً.');
      return;
    }
    const title = docTitle.trim() || 'مستند نصي';
    onCreateDocument(textInput, title);
    onClose();
  };

  const charCount = textInput.length;
  const wordCount = textInput.trim() ? textInput.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = textInput ? textInput.split('\n').length : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>إنشاء مستند من نص جاهز</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  لصق وتعديل الحروف فورياً
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                الصق أي نص منسوخ من أي مكان (واتساب، مقال، إيميل...) لتعديل حروفه وكلماته وتصديره كـ PDF
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Notification Toast */}
          {copiedNotification && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{copiedNotification}</span>
            </div>
          )}

          {/* Document Title Input */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Type className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>عنوان المستند (اختياري):</span>
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="مثال: مسودة مقال، خطاب رسمي، ملاحظات..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Text Input Area & Paste Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileEdit className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>محتوى النص المراد وضعه في المستند:</span>
              </label>

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 font-bold transition-colors cursor-pointer"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>لصق من الحافظة</span>
              </button>
            </div>

            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="الصق نصك هنا من أي مكان (أو اكتبه مباشرة)، ثم استخدم أدوات تعديل الحروف بالأسفل أو افتحه في محرر المستندات الكامل..."
              dir="auto"
              rows={9}
              className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-sans resize-y"
            />

            {/* Quick Metrics */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-mono">
              <div className="flex items-center gap-3">
                <span>{charCount} حرف</span>
                <span>•</span>
                <span>{wordCount} كلمة</span>
                <span>•</span>
                <span>{lineCount} أسطر</span>
              </div>
              {charCount > 0 && (
                <button
                  type="button"
                  onClick={() => setTextInput('')}
                  className="text-red-500 hover:underline cursor-pointer"
                >
                  مسح النص
                </button>
              )}
            </div>
          </div>

          {/* Quick Character Modification Toolbar */}
          <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2">
            <span className="text-[11px] font-extrabold text-purple-900 dark:text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              أدوات سريعة لتعديل وتبديل الحروف بنقرة واحدة:
            </span>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickCharSwap('ى', 'ي', 'الألف المقصورة إلى ياء')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                title="استبدال حرف ى بحرف ي في جميع الكلمات"
              >
                تبديل ى ➔ ي
              </button>

              <button
                type="button"
                onClick={() => handleQuickCharSwap('ي', 'ى', 'الياء إلى ألف مقصورة')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                title="استبدال حرف ي بحرف ى"
              >
                تبديل ي ➔ ى
              </button>

              <button
                type="button"
                onClick={() => handleQuickCharSwap('ه', 'ة', 'الهاء إلى تاء مربوطة')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                title="استبدال الهاء بتاء مربوطة"
              >
                تبديل ه ➔ ة
              </button>

              <button
                type="button"
                onClick={() => handleQuickCharSwap('ة', 'ه', 'التاء المربوطة إلى هاء')}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                title="استبدال التاء المربوطة بهاء"
              >
                تبديل ة ➔ ه
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!textInput) return;
                  const updated = textInput.replace(/[أإآ]/g, 'ا');
                  setTextInput(updated);
                  showNotification('تم توحيد جميع الهمزات إلى ألف مجردة (ا)!');
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
                title="توحيد الهمزات (أ، إ، آ) إلى ألف عادية (ا)"
              >
                توحيد الهمزات (أ/إ ➔ ا)
              </button>

              <button
                type="button"
                onClick={handleRemoveDiacritics}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
              >
                حذف التشكيل
              </button>

              <button
                type="button"
                onClick={handleCleanSpaces}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-slate-700 dark:text-slate-200 font-medium transition-colors cursor-pointer"
              >
                ضبط المسافات
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={!textInput.trim()}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <FileEdit className="w-4 h-4" />
              <span>فتح المستند وبدء التعديل والتصدير كـ PDF</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
