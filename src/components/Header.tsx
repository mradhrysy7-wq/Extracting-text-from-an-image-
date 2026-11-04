import React from 'react';
import { 
  FileText, 
  History, 
  HelpCircle, 
  Moon, 
  Sun, 
  Sparkles,
  Camera,
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenHelp: () => void;
  onReset: () => void;
  hasActiveImage: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  toggleDarkMode,
  onOpenHistory,
  historyCount,
  onOpenHelp,
  onReset,
  hasActiveImage,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-l from-emerald-600 to-teal-800 dark:from-emerald-400 dark:to-teal-200 bg-clip-text text-transparent">
                بصيرة
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                OCR الذكي
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              استخراج وقراءة النصوص من الصور بدقة الذكاء الاصطناعي
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {hasActiveImage && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
              title="بدء عملية جديدة وتفريغ الصورة الحالية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">صورة جديدة</span>
            </button>
          )}

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="سجل الاستخراجات السابقة"
          >
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">السجل</span>
            {historyCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {historyCount > 9 ? '+9' : historyCount}
              </span>
            )}
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="دليل الاستخدام ونصائح الدقة"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer active:scale-95"
            title={isDarkMode ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'التبديل إلى الوضع الليلي (Dark Mode)'}
            aria-label={isDarkMode ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

      </div>
    </header>
  );
};
