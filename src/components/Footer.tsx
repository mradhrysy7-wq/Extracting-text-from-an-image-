import React from 'react';
import { Sparkles, Shield, FileText, Info, Mail, Heart } from 'lucide-react';
import { LegalModalType } from './LegalModals';

interface FooterProps {
  onOpenLegal: (type: LegalModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs transition-colors">
      
      {/* Upper Navigation & Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Col 1: Brand Info */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white">
              بصيرة OCR
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            المنصة الذكية الرائدة لتحويل الصور والمستندات والخط اليدوي إلى نصوص رقمية قابلة للتحرير والترجمة بدقة فائقة.
          </p>
        </div>

        {/* Col 2: Capabilities */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            المميزات والخدمات
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>استخراج نصوص الخط اليدوي العربي</li>
            <li>تحويل الفواتير والإيصالات الضريبية</li>
            <li>قراءة الجداول والبيانات المنظمة</li>
            <li>الحفاظ على التشكيل والحركات</li>
            <li>التصدير إلى Word و TXT وماركداون</li>
          </ul>
        </div>

        {/* Col 3: Compliance & Legal Policies (Crucial for AdSense) */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            السياسات والامتثال (AdSense & Legal)
          </h4>
          <ul className="space-y-1.5 text-xs">
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-emerald-500" />
                <span>سياسة الخصوصية وملفات الكوكيز</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal('terms')}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3 h-3 text-emerald-500" />
                <span>شروط الاستخدام والخدمة</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal('about')}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Info className="w-3 h-3 text-emerald-500" />
                <span>من نحن ورسالة المنصة</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal('contact')}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Mail className="w-3 h-3 text-emerald-500" />
                <span>اتصل بنا وفريق الدعم</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Trust & Data Security */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
            الأمان والخصوصية
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            نلتزم بحماية بياناتك: لا يتم تخزين صورك أو مشاركتها مع أطراف ثالثة، وتتم المعالجة عبر تشفير SSL آمن بالكامل.
          </p>
          <div className="pt-1 text-[11px] text-slate-400">
            متوافق مع سياسات Google AdSense لبرنامج الناشرين.
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100 dark:border-slate-900 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} - منصة بصيرة للذكاء الاصطناعي (Baseera OCR)
          </p>
          <div className="flex items-center gap-3">
            <span>معالجة آمنة ومشفرة</span>
            <span>•</span>
            <span>GDPR & Google AdSense Compliant</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
