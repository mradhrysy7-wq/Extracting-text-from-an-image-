import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
      setCameraError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    setIsLoadingCamera(true);
    setCameraError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setCameraError(
        'تعذر الوصول إلى الكاميرا. يرجى التأكد من منح الإذن لاستخدام الكاميرا من إعدادات المتصفح.'
      );
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If front camera, invert horizontally if desired, or keep as is
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(dataUrl);
    }
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">التقاط صورة بكاميرا الجهاز</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative bg-black flex-1 min-h-[360px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <p className="text-white font-medium text-sm mb-4">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : capturedImage ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={capturedImage}
                alt="Captured"
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
              <div className="absolute top-4 right-4 bg-black/60 px-3 py-1.5 rounded-full text-xs text-white backdrop-blur-md">
                معاينة الصورة الملتقطة
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[70vh]"
              />

              {/* Guide Overlay for Document alignment */}
              <div className="absolute inset-8 sm:inset-12 pointer-events-none border-2 border-dashed border-emerald-400/60 rounded-xl flex items-center justify-center">
                <span className="bg-black/60 text-emerald-300 text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  وجّه المستند أو الورقة داخل هذا الإطار
                </span>
              </div>

              {isLoadingCamera && (
                <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-white text-sm gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                  <span>جاري تشغيل الكاميرا...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {!capturedImage ? (
            <>
              <button
                onClick={switchCamera}
                disabled={isLoadingCamera || !!cameraError}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تبديل الكاميرا</span>
              </button>

              <button
                onClick={takePhoto}
                disabled={isLoadingCamera || !!cameraError}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-all disabled:opacity-50"
                title="التقاط"
              >
                <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white" />
                </div>
              </button>

              <button
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                onClick={retakePhoto}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>التقاط مرة أخرى</span>
              </button>
              <button
                onClick={confirmPhoto}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>استخدام هذه الصورة والبدء</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
