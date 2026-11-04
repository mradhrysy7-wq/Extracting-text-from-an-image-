import React, { useState } from 'react';
import { 
  X, 
  FileDown, 
  Printer, 
  Sliders, 
  Eye, 
  Type, 
  AlignRight, 
  AlignCenter, 
  AlignJustify, 
  Calendar, 
  Image as ImageIcon,
  Check,
  FileText
} from 'lucide-react';
import { exportWhitePagePdf, WhitePagePdfOptions } from '../utils/textExport';

interface WhitePagePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedText: string;
  imageThumbnail?: string | null;
}

export const WhitePagePdfModal: React.FC<WhitePagePdfModalProps> = ({
  isOpen,
  onClose,
  extractedText,
  imageThumbnail,
}) => {
  const [docTitle, setDocTitle] = useState('المستند المستخرج');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [lineHeight, setLineHeight] = useState<'compact' | 'normal' | 'relaxed'>('normal');
  const [alignment, setAlignment] = useState<'right' | 'center' | 'justify'>('right');
  const [includeDate, setIncludeDate] = useState(true);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includeImageThumbnail, setIncludeImageThumbnail] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportPdf = () => {
    setIsExporting(true);
    const options: WhitePagePdfOptions = {
      title: docTitle.trim() || undefined,
      text: extractedText,
      fontSize,
      lineHeight,
      alignment,
      includeDate,
      includeHeader,
      imageThumbnail: includeImageThumbnail && imageThumbnail ? imageThumbnail : null,
    };

    exportWhitePagePdf(options);
    setTimeout(() => {
      setIsExporting(false);
    }, 1500);
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small':
        return 'text-xs sm:text-sm';
      case 'large':
        return 'text-base sm:text-lg';
      case 'medium':
      default:
        return 'text-sm sm:text-base';
    }
  };

  const getLineHeightClass = () => {
    switch (lineHeight) {
      case 'compact':
        return 'leading-relaxed';
      case 'relaxed':
        return 'leading-loose';
      case 'normal':
      default:
        return 'leading-normal sm:leading-relaxed';
    }
  };

  const getAlignmentClass = () => {
    switch (alignment) {
      case 'center':
        return 'text-center';
      case 'justify':
        return 'text-justify';
      case 'right':
      default:
        return 'text-right';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <span>تصدير في صفحة بيضاء بتنسيق PDF</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  A4 جاهز للحفظ والطباعة
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                خصص شكل الصفحة البيضاء، وحجم الخط، والترويسة ثم احفظ المستند كملف PDF رقمي نقي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Body: Split Controls & Live A4 White Page Preview */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 bg-slate-950/60">
          
          {/* Left / Settings Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Document Title */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-emerald-400" />
                <span>عنوان المستند (اختياري):</span>
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="أدخل عنواناً للصفحة (أو اتركه فارغاً)..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Typography & Spacing */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>تخصيص الخط والفقرات:</span>
              </label>

              {/* Font Size */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">حجم الخط:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFontSize('small')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      fontSize === 'small' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    صغير
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('medium')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      fontSize === 'medium' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    متوسط
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize('large')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      fontSize === 'large' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    كبير
                  </button>
                </div>
              </div>

              {/* Line Spacing */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">تباعد الأسطر:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setLineHeight('compact')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      lineHeight === 'compact' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    مضغوط
                  </button>
                  <button
                    type="button"
                    onClick={() => setLineHeight('normal')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      lineHeight === 'normal' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    عادي
                  </button>
                  <button
                    type="button"
                    onClick={() => setLineHeight('relaxed')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      lineHeight === 'relaxed' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    مريح
                  </button>
                </div>
              </div>

              {/* Text Alignment */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-1.5">محاذاة النص:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAlignment('right')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                      alignment === 'right' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                    <span>يمين</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlignment('center')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                      alignment === 'center' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                    <span>وسط</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlignment('justify')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                      alignment === 'justify' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                    <span>ضبط</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Optional Header Elements */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <span className="font-bold block text-slate-200">عناصر الصفحة البيضاء:</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>إظهار ترويسة الصفحة وخط الفصل</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDate}
                  onChange={(e) => setIncludeDate(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>إظهار تاريخ الاستخراج اليوم</span>
              </label>

              {imageThumbnail && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeImageThumbnail}
                    onChange={(e) => setIncludeImageThumbnail(e.target.checked)}
                    className="rounded text-emerald-600"
                  />
                  <span>إرفاق صورة مصغرة للمستند الأصلي</span>
                </label>
              )}
            </div>

            {/* Main Action Export Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? 'جاري تجهيز ملف PDF...' : 'حفظ وتحميل بصيغة PDF'}</span>
            </button>

          </div>

          {/* Right / Live White A4 Sheet Preview Column (8 cols) */}
          <div className="lg:col-span-8 flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-1">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>معاينة حية للصفحة البيضاء A4:</span>
              </span>
              <span>مقاس قياسي (210 × 297 مم)</span>
            </div>

            {/* The Realistic White A4 Sheet */}
            <div className="w-full max-w-[620px] bg-white text-slate-900 rounded-lg shadow-2xl p-8 sm:p-12 min-h-[640px] flex flex-col justify-between border border-slate-300 relative transition-all">
              
              <div>
                {/* Header Section */}
                {includeHeader && (
                  <div className="border-b-2 border-emerald-700 pb-3 mb-6 flex items-end justify-between">
                    <div>
                      {docTitle && (
                        <h2 className="text-xl sm:text-2xl font-black text-emerald-800 m-0 leading-tight">
                          {docTitle}
                        </h2>
                      )}
                      {includeDate && (
                        <div className="text-[11px] text-slate-500 font-sans mt-1">
                          تاريخ الاستخراج: {new Date().toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-bold text-emerald-800 font-sans">
                      بصيرة OCR
                    </div>
                  </div>
                )}

                {/* Optional Image Thumbnail Preview */}
                {includeImageThumbnail && imageThumbnail && (
                  <div className="mb-4 text-center">
                    <img
                      src={imageThumbnail}
                      alt="Thumbnail"
                      className="max-h-28 mx-auto object-contain rounded border border-slate-200"
                    />
                  </div>
                )}

                {/* Extracted Text Content on Pure White Background */}
                <div className={`text-slate-800 whitespace-pre-wrap ${getFontSizeClass()} ${getLineHeightClass()} ${getAlignmentClass()}`}>
                  {extractedText || 'لا يوجد نص مستخرج للعرض.'}
                </div>
              </div>

              {/* Footer Section */}
              <div className="mt-12 pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-sans">
                <span>مستند نصي رقمي مستخرج بالذكاء الاصطناعي</span>
                <span>صفحة 1 من 1</span>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>يتم إنشاء ملف PDF عالي الدقة (Vector PDF) مع دعم كامل للخط العربي وعلامات التشكيل.</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              onClick={handleExportPdf}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة / حفظ PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
