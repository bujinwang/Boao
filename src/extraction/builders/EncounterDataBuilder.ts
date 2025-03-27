import { EncounterData } from '../models/EncounterData';

export class EncounterDataBuilder {
  private encounterData: EncounterData = {};
  
  public reset(): EncounterDataBuilder {
    this.encounterData = {};
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
  
  public withDate(date: string | Date): EncounterDataBuilder {
    if (typeof date === 'string') {
      // Handle various date formats
      this.encounterData.date = new Date(date);
    } else {
      this.encounterData.date = date;
    }
    return this;
  }
  
  public withReason(reason: string): EncounterDataBuilder {
    this.encounterData.reason = reason;
    return this;
  }
  
  public withDiagnosis(diagnosis: string): EncounterDataBuilder {
    this.encounterData.diagnosis = diagnosis.split(',').map(d => d.trim());
    return this;
  }
  
  public withProcedures(procedures: string): EncounterDataBuilder {
    this.encounterData.procedures = procedures.split(',').map(p => p.trim());
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
  
  public build(): EncounterData {
    return { ...this.encounterData };
  }
}