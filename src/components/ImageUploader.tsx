import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Camera, Clipboard, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { SAMPLE_IMAGES, SampleImage } from '../data/sampleImages';
import { OcrMode } from '../types/ocr';

interface ImageUploaderProps {
  onImageSelected: (dataUrl: string, fileName?: string, recommendedMode?: OcrMode) => void;
  onOpenCamera: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  onOpenCamera,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler (Ctrl+V / Command+V anywhere on page)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            handleFile(blob, 'صورة منسية_من_الحافظة.png');
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleFile = (file: File, customName?: string) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح (PNG, JPG, WEBP, SVG...)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageSelected(dataUrl, customName || file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteFromClipboardBtn = async () => {
    setPasteError(null);
    try {
      if (!navigator.clipboard || !navigator.clipboard.read) {
        // Fallback info
        setPasteError('اضغط (Ctrl + V) أو (Cmd + V) للصق الصورة مباشرة من الحافظة.');
        return;
      }
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          handleFile(blob as File, 'صورة_الحافظة.png');
          return;
        }
      }
      setPasteError('لم يتم العثور على صورة في الحافظة. انسخ صورة أولاً ثم الصقها.');
    } catch (err) {
      setPasteError('يرجى الضغط على اختصار (Ctrl+V / Cmd+V) للصق الصورة مباشرة.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Main Dropzone Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {/* Center Content */}
        <div className="max-w-md mx-auto space-y-4">
          
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <UploadCloud className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white mb-1">
              اسحب وأفلت الصورة هنا، أو انقر للاختيار
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              يدعم كافة صيغ الصور: PNG, JPG, JPEG, WEBP, SVG, HEIC والمستندات المصورة
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              <span>اختيار من الجهاز</span>
            </button>

            <button
              type="button"
              onClick={onOpenCamera}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>التقاط بالكاميرا</span>
            </button>

            <button
              type="button"
              onClick={handlePasteFromClipboardBtn}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Clipboard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>لصق من الحافظة (Ctrl+V)</span>
            </button>
          </div>

          {pasteError && (
            <p className="text-xs text-amber-600 dark:text-amber-400 animate-in fade-in">
              {pasteError}
            </p>
          )}

        </div>
      </div>

      {/* Instant Ready Samples Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              أو جرّب أحد النماذج الجاهزة فورياً بنقرة واحدة:
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            نماذج اختبارية سريعة
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onImageSelected(sample.dataUrl, sample.title, sample.recommendedMode)}
              className="group text-right p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-900 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Preview */}
                <div className="h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2.5 border border-slate-200/60 dark:border-slate-700/60 relative">
                  <img
                    src={sample.dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-medium backdrop-blur-xs">
                    {sample.category}
                  </span>
                </div>

                <h5 className="font-bold text-xs text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1 line-clamp-1">
                  {sample.title}
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>تجربة النموذج</span>
                <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
