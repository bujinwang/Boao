// Images
export * from './images';

// Icons
export * from './icons';

// Fonts
export * from './fonts';

// Animations
export * from './animations';

// Constants
export const ASSET_PATHS = {
  images: {
    logo: require('./images/logo.png'),
    placeholder: require('./images/placeholder.png'),
    error: require('./images/error.png'),
    success: require('./images/success.png'),
    loading: require('./images/loading.png'),
  },
  icons: {
    home: require('./icons/home.png'),
    profile: require('./icons/profile.png'),
    settings: require('./icons/settings.png'),
    search: require('./icons/search.png'),
    close: require('./icons/close.png'),
  },
  fonts: {
    regular: require('./fonts/OpenSans-Regular.ttf'),
    medium: require('./fonts/OpenSans-Medium.ttf'),
    bold: require('./fonts/OpenSans-Bold.ttf'),
  },
  animations: {
    loading: require('./animations/loading.json'),
    success: require('./animations/success.json'),
    error: require('./animations/error.json'),
  },
} as const;

// Asset Types
export type AssetType = 'image' | 'icon' | 'font' | 'animation';
export type AssetPath = typeof ASSET_PATHS;

// Asset Loading Functions
export const loadAssets = async () => {
  try {
    // Load fonts
    await Promise.all([
      ASSET_PATHS.fonts.regular,
      ASSET_PATHS.fonts.medium,
      ASSET_PATHS.fonts.bold,
    ]);

    // Load images
    await Promise.all([
      ASSET_PATHS.images.logo,
      ASSET_PATHS.images.placeholder,
      ASSET_PATHS.images.error,
      ASSET_PATHS.images.success,
      ASSET_PATHS.images.loading,
    ]);

    // Load icons
    await Promise.all([
      ASSET_PATHS.icons.home,
      ASSET_PATHS.icons.profile,
      ASSET_PATHS.icons.settings,
      ASSET_PATHS.icons.search,
      ASSET_PATHS.icons.close,
    ]);

    // Load animations
    await Promise.all([
      ASSET_PATHS.animations.loading,
      ASSET_PATHS.animations.success,
      ASSET_PATHS.animations.error,
    ]);

    return true;
  } catch (error) {
    console.error('Error loading assets:', error);
    return false;
  }
}; 