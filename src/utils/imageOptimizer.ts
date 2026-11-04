// Client-side image pre-processing for ultra-fast uploads and lightning-speed OCR

export async function optimizeImageForOcr(dataUrl: string, maxDimension = 1400, quality = 0.80): Promise<string> {
  return new Promise((resolve) => {
    // If it's an SVG, it's already tiny vector
    if (dataUrl.startsWith('data:image/svg+xml')) {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // If image is already smaller than maxDimension and lightweight (< 350KB base64), keep it
      if (width <= maxDimension && height <= maxDimension && dataUrl.length < 350_000) {
        return resolve(dataUrl);
      }

      // Calculate proportional scale keeping high-res readability for Arabic letters
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(dataUrl);

      // High quality smoothing for clear text lines and diacritics
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG with optimal compression
      const optimized = canvas.toDataURL('image/jpeg', quality);
      resolve(optimized);
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

