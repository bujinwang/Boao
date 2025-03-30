import { ImageSource } from '../../core/models/ImageSource';
import { OCRResult } from '../models/OCRResult';
import { GoogleVisionService } from './GoogleVisionService';

export class OCRService {
  private static instance: OCRService;
  private googleVisionService: GoogleVisionService;
  
  private constructor() {
    this.googleVisionService = GoogleVisionService.getInstance();
  }
  
  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }
  
  public async processImage(image: ImageSource): Promise<OCRResult> {
    console.log(`Processing image ${image.id} from ${image.source}`);
    
    try {
      // Get OCR results from Google Vision API
      const visionResults = await this.googleVisionService.processImage(image);
      
      // Combine all text results
      const rawText = visionResults.map(result => result.text).join('\n');
      
      // Calculate average confidence
      const confidence = visionResults.reduce((acc, result) => acc + result.confidence, 0) / visionResults.length;
      
      // Extract sections based on text content
      const sections = {
        patientInfo: {
          text: this.extractSection(rawText, ['Patient:', 'Name:', 'DOB:', 'Date of Birth:']),
          boundingBox: visionResults[0]?.boundingBox || { x: 0, y: 0, width: 0, height: 0 }
        },
        encounterInfo: {
          text: this.extractSection(rawText, ['Visit Date:', 'Date:', 'Reason:', 'Chief Complaint:']),
          boundingBox: visionResults[0]?.boundingBox || { x: 0, y: 0, width: 0, height: 0 }
        },
        clinicalInfo: {
          text: this.extractSection(rawText, ['Diagnosis:', 'Procedure:', 'Treatment:', 'Notes:']),
          boundingBox: visionResults[0]?.boundingBox || { x: 0, y: 0, width: 0, height: 0 }
        }
      };
      
      return {
        imageId: image.id,
        timestamp: new Date(),
        rawText,
        confidence,
        sections
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }
  
  private extractSection(text: string, keywords: string[]): string {
    const lines = text.split('\n');
    const sectionLines: string[] = [];
    
    for (const line of lines) {
      if (keywords.some(keyword => line.toLowerCase().includes(keyword.toLowerCase()))) {
        sectionLines.push(line);
      }
    }
    
    return sectionLines.join('\n');
  }
}