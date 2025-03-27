import { EncounterData } from '../../extraction/models/EncounterData';
import { BillingCode, BillingCodeSuggestion } from '../models/BillingCode';

export class BillingCodeService {
  private static instance: BillingCodeService;
  private billingCodes: BillingCode[] = [];
  
  private constructor() {
    // In a real implementation, these would be loaded from a database or API
    this.billingCodes = [
      {
        code: '03.04A',
        description: 'Comprehensive assessment',
        fee: 85.89
      },
      {
        code: '03.03A',
        description: 'Limited assessment',
        fee: 38.03
      },
      {
        code: '03.08A',
        description: 'Comprehensive consultation',
        fee: 90.16
      },
      {
        code: '03.07A',
        description: 'Consultation',
        fee: 83.90
      },
      {
        code: '03.05JR',
        description: 'Comprehensive visit - Geriatric',
        fee: 104.99
      }
    ];
  }
  
  public static getInstance(): BillingCodeService {
    if (!BillingCodeService.instance) {
      BillingCodeService.instance = new BillingCodeService();
    }
    return BillingCodeService.instance;
  }
  
  public suggestBillingCodes(encounterData: EncounterData): BillingCodeSuggestion[] {
    const suggestions: BillingCodeSuggestion[] = [];
    
    // Simple keyword-based matching
    const keywords = {
      'comprehensive': ['03.04A', '03.08A', '03.05JR'],
      'assessment': ['03.04A', '03.03A'],
      'consultation': ['03.08A', '03.07A'],
      'limited': ['03.03A'],
      'geriatric': ['03.05JR'],
      'senior': ['03.05JR'],
      'elderly': ['03.05JR'],
      'annual': ['03.04A'],
      'physical': ['03.04A'],
      'examination': ['03.04A', '03.03A']
    };
    
    // Collect all text to search for keywords
    const searchText = [
      encounterData.reason || '',
      ...(encounterData.diagnosis || []),
      ...(encounterData.procedures || []),
      encounterData.notes || ''
    ].join(' ').toLowerCase();
    
    // Track matched codes and their scores
    const codeScores: Record<string, number> = {};
    
    // Search for keywords
    Object.entries(keywords).forEach(([keyword, codes]) => {
      if (searchText.includes(keyword)) {
        codes.forEach(code => {
          codeScores[code] = (codeScores[code] || 0) + 1;
        });
      }
    });
    
    // Convert scores to suggestions
    Object.entries(codeScores).forEach(([code, score]) => {
      const billingCode = this.billingCodes.find(bc => bc.code === code);
      if (billingCode) {
        // Calculate confidence based on number of keyword matches
        const confidence = Math.min(0.5 + (score * 0.1), 0.95);
        
        suggestions.push({
          code: billingCode,
          confidence,
          reasoning: `Matched keywords in encounter data suggest this code is appropriate.`
        });
      }
    });
    
    // If no codes matched, suggest the most common one as a fallback
    if (suggestions.length === 0) {
      suggestions.push({
        code: this.billingCodes.find(bc => bc.code === '03.03A')!,
        confidence: 0.5,
        reasoning: 'Default suggestion based on limited information.'
      });
    }
    
    // Sort by confidence
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }
}