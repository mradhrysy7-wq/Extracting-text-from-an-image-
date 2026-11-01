import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Cpu, 
  Lightbulb, 
  Zap, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'كيف يعمل استخراج النصوص من الصور في منصة بصيرة؟',
    answer: 'تعتمد بصيرة على أحدث خوارزميات الذكاء الاصطناعي متعدد الوسائط (Multimodal AI). عند رفع صورتك، يقوم المحرك بفحص الترددات وتحديد زوايا الكلمات، ثم التعرف على الحروف العربية واللاتينية بدقة فائقة مع قراءة الحركات والتشكيل وتنسيق الفقرات تلقائياً.',
  },
  {
    question: 'هل الخدمة مجانية بالكامل أم تتطلب اشتراكاً؟',
    answer: 'نعم، الخدمة مجانية بنسبة 100% ولا تتطلب أي تسجيل حساب أو بطاقة ائتمان. يمكنك رفع واستخراج أي عدد من الصور والمستندات يومياً دون قيود.',
  },
  {
    question: 'هل صوري ومستنداتي آمنة ولا يتم تخزينها؟',
    answer: 'أمن بياناتك وخصوصيتك خط أحمر. تتم معالجة الصور بشكل فوري ومشفّر عبر بروتوكولات آمنة (HTTPS/SSL)، ويتم حذف الصورة فور استخراج النص. نحن لا نخزن صورك أو نستخدمها لأي غرض تجاري أو إعلاني وفقاً لسياسة الخصوصية الصارمة.',
  },
  {
    question: 'ما هي دقة التعرف على الخطوط المكتوبة بخط اليد؟',
    answer: 'تتميز بصيرة بدعم مخصص لخطوط اليد (Handwriting OCR) بدقة تتجاوز 95% لمعظم الملاحظات والمخطوطات العربية، حيث يفهم النموذج سياق الجملة لفك رموز الكلمات الغامضة أو الحروف المتشابكة.',
  },
  {
    question: 'هل يمكن استخراج الجداول والفواتير بتنسيق منظم؟',
    answer: 'بالتأكيد! توفر المنصة وضعين متخصصين: وضع الفواتير والإيصالات لاستخراج الأصناف والأسعار وضريبة القيمة المضافة، ووضع الجداول لتحويل البيانات المجدولة إلى جداول رقمية جاهزة للنسخ إلى Excel أو Word.',
  },
  {
    question: 'ما هي صيغ الملفات المدعومة للرفع والتصدير؟',
    answer: 'يدعم الرفع جميع صيغ الصور الشائعة: JPG, PNG, WEBP, SVG, HEIC, والتقاط الصور بكاميرا الهاتف. أما بالنسبة للتصدير فيمكنك حفظ النص كملف Word (.doc)، ملف نصي (.txt)، ماركداون (.md)، أو طباعته مباشرة.',
  },
];

export const AdsenseInfoSections: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-12 my-12 pt-6 border-t border-slate-200 dark:border-slate-800">
      
      {/* 1. How It Works Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            سهولة وسرعة فائقة
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            كيف تستخرج النصوص من الصور في 3 خطوات بسيطة؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            خطوات سريعة لا تتعدى ثوانٍ معدودة لتحويل أي مستند ورقي أو صورة إلى نص رقمي
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 relative overflow-hidden group hover:border-emerald-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center text-lg">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">رفع الصورة أو المستند</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              اسحب وأفلت الصورة، أو التقطها مباشرة بكاميرا هاتفك، أو الصقها من الحافظة (Ctrl+V) بكل سهولة.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 relative overflow-hidden group hover:border-emerald-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-black flex items-center justify-center text-lg">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">المعالجة الذكية الفورية</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              يقوم محرك الذكاء الاصطناعي بقراءة وتدقيق النصوص وتنسيق الفقرات وضبط التشكيل في غضون 2 إلى 5 ثوانٍ فقط.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 relative overflow-hidden group hover:border-emerald-500 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black flex items-center justify-center text-lg">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">التحرير، الترجمة، والتصدير</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              انسخ النص بضغطة زر، أو عدّله في المحرر، أو ترجمه، أو صدّره مباشرة بصيغة Word (.doc) أو TXT جاهزاً للطباعة.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Educational & Technology Value Article */}
      <section className="bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-slate-50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-slate-900 p-6 sm:p-8 rounded-3xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            لماذا يختلف التعرف الضوئي على الحروف (OCR) بالذكاء الاصطناعي عن الأدوات التقليدية؟
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          اعتمدت برامج الـ OCR القديمة لعقود على مطابقة القوالب الصورية (Template Matching)، وهو ما جعلها تفشل بشكل ذريع عند التعامل مع الخط العربي بسبب تشابك الحروف وتعدد أشكال الحرف الواحد (في البداية، الوسط، والنهاية)، بالإضافة إلى الحركات والتشكيل.
        </p>

        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          في المقابل، تستخدم منصة <strong>بصيرة</strong> نماذج لغوية بصرية متطورة تفهم سياق الكلام، مما يمكّنها من قراءة الكلمات المقطوعة، والخطوط اليدوية المائلة، والفواتير الباهتة، مع الحفاظ التام على علامات الترقيم والهيكل المنطقي للوثيقة.
        </p>

        <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-slate-200 dark:border-slate-800">
            <span className="block font-black text-lg text-emerald-600 dark:text-emerald-400">+98%</span>
            <span className="text-[11px] text-slate-500">دقة القراءة والتعرف</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-slate-200 dark:border-slate-800">
            <span className="block font-black text-lg text-emerald-600 dark:text-emerald-400">&lt; 5s</span>
            <span className="text-[11px] text-slate-500">متوسط سرعة الإنجاز</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-slate-200 dark:border-slate-800">
            <span className="block font-black text-lg text-emerald-600 dark:text-emerald-400">100%</span>
            <span className="text-[11px] text-slate-500">أمان وحماية الخصوصية</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-slate-200 dark:border-slate-800">
            <span className="block font-black text-lg text-emerald-600 dark:text-emerald-400">مجاني</span>
            <span className="text-[11px] text-slate-500">لكافة الباحثين والطلاب</span>
          </div>
        </div>
      </section>

      {/* 3. Comprehensive FAQ Section (Schema.org compliant) */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>الأسئلة الشائعة حول الخدمة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            إجابات واضحة على جميع التساؤلات الشائعة حول الدقة، التنسيق، والأمان
          </p>
        </div>

        <div className="space-y-2.5 max-w-3xl mx-auto">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-right flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 shrink-0 text-emerald-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
