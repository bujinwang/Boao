import { OCRResult } from '../ocr/models/OCRTypes';
import { PatientData } from '../extraction/models/PatientData';
import { EncounterData } from '../extraction/models/EncounterData';

export type RootStackParamList = {
  Dashboard: {
    savedEncounter?: EncounterData;
    savedPatient?: PatientData;
  };
  ImageCapture: {
    onPhotoTaken: (base64: string, uri: string) => void;
  };
  ImageImport: undefined;
  Processing: {
    images: Array<{
      base64: string;
      uri: string;
    }>;
  };
  DataReview: {
    originalImage?: string;
    imageUri?: string;
    encounterData?: EncounterData;
    batchImages?: Array<{
      base64: string;
      uri: string;
    }>;
    currentBatchIndex?: number;
    ocrResults?: OCRResult[][];
    patientData?: PatientData;
    billingCodeSuggestions?: Array<{
      code: {
        code: string;
        description: string;
        fee: number;
      };
      confidence: number;
      reasoning: string;
    }>;
  };
  EncounterDetails: {
    encounterId: string;
  };
};

export type TabParamList = {
  HomeTab: undefined;
  StatementsTab: undefined;
  SettingsTab: undefined;
};

export type RootParamList = {
  MainTabs: undefined;
}; 