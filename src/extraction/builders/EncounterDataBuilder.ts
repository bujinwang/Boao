import { EncounterData } from '../models/EncounterData';

export class EncounterDataBuilder {
  private encounterData: EncounterData = {
    date: new Date(),
    reason: '',
    diagnosis: [],
    procedures: [],
    notes: '',
    provider: '',
    location: '',
    billingCodes: [],
    totalAmount: 0,
    status: 'pending'
  };
  
  public reset(): EncounterDataBuilder {
    this.encounterData = {
      date: new Date(),
      reason: '',
      diagnosis: [],
      procedures: [],
      notes: '',
      provider: '',
      location: '',
      billingCodes: [],
      totalAmount: 0,
      status: 'pending'
    };
    return this;
  }
  
  public withId(id: string): EncounterDataBuilder {
    this.encounterData.id = id;
    return this;
  }
  
  public withPatientId(patientId: string): EncounterDataBuilder {
    this.encounterData.patientId = patientId;
    return this;
  }
  
  public withDate(date: Date | string): EncounterDataBuilder {
    if (typeof date === 'string') {
      // Try to parse the date string
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        this.encounterData.date = parsedDate;
      } else {
        // Try to parse common date formats
        const formats = [
          /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
          /(\d{4})-(\d{1,2})-(\d{1,2})/,    // YYYY-MM-DD
          /(\d{1,2})-(\d{1,2})-(\d{4})/,    // DD-MM-YYYY
          /(\d{1,2})\.(\d{1,2})\.(\d{4})/,  // DD.MM.YYYY
        ];

        for (const format of formats) {
          const match = date.match(format);
          if (match) {
            const [_, month, day, year] = match;
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (!isNaN(parsedDate.getTime())) {
              this.encounterData.date = parsedDate;
              break;
            }
          }
        }

        // If no valid date was found, log a warning
        if (isNaN(this.encounterData.date.getTime())) {
          console.warn('Could not parse encounter date:', date);
          this.encounterData.date = new Date(); // Default to current date
        }
      }
    } else {
      this.encounterData.date = date;
    }
    return this;
  }
  
  public withReason(reason: string): EncounterDataBuilder {
    this.encounterData.reason = reason;
    return this;
  }
  
  public withDiagnosis(diagnosis: string | string[]): EncounterDataBuilder {
    this.encounterData.diagnosis = Array.isArray(diagnosis) ? diagnosis : [diagnosis];
    return this;
  }
  
  public withProcedures(procedures: string | string[]): EncounterDataBuilder {
    this.encounterData.procedures = Array.isArray(procedures) ? procedures : [procedures];
    return this;
  }
  
  public withNotes(notes: string): EncounterDataBuilder {
    this.encounterData.notes = notes;
    return this;
  }
  
  public withProvider(provider: string): EncounterDataBuilder {
    this.encounterData.provider = provider;
    return this;
  }
  
  public withLocation(location: string): EncounterDataBuilder {
    this.encounterData.location = location;
    return this;
  }
  
  public withBillingCodes(billingCodes: any[]): EncounterDataBuilder {
    this.encounterData.billingCodes = billingCodes;
    return this;
  }
  
  public withTotalAmount(amount: number): EncounterDataBuilder {
    this.encounterData.totalAmount = amount;
    return this;
  }
  
  public withStatus(status: 'complete' | 'pending'): EncounterDataBuilder {
    this.encounterData.status = status;
    return this;
  }
  
  public build(): EncounterData {
    return { ...this.encounterData };
  }
}