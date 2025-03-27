import { OCRResult } from '../../ocr/models/OCRResult';
import { PatientData } from '../models/PatientData';
import { EncounterData } from '../models/EncounterData';
import { PatientDataBuilder } from '../builders/PatientDataBuilder';
import { EncounterDataBuilder } from '../builders/EncounterDataBuilder';

export class DataExtractionService {
  private static instance: DataExtractionService;
  
  private constructor() {}
  
  public static getInstance(): DataExtractionService {
    if (!DataExtractionService.instance) {
      DataExtractionService.instance = new DataExtractionService();
    }
    return DataExtractionService.instance;
  }
  
  public extractPatientData(ocrResult: OCRResult): PatientData {
    const patientBuilder = new PatientDataBuilder();
    
    // Extract patient information from OCR text
    const patientInfoText = ocrResult.sections.patientInfo?.text || ocrResult.rawText;
    
    // Extract patient name
    const nameMatch = patientInfoText.match(/Patient:\s*([^\n]+)/i);
    if (nameMatch && nameMatch[1]) {
      patientBuilder.withFullName(nameMatch[1].trim());
    }
    
    // Extract date of birth
    const dobMatch = patientInfoText.match(/DOB:\s*([^\n]+)/i);
    if (dobMatch && dobMatch[1]) {
      patientBuilder.withDateOfBirth(dobMatch[1].trim());
    }
    
    // Extract healthcare number (if available)
    const healthcareMatch = patientInfoText.match(/Healthcare #:\s*([^\n]+)/i) || 
                           patientInfoText.match(/Health Card:\s*([^\n]+)/i) ||
                           patientInfoText.match(/PHN:\s*([^\n]+)/i);
    if (healthcareMatch && healthcareMatch[1]) {
      patientBuilder.withHealthcareNumber(healthcareMatch[1].trim());
    }
    
    return patientBuilder.build();
  }
  
  public extractEncounterData(ocrResult: OCRResult): EncounterData {
    const encounterBuilder = new EncounterDataBuilder();
    
    // Extract encounter information from OCR text
    const encounterInfoText = ocrResult.sections.encounterInfo?.text || ocrResult.rawText;
    const clinicalInfoText = ocrResult.sections.clinicalInfo?.text || '';
    
    // Extract visit date
    const dateMatch = encounterInfoText.match(/Visit Date:\s*([^\n]+)/i) ||
                     encounterInfoText.match(/Date:\s*([^\n]+)/i);
    if (dateMatch && dateMatch[1]) {
      encounterBuilder.withDate(dateMatch[1].trim());
    }
    
    // Extract reason for visit
    const reasonMatch = encounterInfoText.match(/Reason:\s*([^\n]+)/i) ||
                       encounterInfoText.match(/Chief Complaint:\s*([^\n]+)/i);
    if (reasonMatch && reasonMatch[1]) {
      encounterBuilder.withReason(reasonMatch[1].trim());
    }
    
    // Extract diagnosis
    const diagnosisMatch = clinicalInfoText.match(/Diagnosis:\s*([^\n]+)/i);
    if (diagnosisMatch && diagnosisMatch[1]) {
      encounterBuilder.withDiagnosis(diagnosisMatch[1].trim());
    }
    
    // Extract procedures
    const procedureMatch = clinicalInfoText.match(/Procedure:\s*([^\n]+)/i) ||
                          clinicalInfoText.match(/Treatment:\s*([^\n]+)/i);
    if (procedureMatch && procedureMatch[1]) {
      encounterBuilder.withProcedures(procedureMatch[1].trim());
    }
    
    return encounterBuilder.build();
  }
}