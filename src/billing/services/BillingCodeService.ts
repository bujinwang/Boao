import { EncounterData } from '../../extraction/models/EncounterData';
import { BillingCode, BillingCodeSuggestion } from '../models/BillingCode';
import { DeepSeekExtractionService } from '../../extraction/services/DeepSeekExtractionService';
import { OCRResult } from '../../ocr/models/OCRResult';

export class BillingCodeService {
  private static instance: BillingCodeService;
  private extractionService: DeepSeekExtractionService;
  
  private constructor() {
    this.extractionService = DeepSeekExtractionService.getInstance();
  }
  
  public static getInstance(): BillingCodeService {
    if (!BillingCodeService.instance) {
      BillingCodeService.instance = new BillingCodeService();
    }
    return BillingCodeService.instance;
  }
  
  public async suggestBillingCodes(encounterData: EncounterData, ocrResult: OCRResult): Promise<BillingCodeSuggestion[]> {
    try {
      // Get AI-suggested billing codes from DeepSeek
      // This will use the cached response if available
      const aiSuggestions = await this.extractionService.suggestBillingCodes(ocrResult);
      
      // Convert AI suggestions to the expected format
      return aiSuggestions.map(suggestion => ({
        code: {
          code: suggestion.code.code,
          description: suggestion.code.description,
          fee: suggestion.code.fee
        },
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning
      }));
    } catch (error) {
      console.error('Error getting billing code suggestions:', error);
      return [];
    }
  }
}