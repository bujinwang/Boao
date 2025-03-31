// Font assets
export const fonts = {
  regular: require('./OpenSans-Regular.ttf'),
  medium: require('./OpenSans-Medium.ttf'),
  bold: require('./OpenSans-Bold.ttf'),
} as const;

export type FontAsset = keyof typeof fonts; 