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
      // Try to parse the date string
      const parsedDate = new Date(dob);
      if (!isNaN(parsedDate.getTime())) {
        this.patientData.dateOfBirth = parsedDate;
      } else {
        // Try to parse common date formats
        const formats = [
          /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
          /(\d{4})-(\d{1,2})-(\d{1,2})/,    // YYYY-MM-DD
          /(\d{1,2})-(\d{1,2})-(\d{4})/,    // DD-MM-YYYY
          /(\d{1,2})\.(\d{1,2})\.(\d{4})/,  // DD.MM.YYYY
        ];

        for (const format of formats) {
          const match = dob.match(format);
          if (match) {
            const [_, month, day, year] = match;
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (!isNaN(date.getTime())) {
              this.patientData.dateOfBirth = date;
              break;
            }
          }
        }

        // If no valid date was found, log a warning
        if (!this.patientData.dateOfBirth) {
          console.warn('Could not parse date of birth:', dob);
          this.patientData.dateOfBirth = new Date(); // Default to current date
        }
      }
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