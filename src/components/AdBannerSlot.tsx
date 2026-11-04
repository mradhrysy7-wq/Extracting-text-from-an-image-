import React, { useEffect } from 'react';

interface AdBannerSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'responsive';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({
  slotId = 'default_slot',
  format = 'responsive',
  className = '',
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      // Handled silently
    }
  }, []);

  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center ${className}`}>
      
      {/* Official AdSense Demarcation Label */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1 px-2 select-none">
        <span>إعلان • Advertisement</span>
        <span>Google AdSense Partner</span>
      </div>

      {/* Ad Container Box */}
      <div className="w-full max-w-4xl min-h-[90px] sm:min-h-[100px] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 flex flex-col items-center justify-center p-2 text-center overflow-hidden transition-all">
        {/* Real Google AdSense Tag */}
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-6038377293496140"
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />

        {/* Informational Subtext */}
        <div className="text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-1 py-1">
          <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
            مساحة إعلانية معتمدة من Google AdSense
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            ca-pub-6038377293496140
          </span>
        </div>
      </div>

    </div>
  );
};

