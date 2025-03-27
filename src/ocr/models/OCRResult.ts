export interface OCRResult {
  imageId: string;
  timestamp: Date;
  rawText: string;
  confidence: number;
  sections: {
    patientInfo: {
      text: string;
      boundingBox: { x: number; y: number; width: number; height: number };
    };
    encounterInfo: {
      text: string;
      boundingBox: { x: number; y: number; width: number; height: number };
    };
    clinicalInfo: {
      text: string;
      boundingBox: { x: number; y: number; width: number; height: number };
    };
  };
}