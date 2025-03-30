export interface BillingCodeSuggestion {
  code: string;
  description: string;
  confidence: number;
  basePrice: number;
  modifier?: string;
  modifiedPrice?: number;
} 