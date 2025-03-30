export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface OCRProcessingOptions {
  maxResults?: number;
  languageHints?: string[];
  detectHandwriting?: boolean;
}

export interface OCRProcessingResult {
  results: OCRResult[];
  processingTime: number;
  error?: string;
} 