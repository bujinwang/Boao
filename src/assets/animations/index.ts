// Animation assets
export const animations = {
  loading: require('./loading.json'),
  success: require('./success.json'),
  error: require('./error.json'),
} as const;

export type AnimationAsset = keyof typeof animations; 