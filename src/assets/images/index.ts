// Image assets
export const images = {
  logo: require('./logo.png'),
  placeholder: require('./placeholder.png'),
  error: require('./error.png'),
  success: require('./success.png'),
  loading: require('./loading.png'),
} as const;

export type ImageAsset = keyof typeof images; 