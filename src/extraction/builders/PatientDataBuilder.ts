import { PatientData } from '../models/PatientData';

export class PatientDataBuilder {
  private patientData: PatientData = {};
  
  public reset(): PatientDataBuilder {
    this.patientData = {};
    return this;
  }
  
  public withId(id: string): PatientDataBuilder {
    this.patientData.id = id;
    return this;
  }
  
  public withFullName(fullName: string): PatientDataBuilder {
    this.patientData.fullName = fullName;
    
    // Try to extract first and last name
    const nameParts = fullName.split(' ');
    if (nameParts.length >= 2) {
      this.patientData.firstName = nameParts[0];
      this.patientData.lastName = nameParts.slice(1).join(' ');
    }
    
    return this;
  }
  
  public withDateOfBirth(dob: string | Date): PatientDataBuilder {
    if (typeof dob === 'string') {
      // Handle various date formats
      this.patientData.dateOfBirth = new Date(dob);
    } else {
      this.patientData.dateOfBirth = dob;
    }
    return this;
  }
  
  public withHealthcareNumber(number: string): PatientDataBuilder {
    this.patientData.healthcareNumber = number;
    return this;
  }
  
  public withGender(gender: string): PatientDataBuilder {
    this.patientData.gender = gender;
    return this;
  }
  
  public withContactInfo(phone?: string, email?: string, address?: string): PatientDataBuilder {
    if (phone) this.patientData.phoneNumber = phone;
    if (email) this.patientData.email = email;
    if (address) this.patientData.address = address;
    return this;
  }
  
  public build(): PatientData {
    return { ...this.patientData };
  }
}