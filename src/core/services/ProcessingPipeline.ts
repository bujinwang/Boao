import { ImageSource } from '../models/ImageSource';
import { OCRService } from '../../ocr/services/OCRService';
import { DeepSeekExtractionService } from '../../extraction/services/DeepSeekExtractionService';
import { BillingCodeService } from '../../billing/services/BillingCodeService';
import { PatientData } from '../../extraction/models/PatientData';
import { EncounterData } from '../../extraction/models/EncounterData';
import { PatientDataBuilder } from '../../extraction/builders/PatientDataBuilder';
import { EncounterDataBuilder } from '../../extraction/builders/EncounterDataBuilder';
import { OCRResult } from '../../ocr/models/OCRResult';
import { BillingCode, BillingCodeSuggestion as BillingCodeServiceSuggestion } from '../../billing/models/BillingCode';
import { BillingCodeSuggestion } from '../../billing/models/BillingCodeSuggestion';
import { OCRResult as OCRTypes } from '../../ocr/models/OCRTypes';

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
      console.log('Starting OCR processing...');
      // Step 1: OCR Processing
      const serviceOcrResult: OCRResult = await this.ocrService.processImage(imageSource);
      console.log('OCR Results:', {
        hasResults: !!serviceOcrResult,
        rawText: serviceOcrResult.rawText,
        confidence: serviceOcrResult.confidence,
        sections: Object.keys(serviceOcrResult.sections)
      });

      // Convert OCR result to expected format
      const ocrResults: OCRTypes[] = [
        {
          text: serviceOcrResult.sections.patientInfo.text,
          confidence: serviceOcrResult.confidence,
          boundingBox: serviceOcrResult.sections.patientInfo.boundingBox
        },
        {
          text: serviceOcrResult.sections.encounterInfo.text,
          confidence: serviceOcrResult.confidence,
          boundingBox: serviceOcrResult.sections.encounterInfo.boundingBox
        },
        {
          text: serviceOcrResult.sections.clinicalInfo.text,
          confidence: serviceOcrResult.confidence,
          boundingBox: serviceOcrResult.sections.clinicalInfo.boundingBox
        }
      ];

      // Step 2: Data Extraction
      console.log('Starting data extraction...');
      let patientData: PatientData | null = null;
      let encounterData: EncounterData | null = null;
      
      try {
        [patientData, encounterData] = await Promise.all([
          this.extractionService.extractPatientData(serviceOcrResult),
          this.extractionService.extractEncounterData(serviceOcrResult)
        ]);
      } catch (extractionError) {
        console.error('Error during data extraction:', extractionError);
        // Try fallback extraction
        console.log('Attempting fallback extraction...');
        patientData = this.fallbackPatientExtraction(serviceOcrResult);
        encounterData = this.fallbackEncounterExtraction(serviceOcrResult);
      }

      console.log('Extracted Data:', {
        hasPatientData: !!patientData,
        hasEncounterData: !!encounterData,
        patientData: JSON.stringify(patientData),
        encounterData: JSON.stringify(encounterData),
        rawText: serviceOcrResult.rawText,
        sections: Object.keys(serviceOcrResult.sections)
      });

      if (!patientData || !encounterData) {
        throw new Error('Failed to extract patient or encounter data');
      }

      // Step 3: Billing Code Suggestions
      console.log('Generating billing code suggestions...');
      const serviceSuggestions = await this.billingService.suggestBillingCodes(encounterData);
      
      // Convert billing suggestions to expected format
      const billingCodeSuggestions = serviceSuggestions.map(suggestion => ({
        code: {
          code: suggestion.code.code,
          description: suggestion.code.description,
          fee: suggestion.code.fee
        },
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning
      }));

      console.log('Billing Suggestions:', {
        hasSuggestions: !!billingCodeSuggestions,
        suggestionCount: billingCodeSuggestions.length,
        suggestions: billingCodeSuggestions
      });

      return {
        patientData,
        encounterData: {
          ...encounterData,
          ocrResults
        },
        billingCodeSuggestions
      };
    } catch (error) {
      console.error('Error in processing pipeline:', error);
      throw error;
    }
  }

  private fallbackPatientExtraction(ocrResult: OCRResult): PatientData {
    console.log('Using fallback patient extraction');
    const patientBuilder = new PatientDataBuilder();
    const patientInfoText = ocrResult.sections.patientInfo?.text || ocrResult.rawText;
    
    try {
      // Basic regex-based extraction
      const nameMatch = patientInfoText.match(/(?:Patient:|Name:)\s*([^\n]+)/i);
      const dobMatch = patientInfoText.match(/(?:DOB:|Date of Birth:)\s*([^\n]+)/i);
      const genderMatch = patientInfoText.match(/(?:Gender:|Sex:)\s*([^\n]+)/i);
      const idMatch = patientInfoText.match(/(?:ID:|Chart:|MRN:)\s*([^\n]+)/i);
      
      if (nameMatch && nameMatch[1]) {
        patientBuilder.withFullName(nameMatch[1].trim());
      }
      if (dobMatch && dobMatch[1]) {
        patientBuilder.withDateOfBirth(new Date(dobMatch[1].trim()));
      }
      if (genderMatch && genderMatch[1]) {
        patientBuilder.withGender(genderMatch[1].trim());
      }
      if (idMatch && idMatch[1]) {
        patientBuilder.withHealthcareNumber(idMatch[1].trim());
      }
      
      console.log('Fallback patient extraction results:', {
        name: nameMatch?.[1],
        dob: dobMatch?.[1],
        gender: genderMatch?.[1],
        id: idMatch?.[1]
      });
    } catch (error) {
      console.error('Error in fallback patient extraction:', error);
    }
    
    return patientBuilder.build();
  }

  private fallbackEncounterExtraction(ocrResult: OCRResult): EncounterData {
    console.log('Using fallback encounter extraction');
    const encounterBuilder = new EncounterDataBuilder();
    const encounterInfoText = ocrResult.sections.encounterInfo?.text || ocrResult.rawText;
    const clinicalInfoText = ocrResult.sections.clinicalInfo?.text || '';
    
    try {
      // Basic regex-based extraction
      const dateMatch = encounterInfoText.match(/(?:Visit Date:|Date:)\s*([^\n]+)/i);
      const reasonMatch = encounterInfoText.match(/(?:Reason:|Chief Complaint:)\s*([^\n]+)/i);
      const diagnosisMatch = clinicalInfoText.match(/(?:Diagnosis:|Assessment:)\s*([^\n]+)/i);
      const notesMatch = clinicalInfoText.match(/(?:Notes:|Plan:)\s*([^\n]+)/i);
      
      if (dateMatch && dateMatch[1]) {
        encounterBuilder.withDate(new Date(dateMatch[1].trim()));
      } else {
        encounterBuilder.withDate(new Date());
      }
      
      if (reasonMatch && reasonMatch[1]) {
        encounterBuilder.withReason(reasonMatch[1].trim());
      }
      
      if (diagnosisMatch && diagnosisMatch[1]) {
        encounterBuilder.withDiagnosis([diagnosisMatch[1].trim()]);
      }
      
      if (notesMatch && notesMatch[1]) {
        encounterBuilder.withNotes(notesMatch[1].trim());
      }
      
      console.log('Fallback encounter extraction results:', {
        date: dateMatch?.[1],
        reason: reasonMatch?.[1],
        diagnosis: diagnosisMatch?.[1],
        notes: notesMatch?.[1]
      });
    } catch (error) {
      console.error('Error in fallback encounter extraction:', error);
    }
    
    return encounterBuilder.build();
  }
}