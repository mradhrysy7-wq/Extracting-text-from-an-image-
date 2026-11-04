import React, { useState } from 'react';
import {
  X,
  Share2,
  Send,
  Link2,
  Check,
  Copy,
  ExternalLink,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { copyToClipboard, copyPdfToClipboard } from '../utils/textExport';

interface SharePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  fileName: string;
  shareUrl?: string;
  downloadUrl?: string;
  title: string;
  isGenerating?: boolean;
}

export const SharePdfModal: React.FC<SharePdfModalProps> = ({
  isOpen,
  onClose,
  pdfBlob,
  fileName,
  shareUrl,
  downloadUrl,
  title,
  isGenerating = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);
  const [isSharingNative, setIsSharingNative] = useState(false);

  if (!isOpen) return null;

  const handleCopyFile = async () => {
    if (!pdfBlob) return;
    const result = await copyPdfToClipboard(pdfBlob, title, shareUrl || downloadUrl);
    if (result.success) {
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 3000);
    }
  };

  const handleCopyLink = async () => {
    const urlToCopy = shareUrl || downloadUrl || window.location.href;
    const ok = await copyToClipboard(urlToCopy);
    if (ok) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (!pdfBlob) return;
    setIsSharingNative(true);
    try {
      const file = new File([pdfBlob], fileName || 'document.pdf', { type: 'application/pdf' });
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title || 'مستند PDF مستخرج',
          text: `مستند مستخرج عبر تطبيق بصيرة OCR: ${title}`,
        });
      } else if (typeof navigator !== 'undefined' && navigator.share && shareUrl) {
        await navigator.share({
          title: title || 'مستند PDF مستخرج',
          url: shareUrl,
          text: `مستند مستخرج عبر تطبيق بصيرة OCR: ${title}`,
        });
      } else {
        // Fallback to copying link
        handleCopyLink();
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.warn('Share error:', e);
      }
    } finally {
      setIsSharingNative(false);
    }
  };

  const effectiveShareUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `📄 *${title || 'مستند PDF'}*\nتفضل برؤية ملف الـ PDF كاملاً هنا:\n${effectiveShareUrl}`
  )}`;

  const emailUrl = `mailto:?subject=${encodeURIComponent(title || 'مستند PDF مستخرج')}&body=${encodeURIComponent(
    `مرحباً،\n\nأشاركك هذا المستند المستخرج بصيغة PDF:\n${effectiveShareUrl}\n\nتم الاستخراج بواسطة بصيرة OCR.`
  )}`;

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>مشاركة ملف PDF مباشرة</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  بدون تحميل
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أرسل الملف مباشرة لأي شخص أو تطبيق دون الحاجة لحفظه في جهازك أولاً
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

        {/* Content Body */}
        <div className="p-6 space-y-5">

          {/* Loading Indicator while rendering PDF */}
          {isGenerating && (
            <div className="p-6 text-center space-y-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                جاري توليد ملف الـ PDF وتجهيز رابط المشاركة الفوري...
              </p>
            </div>
          )}

          {!isGenerating && (
            <>
              {/* Document Overview Pill */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {title || 'مستند PDF مستخرج'}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    {fileName}
                  </p>
                </div>
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    title="فتح ومعاينة الـ PDF"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              {/* Primary Dual Action: Copy PDF File + Native Share */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* 1. Copy PDF File Button */}
                <button
                  type="button"
                  onClick={handleCopyFile}
                  disabled={!pdfBlob}
                  className={`py-3.5 px-4 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 ${
                    copiedFile
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                      : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-700 shadow-slate-900/20'
                  }`}
                  title="نسخ ملف الـ PDF إلى الحافظة للصقه مباشرة في أي مكان"
                >
                  {copiedFile ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-emerald-400" />}
                  <span>{copiedFile ? 'تم نسخ ملف الـ PDF!' : 'نسخ ملف الـ PDF للحافظة'}</span>
                </button>

                {/* 2. Native Share Button */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  disabled={isSharingNative || !pdfBlob}
                  className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSharingNative ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                  <span>مشاركة عبر التطبيقات</span>
                </button>

              </div>

              {copiedFile && (
                <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-center text-xs font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                  ✓ تم نسخ ملف الـ PDF ورابطه بنجاح! يمكنك الآن لصقه مباشرة (Ctrl+V) في واتساب أو أي محادثة.
                </div>
              )}

              {/* Direct Channels Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                
                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال عبر واتساب</span>
                </a>

                {/* Email */}
                <a
                  href={emailUrl}
                  className="py-2.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>إرسال عبر الإيميل</span>
                </a>

              </div>

              {/* Shareable Link Box */}
              {shareUrl && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Link2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>رابط المعاينة والمشاركة المباشر (جاهز للإرسال):</span>
                  </label>
                  <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 text-xs bg-transparent text-slate-700 dark:text-slate-300 px-2 py-1 outline-hidden font-mono truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Optional Download for Convenience */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="text-[11px]">أو إذا كنت تفضل حفظ الملف في جهازك:</span>
                <button
                  onClick={handleDownload}
                  disabled={!pdfBlob}
                  className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل كملف</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
