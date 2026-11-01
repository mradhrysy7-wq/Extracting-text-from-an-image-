import React, { useState } from 'react';
import { X, Shield, FileText, Info, Mail, CheckCircle2, Lock, HelpCircle } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'about' | 'contact' | null;

interface LegalModalsProps {
  activeModal: LegalModalType;
  onClose: () => void;
}

export const LegalModals: React.FC<LegalModalsProps> = ({ activeModal, onClose }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  if (!activeModal) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail.trim() || !contactMessage.trim()) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            {activeModal === 'privacy' && <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            {activeModal === 'terms' && <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            {activeModal === 'about' && <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            {activeModal === 'contact' && <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {activeModal === 'privacy' && 'سياسة الخصوصية وملفات تعريف الارتباط (Privacy Policy)'}
              {activeModal === 'terms' && 'شروط الخدمة والاستخدام (Terms of Service)'}
              {activeModal === 'about' && 'عن المنصة ورسالتنا (About Us)'}
              {activeModal === 'contact' && 'اتصل بنا وفريق الدعم (Contact Us)'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          
          {/* 1. Privacy Policy (Strictly compliant with Google AdSense, GDPR, CCPA) */}
          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs">
                آخر تحديث: <strong>نوفمبر 2026</strong>. تلتزم منصة "بصيرة" بأعلى معايير الشفافية وحماية خصوصية الزوار والامتثال التام لسياسات برنامج <strong>Google AdSense</strong> ولوائح حماية البيانات العامة (GDPR).
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">1. خصوصية الصور والبيانات المعالجة</h4>
                <p>
                  نحن ندرك حساسية المستندات والصور التي تقوم برفعها. تتم معالجة الصور واستخراج النصوص منها بشكل فوري ومشفر، <strong>ولا نقوم بتخزين صورك أو بيعها أو مشاركتها مع أي جهة خارجية أو استخدامها في تدريب نماذج عامة</strong>. يتم حذف البيانات المؤقتة فور انتهاء جلسة الاستخراج، ويظل سجلك الشخصي مخزناً داخل متصفحك محلياً (Local Storage) ويمكنك حذفه في أي وقت بنقرة واحدة.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">2. ملفات تعريف الارتباط وإعلانات Google AdSense</h4>
                <p>
                  تستخدم هذه المنصة ملفات تعريف الارتباط (Cookies) لخدمة الإعلانات المقدمة عبر شبكة <strong>Google AdSense</strong> وشركائها الإعلانيين:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-1 text-slate-600 dark:text-slate-400">
                  <li>تستخدم شركة Google بصفتها مورّداً تابعاً لجهة خارجية ملفات تعريف الارتباط لعرض الإعلانات على موقعنا.</li>
                  <li>يساعد استخدام Google لملف تعريف الارتباط <strong>DoubleClick DART</strong> على عرض إعلانات للمستخدمين بناءً على زياراتهم لهذا الموقع ومواقع أخرى على شبكة الإنترنت.</li>
                  <li>يجوز للمستخدمين إلغاء الاشتراك في استخدام ملف تعريف الارتباط DART بزيارة <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 underline font-semibold">سياسة الخصوصية الخاصة بإعلانات Google وشبكة المحتوى</a>.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">3. ملفات السجل ومعلومات التصفح القياسية</h4>
                <p>
                  مثل معظم مواقع الويب، نقوم بجمع معلومات غير شخصية تشمل نوع المتصفح، نظام التشغيل، والصفحات التي تمت زيارتها لتحسين أداء الخوادم وضمان استقرار وسرعة الخدمة لكافة المستخدمين.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">4. حقوق المستخدم (GDPR / CCPA)</h4>
                <p>
                  لك الحق الكامل في طلب الاطلاع على بياناتك أو مسحها أو حظر ملفات تعريف الارتباط التتبعية من خلال إعدادات المتصفح أو عبر لافتة تفضيلات الخصوصية الخاصة بنا.
                </p>
              </div>
            </div>
          )}

          {/* 2. Terms of Service */}
          {activeModal === 'terms' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-slate-700 dark:text-slate-300 text-xs">
                باستخدامك لمنصة "بصيرة"، فإنك توافق على الالتزام بشروط الخدمة التالية وجميع القوانين واللوائح المعمول بها محلياً ودولياً.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">1. شروط الاستخدام المقبول</h4>
                <p>
                  تُقدم الخدمة لأغراض استخراج وقراءة النصوص المشروعة (المستندات، الكتب، الفواتير، بطاقات العمل، والمذكرات). يُحظر استخدام المنصة لمعالجة أي محتوى غير قانوني أو ينتهك حقوق الملكية الفكرية أو يضر بالآخرين.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">2. حقوق الملكية الفكرية</h4>
                <p>
                  تبقى جميع النصوص والمحتويات المستخرجة ملكاً حصرياً للمستخدم الذي قام برفع الصورة. المنصة والتصميم والشيفرات البرمجية والعلامة التجارية "بصيرة" محمية بموجب حقوق النشر.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">3. إخلاء المسؤولية ودقة الاستخراج</h4>
                <p>
                  على الرغم من استخدام أحدث نماذج الذكاء الاصطناعي بدقة تزيد عن 98%، فإن المنصة تُقدم "كما هي" دون ضمانات مطلقة بخلو النصوص من الأخطاء في حالات الصور شديدة الغبش أو الرديئة جداً، ونوصي دائماً بمراجعة النتائج الحساسة.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">4. تعديل الشروط</h4>
                <p>
                  نحتفظ بالحق في تعديل أو تحديث هذه الشروط في أي وقت مع نشر التاريخ المحدث في هذه الصفحة.
                </p>
              </div>
            </div>
          )}

          {/* 3. About Us */}
          {activeModal === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-l from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-1">
                  رؤية منصة "بصيرة": رقمنة المحتوى العربي بذكاء وسرعة
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  انطلقت منصة بصيرة لسد الفجوة في أدوات التعرف الضوئي على الحروف (OCR) التي كانت تعاني تاريخياً من ضعف الدقة في قراءة الخطوط العربية المتشابكة وعلامات التشكيل.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">رسالتنا وقيمنا</h4>
                <p>
                  نعمل على توفير أداة مجانية، فائقة السرعة، وسهلة الاستخدام تمكّن الباحثين، والطلاب، والموظفين، وأصحاب الأعمال من تحويل أطنان الأوراق، والخطابات، والفواتير، والملاحظات المكتوبة يدوياً إلى نصوص رقمية جاهزة للتحرير والتداول في ثوانٍ معدودة.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">⚡ سرعة قياسية</span>
                  معالجة تنتهي خلال 2 إلى 5 ثوانٍ فقط بدلاً من الانتظار الطويل.
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">🔒 خصوصية مطلقة</span>
                  لا نقوم بتخزين ملفاتك على خوادمنا على الإطلاق.
                </div>
              </div>
            </div>
          )}

          {/* 4. Contact Us */}
          {activeModal === 'contact' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                يسعدنا تلقي استفساراتك، وملاحظاتك لتحسين الخدمة، أو الإبلاغ عن أي مشكلة تقنية. نرد عادة خلال 24 ساعة عمل.
              </p>

              {contactSubmitted ? (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-center space-y-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">تم إرسال رسالتك بنجاح!</h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">شكراً لتواصلك معنا، سيقوم فريق الدعم بمراجعة رسالتك والرد عليك قريباً.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الاسم الكريم:</label>
                    <input
                      type="text"
                      required
                      placeholder="أدخل اسمك..."
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني للرد:</label>
                    <input
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص الرسالة أو الاستفسار:</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="اكتب رسالتك أو اقتراحك هنا..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">البريد المباشر: support@baseera-ocr.com</span>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      إرسال الرسالة
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
};
