import { ImageSource } from '../../core/models/ImageSource';
import { OCRService } from '../../ocr/services/OCRService';
import { DataExtractionService } from '../../extraction/services/DataExtractionService';
import { BillingCodeService } from '../../billing/services/BillingCodeService';
import { PatientData } from '../../extraction/models/PatientData';
import { EncounterData } from '../../extraction/models/EncounterData';

interface ProcessingResult {
  patientData: PatientData;
  encounterData: EncounterData;
  billingCodeSuggestions: Array<{
    code: {
      code: string;
      description: string;
      fee: number;
    };
    confidence: number;
    reasoning: string;
  }>;
}

export class ProcessingPipeline {
  private static instance: ProcessingPipeline;
  private ocrService: OCRService;
  private extractionService: DataExtractionService;
  private billingService: BillingCodeService;
  
  private constructor() {
    this.ocrService = OCRService.getInstance();
    this.extractionService = DataExtractionService.getInstance();
    this.billingService = BillingCodeService.getInstance();
  }
  
  public static getInstance(): ProcessingPipeline {
    if (!ProcessingPipeline.instance) {
      ProcessingPipeline.instance = new ProcessingPipeline();
    }
    return ProcessingPipeline.instance;
  }
  
  public async process(imageSource: ImageSource): Promise<ProcessingResult> {
    // 1. Perform OCR on the image
    const ocrResult = await this.ocrService.processImage(imageSource);
    
    // 2. Extract structured data from OCR result
    const patientData = await this.extractionService.extractPatientData(ocrResult);
    const encounterData = await this.extractionService.extractEncounterData(ocrResult);
    
    // 3. Generate billing code suggestions
    const billingCodeSuggestions = await this.billingService.suggestCodes(ocrResult, patientData, encounterData);
    
    return {
      patientData,
      encounterData,
      billingCodeSuggestions
    };
  }
}