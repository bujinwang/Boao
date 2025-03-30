import Constants from 'expo-constants';

interface Config {
  googleCloudVisionApiKey: string;
  ocrMaxResults: number;
  ocrDetectHandwriting: boolean;
  ocrLanguageHints: string[];
  googleCloudVisionApiUrl: string;
  deepseekApiKey: string;
  deepseekApiUrl: string;
}

// Log the environment variables being loaded
console.log('Loading environment variables:', {
  GOOGLE_CLOUD_VISION_API_KEY: Constants.expoConfig?.extra?.GOOGLE_CLOUD_VISION_API_KEY ? 'Present' : 'Missing',
  OCR_MAX_RESULTS: Constants.expoConfig?.extra?.OCR_MAX_RESULTS,
  OCR_DETECT_HANDWRITING: Constants.expoConfig?.extra?.OCR_DETECT_HANDWRITING,
  OCR_LANGUAGE_HINTS: Constants.expoConfig?.extra?.OCR_LANGUAGE_HINTS,
  GOOGLE_CLOUD_VISION_API_URL: Constants.expoConfig?.extra?.GOOGLE_CLOUD_VISION_API_URL,
  DEEPSEEK_API_KEY: Constants.expoConfig?.extra?.DEEPSEEK_API_KEY ? 'Present' : 'Missing',
  DEEPSEEK_API_URL: Constants.expoConfig?.extra?.DEEPSEEK_API_URL
});

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_CLOUD_VISION_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!Constants.expoConfig?.extra?.[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const config: Config = {
  googleCloudVisionApiKey: Constants.expoConfig?.extra?.GOOGLE_CLOUD_VISION_API_KEY || '',
  ocrMaxResults: parseInt(Constants.expoConfig?.extra?.OCR_MAX_RESULTS || '1', 10),
  ocrDetectHandwriting: Constants.expoConfig?.extra?.OCR_DETECT_HANDWRITING === 'true',
  ocrLanguageHints: (Constants.expoConfig?.extra?.OCR_LANGUAGE_HINTS || 'en').split(','),
  googleCloudVisionApiUrl: Constants.expoConfig?.extra?.GOOGLE_CLOUD_VISION_API_URL || 'https://vision.googleapis.com/v1/images:annotate',
  deepseekApiKey: Constants.expoConfig?.extra?.DEEPSEEK_API_KEY || '',
  deepseekApiUrl: Constants.expoConfig?.extra?.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions',
};

// Log the final config (without sensitive values)
console.log('Final config:', {
  ...config,
  googleCloudVisionApiKey: config.googleCloudVisionApiKey ? 'Present' : 'Missing',
  deepseekApiKey: config.deepseekApiKey ? 'Present' : 'Missing'
});

export default config; 