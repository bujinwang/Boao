import { ImageSource } from '../../core/models/ImageSource';
import config from '../../utils/config';

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export class GoogleVisionService {
  private static instance: GoogleVisionService;
  private apiKey: string;
  private apiUrl: string;

  private constructor() {
    this.apiKey = config.googleCloudVisionApiKey;
    this.apiUrl = config.googleCloudVisionApiUrl;
    
    // Log service initialization
    console.log('GoogleVisionService initialized with:', {
      apiUrl: this.apiUrl,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey?.length || 0
    });
  }

  public static getInstance(): GoogleVisionService {
    if (!GoogleVisionService.instance) {
      GoogleVisionService.instance = new GoogleVisionService();
    }
    return GoogleVisionService.instance;
  }

  async processImage(imageSource: ImageSource): Promise<OCRResult[]> {
    try {
      console.log('Calling Google Cloud Vision API for image:', imageSource.id);
      
      if (!this.apiKey) {
        console.error('API Key check failed:', {
          hasApiKey: !!this.apiKey,
          apiKeyLength: this.apiKey?.length || 0,
          configApiKey: config.googleCloudVisionApiKey ? 'Present' : 'Missing'
        });
        throw new Error('Google Cloud Vision API key is not configured');
      }

      const requestBody = {
        requests: [
          {
            image: {
              content: imageSource.data
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: config.ocrMaxResults
              }
            ],
            imageContext: {
              languageHints: config.ocrLanguageHints,
              textDetectionParams: {
                enableTextDetectionConfidenceScore: true
              }
            }
          }
        ]
      };

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Google Cloud Vision API error: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`);
      }

      const data = await response.json();
      console.log('Google Cloud Vision API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data.responses[0]
      });
      
      if (!data.responses || !data.responses[0]) {
        throw new Error('Invalid response format from Google Cloud Vision API');
      }

      if (data.responses[0].error) {
        throw new Error(`Google Cloud Vision API error: ${JSON.stringify(data.responses[0].error)}`);
      }

      if (data.responses[0].textAnnotations) {
        const results = data.responses[0].textAnnotations.map((annotation: any) => ({
          text: annotation.description,
          confidence: annotation.confidence || 0,
          boundingBox: annotation.boundingBox ? {
            x: annotation.boundingBox.vertices[0].x,
            y: annotation.boundingBox.vertices[0].y,
            width: annotation.boundingBox.vertices[2].x - annotation.boundingBox.vertices[0].x,
            height: annotation.boundingBox.vertices[2].y - annotation.boundingBox.vertices[0].y
          } : undefined
        }));
        
        console.log('Processed OCR Results:', results);
        return results;
      }

      console.log('No text annotations found in the image');
      return [];
    } catch (error) {
      console.error('Error processing image with Google Vision API:', error);
      throw error;
    }
  }
} 