import React, { useState } from 'react';
import {
  X,
  FileDown,
  Share2,
  Copy,
  Check,
  Printer,
  Sparkles,
  Loader2,
  FileText,
  Sliders,
  Maximize2
} from 'lucide-react';
import {
  convertImageToPdfBlob,
  downloadBlob,
  sharePdfDirectly,
  copyPdfToClipboard
} from '../utils/textExport';
import { SharePdfModal } from './SharePdfModal';

interface ImageToPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  rotation?: number;
  contrastFilter?: 'normal' | 'high_contrast' | 'grayscale' | 'invert';
  defaultTitle?: string;
}

export const ImageToPdfModal: React.FC<ImageToPdfModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  rotation = 0,
  contrastFilter = 'normal',
  defaultTitle,
}) => {
  const [docTitle, setDocTitle] = useState(
    defaultTitle ? defaultTitle.replace(/\.[^/.]+$/, '') : 'صورة_مستند'
  );
  const [pageSize, setPageSize] = useState<'a4' | 'fit_image' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [margin, setMargin] = useState<'none' | 'small' | 'normal'>('small');
  const [quality, setQuality] = useState<'high' | 'standard' | 'compressed'>('high');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [shareData, setShareData] = useState<{
    blob: Blob;
    fileName: string;
    shareUrl?: string;
    downloadUrl?: string;
    title: string;
  } | null>(null);

  if (!isOpen) return null;

  const getPdfBlob = async (): Promise<Blob> => {
    return await convertImageToPdfBlob({
      imageSrc,
      rotation,
      contrastFilter,
      pageSize,
      orientation,
      margin,
      quality,
      docTitle,
    });
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await getPdfBlob();
      const safeTitle = (docTitle.trim() || 'صورة_مستند').replace(/[\/\\?%*:|"<>]/g, '_');
      downloadBlob(blob, `${safeTitle}.pdf`);
    } catch (err) {
      console.error('Error creating image PDF:', err);
      alert('حدث خطأ أثناء تحويل الصورة إلى PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareDirectly = async () => {
    setIsSharing(true);
    try {
      const blob = await getPdfBlob();
      const safeTitle = (docTitle.trim() || 'صورة_مستند').replace(/[\/\\?%*:|"<>]/g, '_');
      const res = await sharePdfDirectly({
        blob,
        title: safeTitle,
        text: 'مستند PDF تم تحويله من صورة عبر تطبيق بصيرة OCR',
        attemptNativeShare: true,
      });

      setShareData({
        blob: res.blob,
        fileName: res.fileName,
        shareUrl: res.shareUrl,
        downloadUrl: res.downloadUrl,
        title: safeTitle,
      });
    } catch (err) {
      console.error('Error sharing image PDF:', err);
      alert('حدث خطأ أثناء تجهيز رابط المشاركة.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyPdf = async () => {
    setIsCopying(true);
    try {
      const blob = await getPdfBlob();
      const safeTitle = (docTitle.trim() || 'صورة_مستند').replace(/[\/\\?%*:|"<>]/g, '_');
      
      const shareRes = await sharePdfDirectly({
        blob,
        title: safeTitle,
        text: 'مستند PDF محول من صورة',
        attemptNativeShare: false,
      });

      await copyPdfToClipboard(blob, safeTitle, shareRes.shareUrl || shareRes.downloadUrl);
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    } catch (err) {
      console.error('Error copying PDF file:', err);
      alert('تعذر نسخ ملف الـ PDF إلى الحافظة.');
    } finally {
      setIsCopying(false);
    }
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const blob = await getPdfBlob();
      const blobUrl = URL.createObjectURL(blob);
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.top = '-9999px';
      printIframe.style.left = '-9999px';
      printIframe.src = blobUrl;
      document.body.appendChild(printIframe);
      printIframe.onload = () => {
        setTimeout(() => {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(printIframe);
            URL.revokeObjectURL(blobUrl);
          }, 60000);
        }, 300);
      };
    } catch (err) {
      console.error('Error printing PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getFilterStyle = () => {
    switch (contrastFilter) {
      case 'high_contrast':
        return 'contrast(160%) brightness(105%)';
      case 'grayscale':
        return 'grayscale(100%) contrast(120%)';
      case 'invert':
        return 'invert(100%)';
      default:
        return 'none';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
        <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
                <FileDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>تحويل الصورة إلى ملف PDF</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                    JPG / PNG ➔ PDF
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  تحويل الصورة الأصلية مباشرة إلى مستند PDF عالي الدقة مع التخصيص والمشاركة الفورية
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

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left/Center: Visual Page Preview */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[320px]">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-rose-500" />
                معاينة شكل الصفحة داخل ملف الـ PDF:
              </span>

              {/* Simulated Sheet Frame */}
              <div
                className={`relative bg-white shadow-xl transition-all duration-300 flex items-center justify-center overflow-hidden border border-slate-300 ${
                  pageSize === 'fit_image'
                    ? 'rounded-md p-0'
                    : margin === 'none'
                    ? 'p-0'
                    : margin === 'small'
                    ? 'p-2 sm:p-3'
                    : 'p-4 sm:p-6'
                } ${
                  orientation === 'landscape'
                    ? 'w-[280px] sm:w-[360px] h-[198px] sm:h-[254px]'
                    : orientation === 'portrait'
                    ? 'w-[198px] sm:w-[254px] h-[280px] sm:h-[360px]'
                    : 'w-[220px] sm:w-[280px] h-[280px] sm:h-[350px]'
                }`}
                style={{
                  aspectRatio:
                    pageSize === 'fit_image'
                      ? 'auto'
                      : orientation === 'landscape'
                      ? '297/210'
                      : '210/297',
                }}
              >
                <img
                  src={imageSrc}
                  alt="Preview inside PDF"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: getFilterStyle(),
                  }}
                  className="max-h-full max-w-full object-contain shadow-2xs transition-all"
                />

                {/* Page Number & Watermark hint */}
                <div className="absolute bottom-1 right-2 text-[8px] text-slate-400 font-mono select-none">
                  بصيرة OCR
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                <span>الحجم: {pageSize === 'a4' ? 'A4 قياسي' : pageSize === 'fit_image' ? 'ملائمة الصورة (Fit)' : 'Letter'}</span>
                <span>•</span>
                <span>الاتجاه: {orientation === 'auto' ? 'تلقائي' : orientation === 'portrait' ? 'عمودي' : 'أفقي'}</span>
              </div>
            </div>

            {/* Right: Customization Controls */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Document Title Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  اسم ملف الـ PDF:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="اسم الملف..."
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pl-12 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                    .pdf
                  </span>
                </div>
              </div>

              {/* Page Format Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  حجم وشكل الصفحة:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPageSize('a4')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      pageSize === 'a4'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs">A4 قياسي</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                      210 × 297 مم
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageSize('fit_image')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      pageSize === 'fit_image'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs">ملائمة الصورة</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                      بدون هوامش بيضاء
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPageSize('letter')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      pageSize === 'letter'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs">Letter</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">
                      قياس أمريكي
                    </span>
                  </button>
                </div>
              </div>

              {/* Orientation Selector */}
              {pageSize !== 'fit_image' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    اتجاه الصفحة:
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setOrientation('auto')}
                      className={`p-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        orientation === 'auto'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      تلقائي (ذكي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('portrait')}
                      className={`p-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        orientation === 'portrait'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      عمودي (طولي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('landscape')}
                      className={`p-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        orientation === 'landscape'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      أفقي (عرضي)
                    </button>
                  </div>
                </div>
              )}

              {/* Margins */}
              {pageSize !== 'fit_image' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    هوامش الصفحة:
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setMargin('none')}
                      className={`p-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        margin === 'none'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      بدون هوامش (ملء)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMargin('small')}
                      className={`p-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        margin === 'small'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      هوامش صغيرة (6 مم)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMargin('normal')}
                      className={`p-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                        margin === 'normal'
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      هوامش عادية (15 مم)
                    </button>
                  </div>
                </div>
              )}

              {/* Quality Preset */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  جودة الصورة في الـ PDF:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setQuality('high')}
                    className={`p-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                      quality === 'high'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    أعلى جودة (95%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality('standard')}
                    className={`p-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                      quality === 'standard'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    قياسية متوازنة (85%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality('compressed')}
                    className={`p-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                      quality === 'compressed'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    حجم ملف صغير (65%)
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              إلغاء
            </button>

            <div className="flex flex-wrap items-center gap-2">
              
              {/* Copy PDF File */}
              <button
                type="button"
                onClick={handleCopyPdf}
                disabled={isCopying}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  copiedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}
                title="نسخ ملف الـ PDF ورابطه إلى الحافظة"
              >
                {isCopying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : copiedSuccess ? (
                  <Check className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                )}
                <span>{copiedSuccess ? 'تم نسخ الـ PDF!' : 'نسخ ملف الـ PDF'}</span>
              </button>

              {/* Direct Share PDF Without Download */}
              <button
                type="button"
                onClick={handleShareDirectly}
                disabled={isSharing}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-md shadow-teal-600/20 cursor-pointer disabled:opacity-50"
                title="مشاركة الـ PDF فورياً عبر واتساب أو التطبيقات الأخرى"
              >
                {isSharing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>مشاركة مباشرة</span>
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                title="طباعة مستند الـ PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>طباعة</span>
              </button>

              {/* Download PDF (Primary) */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                <span>تحميل ملف PDF الآن</span>
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* Standalone Share PDF Modal */}
      {shareData && (
        <SharePdfModal
          isOpen={true}
          onClose={() => setShareData(null)}
          pdfBlob={shareData.blob}
          fileName={shareData.fileName}
          shareUrl={shareData.shareUrl}
          downloadUrl={shareData.downloadUrl}
          title={shareData.title}
        />
      )}
    </>
  );
};
