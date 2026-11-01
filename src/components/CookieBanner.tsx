import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X } from 'lucide-react';

interface CookieBannerProps {
  onOpenPrivacy: () => void;
}

const COOKIE_CONSENT_KEY = 'baseera_cookie_consent_v1';

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for smooth entry
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'all_accepted');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-4 sm:p-6 bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md border-t border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Notice Info */}
        <div className="flex items-start gap-3 max-w-3xl">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white mb-1">
              إشعار الخصوصية وملفات تعريف الارتباط (Google AdSense & Cookies)
            </h4>
            <p className="text-slate-300 leading-relaxed text-xs">
              نحن نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح، وتحليل أداء الموقع، وعرض إعلانات ملائمة ومتوافقة مع سياسات <strong>Google AdSense</strong>. يمكنك مراجعة تفاصيل استخدام البيانات في أي وقت عبر{' '}
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-emerald-400 underline font-semibold hover:text-emerald-300 inline"
              >
                سياسة الخصوصية
              </button>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleAcceptEssential}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            الأساسية فقط
          </button>
          
          <button
            onClick={handleAcceptAll}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>قبول ومتابعة</span>
          </button>
        </div>

      </div>
    </div>
  );
};
