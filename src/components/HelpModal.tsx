import React from 'react';
import { X, CheckCircle2, AlertTriangle, Lightbulb, Camera, FileSpreadsheet, FileCheck, Languages } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">دليل الاستخدام وأسرار الدقة العالية</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700 dark:text-slate-300">
          
          {/* Quick Intro */}
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed">
            تطبيق <strong>بصيرة</strong> يعتمد على أحدث نماذج الذكاء الاصطناعي متعدد الوسائط، مما يمكّنه من قراءة النصوص العربية بكافة خطوطها بما في ذلك خطوط اليد الصعبة والمستندات المشكولة بدقة استثنائية.
          </div>

          {/* Tips for high accuracy */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              نصائح للحصول على أعلى دقة استخراج:
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mr-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>الإضاءة الجيدة:</strong> تأكد من وضوح الصورة وتجنب الظلال القوية أو انعكاسات الفلاش على الورق.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>استقامة الزاوية:</strong> استخدم أدوات التدوير (90 درجة) إذا كانت الصورة مقلوبة أو جانبية.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>اختيار النمط المناسب:</strong> اختر نمط "خط اليد" للملاحظات المكتوبة يدوياً، أو "فواتير" للإيصالات للحصول على جداول مهيكلة.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span><strong>اللصق السريع:</strong> يمكنك التقاط لقطة شاشة والضغط على (Ctrl+V / ⌘+V) مباشرة في أي مكان داخل الصفحة!</span>
              </li>
            </ul>
          </div>

          {/* Supported modes */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2.5 text-sm">الأوضاع المتخصصة المدعومة:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">📄 مستند منسق (Markdown)</span>
                يحافظ على العناوين والفقرات والقوائم النقطية بدقة.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">✍️ خط يد ومذكرات</span>
                متخصص في فك الرموز والخطوط اليدوية السريعة.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">🧾 فواتير وإيصالات</span>
                استخراج الأسعار، الأصناف، والضريبة وحساب الإجمالي.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">💳 بطاقات العمل</span>
                استخراج الاسم، الشركة، الهاتف، والإيميل والموقع.
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>تتم معالجة الصور بشكل آمن دون تخزينها على خوادم خارجية، ويتم حفظ سجلك الشخصي محلياً داخل متصفحك فقط.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20"
          >
            فهمت، شكراً لك
          </button>
        </div>

      </div>
    </div>
  );
};
