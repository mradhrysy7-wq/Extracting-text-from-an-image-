import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Zap, Timer } from 'lucide-react';

interface ScanProgressProps {
  imageSrc: string;
  rotation: number;
  contrastFilter: string;
}

const STEPS = [
  'معالجة الصورة وضبط التباين والأبعاد...',
  'تحليل الكلمات والخطوط بدقة...',
  'التعرف السريع على الحروف والتشكيل والأرقام...',
  'تنظيم الهيكل وصياغة النتيجة النهائية...',
];

export const ScanProgress: React.FC<ScanProgressProps> = ({
  imageSrc,
  rotation,
  contrastFilter,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live timer counting tenths of a second
  useEffect(() => {
    const start = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      setElapsedSeconds(parseFloat(elapsed));
    }, 100);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 700);

    return () => {
      clearInterval(timerInterval);
      clearInterval(stepInterval);
    };
  }, []);

  const getFilterStyle = () => {
    switch (contrastFilter) {
      case 'high_contrast':
        return 'contrast(160%) brightness(105%)';
      case 'grayscale':
        return 'grayscale(100%) contrast(120%)';
      default:
        return 'none';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl max-w-2xl mx-auto space-y-6">
      
      {/* Laser Scanning Image Box */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[260px] max-h-[360px] border border-emerald-500/30">
        
        {/* The Image being scanned */}
        <img
          src={imageSrc}
          alt="Scanning"
          style={{
            transform: `rotate(${rotation}deg)`,
            filter: getFilterStyle(),
          }}
          className="max-h-[340px] w-auto object-contain transition-all duration-300 opacity-75"
        />

        {/* Rapid Laser Scanner Line */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-line z-10 pointer-events-none" />

        {/* Grid HUD Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

        {/* Floating status badge with live timer */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-1.5 rounded-xl shadow-lg flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span className="font-semibold">استخراج فائق السرعة...</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-200 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
            <Timer className="w-3 h-3 text-emerald-400" />
            <span>{elapsedSeconds.toFixed(1)} ثانية</span>
          </div>
        </div>

      </div>

      {/* Progress Steps & Speed Badge */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
            <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>معالجة سريعة (خلال ثوانٍ معدودة)</span>
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(95, ((currentStep + 1) / STEPS.length) * 100)}%` }}
          />
        </div>

        {/* Step Text */}
        <p className="text-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 animate-pulse">
          {STEPS[currentStep]}
        </p>
      </div>

    </div>
  );
};
