import { ImageSource } from '../models/ImageSource';
import { OCRService } from '../../ocr/services/OCRService';
import { DeepSeekExtractionService } from '../../extraction/services/DeepSeekExtractionService';
import { BillingCodeService } from '../../billing/services/BillingCodeService';
import { PatientData } from '../../extraction/models/PatientData';
import { EncounterData } from '../../extraction/models/EncounterData';
import { PatientDataBuilder } from '../../extraction/builders/PatientDataBuilder';
import { EncounterDataBuilder } from '../../extraction/builders/EncounterDataBuilder';
import { OCRResult } from '../../ocr/models/OCRResult';
import { BillingCode, BillingCodeSuggestion } from '../../billing/models/BillingCode';
import { OCRResult as OCRTypes } from '../../ocr/models/OCRTypes';

interface ProcessingResult {
  patientData: PatientData;
  encounterData: EncounterData;
  billingCodeSuggestions: BillingCodeSuggestion[];
}

export class ProcessingPipeline {
  private static instance: ProcessingPipeline;
  private ocrService: OCRService;
  private extractionService: DeepSeekExtractionService;
  private billingService: BillingCodeService;
  
  private constructor() {
    this.ocrService = OCRService.getInstance();
    this.extractionService = DeepSeekExtractionService.getInstance();
    this.billingService = BillingCodeService.getInstance();
  }
  
  public static getInstance(): ProcessingPipeline {
    if (!ProcessingPipeline.instance) {
      ProcessingPipeline.instance = new ProcessingPipeline();
    }
    return ProcessingPipeline.instance;
  }

  public async process(imageSource: ImageSource): Promise<ProcessingResult> {
    try {
      console.log('Starting document processing pipeline...');
      
      // Step 1: OCR Processing
      const ocrResult = await this.ocrService.processImage(imageSource);
      console.log('OCR completed:', ocrResult);
      
      // Step 2: Extract all data in a single API call
      const { patientData, encounterData, billingSuggestions } = await this.extractionService.extractAllData(ocrResult);
      
      return {
        patientData,
        encounterData,
        billingCodeSuggestions: billingSuggestions
      };
    } catch (error) {
      console.error('Error in processing pipeline:', error);
      throw error;
    }
  }

  private combineBillingSuggestions(
    aiSuggestions: Array<{
      code: {
        code: string;
        description: string;
        fee: number;
      };
      confidence: number;
      reasoning: string;
    }>,
    serviceSuggestions: BillingCodeSuggestion[]
  ): BillingCodeSuggestion[] {
    // Create a map to track unique codes
    const uniqueSuggestions = new Map<string, BillingCodeSuggestion>();

    // Add AI suggestions first (they're more context-aware)
    aiSuggestions.forEach(suggestion => {
      uniqueSuggestions.set(suggestion.code.code, {
        code: {
          code: suggestion.code.code,
          description: suggestion.code.description,
          fee: suggestion.code.fee
        },
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning
      });
    });

    // Add service suggestions if they don't exist or have lower confidence
    serviceSuggestions.forEach(suggestion => {
      const existing = uniqueSuggestions.get(suggestion.code.code);
      if (!existing || existing.confidence < suggestion.confidence) {
        uniqueSuggestions.set(suggestion.code.code, suggestion);
      }
    });

    // Convert map to array and sort by confidence
    return Array.from(uniqueSuggestions.values())
      .sort((a, b) => b.confidence - a.confidence);
  }
}