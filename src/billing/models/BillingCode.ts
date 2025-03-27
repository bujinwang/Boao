export interface BillingCode {
  code: string;
  description: string;
  fee: number;
}

export interface BillingCodeSuggestion {
  code: BillingCode;
  confidence: number;
  reasoning: string;
}