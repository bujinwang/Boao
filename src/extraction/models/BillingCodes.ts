export interface BillingCode {
  code: string;
  description: string;
  basePrice: number;
  modifier?: string;
  modifiedPrice?: number;
  timeBasedModifiers?: boolean;
  commonDiagnoses?: string[];
  category: string;
  relatedCodes?: string[]; // Codes often billed together
  timeEstimate?: number; // Estimated time in minutes
  complexity?: 'low' | 'medium' | 'high';
}

export interface BillingModifier {
  code: string;
  name: string;
  description: string;
  multiplier: number;
  applicableCategories?: string[];
  timeMultiplier?: number; // For time-based modifiers
  requiresDocumentation?: boolean;
}

// Common billing code categories
export const BILLING_CATEGORIES = {
  CONSULTATION: 'Consultation',
  PROCEDURE: 'Procedure',
  DIAGNOSTIC: 'Diagnostic',
  PREVENTIVE: 'Preventive Care',
  CHRONIC: 'Chronic Disease Management',
  MENTAL_HEALTH: 'Mental Health',
  EMERGENCY: 'Emergency Care',
};

// Common billing modifiers with descriptions
export const BILLING_MODIFIERS: { [key: string]: BillingModifier } = {
  'CMGP': {
    code: 'CMGP',
    name: 'Comprehensive General Practice',
    description: 'For complex cases requiring extended consultation time',
    multiplier: 1.20,
    applicableCategories: ['Consultation', 'Chronic Disease Management'],
    timeMultiplier: 1.5
  },
  'CALL': {
    code: 'CALL',
    name: 'After Hours Call',
    description: 'Services provided outside regular business hours',
    multiplier: 1.25,
    applicableCategories: ['Consultation', 'Procedure', 'Diagnostic', 'Emergency Care'],
    requiresDocumentation: true
  },
  'COMP': {
    code: 'COMP',
    name: 'Complex Care',
    description: 'Multiple medical conditions requiring coordination',
    multiplier: 1.35,
    applicableCategories: ['Consultation', 'Chronic Disease Management'],
    requiresDocumentation: true
  },
  'URGN': {
    code: 'URGN',
    name: 'Urgent Care',
    description: 'Immediate medical attention required',
    multiplier: 1.30,
    applicableCategories: ['Consultation', 'Procedure', 'Emergency Care']
  },
  'TIME': {
    code: 'TIME',
    name: 'Extended Time',
    description: 'Additional time spent beyond standard duration',
    multiplier: 1.50,
    timeMultiplier: 2.0,
    applicableCategories: ['Consultation', 'Procedure', 'Diagnostic']
  },
  'TEAM': {
    code: 'TEAM',
    name: 'Team Care',
    description: 'Multiple healthcare providers involved',
    multiplier: 1.40,
    applicableCategories: ['Chronic Disease Management', 'Mental Health'],
    requiresDocumentation: true
  },
  'TELE': {
    code: 'TELE',
    name: 'Telemedicine',
    description: 'Services provided via telehealth',
    multiplier: 0.85,
    applicableCategories: ['Consultation', 'Mental Health']
  }
};

// Common billing codes with descriptions and base prices
export const COMMON_BILLING_CODES: BillingCode[] = [
  {
    code: 'E11.9',
    description: 'Type 2 diabetes without complications',
    basePrice: 85.50,
    category: BILLING_CATEGORIES.CHRONIC,
    commonDiagnoses: ['Type 2 Diabetes', 'Diabetes Mellitus'],
    relatedCodes: ['I10', 'E78.5'],
    timeEstimate: 30,
    complexity: 'medium'
  },
  {
    code: 'I10',
    description: 'Essential hypertension',
    basePrice: 65.75,
    category: BILLING_CATEGORIES.CHRONIC,
    commonDiagnoses: ['Hypertension', 'High Blood Pressure'],
    relatedCodes: ['E11.9', 'I25.10'],
    timeEstimate: 25,
    complexity: 'low'
  },
  {
    code: 'J45.909',
    description: 'Unspecified asthma',
    basePrice: 95.25,
    category: BILLING_CATEGORIES.CHRONIC,
    commonDiagnoses: ['Asthma', 'Respiratory Issues', 'Wheezing'],
    relatedCodes: ['J30.9', 'R06.02'],
    timeEstimate: 35,
    complexity: 'medium'
  },
  {
    code: 'M54.5',
    description: 'Low back pain',
    basePrice: 75.00,
    category: BILLING_CATEGORIES.CONSULTATION,
    commonDiagnoses: ['Back Pain', 'Lumbar Pain', 'Sciatica'],
    relatedCodes: ['M54.16', 'M54.17'],
    timeEstimate: 30,
    complexity: 'medium'
  },
  {
    code: 'Z00.00',
    description: 'General adult medical examination',
    basePrice: 120.00,
    category: BILLING_CATEGORIES.PREVENTIVE,
    timeBasedModifiers: true,
    timeEstimate: 45,
    complexity: 'low'
  },
  {
    code: 'G89.29',
    description: 'Other chronic pain',
    basePrice: 85.00,
    category: BILLING_CATEGORIES.CHRONIC,
    commonDiagnoses: ['Chronic Pain', 'Pain Management'],
    relatedCodes: ['M54.5', 'M25.50'],
    timeEstimate: 35,
    complexity: 'high'
  },
  {
    code: 'F41.9',
    description: 'Anxiety disorder, unspecified',
    basePrice: 95.00,
    category: BILLING_CATEGORIES.MENTAL_HEALTH,
    commonDiagnoses: ['Anxiety', 'Panic Attacks', 'Stress'],
    relatedCodes: ['F32.9', 'F43.23'],
    timeEstimate: 45,
    complexity: 'high'
  },
  {
    code: 'F32.9',
    description: 'Major depressive disorder',
    basePrice: 105.00,
    category: BILLING_CATEGORIES.MENTAL_HEALTH,
    commonDiagnoses: ['Depression', 'Mood Disorder'],
    relatedCodes: ['F41.9', 'F43.23'],
    timeEstimate: 45,
    complexity: 'high'
  },
  {
    code: 'J02.9',
    description: 'Acute pharyngitis, unspecified',
    basePrice: 55.00,
    category: BILLING_CATEGORIES.CONSULTATION,
    commonDiagnoses: ['Sore Throat', 'Pharyngitis', 'Upper Respiratory Infection'],
    timeEstimate: 15,
    complexity: 'low'
  },
  {
    code: 'N39.0',
    description: 'Urinary tract infection',
    basePrice: 65.00,
    category: BILLING_CATEGORIES.CONSULTATION,
    commonDiagnoses: ['UTI', 'Bladder Infection'],
    timeEstimate: 20,
    complexity: 'low'
  },
  {
    code: 'L30.9',
    description: 'Dermatitis, unspecified',
    basePrice: 70.00,
    category: BILLING_CATEGORIES.CONSULTATION,
    commonDiagnoses: ['Skin Rash', 'Dermatitis', 'Eczema'],
    timeEstimate: 20,
    complexity: 'low'
  },
  {
    code: 'R51',
    description: 'Headache',
    basePrice: 75.00,
    category: BILLING_CATEGORIES.CONSULTATION,
    commonDiagnoses: ['Headache', 'Migraine', 'Tension Headache'],
    relatedCodes: ['G43.909', 'R51.9'],
    timeEstimate: 25,
    complexity: 'medium'
  },
  {
    code: 'K21.9',
    description: 'Gastro-esophageal reflux disease',
    basePrice: 70.00,
    category: BILLING_CATEGORIES.CHRONIC,
    commonDiagnoses: ['GERD', 'Acid Reflux', 'Heartburn'],
    timeEstimate: 25,
    complexity: 'low'
  },
  {
    code: 'R10.9',
    description: 'Unspecified abdominal pain',
    basePrice: 85.00,
    category: BILLING_CATEGORIES.CONSULTATION,
    commonDiagnoses: ['Abdominal Pain', 'Stomach Pain'],
    timeEstimate: 30,
    complexity: 'medium'
  },
  {
    code: 'H66.90',
    description: 'Otitis media, unspecified',
    basePrice: 60.00,
    category: BILLING_CATEGORIES.CONSULTATION,
    commonDiagnoses: ['Ear Infection', 'Ear Pain'],
    timeEstimate: 20,
    complexity: 'low'
  }
];

// Helper function to suggest related codes based on diagnosis
export function suggestCodesForDiagnosis(diagnosis: string): BillingCode[] {
  const normalizedDiagnosis = diagnosis.toLowerCase();
  return COMMON_BILLING_CODES.filter(code => 
    code.commonDiagnoses?.some(d => d.toLowerCase().includes(normalizedDiagnosis))
  );
}

// Helper function to suggest related codes based on current code
export function suggestRelatedCodes(currentCode: string): BillingCode[] {
  const code = COMMON_BILLING_CODES.find(c => c.code === currentCode);
  if (!code?.relatedCodes) return [];
  return COMMON_BILLING_CODES.filter(c => code.relatedCodes?.includes(c.code));
}

// Helper function to calculate time-based modifier
export function calculateTimeModifier(baseTime: number, actualTime: number, modifier: BillingModifier): number {
  if (!modifier.timeMultiplier) return modifier.multiplier;
  const timeRatio = actualTime / baseTime;
  return modifier.multiplier * Math.min(timeRatio, modifier.timeMultiplier);
}

// Helper function to get applicable modifiers for a code
export function getApplicableModifiers(code: BillingCode): BillingModifier[] {
  return Object.values(BILLING_MODIFIERS).filter(modifier =>
    !modifier.applicableCategories ||
    modifier.applicableCategories.includes(code.category)
  );
} 