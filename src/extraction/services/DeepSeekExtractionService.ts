import { OCRResult } from '../../ocr/models/OCRResult';
import { PatientData } from '../models/PatientData';
import { EncounterData } from '../models/EncounterData';
import { PatientDataBuilder } from '../builders/PatientDataBuilder';
import { EncounterDataBuilder } from '../builders/EncounterDataBuilder';
import { BillingCode, BillingCodeSuggestion } from '../../billing/models/BillingCode';
import { BILLING_CATEGORIES, BILLING_MODIFIERS } from '../models/BillingCodes';
import config from '../../utils/config';

interface DeepSeekResponse {
  patientInfo: {
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    healthcareNumber?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
  };
  encounterInfo: {
    date?: string;
    reason?: string;
    diagnosis?: string[];
    procedures?: string[];
    notes?: string;
    provider?: string;
    location?: string;
  };
  billingSuggestions: {
    codes: Array<{
      code: string;
      description: string;
      fee: number;
      category: string;
      confidence: number;
      reasoning: string;
      modifiers?: Array<{
        code: string;
        name: string;
        multiplier: number;
      }>;
    }>;
  };
  confidence: number;
}

export class DeepSeekExtractionService {
  private static instance: DeepSeekExtractionService;
  private apiKey: string;
  private apiUrl: string;
  private lastResponse: DeepSeekResponse | null = null;
  private lastText: string | null = null;

  private constructor() {
    this.apiKey = config.deepseekApiKey;
    this.apiUrl = config.deepseekApiUrl;
  }

  public static getInstance(): DeepSeekExtractionService {
    if (!DeepSeekExtractionService.instance) {
      DeepSeekExtractionService.instance = new DeepSeekExtractionService();
    }
    return DeepSeekExtractionService.instance;
  }

  private async callDeepSeekAPI(text: string): Promise<DeepSeekResponse> {
    try {
      // Return cached response if available and text matches
      if (this.lastResponse && this.lastText === text) {
        console.log('Using cached DeepSeek API response');
        return this.lastResponse;
      }

      const startTime = performance.now();
      console.log('Calling DeepSeek API...');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a medical document analysis assistant. Extract structured information from the following medical document text and suggest appropriate billing codes.
              Use the following reference documents for accurate billing:
              - Medical Price List 2024-01 (hlth-somb-medical-price-list-2024-01)
              - Medical Procedure List 2024-01 (hlth-somb-medical-procedure-list-2024-01)
              - Fee Modifier Definitions 2024-01 (hlth-somb-fee-modifier-definitions-2024-01)
              
              Return a JSON object with patientInfo, encounterInfo, and billingSuggestions sections. Be precise and maintain medical terminology.
              Format the response as a valid JSON object with the following structure:
              {
                "patientInfo": {
                  "fullName": string,
                  "dateOfBirth": string,
                  "gender": string,
                  "healthcareNumber": string,
                  "address": string,
                  "phoneNumber": string,
                  "email": string
                },
                "encounterInfo": {
                  "date": string,
                  "reason": string,
                  "diagnosis": string[],
                  "procedures": string[],
                  "notes": string,
                  "provider": string,
                  "location": string
                },
                "billingSuggestions": {
                  "codes": [
                    {
                      "code": string,
                      "description": string,
                      "fee": number,
                      "category": string,
                      "confidence": number,
                      "reasoning": string,
                      "modifiers": [
                        {
                          "code": string,
                          "name": string,
                          "multiplier": number
                        }
                      ]
                    }
                  ]
                },
                "confidence": number
              }`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.1,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.statusText}`);
      }

      const data = await response.json();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const parsedResponse = JSON.parse(data.choices[0].message.content);
      
      // Cache the response
      this.lastResponse = parsedResponse;
      this.lastText = text;
      
      console.log(`DeepSeek API completed in ${duration.toFixed(2)}ms`);
      return parsedResponse;
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }

  public async extractAllData(ocrResult: OCRResult): Promise<{
    patientData: PatientData;
    encounterData: EncounterData;
    billingSuggestions: BillingCodeSuggestion[];
  }> {
    try {
      const deepSeekResponse = await this.callDeepSeekAPI(ocrResult.rawText);
      
      // Extract patient data
      const patientBuilder = new PatientDataBuilder();
      if (deepSeekResponse.patientInfo.fullName) {
        patientBuilder.withFullName(deepSeekResponse.patientInfo.fullName);
      }
      if (deepSeekResponse.patientInfo.dateOfBirth) {
        patientBuilder.withDateOfBirth(deepSeekResponse.patientInfo.dateOfBirth);
      }
      if (deepSeekResponse.patientInfo.gender) {
        patientBuilder.withGender(deepSeekResponse.patientInfo.gender);
      }
      if (deepSeekResponse.patientInfo.healthcareNumber) {
        patientBuilder.withHealthcareNumber(deepSeekResponse.patientInfo.healthcareNumber);
      }
      if (deepSeekResponse.patientInfo.phoneNumber || 
          deepSeekResponse.patientInfo.email || 
          deepSeekResponse.patientInfo.address) {
        patientBuilder.withContactInfo(
          deepSeekResponse.patientInfo.phoneNumber,
          deepSeekResponse.patientInfo.email,
          deepSeekResponse.patientInfo.address
        );
      }
      const patientData = patientBuilder.build();
      console.log('Patient data extracted:', {
        name: patientData.fullName,
        dob: patientData.dateOfBirth,
        hasContactInfo: !!(patientData.phoneNumber || patientData.email || patientData.address)
      });

      // Extract encounter data
      const encounterBuilder = new EncounterDataBuilder();
      if (deepSeekResponse.encounterInfo.date) {
        encounterBuilder.withDate(deepSeekResponse.encounterInfo.date);
      }
      if (deepSeekResponse.encounterInfo.reason) {
        encounterBuilder.withReason(deepSeekResponse.encounterInfo.reason);
      }
      if (deepSeekResponse.encounterInfo.diagnosis) {
        encounterBuilder.withDiagnosis(deepSeekResponse.encounterInfo.diagnosis);
      }
      if (deepSeekResponse.encounterInfo.procedures) {
        encounterBuilder.withProcedures(deepSeekResponse.encounterInfo.procedures);
      }
      if (deepSeekResponse.encounterInfo.notes) {
        encounterBuilder.withNotes(deepSeekResponse.encounterInfo.notes);
      }
      if (deepSeekResponse.encounterInfo.provider) {
        encounterBuilder.withProvider(deepSeekResponse.encounterInfo.provider);
      }
      if (deepSeekResponse.encounterInfo.location) {
        encounterBuilder.withLocation(deepSeekResponse.encounterInfo.location);
      }
      const encounterData = encounterBuilder.build();
      console.log('Encounter data extracted:', {
        date: encounterData.date,
        reason: encounterData.reason,
        diagnosisCount: encounterData.diagnosis?.length || 0,
        procedureCount: encounterData.procedures?.length || 0
      });

      // Extract billing suggestions
      const billingSuggestions = deepSeekResponse.billingSuggestions.codes.map(suggestion => ({
        code: {
          code: suggestion.code,
          description: suggestion.description,
          fee: suggestion.fee
        },
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning
      }));
      console.log(`Extracted ${billingSuggestions.length} billing code suggestions`);

      return {
        patientData,
        encounterData,
        billingSuggestions
      };
    } catch (error) {
      console.error('Error extracting data:', error);
      console.log('Falling back to basic extraction...');
      return {
        patientData: this.fallbackPatientExtraction(ocrResult),
        encounterData: this.fallbackEncounterExtraction(ocrResult),
        billingSuggestions: []
      };
    }
  }

  // Keep the individual methods for backward compatibility
  public async extractPatientData(ocrResult: OCRResult): Promise<PatientData> {
    const { patientData } = await this.extractAllData(ocrResult);
    return patientData;
  }

  public async extractEncounterData(ocrResult: OCRResult): Promise<EncounterData> {
    const { encounterData } = await this.extractAllData(ocrResult);
    return encounterData;
  }

  public async suggestBillingCodes(ocrResult: OCRResult): Promise<BillingCodeSuggestion[]> {
    const { billingSuggestions } = await this.extractAllData(ocrResult);
    return billingSuggestions;
  }

  private fallbackPatientExtraction(ocrResult: OCRResult): PatientData {
    const patientBuilder = new PatientDataBuilder();
    const patientInfoText = ocrResult.sections.patientInfo?.text || ocrResult.rawText;
    
    // Basic regex-based extraction as fallback
    const nameMatch = patientInfoText.match(/Patient:\s*([^\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      patientBuilder.withFullName(nameMatch[1].trim());
    }
    
    const dobMatch = patientInfoText.match(/DOB:\s*([^\n]+)/i);
    if (dobMatch && dobMatch[1]) {
      patientBuilder.withDateOfBirth(dobMatch[1].trim());
    }
    
    const healthcareMatch = patientInfoText.match(/Healthcare #:\s*([^\n]+)/i) || 
                           patientInfoText.match(/Health Card:\s*([^\n]+)/i) ||
                           patientInfoText.match(/PHN:\s*([^\n]+)/i);
    if (healthcareMatch && healthcareMatch[1]) {
      patientBuilder.withHealthcareNumber(healthcareMatch[1].trim());
    }
    
    return patientBuilder.build();
  }

  private fallbackEncounterExtraction(ocrResult: OCRResult): EncounterData {
    const encounterBuilder = new EncounterDataBuilder();
    const encounterInfoText = ocrResult.sections.encounterInfo?.text || ocrResult.rawText;
    const clinicalInfoText = ocrResult.sections.clinicalInfo?.text || '';
    
    // Basic regex-based extraction as fallback
    const dateMatch = encounterInfoText.match(/Visit Date:\s*([^\n]+)/i) ||
                     encounterInfoText.match(/Date:\s*([^\n]+)/i);
    if (dateMatch && dateMatch[1]) {
      encounterBuilder.withDate(dateMatch[1].trim());
    }
    
    const reasonMatch = encounterInfoText.match(/Reason:\s*([^\n]+)/i) ||
                       encounterInfoText.match(/Chief Complaint:\s*([^\n]+)/i);
    if (reasonMatch && reasonMatch[1]) {
      encounterBuilder.withReason(reasonMatch[1].trim());
    }
    
    const diagnosisMatch = clinicalInfoText.match(/Diagnosis:\s*([^\n]+)/i);
    if (diagnosisMatch && diagnosisMatch[1]) {
      encounterBuilder.withDiagnosis(diagnosisMatch[1].trim().split(',').map(d => d.trim()));
    }
    
    const procedureMatch = clinicalInfoText.match(/Procedure:\s*([^\n]+)/i) ||
                          clinicalInfoText.match(/Treatment:\s*([^\n]+)/i);
    if (procedureMatch && procedureMatch[1]) {
      encounterBuilder.withProcedures(procedureMatch[1].trim().split(',').map(p => p.trim()));
    }
    
    return encounterBuilder.build();
  }
} 