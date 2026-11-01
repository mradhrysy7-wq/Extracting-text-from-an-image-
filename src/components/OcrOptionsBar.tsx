import React from 'react';
import { 
  FileText, 
  FileCode, 
  Table, 
  Receipt, 
  CreditCard, 
  PenTool, 
  Sparkles, 
  Settings2, 
  Languages, 
  Check, 
  ChevronDown 
} from 'lucide-react';
import { OcrMode, OcrOptions } from '../types/ocr';

interface OcrOptionsBarProps {
  options: OcrOptions;
  onChangeOptions: (updated: Partial<OcrOptions>) => void;
  onStartOcr: () => void;
  isProcessing: boolean;
  disabled?: boolean;
}

const MODES: { id: OcrMode; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
  { id: 'raw', label: 'نص شامل ودقيق', icon: FileText, desc: 'استخراج الكلمات والأسطر كما هي بالأصل' },
  { id: 'formatted', label: 'مستند منسق (Markdown)', icon: FileCode, desc: 'عناوين وفقرات وقوائم منظمة' },
  { id: 'handwriting', label: 'خط يدوي وملاحظات', icon: PenTool, desc: 'معالجة الخطوط اليدوية الصعبة' },
  { id: 'table', label: 'جداول وبيانات', icon: Table, desc: 'استخراج الجداول وتحويلها لأعمدة' },
  { id: 'receipt', label: 'فاتورة / إيصال', icon: Receipt, desc: 'تفاصيل الأصناف والضريبة والمجموع' },
  { id: 'business_card', label: 'بطاقة عمل', icon: CreditCard, desc: 'استخراج الاسم والشركة وجهات الاتصال' },
];

const LANGUAGES = [
  { code: 'none', label: 'بدون ترجمة' },
  { code: 'en', label: 'الإنجليزية (English)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'fr', label: 'الفرنسية (Français)' },
  { code: 'tr', label: 'التركية (Türkçe)' },
  { code: 'de', label: 'الألمانية (Deutsch)' },
  { code: 'es', label: 'الإسبانية (Español)' },
  { code: 'ur', label: 'الأردية (Urdu)' },
];

export const OcrOptionsBar: React.FC<OcrOptionsBarProps> = ({
  options,
  onChangeOptions,
  onStartOcr,
  isProcessing,
  disabled,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
      
      {/* Title & Mode Selector */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Settings2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>اختر نوع المستند لضبط محرك الذكاء الاصطناعي:</span>
          </label>
        </div>

        {/* Mode Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = options.mode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChangeOptions({ mode: mode.id })}
                className={`relative flex flex-col items-center text-center p-2.5 rounded-xl border transition-all text-xs ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg mb-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold mb-0.5 leading-snug">{mode.label}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {mode.desc}
                </span>
                {isSelected && (
                  <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Toggles Bar */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Checkbox Options */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Diacritics Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options.preserveDiacritics}
              onChange={(e) => onChangeOptions({ preserveDiacritics: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              الإبقاء على علامات التشكيل والحركات
            </span>
          </label>

          {/* Clean Formatting */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options.cleanFormatting}
              onChange={(e) => onChangeOptions({ cleanFormatting: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              تصحيح المسافات والهيكل تلقائياً
            </span>
          </label>

          {/* Auto Summarize */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={options.summarize}
              onChange={(e) => onChangeOptions({ summarize: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              توليد ملخص تنفيذي للنص
            </span>
          </label>

        </div>

        {/* Translation Option */}
        <div className="flex items-center gap-2">
          <Languages className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-600 dark:text-slate-400 font-medium text-xs">
            ترجمة فورية:
          </span>
          <select
            value={options.translateTo}
            onChange={(e) => onChangeOptions({ translateTo: e.target.value })}
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Trigger Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onStartOcr}
          disabled={disabled || isProcessing}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-md shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isProcessing ? 'جاري الاستخراج والتحليل...' : 'استخراج النص من الصورة الآن'}</span>
        </button>
      </div>

    </div>
  );
};
