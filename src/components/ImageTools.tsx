import React from 'react';
import { RotateCw, RotateCcw, Sliders, Eye, RefreshCw, ZoomIn, FileDown } from 'lucide-react';

interface ImageToolsProps {
  rotation: number;
  onRotateClockwise: () => void;
  onRotateCounterClockwise: () => void;
  contrastFilter: 'normal' | 'high_contrast' | 'grayscale' | 'invert';
  onChangeFilter: (filter: 'normal' | 'high_contrast' | 'grayscale' | 'invert') => void;
  onResetAdjustments: () => void;
  onTriggerZoom: () => void;
  onConvertToPdf: () => void;
  imageFileName?: string;
  imageDimensions?: { width: number; height: number };
}

export const ImageTools: React.FC<ImageToolsProps> = ({
  rotation,
  onRotateClockwise,
  onRotateCounterClockwise,
  contrastFilter,
  onChangeFilter,
  onResetAdjustments,
  onTriggerZoom,
  onConvertToPdf,
  imageFileName,
  imageDimensions,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
      
      {/* File Info */}
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 min-w-0">
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-[200px]">
          {imageFileName || 'صورة محددة'}
        </span>
        {imageDimensions && (
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 shrink-0 font-mono">
            {imageDimensions.width} × {imageDimensions.height} px
          </span>
        )}
      </div>

      {/* Adjustment Tools */}
      <div className="flex items-center gap-1.5 flex-wrap">
        
        {/* Rotate Left */}
        <button
          onClick={onRotateCounterClockwise}
          className="p-1.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
          title="تدوير لليسار 90°"
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden md:inline">تدوير 90°</span>
        </button>

        {/* Rotate Right */}
        <button
          onClick={onRotateClockwise}
          className="p-1.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
          title="تدوير لليمين 90°"
        >
          <RotateCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </button>

        {/* Filter Presets for enhancing readability */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
          <button
            onClick={() => onChangeFilter('normal')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              contrastFilter === 'normal'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="الألوان الأصلية"
          >
            طبيعي
          </button>
          <button
            onClick={() => onChangeFilter('high_contrast')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              contrastFilter === 'high_contrast'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="تباين عالي لتوضيح الخطوط الباهتة"
          >
            تباين عالي
          </button>
          <button
            onClick={() => onChangeFilter('grayscale')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              contrastFilter === 'grayscale'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="أبيض وأسود"
          >
            رمادي
          </button>
        </div>

        {/* Zoom inspection */}
        <button
          onClick={onTriggerZoom}
          className="p-1.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          title="تكبير ومعاينة الصورة كاملة"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        {/* Convert Image to PDF Button */}
        <button
          onClick={onConvertToPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          title="تحويل هذه الصورة مباشرة إلى ملف PDF عالي الدقة بدون انتظار"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>تحويل الصورة إلى PDF</span>
        </button>

        {/* Reset */}
        {(rotation !== 0 || contrastFilter !== 'normal') && (
          <button
            onClick={onResetAdjustments}
            className="text-[11px] text-rose-500 hover:text-rose-600 underline font-medium px-1 cursor-pointer"
          >
            إعادة ضبط
          </button>
        )}

      </div>

    </div>
  );
};
