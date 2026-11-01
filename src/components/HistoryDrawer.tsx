import React from 'react';
import { X, Trash2, Clock, FileText, ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import { ExtractionHistoryItem } from '../types/ocr';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: ExtractionHistoryItem[];
  onSelect: (item: ExtractionHistoryItem) => void;
  onClear: () => void;
  onDeleteItem: (id: string, e: React.MouseEvent) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  onDeleteItem,
}) => {
  if (!isOpen) return null;

  const modeLabels: Record<string, string> = {
    raw: 'نص عادي',
    formatted: 'مستند منسق',
    table: 'جدول بيانات',
    receipt: 'فاتورة / إيصال',
    business_card: 'بطاقة عمل',
    handwriting: 'خط يد',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">سجل العمليات السابقة</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={onClear}
                className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors text-xs flex items-center gap-1"
                title="مسح السجل بالكامل"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">مسح الكل</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List of items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
              <FileText className="w-12 h-12 mb-3 stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">لا توجد عمليات سابقة بعد</p>
              <p className="text-xs max-w-xs">
                عند استخراج النص من أي صورة، ستُحفظ النتيجة هنا للرجوع إليها لاحقاً بكل سهولة.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group relative p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all cursor-pointer flex gap-3 items-start"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 relative">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 left-0 bg-black/60 text-[9px] text-white text-center py-0.5 truncate">
                    {modeLabels[item.mode] || 'نص'}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {item.title || 'مستند مستخرج'}
                    </h4>
                    <button
                      onClick={(e) => onDeleteItem(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                      title="حذف هذا العنصر"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2 font-mono">
                    {item.result?.extractedText || 'لا يوجد نص'}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleDateString('ar-SA')}
                    </span>
                    <span>•</span>
                    <span>{item.result?.wordCount || 0} كلمة</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center text-xs text-slate-500 dark:text-slate-400">
          يتم تخزين السجل محلياً في متصفحك لضمان الخصوصية
        </div>

      </div>
    </div>
  );
};
