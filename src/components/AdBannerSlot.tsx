import React from 'react';

interface AdBannerSlotProps {
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'responsive';
  className?: string;
}

export const AdBannerSlot: React.FC<AdBannerSlotProps> = ({
  slotId = 'default_slot',
  format = 'responsive',
  className = '',
}) => {
  return (
    <div className={`w-full my-6 flex flex-col items-center justify-center ${className}`}>
      
      {/* Official AdSense Demarcation Label */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1 px-2 select-none">
        <span>إعلان • Advertisement</span>
        <span>Google AdSense Partner</span>
      </div>

      {/* Ad Container Box */}
      <div className="w-full max-w-4xl min-h-[90px] sm:min-h-[100px] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/40 flex flex-col items-center justify-center p-4 text-center overflow-hidden transition-all">
        <div className="text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-1">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            مساحة إعلانية متوافقة مع معايير Google AdSense (Better Ads Standard)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            [data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"] • [data-ad-slot="{slotId}"]
          </span>
        </div>
      </div>

    </div>
  );
};
