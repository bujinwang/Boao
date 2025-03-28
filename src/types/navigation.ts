export type RootStackParamList = {
  Dashboard: undefined;
  ImageCapture: {
    onPhotoTaken: (base64: string) => void;
  };
  DataReview: {
    originalImage?: string;
    imageUri?: string;
    encounterData?: any;
    batchImages?: Array<{
      base64: string;
      uri: string;
    }>;
    currentBatchIndex?: number;
  };
  EncounterDetails: {
    encounterId: string;
  };
  Processing: {
    images: Array<{
      base64: string;
      uri: string;
    }>;
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