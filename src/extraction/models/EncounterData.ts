import { BillingCode } from './BillingCodes';

type SimpleBillingCode = Pick<BillingCode, 'code' | 'description' | 'basePrice' | 'modifier' | 'modifiedPrice' | 'timeBasedModifiers'>;

export interface EncounterData {
  id?: string;
  patientId?: string;
  date: Date;
  reason: string;
  diagnosis?: string[];
  procedures?: string[];
  notes?: string;
  provider?: string;
  location?: string;
  billingCodes?: SimpleBillingCode[];
  totalAmount?: number;
  status?: 'complete' | 'pending';
}