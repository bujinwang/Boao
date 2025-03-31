import { NavigatorScreenParams } from '@react-navigation/native';
import { OCRResult } from '../ocr/models/OCRTypes';
import { PatientData } from '../extraction/models/PatientData';
import { EncounterData } from '../extraction/models/EncounterData';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
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

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Billing: undefined;
  OCR: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type BillingStackParamList = {
  BillingList: undefined;
  BillingDetails: { id: string };
  BillingHistory: undefined;
};

export type OCRStackParamList = {
  OCRList: undefined;
  OCRDetails: { id: string };
  OCRHistory: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  StatementsTab: undefined;
  SettingsTab: undefined;
};

export type RootParamList = {
  MainTabs: undefined;
}; 