import 'dotenv/config';

// Log environment variables being loaded
console.log('Loading environment variables in app.config.js:', {
  GOOGLE_CLOUD_VISION_API_KEY: process.env.GOOGLE_CLOUD_VISION_API_KEY ? 'Present' : 'Missing',
  OCR_MAX_RESULTS: process.env.OCR_MAX_RESULTS,
  OCR_DETECT_HANDWRITING: process.env.OCR_DETECT_HANDWRITING,
  OCR_LANGUAGE_HINTS: process.env.OCR_LANGUAGE_HINTS,
  GOOGLE_CLOUD_VISION_API_URL: process.env.GOOGLE_CLOUD_VISION_API_URL,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ? 'Present' : 'Missing',
  DEEPSEEK_API_URL: process.env.DEEPSEEK_API_URL
});

export default {
  expo: {
    name: "Boao Medical Billing",
    slug: "boao-medical-billing",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.bujinwang.boao-medical-billing"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ]
    },
    plugins: [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos."
        }
      ]
    ],
    extra: {
      GOOGLE_CLOUD_VISION_API_KEY: process.env.GOOGLE_CLOUD_VISION_API_KEY,
      OCR_MAX_RESULTS: process.env.OCR_MAX_RESULTS || '1',
      OCR_DETECT_HANDWRITING: process.env.OCR_DETECT_HANDWRITING || 'false',
      OCR_LANGUAGE_HINTS: process.env.OCR_LANGUAGE_HINTS || 'en',
      GOOGLE_CLOUD_VISION_API_URL: process.env.GOOGLE_CLOUD_VISION_API_URL || 'https://vision.googleapis.com/v1/images:annotate',
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
      DEEPSEEK_API_URL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'
    },
    newArchEnabled: true
  }
}; 