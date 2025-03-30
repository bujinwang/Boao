import { OCRResult } from '../../ocr/models/OCRResult';
import { PatientData } from '../models/PatientData';
import { EncounterData } from '../models/EncounterData';
import { PatientDataBuilder } from '../builders/PatientDataBuilder';
import { EncounterDataBuilder } from '../builders/EncounterDataBuilder';
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
  confidence: number;
}

export class DeepSeekExtractionService {
  private static instance: DeepSeekExtractionService;
  private apiKey: string;
  private apiUrl: string;

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
      console.log('Calling DeepSeek API with text:', text.substring(0, 200) + '...');
      
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
              content: `You are a medical document analysis assistant. Extract structured information from the following medical document text. 
              Return a JSON object with patientInfo and encounterInfo sections. Be precise and maintain medical terminology.
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
      console.log('DeepSeek API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data.choices[0].message.content
      });
      
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('Error calling DeepSeek API:', error);
      throw error;
    }
  }

  public async extractPatientData(ocrResult: OCRResult): Promise<PatientData> {
    try {
      console.log('Extracting patient data from OCR result...');
      
      // Get structured data from DeepSeek
      const deepSeekResponse = await this.callDeepSeekAPI(ocrResult.rawText);
      console.log('DeepSeek patient info extraction:', deepSeekResponse.patientInfo);
      
      // Build patient data using the builder pattern
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
      
      const result = patientBuilder.build();
      console.log('Final patient data:', result);
      return result;
    } catch (error) {
      console.error('Error extracting patient data:', error);
      console.log('Falling back to basic extraction...');
      // Fallback to basic extraction if AI fails
      return this.fallbackPatientExtraction(ocrResult);
    }
  }

  public async extractEncounterData(ocrResult: OCRResult): Promise<EncounterData> {
    try {
      console.log('Extracting encounter data from OCR result...');
      
      // Get structured data from DeepSeek
      const deepSeekResponse = await this.callDeepSeekAPI(ocrResult.rawText);
      console.log('DeepSeek encounter info extraction:', deepSeekResponse.encounterInfo);
      
      // Build encounter data using the builder pattern
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
      
      const result = encounterBuilder.build();
      console.log('Final encounter data:', result);
      return result;
    } catch (error) {
      console.error('Error extracting encounter data:', error);
      console.log('Falling back to basic extraction...');
      // Fallback to basic extraction if AI fails
      return this.fallbackEncounterExtraction(ocrResult);
    }
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