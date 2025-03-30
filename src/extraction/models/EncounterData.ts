import { BillingCode } from './BillingCodes';
import { OCRResult } from '../../ocr/models/OCRTypes';

type SimpleBillingCode = Pick<BillingCode, 'code' | 'description' | 'basePrice' | 'modifier' | 'modifiedPrice' | 'timeBasedModifiers'>;

export interface EncounterData {
  id?: string;
  patientId?: string;
  date: Date | string;
  reason: string;
  diagnosis: string[];
  procedures: string[];
  notes: string;
  provider: string;
  location: string;
  billingCodes: Array<{
    code: string;
    description: string;
    basePrice: number;
    modifier?: string;
    modifiedPrice?: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'complete';
  ocrResults?: OCRResult[];
}