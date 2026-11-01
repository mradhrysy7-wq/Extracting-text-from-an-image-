export type OcrMode = 'raw' | 'formatted' | 'table' | 'receipt' | 'business_card' | 'handwriting';

export interface OcrResultData {
  extractedText: string;
  confidence?: number;
  detectedLanguages?: string[];
  wordCount?: number;
  charCount?: number;
  lineCount?: number;
  modeSpecificData?: any;
  summary?: string | null;
  translation?: string | null;
  notes?: string | null;
  durationSeconds?: number;
}

export interface ExtractionHistoryItem {
  id: string;
  timestamp: number;
  title: string;
  thumbnail: string;
  mode: OcrMode;
  result: OcrResultData;
}

export interface OcrOptions {
  mode: OcrMode;
  preserveDiacritics: boolean;
  cleanFormatting: boolean;
  translateTo: string; // 'none' or language code
  summarize: boolean;
}
